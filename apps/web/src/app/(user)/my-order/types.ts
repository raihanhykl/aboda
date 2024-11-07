export type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type Order = {
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
