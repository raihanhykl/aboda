'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/config/axios.config';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';
import { Order, OrderItem } from './types';
import { useSnapScript } from './useSnapScript';
import axios from 'axios';

export default function EnhancedCustomerOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const ordersPerPage = 5;
  const snapLoaded = useSnapScript();

  useEffect(() => {
    fetchOrders();
  }, [session, currentPage, filters]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/order/get`, {
        headers: {
          Authorization: `Bearer ${session?.data?.user.access_token}`,
        },
        params: {
          page: currentPage,
          limit: ordersPerPage,
          search: filters.search,
          status: filters.status === 'all' ? undefined : filters.status,
          date: filters.date === 'all' ? undefined : filters.date,
        },
      });
      setOrders(formatOrders(response.data.data.data));
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatOrders = (rawOrders: any[]): Order[] => {
    return rawOrders.map((order) => ({
      id: order.id,
      invoice: order.invoice,
      total_price: order.total_price,
      status: order.status,
      created_at: order.updated_at,
      items: order.OrderItem.map(
        (item: any): OrderItem => ({
          id: item.id,
          product_name: item.Product.product_name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        }),
      ),
      shipping_address: `${order.Address.street}, ${order.Address.City.city}, ${order.Address.City.Province.name}`,
      payment_method: order.paymentId === 1 ? 'Gateway' : 'Bank Transfer',
      midtrans_token: order.midtrans_token,
      shipping_price: order.ShippingDetail[0]?.price || 0,
    }));
  };

  const handlePayment = async (
    order_invoice: string,
    totalAmount: number,
    token: string | null,
  ) => {
    if (!snapLoaded) {
      toast({
        title: 'Error',
        description: 'Payment system is not ready. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!token) {
        const response = await axios.post('/api/payment', {
          order_id: order_invoice,
          shippingCost: totalAmount || 0,
        });
        token = response.data.token;
        console.log(token, 'ini token');

        await api.post(
          `/order/update-midtrans-token`,
          {
            invoice: order_invoice,
            order_token: token,
          },
          {
            headers: {
              Authorization: `Bearer ${session?.data?.user.access_token}`,
            },
          },
        );
      }

      if (typeof window.snap !== 'undefined') {
        console.log('masuk');
        window.snap.pay(String(token), {
          onSuccess: async function (result) {
            toast({
              description: `Payment successful for order ${order_invoice}`,
            });
            await api.post(
              `/order/update-midtrans`,
              { invoice: order_invoice },
              {
                headers: {
                  Authorization: `Bearer ${session?.data?.user.access_token}`,
                },
              },
            );
            fetchOrders();
          },
          onPending: function (result) {
            toast({
              description: 'Payment is pending. Please complete the payment.',
            });
          },
          onError: function (result) {
            toast({
              title: 'Error',
              description: 'Payment failed. Please try again.',
              variant: 'destructive',
            });
          },
          onClose: function () {
            toast({
              description:
                "Payment window closed. If you haven't completed the payment, please try again.",
            });
          },
        });
      } else {
        throw new Error('Snap library is not loaded');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred during payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = (
    order_invoice: string,
    totalAmount: number,
    payment_method: string,
    token: string | null,
  ) => {
    if (payment_method === 'Bank Transfer') {
      router.push(`/checkout-manual/${order_invoice}`);
    } else if (payment_method === 'Gateway') {
      handlePayment(order_invoice, totalAmount, token);
    } else {
      toast({
        title: 'Error',
        description:
          'Invalid payment method. Please select a valid payment method.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async (invoice: string) => {
    try {
      await api.post(
        `/order/cancel`,
        { invoice },
        {
          headers: {
            Authorization: `Bearer ${session?.data?.user.access_token}`,
          },
        },
      );
      fetchOrders();
      toast({ description: 'Order cancelled successfully.' });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirm = async (invoice: string) => {
    try {
      await api.post(
        `/order/confirm-order`,
        { invoice },
        {
          headers: {
            Authorization: `Bearer ${session?.data?.user.access_token}`,
          },
        },
      );
      fetchOrders();
      toast({ description: 'Order confirmed successfully.' });
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Orders</CardTitle>
        <OrderFilters filters={filters} setFilters={setFilters} />
      </CardHeader>
      <CardContent>
        <OrderList
          orders={orders}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          handleCheckout={handleCheckout}
          handleCancel={handleCancel}
          handleConfirm={handleConfirm}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}
