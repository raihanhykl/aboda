import { ErrorHandler } from '@/helpers/response';
import { IUser } from '@/interfaces/user';
import { generateToken } from '@/lib/jwt';
import prisma from '@/prisma';
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
    try {
      const { first_name, last_name, email, phone_number } = req.body;
      const user = (await prisma.user.update({
        where: {
          id: Number(req.user.id),
        },
        data: {
          first_name,
          last_name,
          email,
          phone_number,
          updated_at: new Date(),
        },
      })) as IUser;
      delete user.password;

      // return generateToken(user);
      return user;
    } catch (error) {
      throw new ErrorHandler('Error editing user profile', 400);
    }
  }
}
