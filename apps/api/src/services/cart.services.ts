import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { IUser, IUserDetail } from '@/interfaces/user';
import { userDeletionQueue } from '@/lib/Deleteuser.lib';
import { compare, hash } from 'bcrypt';
import { generateTokeEmailVerification, generateToken } from '@/lib/jwt';
import { sendVerificationEmail } from '@/lib/nodemailer';
import { verification_url } from '@/config';

export class CartService {
  static async addToCart(req: Request) {
    try {
      const { productStockId, quantityInput } = req.body;

      const checkStock = await prisma.productStock.count({
        where: {
          id: productStockId,
        },
      });

      if (!checkStock) {
        // throw new error
      }
      const data: Prisma.CartCreateInput = {
        quantity: quantityInput,
        ProductStock: {
          connect: {
            id: productStockId,
          },
        },
        User: {
          connect: {
            id: Number(req.user.id),
          },
        },
      };

      return await prisma.cart.upsert({
        where: {
          productStockId: Number(productStockId),
          userId: Number(req.user.id),
        },
        update: {
          //   name: 'Viola the Magnificent',
          quantity: quantityInput,
        },
        create: {
          //   email: 'viola@prisma.io',
          //   name: 'Viola the Magnificent',
        },
      });
    } catch (error) {}
  }
}
