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
      });
    } catch (error) {}
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

  static async add(req: Request) {
    try {
      // const { productStockId, quantityInput } = req.body;
      // if (!req.user || !req.user.is_verified) {
      //   throw new ErrorHandler(
      //     'User belum terverifikasi atau tidak teregistrasi',
      //     403,
      //   );
      // }
      // const productStock = await prisma.productStock.findUnique({
      //   where: {
      //     id: productStockId,
      //   },
      //   include: {
      //     Branch: true,
      //   },
      // });
      // if (!productStock || productStock.stock < quantityInput) {
      //   throw new ErrorHandler(
      //     'Stok produk tidak tersedia atau jumlah melebihi stok',
      //     400,
      //   );
      // }
      // const userCartItems = await prisma.cart.findMany({
      //   where: {
      //     userId: req.user.id,
      //   },
      //   include: {
      //     ProductStock: {
      //       include: {
      //         Branch: true,
      //       },
      //     },
      //   },
      // });
      // const hasDifferentBranch = userCartItems.some(
      //   (cartItem) =>
      //     cartItem.ProductStock?.Branch?.id !== productStock?.Branch?.id,
      // );
      // if (hasDifferentBranch) {
      //   await prisma.cart.deleteMany({
      //     where: {
      //       userId: req.user.id,
      //     },
      //   });
      // }
      // const existingCartItem = await prisma.cart.findFirst({
      //   where: {
      //     userId: req.user.id,
      //     productStockId,
      //   },
      // });
      // if (existingCartItem) {
      //   const updatedQuantity = existingCartItem.quantity + quantityInput;
      //   if (updatedQuantity > Number(productStock?.stock)) {
      //     throw new ErrorHandler(
      //       'Jumlah total melebihi stok yang tersedia',
      //       400,
      //     );
      //   }
      //   await prisma.cart.update({
      //     where: {
      //       id: existingCartItem.id,
      //     },
      //     data: {
      //       quantity: updatedQuantity,
      //     },
      //   });
      // } else {
      //   await prisma.cart.create({
      //     data: {
      //       quantity: quantityInput,
      //       ProductStock: {
      //         connect: {
      //           id: productStockId,
      //         },
      //       },
      //       User: {
      //         connect: {
      //           id: req.user.id,
      //         },
      //       },
      //     },
      //   });
      // }
      // return { message: 'Produk berhasil ditambahkan ke keranjang' };
    } catch (error) {
      throw new ErrorHandler(
        'Terjadi kesalahan saat menambahkan ke keranjang',
        400,
      );
    }
  }

  static async updateCart(req: Request) {
    // try {
    //   const { quantity, cartId } = req.body;
    //   if (quantity > 0) {
    //     return await prisma.cart.update({
    //       where: {
    //         id: Number(cartId),
    //         userId: req.user.id,
    //       },
    //       data: {
    //         quantity: quantity,
    //       },
    //     });
    //   }
    // } catch (error) {
    //   throw new Error('Failed update cart!');
    // }
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
