import { IUser, IUserDetail } from '@/interfaces/user';
import prisma from '@/prisma';
import Queue from 'bull';

export const userDeletionQueue = new Queue('userDeletion');
export const forgotPasswordQueue = new Queue('forgotPassword');
export const cancelOrder = new Queue('cancelOrder');
export const confirmOrder = new Queue('confirmOrder');

userDeletionQueue.process(async (job) => {
  prisma.$transaction(async (prisma) => {
    const userId = job.data.userId;
    const user = (await prisma.user.findFirst({
      where: {
        id: userId,
      },
    })) as IUser;

    if (user && !user.is_verified) {
      await prisma.userDetail.delete({
        where: {
          userId,
        },
      });
      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      console.log('User deleted due to unverified account');
    }
  });
});

forgotPasswordQueue.process(async (job) => {
  const { email } = job.data;
  const user = (await prisma.user.findFirst({
    where: {
      email,
    },
  })) as IUser;
  if (user && user.is_forgot === 1) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        is_forgot: 0,
      },
    });
    console.log('Reset password is expired due to timeout');
  }
});

cancelOrder.process(async (job) => {
  const { id, user } = job.data;

  const order = await prisma.order.findFirst({
    where: {
      id: Number(id),
      userId: user,
      status: 'pending_payment',
    },
    include: {
      OrderItem: true,
    },
  });

  if (order) {
    await prisma.order.update({
      where: {
        id: Number(id),
        userId: user,
        status: 'pending_payment',
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
            reference: `Order cancellation (run out of time) for Order ID: ${order.id}`,
            quantity: item.quantity,
            stock_before: productStock.stock,
            stock_after: restoredStock,
          },
        });
      }
    }
  }
});

confirmOrder.process(async (job) => {
  const { id } = job.data;
  const order = await prisma.order.findFirst({
    where: {
      id: Number(id),
      status: 'shipped',
    },
    include: {
      OrderItem: true,
    },
  });

  if (order) {
    await prisma.order.update({
      where: {
        id: Number(id),
        status: 'shipped',
      },
      data: {
        status: 'confirmed',
      },
    });
  }
});
