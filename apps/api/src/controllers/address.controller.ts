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
  async getUserAddressWithin10KiloFromBranch(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data =
        await AddressService.getUserAddressWithin10KiloFromBranch(req);
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
      return res.send(responseHandle('Address added successfully', data));
    } catch (error) {
      next(error);
    }
  }

  async updateUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.updateUserAddress(req);
      return res.send(responseHandle('Address updated successfully', data));
    } catch (error) {
      next(error);
    }
  }
  async deleteUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.deleteUserAddress(req);
      return res.send(responseHandle('Address deleted successfully', data));
    } catch (error) {
      next(error);
    }
  }

  async setDefaultUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AddressService.setDefaultUserAddress(req);
      return res.send(responseHandle('Address set as default', data));
    } catch (error) {
      next(error);
    }
  }
}
