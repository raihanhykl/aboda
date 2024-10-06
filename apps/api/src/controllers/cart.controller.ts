import { responseHandle } from '@/helpers/response';
import { NextFunction, Request, Response } from 'express';
import { CartService } from '../services/cart.services';

export class CartController {

    async addToCart(req: Request, res: Response, next: NextFunction) {
        try {
          const data = await CartService.addToCart(req);
          return res.send(responseHandle('Add to Cart Success', data));
        } catch (error) {
          next(error);
        }
    }
}
