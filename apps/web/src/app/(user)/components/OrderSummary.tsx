import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OrderSummaryProps {
  itemCount: number;
  subtotal: number;
  total: number;
  onCheckout: () => void;
}

export default function OrderSummary({
  itemCount,
  subtotal,
  total,
  onCheckout,
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Sub Total</span>
          <span>Rp. {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rp. {total.toLocaleString()}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
