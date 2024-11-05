import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import AlertModal from '@/components/modal/modal';

interface CartListProps {
  carts: any[];
  updateQuantity: (id: number, change: number) => void;
  deleteCart: (id: number) => void;
}

export default function CartList({
  carts,
  updateQuantity,
  deleteCart,
}: CartListProps) {
  return (
    <>
      <CardHeader className="bg-yellow-300 rounded-t-xl">
        <div className="grid grid-cols-5 gap-4 font-semibold">
          <div className="col-span-2">
            Product - {carts[0]?.ProductStock.Branch.branch_name} Branch
          </div>
          <div>Quantity</div>
          <div>Price</div>
          <div>Subtotal</div>
        </div>
      </CardHeader>
      <CardContent className="divide-y">
        {carts.map((cart) => (
          <div
            key={cart.id}
            className="py-4 grid grid-cols-5 gap-4 items-center"
          >
            <div className="col-span-2 flex items-center space-x-4">
              <AlertModal
                onConfirm={() => deleteCart(cart.id)}
                triggerText="✕"
                title="Are you sure?"
                description={`This action cannot be undone. This will delete ${cart.ProductStock.Product.product_name} from your cart.`}
              />
              <div className="w-16 h-16 bg-gray-200" />
              <span>{cart.ProductStock.Product.product_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(cart.id, cart.quantity - 1)}
              >
                -
              </Button>
              <span>{cart.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(cart.id, cart.quantity + 1)}
              >
                +
              </Button>
            </div>
            <div className="flex flex-col">
              {cart.originalPrice !== cart.discountedPrice ? (
                <>
                  <span className="text-sm line-through text-red-500">
                    Rp. {cart.originalPrice.toLocaleString()}
                  </span>
                  <span className="font-semibold">
                    Rp. {cart.discountedPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="font-semibold">
                  Rp. {cart.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div>
              Rp. {(cart.discountedPrice * cart.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>
    </>
  );
}
