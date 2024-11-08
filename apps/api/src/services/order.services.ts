import { ErrorHandler } from '@/helpers/response';
import { cancelOrder, confirmOrder } from '@/lib/bull';
import prisma from '@/prisma';
import { Request } from 'express';
import { OrderQueryService } from './order/orderQuery.services';
import { OrderUpdateService } from './order/orderUpdate.services';
import { OrderCreationService } from './order/orderCreate.services';
import { OrderPaymentService } from './order/orderPayment.service';
import { OrderGetService } from './order/orderGet.services';

export class OrderService {
  static async getAllOrder(req: Request) {
    return OrderQueryService.getAllOrder(req);
  }

  static async getOrderByBranch(req: Request) {
    return OrderGetService.getOrderByBranch(req);
  }

  static async getOrder(req: Request) {
    return OrderQueryService.getOrder(req);
  }

  static async updateStatus(req: Request) {
    return OrderUpdateService.updateStatus(req);
  }

  static async addOrder(req: Request) {
    return OrderCreationService.addOrder(req);
  }

  static async getByInvoice(req: Request) {
    return OrderQueryService.getByInvoice(req);
  }

  static async updateFromMidtrans(req: Request) {
    return OrderPaymentService.updateFromMidtrans(req);
  }

  static async updatePaymentProof(req: Request) {
    return OrderPaymentService.updatePaymentProof(req);
  }

  static async updateToken(req: Request) {
    return OrderPaymentService.updateToken(req);
  }

  static async cancelOrder(req: Request) {
    return OrderUpdateService.cancelOrder(req);
  }

  static async confirmOrder(req: Request) {
    return OrderUpdateService.confirmOrder(req);
  }
}
