import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export class OrderQueryService {
  static async getAllOrder(req: Request) {
    try {
      const branchId = req.query.branch as number | undefined;
      const status = req.query.status ? String(req.query.status) : '';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      const branchFilter: Prisma.OrderWhereInput = branchId ? { branchId } : {};

      const statusFilter: Prisma.OrderWhereInput =
        status && status !== 'all' ? { status: status as any } : {};

      if (req.user.roleId == 2) {
        return await prisma.order.findMany({
          where: {
            ...branchFilter,
            ...statusFilter,
          },
          skip,
          take: limit,
        });
      } else throw new ErrorHandler('Unauthorized!', 401);
    } catch (error) {
      throw new ErrorHandler(
        'Terjadi kesalahan saat mengambil semua order',
        400,
      );
    }
  }

  static async getOrder(req: Request) {
    try {
      const userId = Number(req.user.id);
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const search = req.query.search ? String(req.query.search) : '';
      const status = req.query.status ? String(req.query.status) : '';

      const dateFilter = req.query.date;

      const skip = (page - 1) * limit;

      const searchFilter: Prisma.OrderWhereInput = search
        ? {
            OR: [
              {
                invoice: {
                  contains: search,
                } as Prisma.StringFilter,
              },
              {
                OrderItem: {
                  some: {
                    Product: {
                      product_name: {
                        contains: search,
                      } as Prisma.StringFilter,
                    },
                  },
                },
              },
            ],
          }
        : {};
      const statusFilter: Prisma.OrderWhereInput =
        status && status !== 'all' ? { status: status as any } : {};

      const dateFilterCondition: Prisma.OrderWhereInput = (() => {
        const today = new Date();
        if (dateFilter === 'today') {
          return {
            created_at: {
              gte: new Date(today.setHours(0, 0, 0, 0)),
              lte: new Date(),
            },
          };
        } else if (dateFilter === 'this_week') {
          return {
            created_at: {
              gte: startOfWeek(today),
              lte: new Date(),
            },
          };
        } else if (dateFilter === 'this_month') {
          return {
            created_at: {
              gte: startOfMonth(today),
              lte: new Date(),
            },
          };
        } else if (dateFilter === 'this_year') {
          return {
            created_at: {
              gte: startOfYear(today),
              lte: new Date(),
            },
          };
        }
        return {};
      })();

      const orders = await prisma.order.findMany({
        where: {
          userId,
          ...searchFilter,
          ...statusFilter,
          ...dateFilterCondition,
        },
        include: {
          OrderItem: {
            include: {
              Product: true,
            },
          },
          ShippingDetail: true,
          Address: {
            include: {
              City: {
                include: {
                  Province: true,
                },
              },
            },
          },
        },
        orderBy: {
          invoice: 'desc',
        },
        skip,
        take: limit,
      });

      const totalOrders = await prisma.order.count({
        where: {
          userId,
          ...searchFilter,
          ...statusFilter,
          ...dateFilterCondition,
        },
      });

      const totalPages = Math.ceil(totalOrders / limit);

      return {
        data: orders,
        totalPages,
        currentPage: page,
        totalItems: totalOrders,
      };
    } catch (error) {
      throw new ErrorHandler('Terjadi kesalahan saat mengambil order', 400);
    }
  }

  static async getByInvoice(req: Request) {
    try {
      const { invoice } = req.params;

      if (!req.user || !req.user.is_verified) {
        throw new ErrorHandler(
          'User belum terverifikasi atau tidak teregistrasi',
          403,
        );
      }

      const order = await prisma.order.findFirst({
        where: {
          invoice,
          userId: req.user.id,
          paymentId: 2,
          payment_proof: null,
        },
      });

      if (!order) {
        throw new ErrorHandler('Order tidak ditemukan', 403);
      }

      return order;
    } catch (error) {
      throw new ErrorHandler('Terjadi kesalahan saat mengambil order', 400);
    }
  }
}
