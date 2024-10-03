import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { IUser, IUserDetail } from '@/interfaces/user';

export class AuthService {
  static async register(req: Request) {
    return await prisma.$transaction(async (prisma) => {
      try {
        const { first_name, last_name, email, phone_number, f_referral_code } =
          req.body;

        const data: Prisma.UserCreateInput = {
          first_name,
          last_name,
          email,
          phone_number,
          Role: {
            connect: {
              id: 1,
            },
          },
          image: 'avatar.png',
          is_verified: 0,
        };

        const newUser = await prisma.user.create({
          data,
        });

        const newUserDetail = await prisma.userDetail.create({
          data: {
            referral_code: Math.random()
              .toString(36)
              .toLocaleUpperCase()
              .slice(2, 9)
              .padEnd(7, '0'),
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
        }
      } catch (error) {
        throw new ErrorHandler((error as Error).message, 400);
      }
    });
  }
}
