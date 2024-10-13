import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateData } from '@/middlewares/validationMiddleware';
import { registerSchema } from '@/schemas/auth.schema';
import { verifyEmail } from '@/middlewares/verifyEmail';
import { CartController } from '@/controllers/cart.controller';
import { validateToken } from '@/middlewares/verifyToken';
import { AddressController } from '@/controllers/address.controller';

export class AddressRouter {
  private router = Router();
  private addressController = new AddressController();
  constructor() {
    this.routes();
  }
  private routes() {
    this.router.get(
      '/get-user',
      validateToken,
      this.addressController.getUserAddress,
    );
    this.router.get('/get-provinces', this.addressController.getProvinces);
    this.router.get(
      '/get-city-by-province',
      this.addressController.getCityByProvince,
    );
    this.router.post(
      '/add-user-address',
      validateToken,
      this.addressController.createUserAddress,
    );

    // this.router.post('/add', validateToken, this.cartController.addToCart);
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
