import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class CartService {
  static async getCart(req: Request) {
    try {
      return await prisma.cart.findMany({
        where: {
          userId: Number(req.user.id),
        },
        include: {
          ProductStock: {
            include: {
              Product: true,
              Branch: true,
            },
          },
        },
      });
    } catch (error) {}
  }

  static async addToCart(req: Request) {
    try {
      const { productStockId, quantityInput } = req.body;

      if (!req.user || !req.user.is_verified) {
        throw new ErrorHandler(
          'User belum terverifikasi atau tidak teregistrasi',
          403,
        );
      }

      const productStock = await prisma.productStock.findUnique({
        where: {
          id: productStockId,
        },
        include: {
          Branch: true,
        },
      });

      if (!productStock || productStock.stock < quantityInput) {
        throw new ErrorHandler(
          'Stok produk tidak tersedia atau jumlah melebihi stok',
          400,
        );
      }

      const userCartItems = await prisma.cart.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          ProductStock: {
            include: {
              Branch: true,
            },
          },
        },
      });

      const hasDifferentBranch = userCartItems.some(
        (cartItem) =>
          cartItem.ProductStock?.Branch?.id !== productStock?.Branch?.id,
      );

      if (hasDifferentBranch) {
        await prisma.cart.deleteMany({
          where: {
            userId: req.user.id,
          },
        });
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
          throw new ErrorHandler(
            'Jumlah total melebihi stok yang tersedia',
            400,
          );
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
      throw new ErrorHandler(
        'Terjadi kesalahan saat menambahkan ke keranjang',
        400,
      );
    }
  }

  static async updateCart(req: Request) {
    try {
      const { quantity, cartId } = req.body;

      if (quantity > 0) {
        return await prisma.cart.update({
          where: {
            id: Number(cartId),
            userId: req.user.id,
          },
          data: {
            quantity: quantity,
          },
        });
      }
    } catch (error) {
      throw new Error('Failed update cart!');
    }
  }

  static async delete(req: Request) {
    try {
      const { cartId } = req.body;

      return await prisma.cart.delete({
        where: {
          id: Number(cartId),
          userId: req.user.id,
        },
      });
    } catch (error) {
      throw new Error('Failed to delete cart!');
    }
  }

  static async deleteAll(req: Request) {
    try {
      return await prisma.cart.deleteMany({
        where: {
          userId: req.user.id,
        },
      });
    } catch (error) {
      throw new Error('Failed to delete all cart!');
    }
  }
}
