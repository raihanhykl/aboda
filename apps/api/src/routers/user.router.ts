import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { UserController } from '@/controllers/user.controller';
import { validateToken } from '@/middlewares/verifyToken';

export class UserRouter {
  private router = Router();
  private userController = new UserController();

  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get(
      '/get-all-user-addresses',
      validateToken,
      this.userController.getAllUserAddress,
    );

    this.router.get(
      '/get-all-user-vouchers',
      validateToken,
      this.userController.getUserVouchers,
    );
  }

  public getRouter() {
    return this.router;
  }
}
