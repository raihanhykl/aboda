import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Order } from './page';

const statusColors: Record<Order['status'], string> = {
  pending_payment: 'bg-yellow-500',
  awaiting_confirmation: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-indigo-500',
  confirmed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

interface OrderListProps {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  handleUpdateStatus: (order: Order) => void;
}

export function OrderList({
  orders,
  currentPage,
  totalPages,
  setCurrentPage,
  handleUpdateStatus,
}: OrderListProps) {
  return (
    <>
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
                      Order #{order.invoice} - {order.branch}
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
                  <OrderDetails
                    order={order}
                    handleUpdateStatus={handleUpdateStatus}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </>
  );
}

interface OrderDetailsProps {
  order: Order;
  handleUpdateStatus: (order: Order) => void;
}

function OrderDetails({ order, handleUpdateStatus }: OrderDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Customer:</span>
        <span>{`${order.user.first_name} ${order.user.last_name} (${order.user.email})`}</span>
      </div>
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
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
          <strong>Shipping Address:</strong> {order.shipping_address}
        </p>
        <p>
          <strong>Payment Method:</strong> {order.payment_method}
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
      </div>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: PaginationProps) {
  return (
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
  );
}
