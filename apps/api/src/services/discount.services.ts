// services/discount.service.ts

import { ErrorHandler } from '@/helpers/response';
import { Request } from 'express';
import prisma from '@/prisma';
import { Discount } from '@prisma/client';

export class DiscountService {
  // Create Discount
  static async createDiscount(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const user = req.user;
        const {
          branchId,
          discount_type,
          discount_value,
          start_date,
          end_date,
          productId,
        } = req.body;

        // Check if the user is authorized (assuming roleId 2 is for admin)
        if (user.roleId !== 2) {
          throw new ErrorHandler('Unauthorized', 401);
        }

        // Create the discount
        const newDiscount = await prisma.discount.create({
          data: {
            branchId: Number(branchId),
            discount_type,
            discount_value: Number(discount_value),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            productId: productId ? Number(productId) : null, // Optional productId
          },
        });

        return newDiscount;
      } catch (error) {
        if (error instanceof ErrorHandler) {
          throw error;
        }
        throw new ErrorHandler('Failed to create discount', 500);
      }
    });
  }

  // Update Discount
  static async updateDiscount(req: Request) {
    return prisma.$transaction(async (prisma) => {
      try {
        const user = req.user;
        const { id } = req.params;
        const {
          branchId,
          discount_type,
          discount_value,
          start_date,
          end_date,
          productId,
        } = req.body;

        // Check if the user is authorized
        if (user.roleId !== 2) {
          throw new ErrorHandler('Unauthorized', 401);
        }

        // Update the discount
        const updatedDiscount = await prisma.discount.update({
          where: {
            id: Number(id),
          },
          data: {
            branchId: Number(branchId),
            discount_type,
            discount_value: Number(discount_value),
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            productId: productId ? Number(productId) : null,
          },
        });

        return updatedDiscount;
      } catch (error) {
        if (error instanceof ErrorHandler) {
          throw error;
        }
        throw new ErrorHandler('Failed to update discount', 500);
      }
    });
  }

  // Delete Discount
  static async deleteDiscount(req: Request) {
    try {
      const user = req.user;
      const { id } = req.params;

      // Check if the user is authorized
      if (user.roleId !== 2) {
        throw new ErrorHandler('Unauthorized', 401);
      }

      await prisma.discount.delete({
        where: {
          id: Number(id),
        },
      });

      return { message: 'Discount deleted successfully' };
    } catch (error) {
      throw new ErrorHandler('Failed to delete discount', 500);
    }
  }

  // Get All Discounts
  static async getAllDiscounts(): Promise<Discount[]> {
    try {
      return await prisma.discount.findMany({
        include: {
          Product: true,
          Branch: true,
        },
      });
    } catch (error) {
      throw new ErrorHandler('Failed to retrieve discounts', 500);
    }
  }

  static async getSelectedProduct(req: Request) {
    try {
      const branchId = req.query.branchId;
      const productId = req.query.productId;
      // const branchId = req.query.branchId;
      // const productId,  = req.query.productId;

      console.log(productId, branchId, 'bakekok');
      console.log(new Date(new Date().getTime() + 7 * 60 * 60 * 1000));

      return await prisma.discount.findMany({
        where: {
          productId: Number(productId),
          branchId: Number(branchId),
          start_date: {
            lte: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
          },
          end_date: {
            gte: new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
          },
        },
        include: {
          Product: true, // Include related Product data if needed
          Branch: true, // Include related Branch data if needed
        },
      });
    } catch (error) {
      throw new ErrorHandler('Failed to retrieve discounts', 500);
    }
  }
}
