// import { ErrorHandler } from '@/helpers/response';
// import { cancelOrder, confirmOrder } from '@/lib/bull';
// import prisma from '@/prisma';
// import { Prisma } from '@prisma/client';
// import axios from 'axios';
// import { Request } from 'express';
// import { subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

// export class OrderService {
//   static async getAllOrder(req: Request) {
//     try {
//       const branchId = req.query.branch as number | undefined;
//       const status = req.query.status ? String(req.query.status) : '';
//       const page = Number(req.query.page) || 1;
//       const limit = Number(req.query.limit) || 5;
//       const skip = (page - 1) * limit;

//       const branchFilter: Prisma.OrderWhereInput = branchId ? { branchId } : {};

//       const statusFilter: Prisma.OrderWhereInput =
//         status && status !== 'all' ? { status: status as any } : {};

//       if (req.user.roleId == 2) {
//         return await prisma.order.findMany({
//           where: {
//             ...branchFilter,
//             ...statusFilter,
//           },
//           skip,
//           take: limit,
//         });
//       } else throw new ErrorHandler('Unauthorized!', 401);
//     } catch (error) {
//       throw new ErrorHandler(
//         'Terjadi kesalahan saat mengambil semua order',
//         400,
//       );
//     }
//   }

//   static async getOrderByBranch(req: Request) {
//     try {
//       const status = req.query.status ? String(req.query.status) : '';
//       const search = req.query.search ? String(req.query.search) : '';
//       const branchIdFilter = req.query.branchFilter
//         ? String(req.query.branchFilter)
//         : '';
//       const page = Number(req.query.page) || 1;
//       const limit = Number(req.query.limit) || 5;
//       const skip = (page - 1) * limit;
//       const user = req.user;
//       const dateFilter = req.query.date;

//       const searchFilter: Prisma.OrderWhereInput = search
//         ? {
//             OR: [
//               {
//                 invoice: {
//                   contains: search,
//                 } as Prisma.StringFilter,
//               },
//               {
//                 OrderItem: {
//                   some: {
//                     Product: {
//                       product_name: {
//                         contains: search,
//                       } as Prisma.StringFilter,
//                     },
//                   },
//                 },
//               },
//             ],
//           }
//         : {};

//       const statusFilter: Prisma.OrderWhereInput =
//         status && status !== 'all' ? { status: status as any } : {};

//       const dateFilterCondition: Prisma.OrderWhereInput = (() => {
//         const today = new Date();
//         if (dateFilter === 'today') {
//           return {
//             created_at: {
//               gte: new Date(today.setHours(0, 0, 0, 0)),
//               lte: new Date(),
//             },
//           };
//         } else if (dateFilter === 'this_week') {
//           return {
//             created_at: {
//               gte: startOfWeek(today),
//               lte: new Date(),
//             },
//           };
//         } else if (dateFilter === 'this_month') {
//           return {
//             created_at: {
//               gte: startOfMonth(today),
//               lte: new Date(),
//             },
//           };
//         } else if (dateFilter === 'this_year') {
//           return {
//             created_at: {
//               gte: startOfYear(today),
//               lte: new Date(),
//             },
//           };
//         }
//         return {};
//       })();

//       let branchFilter: Prisma.OrderWhereInput = {};

//       if (user.roleId === 3) {
//         const adminDetail = await prisma.adminDetail.findUnique({
//           where: { userId: user.id },
//           select: { branchId: true },
//         });

//         if (!adminDetail || !adminDetail.branchId) {
//           throw new ErrorHandler(
//             'Admin does not have an associated branch',
//             400,
//           );
//         }

//         branchFilter = { branchId: adminDetail.branchId };
//       } else if (user.roleId != 2) {
//         throw new ErrorHandler('Unauthorized!', 401);
//       } else if (user.roleId === 2) {
//         if (branchIdFilter) branchFilter = { branchId: Number(branchIdFilter) };
//       }
//       const order = await prisma.order.findMany({
//         where: {
//           ...searchFilter,
//           ...branchFilter,
//           ...statusFilter,
//           ...dateFilterCondition,
//         },
//         include: {
//           OrderItem: {
//             include: {
//               Product: true,
//             },
//           },
//           Branch: true,
//           Address: {
//             include: {
//               City: {
//                 include: {
//                   Province: true,
//                 },
//               },
//             },
//           },
//           ShippingDetail: true,
//           User: true,
//         },
//         skip,
//         take: limit,
//         orderBy: {
//           invoice: 'desc',
//         },
//       });

//       const totalOrders = await prisma.order.count({
//         where: {
//           ...branchFilter,
//           ...statusFilter,
//           ...dateFilterCondition,
//         },
//       });

//       // Calculate total pages
//       const totalPages = Math.ceil(totalOrders / limit);

//       return {
//         data: order,
//         totalPages,
//       };
//     } catch (error) {
//       throw new ErrorHandler(
//         'Terjadi kesalahan saat mengambil semua order',
//         400,
//       );
//     }
//   }

//   static async getOrder(req: Request) {
//     try {
//       const userId = Number(req.user.id);
//       const page = Number(req.query.page) || 1;
//       const limit = Number(req.query.limit) || 5;
//       const search = req.query.search ? String(req.query.search) : '';
//       const status = req.query.status ? String(req.query.status) : '';
//       // const date = 'today' || 'this week' || 'this month' || 'this year';

//       const dateFilter = req.query.date;

//       const skip = (page - 1) * limit;

//       console.log(page, 'ini page');
//       console.log(limit, 'ini limit');
//       console.log(search, 'ini search');
//       console.log(status, 'ini status');
//       console.log(dateFilter, 'ini date');

//       // Define search filter
//       const searchFilter: Prisma.OrderWhereInput = search
//         ? {
//             OR: [
//               {
//                 invoice: {
//                   contains: search,
//                 } as Prisma.StringFilter,
//               },
//               {
//                 OrderItem: {
//                   some: {
//                     Product: {
//                       product_name: {
//                         contains: search,
//                       } as Prisma.StringFilter,
//                     },
//                   },
//                 },
//               },
//             ],
//           }
//         : {};

//       // Define status filter
//       const statusFilter: Prisma.OrderWhereInput =
//         status && status !== 'all'
//           ? { status: status as any } // Adjust this to match your enum type if `status` is an enum
//           : {};

//       const dateFilterCondition: Prisma.OrderWhereInput = (() => {
//         const today = new Date();
//         if (dateFilter === 'today') {
//           return {
//             created_at: {
//               gte: new Date(today.setHours(0, 0, 0, 0)),
//               lte: new Date(),
//             },
//           };
//         } else if (dateFilter === 'this_week') {
//           return {
//             created_at: {
//               gte: startOfWeek(today),
//               lte: new Date(),
//             },
//           };
//         } else if (dateFilter === 'this_month') {
//           return {
//             created_at: {
//               gte: startOfMonth(today),
//               lte: new Date(),
//             },
//           };
//         } else if (dateFilter === 'this_year') {
//           return {
//             created_at: {
//               gte: startOfYear(today),
//               lte: new Date(),
//             },
//           };
//         }
//         return {};
//       })();

//       // Fetch paginated orders with filters
//       const orders = await prisma.order.findMany({
//         where: {
//           userId,
//           ...searchFilter,
//           ...statusFilter,
//           ...dateFilterCondition,
//         },
//         include: {
//           OrderItem: {
//             include: {
//               Product: true,
//             },
//           },
//           ShippingDetail: true,
//           Address: {
//             include: {
//               City: {
//                 include: {
//                   Province: true,
//                 },
//               },
//             },
//           },
//         },
//         orderBy: {
//           invoice: 'desc',
//         },
//         skip,
//         take: limit,
//       });

//       // Fetch total orders count for pagination
//       const totalOrders = await prisma.order.count({
//         where: {
//           userId,
//           ...searchFilter,
//           ...statusFilter,
//           ...dateFilterCondition,
//         },
//       });

//       // Calculate total pages
//       const totalPages = Math.ceil(totalOrders / limit);

//       return {
//         data: orders,
//         totalPages,
//         currentPage: page,
//         totalItems: totalOrders,
//       };
//     } catch (error) {
//       throw new ErrorHandler('Terjadi kesalahan saat mengambil order', 400);
//     }
//   }

//   static async updateStatus(req: Request) {
//     const { orderId, status } = req.body;

//     try {
//       if (req.user.roleId == 2 || req.user.roleId == 3) {
//         if (status == 'pending_payment') {
//           const order = await prisma.order.update({
//             where: {
//               id: Number(orderId),
//             },
//             data: {
//               payment_proof: null,
//               status,
//               updated_at: new Date(),
//             },
//           });

//           cancelOrder.add(
//             {
//               user: order.userId,
//               id: order.id,
//             },
//             {
//               delay: 300000, //5 min
//             },
//           );

//           return order;
//         } else {
//           const order = await prisma.order.update({
//             where: {
//               id: Number(orderId),
//             },
//             data: {
//               status,
//               updated_at: new Date(),
//             },
//           });

//           if (status == 'shipped') {
//             confirmOrder.add(
//               {
//                 id: order.id,
//               },
//               {
//                 delay: 600000, //10 min
//               },
//             );
//           }
//           return order;
//         }
//       } else throw new ErrorHandler('Unauthorized', 401);
//     } catch (error) {
//       throw new ErrorHandler('Terjadi kesalahan saat update status order', 400);
//     }
//   }

//   static async addOrder(req: Request) {
//     const {
//       origin,
//       destination,
//       courier,
//       service,
//       user_voucher_id,
//       payment_id,
//       user_address_id,
//       expedition,
//       expedition_detail,
//     } = req.body;

//     try {
//       // Check if user is authenticated
//       if (!req.user) {
//         throw new ErrorHandler('Unauthorized user', 401);
//       }

//       const cartItems = await prisma.cart.findMany({
//         where: { userId: req.user.id },
//         include: {
//           ProductStock: {
//             include: { Product: true },
//           },
//         },
//       });

//       if (!cartItems.length) {
//         throw new ErrorHandler('Keranjang belanja kosong', 400);
//       }

//       // Check stock availability
//       for (const cartItem of cartItems) {
//         const productStock = cartItem.ProductStock;
//         const quantity = cartItem.quantity || 1;

//         if (productStock && quantity > productStock.stock) {
//           throw new ErrorHandler(
//             `Jumlah yang diminta untuk produk "${productStock.Product?.product_name}" melebihi stok yang tersedia`,
//             400,
//           );
//         }
//       }

//       let totalPrice = 0;
//       let totalWeight = 0;

//       // Use Promise.all to fetch discounts concurrently
//       const orderItems = await Promise.all(
//         cartItems.map(async (cartItem) => {
//           const product = cartItem.ProductStock?.Product;
//           const quantity = cartItem.quantity || 1;
//           const subtotal = (product?.price || 0) * quantity;

//           // Initialize subtotal for this item
//           let itemSubtotal = subtotal;

//           // Check for discounts on the product
//           const discount = await prisma.discount.findFirst({
//             where: {
//               productId: product?.id,
//               start_date: { lte: new Date() },
//               end_date: { gte: new Date() },
//               Branch: { id: cartItem.ProductStock?.branchId },
//               isActive: 1,
//             },
//           });

//           // Apply the discounts
//           if (discount) {
//             if (discount.discount_type === 'percentage') {
//               itemSubtotal -= (itemSubtotal * discount.discount_value) / 100;
//             } else if (discount.discount_type === 'fixed') {
//               itemSubtotal -= discount.discount_value;
//             }
//           }

//           totalPrice += itemSubtotal;
//           totalWeight += (product?.weight || 0) * quantity;

//           return {
//             productId: product?.id || 0,
//             quantity,
//             price: product?.price || 0,
//             subtotal: itemSubtotal, // Use the discounted subtotal
//           };
//         }),
//       );

//       // Apply user voucher discount
//       if (user_voucher_id) {
//         const userVoucher = await prisma.userVoucher.findFirst({
//           where: { id: user_voucher_id, userId: req.user.id, is_valid: 1 },
//           include: { Voucher: true },
//         });

//         if (userVoucher) {
//           const voucher = userVoucher.Voucher;
//           if (totalPrice >= voucher.min_purchase) {
//             if (voucher.type === 'percentage') {
//               totalPrice -= (totalPrice * voucher.value) / 100;
//             } else if (voucher.type === 'fixed') {
//               totalPrice -= voucher.value;
//             }
//           } else {
//             throw new ErrorHandler(
//               'Pembelian tidak memenuhi syarat voucher',
//               400,
//             );
//           }
//         } else {
//           throw new ErrorHandler('Voucher tidak valid', 400);
//         }
//       }

//       // Calculate shipping costs
//       const shippingCostResponse = await axios.post(
//         'https://api.rajaongkir.com/starter/cost',
//         {
//           origin: origin,
//           destination: destination,
//           weight: totalWeight,
//           courier: courier,
//         },
//         {
//           headers: {
//             key: '6217fa0987d802058e79fa9a345c6923',
//             'content-type': 'application/x-www-form-urlencoded',
//           },
//         },
//       );

//       const selectedService =
//         shippingCostResponse.data.rajaongkir.results[0].costs.find(
//           (c: any) => c.service === service,
//         );

//       if (!selectedService) {
//         throw new ErrorHandler('Service not found', 404);
//       }

//       const shippingCost = selectedService.cost[0].value;
//       totalPrice += shippingCost;

//       const address = await prisma.userAddress.findFirst({
//         where: { id: user_address_id, userId: req.user.id },
//         include: { address: true },
//       });

//       const order = await prisma.order.create({
//         data: {
//           userId: req.user.id,
//           total_price: totalPrice,
//           addressId: Number(address?.id),
//           paymentId: payment_id,
//           branchId: cartItems[0].ProductStock?.branchId,
//           voucherId: user_voucher_id || null,
//           discount_voucher: user_voucher_id ? 1 : 0,
//           invoice: `INV-${Date.now()}`,
//           status: 'pending_payment',
//           OrderItem: {
//             create: orderItems,
//           },
//           ShippingDetail: {
//             create: {
//               price: shippingCost,
//               total_weight: totalWeight,
//               expedition,
//               expedition_detail,
//             },
//           },
//         },
//       });

//       // Update stock and create stock history
//       for (const cartItem of cartItems) {
//         const productStock = cartItem.ProductStock;
//         const quantity = cartItem.quantity || 1;

//         if (productStock) {
//           const newStock = productStock.stock - quantity;
//           await prisma.productStock.update({
//             where: { id: productStock.id },
//             data: { stock: newStock },
//           });

//           // Record stock change in StockHistory
//           await prisma.stockHistory.create({
//             data: {
//               productStockId: productStock.id,
//               stock_id: productStock.id,
//               status: 'out',
//               reference: `Order ID: ${order.id}`,
//               quantity,
//               stock_before: productStock.stock,
//               stock_after: newStock,
//             },
//           });
//         }
//       }

//       // Schedule order cancellation
//       cancelOrder.add(
//         {
//           user: req.user.id,
//           id: order.id,
//         },
//         {
//           delay: 300000,
//         },
//       );

//       // Clear cart
//       await prisma.cart.deleteMany({ where: { userId: req.user.id } });

//       return { message: 'Order berhasil dibuat' };
//     } catch (error) {
//       console.error(error); // Log the actual error for debugging
//       throw new ErrorHandler('Terjadi kesalahan saat menambahkan order', 400);
//     }
//   }

//   static async getByInvoice(req: Request) {
//     try {
//       const { invoice } = req.params;
//       console.log(req.params, 'ini req params');
//       console.log(invoice, 'ini invoice');

//       if (!req.user || !req.user.is_verified) {
//         throw new ErrorHandler(
//           'User belum terverifikasi atau tidak teregistrasi',
//           403,
//         );
//       }

//       const order = await prisma.order.findFirst({
//         where: {
//           invoice,
//           userId: req.user.id,
//           paymentId: 2,
//           payment_proof: null,
//         },
//       });

//       if (!order) {
//         throw new ErrorHandler('Order tidak ditemukan', 403);
//       }

//       return order;
//     } catch (error) {
//       throw new ErrorHandler('Terjadi kesalahan saat mengambil order', 400);
//     }
//   }

//   static async updateFromMidtrans(req: Request) {
//     try {
//       const { invoice } = req.body;
//       const order = await prisma.order.findFirst({
//         where: {
//           invoice,
//           userId: req.user.id,
//           status: 'pending_payment',
//         },
//       });
//       if (order) {
//         return await prisma.order.update({
//           where: {
//             id: order.id,
//             paymentId: 1,
//           },
//           data: {
//             status: 'processing',
//           },
//         });
//       } else throw new Error('Order not valid!');
//     } catch (error) {
//       throw new Error('Failed to update order status!');
//     }
//   }

//   static async updatePaymentProof(req: Request) {
//     try {
//       const { id } = req.body;
//       const image = req.file;

//       console.log(image?.filename);

//       if (!id || !image) {
//         throw new Error('Id atau image gaada!');
//       }

//       const order = await prisma.order.update({
//         where: {
//           id: Number(id),
//           userId: req.user.id,
//           payment_proof: null,
//           paymentId: 2,
//         },
//         data: {
//           payment_proof: image.filename || '',
//           status: 'awaiting_confirmation',
//         },
//       });

//       return order;
//     } catch (error) {
//       console.error(error);
//       throw new Error('Failed to update payment proof!');
//     }
//   }

//   static async updateToken(req: Request) {
//     try {
//       const { invoice, order_token } = req.body;
//       const order = await prisma.order.findFirst({
//         where: {
//           invoice,
//           userId: req.user.id,
//           status: 'pending_payment',
//         },
//       });
//       if (order) {
//         return await prisma.order.update({
//           where: {
//             id: order.id,
//           },
//           data: {
//             midtrans_token: order_token,
//           },
//         });
//       }
//     } catch (error) {
//       throw new Error('Failed to add token!');
//     }
//   }

//   static async cancelOrder(req: Request) {
//     try {
//       const { invoice } = req.body;
//       let order;
//       if (!req.user) {
//         throw new ErrorHandler('Unauthorized user', 403);
//       }
//       if (req.user.roleId == 1) {
//         order = await prisma.order.findFirst({
//           where: {
//             invoice,
//             userId: req.user.id,
//             status: 'pending_payment',
//           },
//           include: {
//             OrderItem: true,
//           },
//         });
//       } else if (req.user.roleId == 2 || req.user.roleId == 3) {
//         order = await prisma.order.findFirst({
//           where: {
//             invoice,
//             status: {
//               in: ['pending_payment', 'processing', 'awaiting_confirmation'],
//             },
//           },
//           include: {
//             OrderItem: true,
//           },
//         });
//       }

//       if (order) {
//         await prisma.order.update({
//           where: {
//             id: Number(order.id),
//           },
//           data: {
//             status: 'cancelled',
//           },
//         });
//         for (const item of order.OrderItem) {
//           const productStock = await prisma.productStock.findFirst({
//             where: {
//               productId: item.productId,
//               branchId: Number(order.branchId),
//             },
//           });

//           if (productStock) {
//             const restoredStock = productStock.stock + item.quantity;

//             await prisma.productStock.update({
//               where: { id: productStock.id },
//               data: { stock: restoredStock },
//             });

//             await prisma.stockHistory.create({
//               data: {
//                 productStockId: productStock.id,
//                 stock_id: productStock.id,
//                 status: 'in',
//                 reference: `Order cancellation for Order ID: ${order.id}`,
//                 quantity: item.quantity,
//                 stock_before: productStock.stock,
//                 stock_after: restoredStock,
//               },
//             });
//           }
//         }
//         return { message: 'Order cancelled successfully' };
//       }
//     } catch (error) {
//       throw new Error('Failed to cancel order!');
//     }
//   }

//   static async confirmOrder(req: Request) {
//     const { invoice } = req.body;
//     try {
//       if (!req.user) throw new ErrorHandler('Unauthorized', 403);
//       const order = await prisma.order.findFirst({
//         where: {
//           invoice,
//           userId: req.user.id,
//           status: 'shipped',
//         },
//       });
//       if (order) {
//         return await prisma.order.update({
//           where: {
//             id: order.id,
//           },
//           data: {
//             status: 'confirmed',
//             updated_at: new Date(),
//           },
//         });
//       }
//     } catch (error) {
//       throw new Error('Failed to confirm order!');
//     }
//   }
// }

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
