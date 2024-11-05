import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Cart } from '../helpers/types';

interface OrderSummaryProps {
  carts: Cart[];
  discountedCarts: Cart[];
  formData: any;
  formErrors: Record<string, string>;
  handleFormChange: (name: string, value: any) => void;
  handleMakeOrder: () => void;
}

export default function OrderSummary({
  carts,
  discountedCarts,
  formData,
  formErrors,
  handleFormChange,
  handleMakeOrder,
}: OrderSummaryProps) {
  const calculateTotalPrice = (carts: Cart[]) => {
    return carts.reduce(
      (acc, cart) => acc + cart.ProductStock.Product.price * cart.quantity,
      0,
    );
  };

  const calculateTotalDiscountedPrice = (carts: Cart[]) => {
    return carts.reduce((acc, cart) => {
      const discountedPrice =
        cart.discountedPrice !== undefined
          ? cart.discountedPrice
          : cart.ProductStock.Product.price;
      return acc + discountedPrice * cart.quantity;
    }, 0);
  };

  const calculateTotalDiscount = (carts: Cart[], discountedCarts: Cart[]) => {
    const totalOriginalPrice = calculateTotalPrice(carts);
    const totalDiscountedPrice = calculateTotalDiscountedPrice(discountedCarts);
    return totalOriginalPrice - totalDiscountedPrice;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span>Rp. {calculateTotalPrice(carts).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="text-red-500">
              -Rp.{' '}
              {calculateTotalDiscount(carts, discountedCarts).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              Rp. {formData.selectedShippingCost?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-method">Select Payment Method</Label>
            <Select
              onValueChange={(value) =>
                handleFormChange('paymentMethod', value)
              }
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gateway">Payment Gateway</SelectItem>
                <SelectItem value="manual">Manual Transfer</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.paymentMethod && (
              <p className="text-red-500 text-sm">{formErrors.paymentMethod}</p>
            )}
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>
              Rp.{' '}
              {(
                calculateTotalDiscountedPrice(discountedCarts) +
                (formData.selectedShippingCost || 0)
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleMakeOrder}>
          Make an Order
        </Button>
      </CardFooter>
    </Card>
  );
}
