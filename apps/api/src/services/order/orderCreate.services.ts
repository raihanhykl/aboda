import { ErrorHandler } from '@/helpers/response';
import prisma from '@/prisma';
import axios from 'axios';
import { Request } from 'express';
import { cancelOrder } from '@/lib/bull';

export class OrderCreationService {
  static async addOrder(req: Request) {
    const {
      origin,
      destination,
      courier,
      service,
      user_voucher_id,
      payment_id,
      user_address_id,
      expedition,
      expedition_detail,
    } = req.body;

    try {
      if (!req.user) {
        throw new ErrorHandler('Unauthorized user', 401);
      }

      const cartItems = await prisma.cart.findMany({
        where: { userId: req.user.id },
        include: {
          ProductStock: {
            include: { Product: true },
          },
        },
      });

      if (!cartItems.length) {
        throw new ErrorHandler('Keranjang belanja kosong', 400);
      }

      for (const cartItem of cartItems) {
        const productStock = cartItem.ProductStock;
        const quantity = cartItem.quantity || 1;

        if (productStock && quantity > productStock.stock) {
          throw new ErrorHandler(
            `Jumlah yang diminta untuk produk "${productStock.Product?.product_name}" melebihi stok yang tersedia`,
            400,
          );
        }
      }

      let totalPrice = 0;
      let totalWeight = 0;

      const orderItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          const product = cartItem.ProductStock?.Product;
          const quantity = cartItem.quantity || 1;
          const subtotal = (product?.price || 0) * quantity;

          let itemSubtotal = subtotal;

          const discount = await prisma.discount.findFirst({
            where: {
              productId: product?.id,
              start_date: { lte: new Date() },
              end_date: { gte: new Date() },
              Branch: { id: cartItem.ProductStock?.branchId },
              isActive: 1,
            },
          });

          if (discount) {
            if (discount.discount_type === 'percentage') {
              itemSubtotal -= (itemSubtotal * discount.discount_value) / 100;
            } else if (discount.discount_type === 'fixed') {
              itemSubtotal -= discount.discount_value;
            }
          }

          totalPrice += itemSubtotal;
          totalWeight += (product?.weight || 0) * quantity;

          return {
            productId: product?.id || 0,
            quantity,
            price: product?.price || 0,
            subtotal: itemSubtotal,
          };
        }),
      );

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
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

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
      for (const cartItem of cartItems) {
        const productStock = cartItem.ProductStock;
        const quantity = cartItem.quantity || 1;

        if (productStock) {
          const newStock = productStock.stock - quantity;
          await prisma.productStock.update({
            where: { id: productStock.id },
            data: { stock: newStock },
          });

          await prisma.stockHistory.create({
            data: {
              productStockId: productStock.id,
              stock_id: productStock.id,
              status: 'out',
              reference: `Order ID: ${order.id}`,
              quantity,
              stock_before: productStock.stock,
              stock_after: newStock,
            },
          });
        }
      }

      cancelOrder.add(
        {
          user: req.user.id,
          id: order.id,
        },
        {
          delay: 300000,
        },
      );

      await prisma.cart.deleteMany({ where: { userId: req.user.id } });

      return { message: 'Order berhasil dibuat' };
    } catch (error) {
      throw new ErrorHandler('Terjadi kesalahan saat menambahkan order', 400);
    }
  }
}
