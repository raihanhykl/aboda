import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';
import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { OrderController } from '@/controllers/order.controller';
import { Uploader } from '@/middlewares/upload';

export class OrderRouter {
  private router = Router();
  private orderController = new OrderController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.get(
      '/get-branch',
      validateToken,
      this.orderController.getOrderByBranch,
    );
    this.router.get('/get', validateToken, this.orderController.getOrder);
    this.router.post(
      '/add-order',
      validateToken,
      this.orderController.addOrder,
    );
    this.router.get(
      '/:invoice',
      validateToken,
      this.orderController.getByInvoice,
    );
    this.router.post(
      '/update-payment-proof',
      Uploader('payment-proof', 'payment-proof').single('image'),
      validateToken,
      this.orderController.updatePaymentProof,
    );
    this.router.post(
      '/update-midtrans',
      validateToken,
      this.orderController.updateFromMidtrans,
    );
    this.router.post(
      '/update-midtrans-token',
      validateToken,
      this.orderController.updateToken,
    );

    this.router.post(
      '/cancel',
      validateToken,
      this.orderController.cancelOrder,
    );
    this.router.post(
      '/update-status',
      validateToken,
      this.orderController.updateStatus,
    );
    this.router.post(
      '/confirm-order',
      validateToken,
      this.orderController.confirmOrder,
    );
  }
  public getRouter() {
    return this.router;
  }
}
