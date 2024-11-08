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

    this.router.put(
      '/update-user-address',
      validateToken,
      this.addressController.updateUserAddress,
    );

    this.router.get(
      '/get-user-address-branch',
      validateToken,
      this.addressController.getUserAddressWithin10KiloFromBranch,
    );
    this.router.patch(
      '/delete-user-address',
      validateToken,
      this.addressController.deleteUserAddress,
    );
    this.router.patch(
      '/set-default-user-address',
      validateToken,
      this.addressController.setDefaultUserAddress,
    );
  }
  public getRouter() {
    return this.router;
  }
}
