import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';
import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middlewares/verifyToken';

export class CartRouter {
  private router = Router();
  private cartController = new CartController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.get('/get', validateToken, this.cartController.getCart);
    this.router.post('/add', validateToken, this.cartController.addToCart);
  }
  public getRouter() {
    return this.router;
  }
}
