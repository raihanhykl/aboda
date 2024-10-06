import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class CartService {
  static async addToCart(req: Request) {
    try {
      const { productStockId, quantityInput } = req.body;

      if (!req.user || !req.user.is_verified) {
        throw new ErrorHandler('User belum terverifikasi atau tidak teregistrasi', 403);
      }

      const productStock = await prisma.productStock.findUnique({
        where: {
          id: productStockId,
        },
      });

      if (!productStock || productStock.stock < quantityInput) {
        throw new ErrorHandler('Stok produk tidak tersedia atau jumlah melebihi stok', 400);
      }

      const existingCartItem = await prisma.cart.findFirst({
        where: {
          userId: req.user.id,
          productStockId,
        },
      });

      if (existingCartItem) {
        const updatedQuantity = existingCartItem.quantity + quantityInput;

        if (updatedQuantity > Number(productStock?.stock)) {
          throw new ErrorHandler('Jumlah total melebihi stok yang tersedia', 400);
        }

        await prisma.cart.update({
          where: {
            id: existingCartItem.id,
          },
          data: {
            quantity: updatedQuantity,
          },
        });
      } else {
        await prisma.cart.create({
          data: {
            quantity: quantityInput,
            ProductStock: {
              connect: {
                id: productStockId,
              },
            },
            User: {
              connect: {
                id: req.user.id,
              },
            },
          },
        });
      }
      return { message: 'Produk berhasil ditambahkan ke keranjang' };
    } catch (error) {
      throw new ErrorHandler('ERROR BGT KAK', 400);
    }
  }
}
