import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';
import { CartController } from '@/controllers/cart.controller';

export class CartRouter {
  private router = Router();
  private cartController = new CartController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.post('/add', this.cartController.addToCart);
  }
  public getRouter() {
    return this.router;
  }
}
