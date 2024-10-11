import {
  ErrorHandler,
  generateReferralCode,
  referralVoucher,
} from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { IUser, IUserDetail } from '@/interfaces/user';
import { userDeletionQueue } from '@/lib/Deleteuser.lib';
import { compare, hash } from 'bcrypt';
import { generateTokeEmailVerification, generateToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/nodemailer';
import { verification_url } from '@/config';

export class AuthService {
  static async login(req: Request) {
    const { email, password } = req.body;
    const user = (await prisma.user.findUnique({
      where: {
        email,
      },
    })) as IUser;

    if (!user) throw new ErrorHandler('User not found', 400);
    const detail = await prisma.userDetail.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        referral_code: true,
        f_referral_code: true,
      },
    });

    const data = { ...user, ...detail };

    if (!data) {
      throw new ErrorHandler('User not found', 400);
    }
    if (data.is_verified == 0) {
      throw new ErrorHandler('User not verified', 400);
    }
    const checkPassword = await compare(password, data.password!);
    if (checkPassword) {
      delete data.password;
    } else throw new ErrorHandler('Password wrong', 400);
    return generateToken(data);
    // return data;
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

  static async socialRegister(req: Request) {
    return await prisma.$transaction(async (prisma) => {
      try {
        const { email, provider, first_name, last_name, phone_number } =
          req.body;
        const user = await prisma.user.findFirst({
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
        }
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
    };
    await prisma.user.update({
      where: {
        email,
      },
      data,
    });
  }
}
