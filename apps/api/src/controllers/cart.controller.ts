import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { CartService } from '../services/cart.services';

export class CartController {
  async countCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CartService.countCart(req);
      return res.send(responseHandle('Get Cart Success', data));
    } catch (error) {
      next(error);
    }
  }
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CartService.getCart(req);
      return res.send(responseHandle('Get Cart Success', data));
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CartService.addToCart(req);
      return res.send(responseHandle('Add to Cart Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CartService.updateCart(req);
      return res.send(responseHandle('Update Cart Success', data));
    } catch (error) {
      next(error);
    }
  }

  async deleteCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CartService.delete(req);
      return res.send(responseHandle('Delete Cart Success', data));
    } catch (error) {
      next(error);
    }
  }

  async deleteAllCart(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CartService.deleteAll(req);
      return res.send(responseHandle('Delete All Cart Success', data));
    } catch (error) {
      next(error);
    }
  }
}
