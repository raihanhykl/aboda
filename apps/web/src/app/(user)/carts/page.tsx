'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AlertModal from '@/components/modal/modal';

export default function page() {
  const [carts, setCarts] = useState<any[]>([]);
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/cart/get`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });
        setCarts(res.data.data);
      } catch (error) {
        console.error('Error fetching carts:', error);
      }
    };

    if (session.status === 'authenticated') {
      fetchData();
    }
  }, [session]);

  const updateQuantity = async (id: number, change: number) => {
    // console.log(change, 'ini change');

    const update = await api.patch(
      '/cart/update',
      { quantity: change, cartId: id },
      {
        headers: {
          Authorization: 'Bearer ' + session.data?.user?.access_token,
        },
      },
    );
    console.log(update.data);

    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.id === id ? { ...cart, quantity: Math.max(0, change) } : cart,
      ),
    );
  };

  const deleteCart = async (id: number) => {
    const deleteCart = await api.patch(
      '/cart/delete',
      { cartId: id },
      {
        headers: {
          Authorization: 'Bearer ' + session.data?.user?.access_token,
        },
      },
    );
    console.log(deleteCart.data);

    setCarts((prevCarts) => prevCarts.filter((cart) => cart.id !== id));
  };

  const deleteAll = async () => {
    const deleteAll = await api.patch(
      '/cart/delete-all',
      {},
      {
        headers: {
          Authorization: 'Bearer ' + session.data?.user?.access_token,
        },
      },
    );
    console.log(deleteAll.data);

    setCarts([]);
  };

  // Gunakan 'reduce' hanya jika carts memiliki data
  const subtotal =
    carts?.length > 0
      ? carts.reduce(
          (acc, cart) => acc + cart.ProductStock.Product.price * cart.quantity,
          0,
        )
      : 0;

  const shipping = 10000;
  const discount = 10000;
  const total = subtotal + shipping - discount;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Shopping Cart</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">
        Home / Shopping Cart
      </p>

      {carts?.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader className="bg-yellow-300 rounded-t-xl">
              <div className="grid grid-cols-4 gap-4 font-semibold">
                <div className="col-span-2">Product</div>
                <div>Quantity</div>
                <div>Subtotal</div>
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {carts?.length > 0 ? (
                carts.map((cart) => (
                  <div
                    key={cart.id}
                    className="py-4 grid grid-cols-4 gap-4 items-center"
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
                        onClick={() =>
                          updateQuantity(cart.id, cart.quantity - 1)
                        }
                      >
                        -
                      </Button>
                      <span>{cart.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(cart.id, cart.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                    <div>
                      Rp.{' '}
                      {(
                        cart.ProductStock.Product.price * cart.quantity
                      ).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-3xl font-semibold">
                  Cart is empty. {carts?.length}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Input placeholder="Voucher Code" className="w-40" />
                <Button className="text-white" variant="secondary">
                  Apply Voucher
                </Button>
              </div>
              <AlertModal
                onConfirm={deleteAll}
                triggerText="Clear Shopping Cart"
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete all your cart items from our servers."
              />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Items</span>
                <span>
                  {carts?.reduce((acc, cart) => acc + cart.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>Rp. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Rp. {shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Voucher Discount</span>
                <span>-Rp. {discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>Rp. {total.toLocaleString()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <p className="text-center text-xl">Cart is Empty</p>
      )}
    </div>
  );
}
