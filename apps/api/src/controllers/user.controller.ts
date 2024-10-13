import { responseHandle } from '@/helpers/response';
import { UserService } from '@/services/user.services';
import { NextFunction, Request, Response } from 'express';

export class UserController {
  async getAllUserAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await UserService.getAllUserAddresses(req);
      return res.send(responseHandle('Get All User Address Success', data));
    } catch (error) {
      next(error);
    }
  }
}
