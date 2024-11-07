import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from './types';
import { OrderDetails } from './OrderDetails';
import { useState, useEffect } from 'react';

interface OrderListProps {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  handleCheckout: (
    order_invoice: string,
    totalAmount: number,
    payment_method: string,
    token: string | null,
  ) => void;
  handleCancel: (invoice: string) => void;
  handleConfirm: (invoice: string) => void;
  isLoading: boolean;
}

const statusColors: Record<Order['status'], string> = {
  pending_payment: 'bg-yellow-500',
  awaiting_confirmation: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-indigo-500',
  confirmed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export function OrderList({
  orders,
  currentPage,
  totalPages,
  setCurrentPage,
  handleCheckout,
  handleCancel,
  handleConfirm,
  isLoading,
}: OrderListProps) {
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCountdowns: Record<number, string> = {};
      orders.forEach((order) => {
        if (order.status === 'pending_payment') {
          const createdAt = new Date(order.created_at);
          const endTime = new Date(createdAt.getTime() + 5 * 60000); // Add 5 minutes
          updatedCountdowns[order.id] = calculateCountdown(endTime);
        }
      });
      setCountdowns(updatedCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [orders]);

  const calculateCountdown = (endTime: Date) => {
    const now = new Date().getTime();
    const timeLeft = endTime.getTime() - now;

    if (timeLeft <= 0) return '00:00';

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">
          No orders found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search or filter to find what you are looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        {orders.map((order, index) => (
          <AccordionItem value={`item-${index}`} key={order.id}>
            <AccordionTrigger>
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">Order #{order.invoice}</span>
                <div className="flex gap-4 text-center items-center">
                  {order.status === 'pending_payment' && (
                    <span className="text-[12px] text-white bg-red-600 rounded-xl px-2 py-1">
                      {countdowns[order.id] ?? '00:00'}
                    </span>
                  )}
                  <Badge className={`${statusColors[order.status]} text-white`}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <OrderDetails
                order={order}
                handleCheckout={handleCheckout}
                handleCancel={handleCancel}
                handleConfirm={handleConfirm}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="flex justify-center items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
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
          onClick={() => setCurrentPage(currentPage + 1)}
          className="ml-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}
