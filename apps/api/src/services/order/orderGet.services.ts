import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

export class OrderGetService {
  static async getOrderByBranch(req: Request) {
    try {
      const status = req.query.status ? String(req.query.status) : '';
      const search = req.query.search ? String(req.query.search) : '';
      const branchIdFilter = req.query.branchFilter
        ? String(req.query.branchFilter)
        : '';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      const user = req.user;
      const dateFilter = req.query.date;

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

      let branchFilter: Prisma.OrderWhereInput = {};

      if (user.roleId === 3) {
        const adminDetail = await prisma.adminDetail.findUnique({
          where: { userId: user.id },
          select: { branchId: true },
        });

        if (!adminDetail || !adminDetail.branchId) {
          throw new ErrorHandler(
            'Admin does not have an associated branch',
            400,
          );
        }

        branchFilter = { branchId: adminDetail.branchId };
      } else if (user.roleId != 2) {
        throw new ErrorHandler('Unauthorized!', 401);
      } else if (user.roleId === 2) {
        if (branchIdFilter) branchFilter = { branchId: Number(branchIdFilter) };
      }
      const order = await prisma.order.findMany({
        where: {
          ...searchFilter,
          ...branchFilter,
          ...statusFilter,
          ...dateFilterCondition,
        },
        include: {
          OrderItem: {
            include: {
              Product: true,
            },
          },
          Branch: true,
          Address: {
            include: {
              City: {
                include: {
                  Province: true,
                },
              },
            },
          },
          ShippingDetail: true,
          User: true,
        },
        skip,
        take: limit,
        orderBy: {
          invoice: 'desc',
        },
      });

      const totalOrders = await prisma.order.count({
        where: {
          ...branchFilter,
          ...statusFilter,
          ...dateFilterCondition,
        },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalOrders / limit);

      return {
        data: order,
        totalPages,
      };
    } catch (error) {
      throw new ErrorHandler(
        'Terjadi kesalahan saat mengambil semua order',
        400,
      );
    }
  }
}
