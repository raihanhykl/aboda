import { ErrorHandler } from '@/helpers/response';
import { Request } from 'express';
import prisma from '@/prisma';
import { IUser } from '@/interfaces/user';

export class ProductAdminServices {
  static async createProduct(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const user = req.user;
        const { product_name, description, price, weight, categoryId } =
          req.body;

        const image = req.file;
        // Check if the user is a superadmin
        if (user.roleId !== 2) {
          throw new ErrorHandler('Unauthorized', 401);
        }
        const existingProduct = await prisma.product.findFirst({
          where: {
            product_name,
          },
        });

        if (existingProduct) {
          throw new ErrorHandler('Product name must be unique', 400);
        }

        // Create the product
        const product = await prisma.product.create({
          data: {
            product_name,
            description,
            price: Number(price),
            weight: Number(weight),
            categoryId: Number(categoryId),
            image: image?.filename || '',
          },
        });

        return product;
      } catch (error) {
        if (error instanceof ErrorHandler) {
          throw error;
        }
        throw new ErrorHandler('Failed to create product', 500);
      }
    });
  }

  // Update Product
  static async updateProduct(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const user = req.user;
        const { id } = req.params;
        const { product_name, description, price, weight, categoryId, image } =
          req.body;

        if (user.roleId !== 2) {
          throw new ErrorHandler('Unauthorized', 401);
        }

        const existingProduct = await prisma.product.findFirst({
          where: {
            product_name,
          },
        });

        if (existingProduct) {
          throw new ErrorHandler('Product name must be unique', 400);
        }

        // Update the product
        await prisma.product.update({
          where: {
            id: Number(id),
          },
          data: {
            product_name,
            description,
            price: Number(price),
            weight: Number(weight),
            categoryId: Number(categoryId),
            image: req.file?.filename || undefined,
          },
        });

        //add product_image
      } catch (error) {
        throw new ErrorHandler('Failed to Update product', 500);
      }
    });
  }

  // Delete Product
  static async deleteProduct(req: Request) {
    try {
      const user = req.user;
      const { id } = req.params;

      if (user.roleId !== 2) {
        throw new ErrorHandler('Unauthorized', 401);
      }

      await prisma.product.delete({
        where: {
          id: Number(id),
        },
      });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new ErrorHandler('Failed to delete product', 500);
    }
  }
}
