import { ErrorHandler } from '@/helpers/response';
import { cancelOrder, confirmOrder } from '@/lib/bull';
import prisma from '@/prisma';
import { Request } from 'express';

export class OrderUpdateService {
  static async updateStatus(req: Request) {
    const { orderId, status } = req.body;
    try {
      if (req.user.roleId == 2 || req.user.roleId == 3) {
        if (status == 'pending_payment') {
          const order = await prisma.order.update({
            where: {
              id: Number(orderId),
            },
            data: {
              payment_proof: null,
              status,
              updated_at: new Date(),
            },
          });

          cancelOrder.add(
            {
              user: order.userId,
              id: order.id,
            },
            {
              delay: 300000, //5 min
            },
          );

          return order;
        } else {
          const order = await prisma.order.update({
            where: {
              id: Number(orderId),
            },
            data: {
              status,
              updated_at: new Date(),
            },
          });

          if (status == 'shipped') {
            confirmOrder.add(
              {
                id: order.id,
              },
              {
                delay: 600000, //10 min
              },
            );
          }
          return order;
        }
      } else throw new ErrorHandler('Unauthorized', 401);
    } catch (error) {
      throw new ErrorHandler('Terjadi kesalahan saat update status order', 400);
    }
  }

  static async cancelOrder(req: Request) {
    try {
      const { invoice } = req.body;
      let order;
      if (!req.user) {
        throw new ErrorHandler('Unauthorized user', 403);
      }
      if (req.user.roleId == 1) {
        order = await prisma.order.findFirst({
          where: {
            invoice,
            userId: req.user.id,
            status: 'pending_payment',
          },
          include: {
            OrderItem: true,
          },
        });
      } else if (req.user.roleId == 2 || req.user.roleId == 3) {
        order = await prisma.order.findFirst({
          where: {
            invoice,
            status: {
              in: ['pending_payment', 'processing', 'awaiting_confirmation'],
            },
          },
          include: {
            OrderItem: true,
          },
        });
      }

      if (order) {
        await prisma.order.update({
          where: {
            id: Number(order.id),
          },
          data: {
            status: 'cancelled',
          },
        });
        for (const item of order.OrderItem) {
          const productStock = await prisma.productStock.findFirst({
            where: {
              productId: item.productId,
              branchId: Number(order.branchId),
            },
          });

          if (productStock) {
            const restoredStock = productStock.stock + item.quantity;

            await prisma.productStock.update({
              where: { id: productStock.id },
              data: { stock: restoredStock },
            });

            await prisma.stockHistory.create({
              data: {
                productStockId: productStock.id,
                stock_id: productStock.id,
                status: 'in',
                reference: `Order cancellation for Order ID: ${order.id}`,
                quantity: item.quantity,
                stock_before: productStock.stock,
                stock_after: restoredStock,
              },
            });
          }
        }
        return { message: 'Order cancelled successfully' };
      }
    } catch (error) {
      throw new Error('Failed to cancel order!');
    }
  }

  static async confirmOrder(req: Request) {
    const { invoice } = req.body;
    try {
      if (!req.user) throw new ErrorHandler('Unauthorized', 403);
      const order = await prisma.order.findFirst({
        where: {
          invoice,
          userId: req.user.id,
          status: 'shipped',
        },
      });
      if (order) {
        return await prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: 'confirmed',
            updated_at: new Date(),
          },
        });
      }
    } catch (error) {
      throw new Error('Failed to confirm order!');
    }
  }
}
