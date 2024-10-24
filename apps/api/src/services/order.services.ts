import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { Request } from 'express';

export class OrderService {
  static async getOrder(req: Request) {
    try {
      return await prisma.order.findMany({
        where: {
          userId: Number(req.user.id),
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
          // Misalnya ingin mengurutkan berdasarkan `createdAt` secara descending
          invoice: 'desc',
        },
      });
    } catch (error) {
      // error handling jika diperlukan
      console.error(error);
    }
  }

  static async addOrder(req: Request) {
    const {
      origin,
      destination,
      // weight,
      courier,
      service,
      user_voucher_id,
      // shipping_price,
      payment_id,
      user_address_id,
      expedition,
      expedition_detail,
    } = req.body;

    try {
      // Check if user is authenticated

      console.log(req.body, 'ini req body');
      if (!req.user) {
        throw new ErrorHandler('Unauthorized user', 401);
      }
      const cartItems = await prisma.cart.findMany({
        where: {
          userId: req.user.id,
        },
        include: {
          ProductStock: {
            include: {
              Product: true,
            },
          },
        },
      });

      console.log(cartItems, 'ini cartitem');

      if (!cartItems.length) {
        throw new ErrorHandler('Keranjang belanja kosong', 400);
      }

      let totalPrice = 0;
      let totalWeight = 0;
      const orderItems = cartItems.map((cartItem) => {
        const product = cartItem.ProductStock?.Product;
        const quantity = cartItem.quantity || 1;
        const subtotal = (product?.price || 0) * quantity;

        totalPrice += subtotal;
        totalWeight += (product?.weight || 0) * quantity;

        return {
          productId: product?.id || 0,
          quantity,
          price: product?.price || 0,
          subtotal,
        };
      });

      console.log(totalWeight, 'ini shippingcost response');

      if (user_voucher_id) {
        const userVoucher = await prisma.userVoucher.findFirst({
          where: { id: user_voucher_id, userId: req.user.id, is_valid: 1 },
          include: { Voucher: true },
        });

        if (userVoucher) {
          const voucher = userVoucher.Voucher;
          if (totalPrice >= voucher.min_purchase) {
            if (voucher.type === 'percentage') {
              totalPrice -= (totalPrice * voucher.value) / 100;
            } else if (voucher.type === 'fixed') {
              totalPrice -= voucher.value;
            }
          } else {
            throw new ErrorHandler(
              'Pembelian tidak memenuhi syarat voucher',
              400,
            );
          }
        } else {
          throw new ErrorHandler('Voucher tidak valid', 400);
        }
      }

      const shippingCostResponse = await axios.post(
        'https://api.rajaongkir.com/starter/cost',
        {
          origin: origin,
          destination: destination,
          weight: totalWeight,
          courier: courier,
        },
        {
          headers: {
            key: '6217fa0987d802058e79fa9a345c6923',
            // "process.env.RAJAONGKIR_API_KEY," // ensure you've set this in your .env file
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log(shippingCostResponse, 'ini shippingcost response');

      // Find the correct service and its cost from RajaOngkir response
      const selectedService =
        shippingCostResponse.data.rajaongkir.results[0].costs.find(
          (c: any) => c.service === service,
        );

      if (!selectedService) {
        throw new ErrorHandler('Service not found', 404);
      }

      const shippingCost = selectedService.cost[0].value;

      totalPrice += shippingCost;

      const address = await prisma.userAddress.findFirst({
        where: { id: user_address_id, userId: req.user.id },
        include: { address: true },
      });

      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          total_price: totalPrice,
          addressId: Number(address?.id),
          paymentId: payment_id,
          branchId: cartItems[0].ProductStock?.branchId,
          voucherId: user_voucher_id || null,
          discount_voucher: user_voucher_id ? 1 : 0,
          invoice: `INV-${Date.now()}`,
          status: 'pending_payment',
          OrderItem: {
            create: orderItems,
          },
          ShippingDetail: {
            create: {
              price: shippingCost,
              total_weight: totalWeight,
              expedition,
              expedition_detail,
            },
          },
        },
      });

      await prisma.cart.deleteMany({ where: { userId: req.user.id } });

      return { message: 'Order berhasil dibuat' };
    } catch (error) {
      throw new ErrorHandler('Terjadi kesalahan saat menambahkan order', 400);
    }
  }

  static async getByInvoice(req: Request) {
    try {
      const { invoice } = req.params;
      console.log(req.params, 'ini req params');
      console.log(invoice, 'ini invoice');

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
  //

  // static async updatePaymentProof(req: Request) {
  //   try {
  //     const { id } = req.body;
  //     const image = req.file;

  //     return await prisma.order.update({
  //       where: {
  //         id: Number(id),
  //         userId: req.user.id,
  //       },
  //       data: {
  //         payment_proof: image?.filename || '',
  //         status: 'awaiting_confirmation',
  //       },
  //     });
  //   } catch (error) {
  //     throw new Error('Failed to update payment proof!');
  //   }
  // }

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
        throw new Error('Id atau image gaada!');
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
      // const { order_id } = req.params;
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

  // static async delete(req: Request) {
  //   try {
  //     const { cartId } = req.body;

  //     return await prisma.cart.delete({
  //       where: {
  //         id: Number(cartId),
  //         userId: req.user.id,
  //       },
  //     });
  //   } catch (error) {
  //     throw new Error('Failed to delete cart!');
  //   }
  // }

  // static async deleteAll(req: Request) {
  //   try {
  //     return await prisma.cart.deleteMany({
  //       where: {
  //         userId: req.user.id,
  //       },
  //     });
  //   } catch (error) {
  //     throw new Error('Failed to delete all cart!');
  //   }
  // }
}
