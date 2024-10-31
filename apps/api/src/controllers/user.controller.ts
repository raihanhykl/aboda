import { responseHandle } from '@/helpers/response';
import { UserService } from '@/services/user.services';
import { NextFunction, Request, Response } from 'express';

export class UserController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.getUser(req);
      return res.send(responseHandle('Get User Success', data));
    } catch (error) {
      next(error);
    }
  }

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.editProfile(req);
      return res.send(responseHandle('Update User Success', data));
    } catch (error) {
      next(error);
    }
  }
  async getAllUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.getAllUserAddresses(req);
      return res.send(responseHandle('Get All User Address Success', data));
    } catch (error) {
      next(error);
    }
  }

  async getUserVouchers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.getuserVouchers(req);
      return res.send(responseHandle('Get All User Vouchers Success', data));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.changePassword(req);
      return res.send(responseHandle('Change Password Success', data));
    } catch (error) {
      next(error);
    }
  }
}
