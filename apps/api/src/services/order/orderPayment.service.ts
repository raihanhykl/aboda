import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Request } from 'express';

export class OrderPaymentService {
  static async updateFromMidtrans(req: Request) {
    try {
      const { invoice } = req.body;
      const order = await prisma.order.findFirst({
        where: {
          invoice,
          userId: req.user.id,
          status: 'pending_payment',
        },
      });
      if (order) {
        return await prisma.order.update({
          where: {
            id: order.id,
            paymentId: 1,
          },
          data: {
            status: 'processing',
          },
        });
      } else throw new Error('Order not valid!');
    } catch (error) {
      throw new Error('Failed to update order status!');
    }
  }

  static async updatePaymentProof(req: Request) {
    try {
      const { id } = req.body;
      const image = req.file;

      console.log(image?.filename);

      if (!id || !image) {
        throw new Error('Id atau image tidak ada!');
      }

      const order = await prisma.order.update({
        where: {
          id: Number(id),
          userId: req.user.id,
          payment_proof: null,
          paymentId: 2,
        },
        data: {
          payment_proof: image.filename || '',
          status: 'awaiting_confirmation',
        },
      });

      return order;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update payment proof!');
    }
  }

  static async updateToken(req: Request) {
    try {
      const { invoice, order_token } = req.body;
      const order = await prisma.order.findFirst({
        where: {
          invoice,
          userId: req.user.id,
          status: 'pending_payment',
        },
      });
      if (order) {
        return await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            midtrans_token: order_token,
          },
        });
      }
    } catch (error) {
      throw new Error('Failed to add token!');
    }
  }
}
