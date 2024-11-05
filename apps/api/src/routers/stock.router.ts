import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';

export class StockRouter {
  private router = Router();

  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get('/:branchId/stocks', StockController.getStockByBranch);
    this.router.put(
      '/:branchId/products/:productId/update-stock',
      StockController.updateStock,
    );
    this.router.get('/history', new StockController().getHistory);
    this.router.post('/create', StockController.createStock);
    this.router.delete('/:stockId/delete', StockController.deleteStock);
  }

  public getRouter() {
    return this.router;
  }
}
