import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';
import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { OrderController } from '@/controllers/order.controller';

export class OrderRouter {
  private router = Router();
  private orderController = new OrderController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.get('/get', validateToken, this.orderController.getOrder);
    this.router.post(
      '/add-order',
      validateToken,
      this.orderController.addOrder,
    );
    // this.router.patch('/update', validateToken, this.cartController.updateCart);
    // this.router.patch('/delete', validateToken, this.cartController.deleteCart);
    // this.router.patch(
    //   '/delete-all',
    //   validateToken,
    //   this.cartController.deleteAllCart,
    // );
  }
  public getRouter() {
    return this.router;
  }
}
