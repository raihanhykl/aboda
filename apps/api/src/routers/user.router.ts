import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { UserController } from '@/controllers/user.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { Uploader } from '@/middlewares/upload';

export class UserRouter {
  private router = Router();
  private userController = new UserController();

  constructor() {
    this.routes();
  }

  private routes() {
    this.router.get('/get-user', validateToken, this.userController.getUser);
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
    this.router.put(
      '/edit-profile',
      Uploader('profile', 'profile').single('image'),
      validateToken,
      this.userController.editProfile,
    );
    this.router.patch(
      '/change-password',
      validateToken,
      this.userController.changePassword,
    );
  }

  public getRouter() {
    return this.router;
  }
}
