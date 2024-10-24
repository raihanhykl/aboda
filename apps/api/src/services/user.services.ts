import { ErrorHandler } from '@/helpers/response';
import { IUser } from '@/interfaces/user';
import { generateToken } from '@/lib/jwt';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class UserService {
  static async getUser(req: Request) {
    try {
      return await prisma.user.findUnique({
        where: {
          id: Number(req.user.id),
        },
      });
    } catch (error) {
      throw new ErrorHandler('Error getting user', 400);
    }
  }
  static async getAllUserAddresses(req: Request) {
    try {
      return await prisma.userAddress.findMany({
        where: {
          userId: Number(req.user.id),
        },
        include: {
          address: {
            include: {
              City: {
                include: {
                  Province: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new ErrorHandler('Error getting user address', 400);
    }
  }

  static async getuserVouchers(req: Request) {
    try {
      return await prisma.userVoucher.findMany({
        where: {
          userId: Number(req.user.id),
        },
        include: {
          Voucher: true,
        },
      });
    } catch (error) {
      throw new ErrorHandler('Error getting user vouchers', 400);
    }
  }

  static async editProfile(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const { first_name, last_name, email, phone_number, isDeleting } =
          req.body;
        const image = req.file;
        const data: Prisma.UserUpdateInput = {
          first_name,
          last_name,
          email,
          phone_number,
        };

        if (image) {
          data.image = image.filename;
        }
        if (isDeleting) {
          data.image = '';
        }
        const user = (await prisma.user.update({
          where: {
            id: Number(req.user.id),
          },
          data,
        })) as IUser;
        delete user.password;

        return user;
      } catch (error) {
        throw new ErrorHandler('Error editing user profile', 400);
      }
    });
  }
}
