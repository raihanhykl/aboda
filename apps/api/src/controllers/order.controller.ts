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

  async getByInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.getByInvoice(req);
      return res.send(responseHandle('Get Order by Invoice Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentProof(req: Request, res: Response, next: NextFunction) {
    try {
      // console.log(req, 'ini req body di controller');

      const data = await OrderService.updatePaymentProof(req);
      return res.send(responseHandle('Update Payment Proof Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updateFromMidtrans(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.updateFromMidtrans(req);
      return res.send(responseHandle('Update Order Status Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.updateToken(req);
      return res.send(responseHandle('Update Token Success', data));
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.cancelOrder(req);
      return res.send(responseHandle('Cancel Order Success', data));
    } catch (error) {
      next(error);
    }
  }

  async getOrderByBranch(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.getOrderByBranch(req);
      return res.send(responseHandle('Get Order Success', data));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.updateStatus(req);
      return res.send(responseHandle('Update Order Status Success', data));
    } catch (error) {
      next(error);
    }
  }

  async confirmOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await OrderService.confirmOrder(req);
      return res.send(responseHandle('Confirm Order Status Success', data));
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
