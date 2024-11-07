'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/config/axios.config';
import { OrderFilters } from './OrderFilters';
import { OrderList } from './OrderList';
import { UpdateOrderModal } from './UpdateOrderModal';

export type Order = {
  id: number;
  invoice: string;
  total_price: number;
  branch: string;
  status:
    | 'pending_payment'
    | 'awaiting_confirmation'
    | 'processing'
    | 'shipped'
    | 'confirmed'
    | 'cancelled';
  created_at: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  shipping_address: string;
  payment_method: string;
  shipping_price: number;
  payment_proof: string | null;
  user: { first_name: string; last_name: string; email: string };
};

interface Filters {
  status: string;
  date: string;
  branch: string;
  search: string;
}

export default function AdminOrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    date: 'all',
    branch: 'all',
    search: '',
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const session = useSession();
  const { toast } = useToast();
  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, [session, currentPage, filters]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/order/get-branch`, {
        headers: {
          Authorization: `Bearer ${session?.data?.user.access_token}`,
        },
        params: {
          page: currentPage,
          limit: ordersPerPage,
          search: filters.search,
          status: filters.status === 'all' ? undefined : filters.status,
          date: filters.date === 'all' ? undefined : filters.date,
          branchFilter: filters.branch === 'all' ? undefined : filters.branch,
        },
      });

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.data)
      ) {
        setOrders(formatOrders(response.data.data.data));
        setTotalPages(response.data.data.totalPages || 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const formatOrders = (rawOrders: any[]): Order[] => {
    return rawOrders.map((order) => ({
      id: order.id,
      invoice: order.invoice,
      total_price: order.total_price,
      branch: order.Branch.branch_name,
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
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateModalOpen(true);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
        <OrderFilters filters={filters} setFilters={setFilters} />
      </CardHeader>
      <CardContent>
        <OrderList
          orders={orders}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          handleUpdateStatus={handleUpdateStatus}
        />
      </CardContent>
      <UpdateOrderModal
        isOpen={isUpdateModalOpen}
        setIsOpen={setIsUpdateModalOpen}
        selectedOrder={selectedOrder}
        fetchOrders={fetchOrders}
        session={session.data}
        toast={toast}
      />
    </Card>
  );
}
