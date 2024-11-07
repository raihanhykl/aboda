import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { BASE_API_URL } from '@/config';
import AlertModal from '@/components/modal/modal';
import { api } from '@/config/axios.config';
import { Order } from './page';
import { Session } from 'next-auth';
import { ToastActionElement, ToastProps } from '@/components/ui/toast';

interface UpdateOrderModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedOrder: Order | null;
  fetchOrders: () => Promise<void>;
  session: Session | null;
  toast: (props: {
    title?: string;
    description: string;
    action?: ToastActionElement;
    variant?: 'default' | 'destructive';
  }) => void;
}

export function UpdateOrderModal({
  isOpen,
  setIsOpen,
  selectedOrder,
  fetchOrders,
  session,
  toast,
}: UpdateOrderModalProps) {
  const handleAcceptOrder = async () => {
    if (selectedOrder) {
      const status =
        selectedOrder.status === 'awaiting_confirmation'
          ? 'processing'
          : 'shipped';
      try {
        await api.post(
          '/order/update-status',
          { orderId: selectedOrder.id, status },
          {
            headers: { Authorization: `Bearer ${session?.user.access_token}` },
          },
        );
        toast({
          title: 'Success',
          description: `Order status updated to ${status}.`,
        });
        setIsOpen(false);
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
          '/order/update-status',
          { orderId: selectedOrder.id, status: 'pending_payment' },
          {
            headers: { Authorization: `Bearer ${session?.user.access_token}` },
          },
        );
        toast({ title: 'Success', description: 'Payment proof rejected.' });
        setIsOpen(false);
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

  const handleCancel = async (invoice: string) => {
    await api.post(
      '/order/cancel',
      { invoice },
      {
        headers: { Authorization: `Bearer ${session?.user.access_token}` },
      },
    );
    setIsOpen(false);
    fetchOrders();
    toast({ description: 'Order Cancelled!' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                src={`${BASE_API_URL}/payment-proof/${selectedOrder.payment_proof}`}
                alt="Payment Proof"
                width={300}
                height={300}
                className="rounded-md"
              />
            </div>
          )}
        {selectedOrder?.status === 'processing' && (
          <div className="mt-4">
            <h4 className="text-sm text-center font-medium">
              Update Status to Shipped?
            </h4>
          </div>
        )}
        {selectedOrder?.status === 'pending_payment' && (
          <div className="mt-4">
            <h4 className="text-sm text-center font-medium">Cancel Order?</h4>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
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
              <AlertModal
                onConfirm={() =>
                  selectedOrder && handleCancel(selectedOrder.invoice)
                }
                triggerText="Cancel Order"
                title="Are you sure?"
                description={`This action cannot be undone. This will delete the ${selectedOrder?.invoice} order.`}
                variant="destructive"
              />
              <Button variant="default" onClick={handleAcceptOrder}>
                Yes
              </Button>
            </>
          )}
          {selectedOrder?.status === 'pending_payment' && (
            <AlertModal
              onConfirm={() =>
                selectedOrder && handleCancel(selectedOrder.invoice)
              }
              triggerText="Cancel Order"
              title="Are you sure?"
              description={`This action cannot be undone. This will delete the ${selectedOrder?.invoice} order.`}
              variant="destructive"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
