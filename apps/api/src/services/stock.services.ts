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
    try {
      const { branchId, productId, stock } = req.body;

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
  static async getHistory(req: Request) {
    try {
      const { branchId, productId } = req.query;

      const stockHistory = await prisma.stockHistory.findMany({
        where: {
          ...(branchId && { ProductStock: { branchId: Number(branchId) } }),
          ...(productId && { ProductStock: { productId: Number(productId) } }),
        },
        include: {
          ProductStock: {
            include: {
              Product: true,
              Branch: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const stockByProduct: Record<
        number,
        { incomingStock: number; outgoingStock: number }
      > = {};

      stockHistory.forEach((history) => {
        const productId = history.ProductStock?.productId;
        const quantity = history.quantity;

        if (productId) {
          if (!stockByProduct[productId]) {
            stockByProduct[productId] = { incomingStock: 0, outgoingStock: 0 };
          }

          if (history.status === 'in') {
            stockByProduct[productId].incomingStock += quantity;
          } else if (history.status === 'out') {
            stockByProduct[productId].outgoingStock += Math.abs(quantity);
          }
        }
      });

      return stockHistory;
    } catch (error) {
      throw new ErrorHandler('Failed to retrieve stock history', 500);
    }
  }
}
