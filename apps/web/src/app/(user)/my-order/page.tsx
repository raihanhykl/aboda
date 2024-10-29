'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Package, Search } from 'lucide-react';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import AlertModal from '@/components/modal/modal';

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Order = {
  id: number;
  invoice: string;
  total_price: number;
  status:
    | 'pending_payment'
    | 'awaiting_confirmation'
    | 'processing'
    | 'shipped'
    | 'confirmed'
    | 'cancelled';
  created_at: string;
  items: OrderItem[];
  shipping_address: string;
  payment_method: string;
  midtrans_token: string | null;
  shipping_price: number;
};
type OrderCountdown = {
  [orderId: number]: string;
};

export default function EnhancedCustomerOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>(
    'all',
  );
  const [totalPages, setTotalPages] = useState(1);
  const session = useSession();
  const [dateFilter, setDateFilter] = useState('');
  const ordersPerPage = 5;
  const router = useRouter();
  const { toast } = useToast();
  const [countdowns, setCountdowns] = useState<OrderCountdown>({});

  // Fetch orders from API on component mount
  useEffect(() => {
    fetchOrders();
  }, [session, currentPage, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      // const response = await api.get('/order/get'); // Update with your actual API endpoint
      const response = await api.get(`/order/get`, {
        headers: {
          Authorization: 'Bearer ' + session?.data?.user.access_token,
        },
        params: {
          page: currentPage,
          limit: ordersPerPage,
          search: searchTerm,
          status: statusFilter === 'all' ? undefined : statusFilter,
          date: dateFilter === 'all' ? undefined : dateFilter,
        },
      });
      const res = response.data.data.data.map((order: any) => ({
        id: order.id,
        invoice: order.invoice,
        total_price: order.total_price,
        status: order.status,
        created_at: order.updated_at,
        items: order.OrderItem.map((item: any) => ({
          id: item.id,
          product_name: item.Product.product_name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        })),
        shipping_address:
          order.Address.street +
          ', ' +
          order.Address.City.city +
          ', ' +
          order.Address.City.Province.name, // Replace with actual shipping address if available
        payment_method: order.paymentId === 1 ? 'Gateway' : 'Bank Transfer', // Example
        midtrans_token: order.midtrans_token,
        shipping_price: order.ShippingDetail[0]?.price || 0,
      }));
      setOrders(res);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as Order['status'] | 'all');
    setCurrentPage(1);
  };

  const handleDateChange = (value: string) => {
    setDateFilter(value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // useEffect(() => {

  //   fetchOrders();
  // }, [session]);

  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === 'all' || order.status === statusFilter) &&
      (order.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase()),
        )),
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );

  // const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const statusColors: Record<Order['status'], string> = {
    pending_payment: 'bg-yellow-500',
    awaiting_confirmation: 'bg-blue-500',
    processing: 'bg-purple-500',
    shipped: 'bg-indigo-500',
    confirmed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  useEffect(() => {
    const snapScript: string = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey: any = 'SB-Mid-client-c7SnHqsRuZTiamhl';

    const script = document.createElement('script');
    script.src = snapScript;

    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (
    order_invoice: string,
    totalAmount: number,
    token: string | null,
  ) => {
    console.log(order_invoice);

    try {
      console.log(token, 'ini token after try');

      if (!token) {
        token = null;
        console.log(token, 'ini token didalem if try');
        const response = await axios.post('/api/payment', {
          order_id: order_invoice,
          shippingCost: totalAmount || 0, // Mengirim biaya pengiriman
        });
        token = response.data.token;
        console.log(token, 'ini token after dimasukin tokennya');
        const inputToken = await api.post(
          `/order/update-midtrans-token`,
          {
            invoice: order_invoice,
            order_token: token,
          },
          {
            headers: {
              Authorization: 'Bearer ' + session?.data?.user.access_token,
            },
          },
        );
        const check = inputToken;
        console.log(check, 'ini check');
      }

      // console.log(response, 'ini response');
      console.log(
        window.snap.pay(String(token), {
          onSuccess: async function (result) {
            console.log('success');
            console.log(result);
            toast({
              description: order_invoice,
            });
            await api.post(
              `/order/update-midtrans`,
              {
                invoice: order_invoice,
              },
              {
                headers: {
                  Authorization: 'Bearer ' + session?.data?.user.access_token,
                },
              },
            );
            router.push('/order');
          },
          onPending: function (result) {
            console.log('pending');
            console.log(result);
            toast({
              description: 'Payment pending!',
            });
          },
          onError: function (result) {
            console.log('error');
            console.log(result);
            toast({
              description: 'Payment Error!',
            });
          },
          onClose: function () {
            console.log(
              'customer closed the popup without finishing the payment',
            );
            toast({
              description: 'Payment Closed',
            });
          },
        }),
      );
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleCheckout = (
    order_invoice: string,
    totalAmount: number,
    payment_method: string,
    token: string | null,
  ) => {
    // e.preventDefault();
    if (payment_method === 'Bank Transfer') {
      router.push(`/checkout-manual/${order_invoice}`);
    } else if (payment_method === 'Gateway') {
      handlePayment(order_invoice, totalAmount, token); // Eksekusi pembayaran dengan payment gateway
    } else {
      console.log('Please select a payment method');
    }
  };

  const handleCancel = async (invoice: string) => {
    console.log(invoice);
    await api.post(
      `/order/cancel`,
      {
        invoice,
      },
      {
        headers: {
          Authorization: 'Bearer ' + session?.data?.user.access_token,
        },
      },
    );
    router.push('/order');
    toast({
      description: 'Order Cancelled!',
    });
  };

  const calculateCountdown = (endTime: Date) => {
    const now = new Date().getTime();
    const timeLeft = endTime.getTime() - now;

    if (timeLeft <= 0) return '00:00';

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCountdowns: OrderCountdown = {};

      orders.forEach((order) => {
        if (order.status === 'pending_payment') {
          const createdAt = new Date(order.created_at);
          const endTime = new Date(createdAt.getTime() + 5 * 60000); // Tambah 5 menit
          updatedCountdowns[order.id] = calculateCountdown(endTime);
        }
      });

      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Orders</CardTitle>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex gap-2">
            <Select onValueChange={handleDateChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Date</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="awaiting_confirmation">
                  Awaiting Confirmation
                </SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <span>
            <Accordion type="single" collapsible className="w-full">
              {orders.map((order, index) => (
                <AccordionItem value={`item-${index}`} key={order.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">
                        Order #{order.invoice}
                      </span>
                      <div className="flex gap-4 text-center items-center">
                        {order.status === 'pending_payment' && (
                          <span className="text-[12px] text-white bg-red-600 rounded-xl px-2 py-1">
                            {countdowns[order.id] ?? '00:00'}
                          </span>
                        )}
                        <Badge
                          className={`${statusColors[order.status]} text-white`}
                        >
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Date:</span>
                        <span>
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.product_name} (x{item.quantity})
                            </span>
                            <span>
                              {item.subtotal.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Shipping Price: </span>
                          <span>
                            {order.shipping_price?.toLocaleString('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>
                          {order.total_price.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          })}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p>
                          <strong>Shipping Address:</strong>{' '}
                          {order.shipping_address}
                        </p>
                        <p>
                          <strong>Payment Method:</strong>{' '}
                          {order.payment_method}
                        </p>
                      </div>
                      {order.status === 'pending_payment' ? (
                        <div className="py-1">
                          <Button
                            className="ml mr-3"
                            variant="outline"
                            onClick={() =>
                              handleCheckout(
                                order.invoice,
                                order.total_price,
                                order.payment_method,
                                order.midtrans_token,
                              )
                            }
                          >
                            Pay Now
                          </Button>

                          <AlertModal
                            onConfirm={() => handleCancel(order.invoice)}
                            triggerText="Cancel Order"
                            title="Are you sure?"
                            description={`This action cannot be undone. This will delete your order.`}
                          />
                        </div>
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="flex justify-center items-center mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
                className="mr-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
                className="ml-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </span>
        )}
      </CardContent>
    </Card>
  );
}
