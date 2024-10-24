import {
  ErrorHandler,
  generateReferralCode,
  referralVoucher,
} from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { IUser, IUserDetail } from '@/interfaces/user';
import { forgotPasswordQueue, userDeletionQueue } from '@/lib/bull';
import { compare, hash } from 'bcrypt';
import { generateTokeEmailVerification, generateToken } from '@/lib/jwt';
import { forgotPasswordEmail, sendVerificationEmail } from '@/lib/nodemailer';
import { forgot_password_url, verification_url } from '@/config';

export class AuthService {
  static async login(req: Request) {
    const { email, password } = req.body;
    const user = (await prisma.user.findUnique({
      include: {
        UserDetails: {
          select: {
            referral_code: true,
            f_referral_code: true,
          },
        },
      },
      where: {
        email,
      },
    })) as IUser;

    if (!user) throw new ErrorHandler('User not found', 400);

    if (user.is_verified == 0) {
      throw new ErrorHandler('User not verified', 400);
    }
    const checkPassword = await compare(password, user.password!);
    if (checkPassword) {
      delete user.password;
    } else throw new ErrorHandler('Password wrong', 400);
    return generateToken(user);
  }

  static async refreshToken(req: Request) {
    const { id } = req.user;
    const user = (await prisma.user.findUnique({
      include: {
        UserDetails: {
          select: {
            referral_code: true,
            f_referral_code: true,
          },
        },
      },
      where: {
        id: Number(id),
      },
    })) as IUser;
    if (!user) throw new ErrorHandler('User not found', 400);
    delete user.password;

    console.log(user, 'ini user');

    return generateToken(user);
  }
  static async register(req: Request) {
    return await prisma.$transaction(async (prisma) => {
      try {
        const {
          first_name,
          last_name,
          email,
          phone_number,
          f_referral_code,
          provider,
        } = req.body;

        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });
        if (user) throw new ErrorHandler('User already exists coy', 400);
        const data: Prisma.UserCreateInput = {
          first_name,
          last_name: last_name || '',
          email,
          Role: {
            connect: {
              id: 1,
            },
          },
          is_verified: 0,
          provider,
        };

        if (phone_number) {
          data.phone_number = phone_number;
        }

        const newUser = await prisma.user.create({
          data,
        });

        const newUserDetail = await prisma.userDetail.create({
          data: {
            referral_code: generateReferralCode(),
            userId: newUser.id,
          },
        });

        if (f_referral_code) {
          const referral = (await prisma.userDetail.findFirst({
            where: {
              referral_code: f_referral_code,
            },
          })) as IUserDetail;
          if (!referral) throw new ErrorHandler('Invalid referral code', 400);
          await prisma.userDetail.update({
            where: {
              id: newUserDetail.id,
            },
            data: {
              f_referral_code,
            },
          });

          await referralVoucher(f_referral_code, newUser.id);
        }

        const token = generateTokeEmailVerification({ email });

        userDeletionQueue.add(
          {
            userId: newUser.id,
          },
          {
            delay: 3600000,
          },
        );

        return sendVerificationEmail(email, {
          email,
          verification_url: verification_url + token,
        });
      } catch (error) {
        throw new ErrorHandler((error as Error).message, 400);
      }
    });
  }

  static async forgotPassword(req: Request) {
    try {
      const { email } = req.body;
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (!user || user.provider === 'google')
        throw new ErrorHandler(
          'The email address you entered is not linked to any account in our system. Please check the email and try again, or sign up if you don’t have an account yet.',
          404,
        );
      if (user.is_forgot === 1)
        throw new ErrorHandler(
          'Email already sent, please check your email.',
          400,
        );
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          is_forgot: 1,
        },
      });
      const token = generateTokeEmailVerification({ email });

      forgotPasswordQueue.add(
        {
          email,
        },
        {
          delay: 360000,
        },
      );
      return forgotPasswordEmail(email, {
        email,
        reset_url: forgot_password_url + token,
      });
    } catch (error) {
      throw new ErrorHandler((error as Error).message, 400);
    }
  }

  static async socialRegister(req: Request) {
    return await prisma.$transaction(async (prisma) => {
      try {
        const { email, provider, first_name, last_name, phone_number } =
          req.body;
        let user = await prisma.user.findFirst({
          include: {
            UserDetails: {
              select: {
                referral_code: true,
                f_referral_code: true,
              },
            },
          },
          where: {
            email,
          },
        });
        if (user) {
          if (user.provider !== provider)
            throw new ErrorHandler('User already exists', 400);
        } else {
          const newUser = await prisma.user.create({
            data: {
              email,
              first_name,
              last_name,
              phone_number: phone_number || '',
              Role: {
                connect: {
                  id: 1,
                },
              },
              provider,
              is_verified: 1,
            },
          });

          await prisma.userDetail.create({
            data: {
              userId: newUser.id,
              referral_code: generateReferralCode(),
            },
          });

          user = await prisma.user.findFirst({
            include: {
              UserDetails: {
                select: {
                  referral_code: true,
                  f_referral_code: true,
                },
              },
            },
            where: {
              email,
            },
          });
        }

        return generateToken(user);
      } catch (error) {
        throw new ErrorHandler((error as Error).message, 400);
      }
    });
  }

  static async checkVerifyEmail(req: Request) {
    const { email } = req.user;

    const user = (await prisma.user.findFirst({
      where: {
        email,
      },
    })) as IUser;

    if (!user) throw new ErrorHandler('User not found', 400);
    return user;
  }

  static async setPassword(req: Request) {
    const { email } = req.user;
    const { password } = req.body;
    const hashPassword = await hash(password, 10);

    const data: Prisma.UserUpdateInput = {
      is_verified: 1,
      password: hashPassword,
      is_forgot: 0,
    };
    await prisma.user.update({
      where: {
        email,
      },
      data,
    });
  }
}
