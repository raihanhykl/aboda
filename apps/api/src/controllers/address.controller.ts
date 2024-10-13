import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { CartService } from '../services/cart.services';
import { AddressService } from '@/services/address.services';

export class AddressController {
  async getUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.getUserAddress(req);
      return res.send(responseHandle('Get Address Success', data));
    } catch (error) {
      next(error);
    }
  }

  async getProvinces(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.getProvinces(req);
      return res.send(responseHandle('Get Address Success', data));
    } catch (error) {
      next(error);
    }
  }

  async getCityByProvince(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.getCityByProvince(req);
      return res.send(responseHandle('Get Address Success', data));
    } catch (error) {
      next(error);
    }
  }

  async createUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.createUserAddress(req);
      return res.send(responseHandle('Get Address Success', data));
    } catch (error) {
      next(error);
    }
  }
}
