import { Router } from 'express';
import { DiscountController } from '../controllers/discount.controller';
import { validateToken } from '@/middlewares/verifyToken';

export class DiscountRouter {
  private router = Router();
  private discountController = new DiscountController();

  constructor() {
    this.routes();
  }

  private routes() {
    // Get all discounts
    this.router.get('/', this.discountController.getAll);

    // Create a new discount
    this.router.post('/', validateToken, this.discountController.create);

    // Update an existing discount
    this.router.put('/:id', validateToken, this.discountController.update);

    // Delete a discount
    this.router.delete('/:id', validateToken, this.discountController.delete);

    this.router.get('/get-product', this.discountController.getSelectedProduct);
  }

  public getRouter() {
    return this.router;
  }
}
