'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
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
  shipping_price: number;
  payment_proof: string | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export default function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>(
    'all',
  );
  const [dateFilter, setDateFilter] = useState('all');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const session = useSession();
  const ordersPerPage = 5;
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [session, currentPage, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/order/get-branch`, {
        headers: {
          Authorization: 'Bearer ' + session?.data?.user.access_token,
        },
        params: {
          page: currentPage,
          limit: ordersPerPage,
          status: statusFilter === 'all' ? undefined : statusFilter,
          date: dateFilter === 'all' ? undefined : dateFilter,
        },
      });

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.data)
      ) {
        const formattedOrders = response.data.data.data.map((order: any) => ({
          id: order.id,
          invoice: order.invoice,
          total_price: order.total_price,
          status: order.status,
          created_at: order.created_at,
          items: order.OrderItem.map((item: any) => ({
            id: item.id,
            product_name: item.Product.product_name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
          shipping_address: `${order.Address.street}, ${order.Address.City.city}, ${order.Address.City.Province.name}`,
          payment_method: order.paymentId === 1 ? 'Gateway' : 'Bank Transfer',
          shipping_price: order.ShippingDetail[0]?.price || 0,
          payment_proof: order.payment_proof,
          user: {
            first_name: order.User.first_name,
            last_name: order.User.last_name,
            email: order.User.email,
          },
        }));

        setOrders(formattedOrders);
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to fetch orders. Please try again.',
      //   variant: 'destructive',
      // });
    }
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

  const statusColors: Record<Order['status'], string> = {
    pending_payment: 'bg-yellow-500',
    awaiting_confirmation: 'bg-blue-500',
    processing: 'bg-purple-500',
    shipped: 'bg-indigo-500',
    confirmed: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  const handleAcceptOrder = async () => {
    let status;
    if (selectedOrder) {
      if (selectedOrder.status === 'awaiting_confirmation')
        status = 'processing';
      else if (selectedOrder.status === 'processing') status = 'shipped';
      try {
        await api.post(
          `/order/update-status`,
          {
            orderId: selectedOrder.id,
            status,
          },
          {
            headers: {
              Authorization: 'Bearer ' + session?.data?.user.access_token,
            },
          },
        );
        toast({
          title: 'Success',
          description: `Order status updated to ${status}.`,
        });
        setIsUpdateModalOpen(false);
        fetchOrders();
      } catch (error) {
        console.error('Error updating order status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update order status. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleRejectOrder = async () => {
    if (selectedOrder) {
      try {
        await api.post(
          `/order/update-status`,
          {
            orderId: selectedOrder.id,
            status: 'pending_payment',
          },
          {
            headers: {
              Authorization: 'Bearer ' + session?.data?.user.access_token,
            },
          },
        );
        toast({
          title: 'Success',
          description: 'Payment proof rejected.',
        });
        setIsUpdateModalOpen(false);
        fetchOrders();
      } catch (error) {
        console.error('Error updating order status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update order status. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
        <div className="flex justify-between items-center gap-4">
          <Select onValueChange={handleDateChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
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
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <>
            <Accordion type="single" collapsible className="w-full">
              {orders.map((order, index) => (
                <AccordionItem value={`item-${index}`} key={order.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">
                        Order #{order.invoice}
                      </span>
                      <div className="flex gap-4 items-center">
                        <span className="text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
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
                        <span>Customer:</span>
                        <span>{`${order.user.first_name} ${order.user.last_name} (${order.user.email})`}</span>
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
                      <div className="flex justify-between text-sm">
                        <span>Shipping Price:</span>
                        <span>
                          {order.shipping_price.toLocaleString('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                          })}
                        </span>
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
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          Update Status
                        </Button>
                        {/* <Button variant="outline" size="sm">
                          View Details
                        </Button> */}
                      </div>
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
          </>
        )}
      </CardContent>
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.invoice} -{' '}
              {selectedOrder?.status.replace('_', ' ')}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder?.status === 'awaiting_confirmation' &&
            selectedOrder.payment_proof && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Payment Proof:</h4>
                <Image
                  // src={selectedOrder.payment_proof}
                  src={`http://localhost:8000/payment-proof/${selectedOrder.payment_proof}`}
                  alt="Payment Proof"
                  width={300}
                  height={300}
                  className="rounded-md"
                />
              </div>
            )}
          {
            selectedOrder?.status === 'processing' && (
              // selectedOrder.payment_proof && (
              <div className="mt-4">
                {/* <h4 className="text-sm font-medium mb-2">Payment Proof:</h4> */}
                <h4 className="text-sm text-center font-medium">
                  Update Status to Shipped?
                </h4>
                {/* <Image
                  // src={selectedOrder.payment_proof}
                  src={`http://localhost:8000/payment-proof/${selectedOrder.payment_proof}`}
                  alt="Payment Proof"
                  width={300}
                  height={300}
                  className="rounded-md"
                /> */}
              </div>
            )
            // )
          }
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
            >
              Cancel
            </Button>
            {selectedOrder?.status === 'awaiting_confirmation' && (
              <>
                <Button variant="destructive" onClick={handleRejectOrder}>
                  Reject
                </Button>
                <Button variant="default" onClick={handleAcceptOrder}>
                  Accept
                </Button>
              </>
            )}
            {selectedOrder?.status === 'processing' && (
              <>
                {/* <Button variant="destructive" onClick={handleRejectOrder}>
                  Cancel Order
                </Button> */}
                <AlertModal
                  onConfirm={handleRejectOrder}
                  triggerText="Cancel Order"
                  title="Are you sure?"
                  description={`This action cannot be undone. This will delete the order from your cart.`}
                  variant="destructive"
                />
                <Button variant="default" onClick={handleAcceptOrder}>
                  Yes
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
