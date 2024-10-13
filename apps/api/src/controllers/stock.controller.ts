import { Request, Response, NextFunction } from 'express';
import { StockService } from '@/services/stock.services';

export class StockController {
  static async getStockByBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const stockData = await StockService.getStockByBranch(req);
      res.json(stockData);
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedStock = await StockService.updateStock(req);
      res.json(updatedStock);
    } catch (error) {
      next(error);
    }
  }

  static async createStock(req: Request, res: Response, next: NextFunction) {
    try {
      const newStock = await StockService.createStock(req);
      res.json(newStock);
    } catch (error) {
      next(error);
    }
  }

  static async deleteStock(req: Request, res: Response, next: NextFunction) {
    try {
      const deletedStock = await StockService.deleteStock(req);
      res.json(deletedStock);
    } catch (error) {
      next(error);
    }
  }
}
