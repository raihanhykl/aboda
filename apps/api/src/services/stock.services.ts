import { PrismaClient, Status } from '@prisma/client';
import { Request } from 'express';
import { ErrorHandler } from '@/helpers/response';

const prisma = new PrismaClient();

export class StockService {
  static async getStockByBranch(req: Request) {
    try {
      const { branchId } = req.params;

      const stocks = await prisma.productStock.findMany({
        where: {
          branchId: Number(branchId),
        },
        include: {
          Product: true,
          Branch: true,
        },
      });

      return stocks;
    } catch (error) {
      throw new ErrorHandler('Failed to fetch stock data', 500);
    }
  }

  static async updateStock(req: Request) {
    const { branchId, productId } = req.params;
    const { quantity, reference, status } = req.body;

    try {
      const productStock = await prisma.productStock.findFirst({
        where: { branchId: Number(branchId), productId: Number(productId) },
      });

      if (!productStock) throw new ErrorHandler('Product stock not found', 404);

      const newStock =
        status === 'in'
          ? productStock.stock + quantity
          : productStock.stock - quantity;

      await prisma.stockHistory.create({
        data: {
          stock_id: productStock.id,
          productStockId: productStock.id,
          status: status as Status,
          reference,
          quantity,
          stock_before: productStock.stock,
          stock_after: newStock,
        },
      });

      await prisma.productStock.update({
        where: { id: productStock.id },
        data: { stock: newStock },
      });

      return { message: 'Stock updated successfully' };
    } catch (error) {
      throw new ErrorHandler('Failed to update stock', 500);
    }
  }

  static async createStock(req: Request) {
    const { branchId, productId, stock } = req.body;

    try {
      await prisma.productStock.create({
        data: {
          branchId: Number(branchId),
          productId: Number(productId),
          stock: Number(stock),
        },
      });

      return { message: 'Stock created successfully' };
    } catch (error) {
      throw new ErrorHandler('Failed to create stock', 500);
    }
  }

  static async deleteStock(req: Request) {
    const { stockId } = req.params;

    try {
      await prisma.productStock.delete({
        where: { id: Number(stockId) },
      });

      return { message: 'Stock deleted successfully' };
    } catch (error) {
      throw new ErrorHandler('Failed to delete stock', 500);
    }
  }
}
