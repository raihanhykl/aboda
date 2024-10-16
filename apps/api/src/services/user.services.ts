import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Request } from 'express';

export class UserService {
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

  static async changePassword(req: Request) {
    try {
    } catch (error) {}
  }
}
