import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
// import { CartService } from '../services/cart.services';
import { OrderService } from '@/services/order.services';

export class OrderController {
  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.getOrder(req);
      return res.send(responseHandle('Get Order Success', data));
    } catch (error) {
      next(error);
    }
  }

  async addOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.addOrder(req);
      return res.send(responseHandle('Add Order Success', data));
    } catch (error) {
      next(error);
    }
  }

  //   `async updateCart(req: Request, res: Response, next: NextFunction) {
  //     try {
  //       const data = await CartService.updateCart(req);
  //       return res.send(responseHandle('Update Cart Success', data));
  //     } catch (error) {
  //       next(error);
  //     }
  //   }

  //   async deleteCart(req: Request, res: Response, next: NextFunction) {
  //     try {
  //       const data = await CartService.delete(req);
  //       return res.send(responseHandle('Delete Cart Success', data));
  //     } catch (error) {
  //       next(error);
  //     }
  //   }

  //   async deleteAllCart(req: Request, res: Response, next: NextFunction) {
  //     try {
  //       const data = await CartService.deleteAll(req);
  //       return res.send(responseHandle('Delete All Cart Success', data));
  //     } catch (error) {
  //       next(error);
  //     }
  //   }`
}
