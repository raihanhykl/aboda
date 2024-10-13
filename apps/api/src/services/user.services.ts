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
              City: true,
            },
          },
        },
      });
    } catch (error) {
      throw new ErrorHandler('Error getting user address', 400);
    }
  }
}
