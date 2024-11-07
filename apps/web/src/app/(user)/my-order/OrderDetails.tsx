import { Button } from '@/components/ui/button';
import AlertModal from '@/components/modal/modal';
import { Order } from './types';

interface OrderDetailsProps {
  order: Order;
  handleCheckout: (
    order_invoice: string,
    totalAmount: number,
    payment_method: string,
    token: string | null,
  ) => void;
  handleCancel: (invoice: string) => void;
  handleConfirm: (invoice: string) => void;
}

export function OrderDetails({
  order,
  handleCheckout,
  handleCancel,
  handleConfirm,
}: OrderDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Date:</span>
        <span>{new Date(order.created_at).toLocaleDateString()}</span>
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
          <strong>Shipping Address:</strong> {order.shipping_address}
        </p>
        <p>
          <strong>Payment Method:</strong> {order.payment_method}
        </p>
      </div>
      {order.status === 'pending_payment' && (
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
            description="This action cannot be undone. This will delete your order."
          />
        </div>
      )}
      {order.status === 'shipped' && (
        <div className="py-1">
          <AlertModal
            onConfirm={() => handleConfirm(order.invoice)}
            triggerText="Confirm Order"
            title="Are you sure?"
            description="This action will close your order. Make sure you received the package and make sure your stuff is not damaged."
          />
        </div>
      )}
    </div>
  );
}
