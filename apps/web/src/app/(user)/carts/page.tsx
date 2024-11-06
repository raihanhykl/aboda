'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/state/store';
import { fetchCart, selectCart } from '@/state/cart/cartSlice';
import { api } from '@/config/axios.config';
import { Card } from '@/components/ui/card';
import AlertModal from '@/components/modal/modal';
import CartList from '../components/CartList';
import OrderSummary from '../components/OrderSummary';
import Link from 'next/link';

export default function ShoppingCartPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [discountedCarts, setDiscountedCarts] = useState<any[]>([]);
  const session = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector(selectCart);

  useEffect(() => {
    if (session.status === 'authenticated') {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (carts.length > 0) {
      applyDiscounts(carts).then(setDiscountedCarts);
    }
  }, [carts]);

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

  const applyDiscounts = async (initialCarts: any[]) => {
    const updatedCarts = await Promise.all(
      initialCarts.map(async (cart) => {
        const discount = await getDiscount(
          cart.ProductStock.Branch.id,
          cart.ProductStock.Product.id,
        );
        let discountAmount = 0;

        if (discount) {
          if (discount.discount_type === 'percentage') {
            discountAmount =
              (cart.ProductStock.Product.price * discount.discount_value) / 100;
          } else if (discount.discount_type === 'fixed') {
            discountAmount = discount.discount_value;
          }
        }

        return {
          ...cart,
          originalPrice: cart.ProductStock.Product.price,
          discountedPrice: Math.max(
            cart.ProductStock.Product.price - discountAmount,
            0,
          ),
        };
      }),
    );
    return updatedCarts;
  };

  const getDiscount = async (branchId: number, productId: number) => {
    try {
      const { data } = await api.get('/discount/get-product', {
        headers: {
          Authorization: 'Bearer ' + session?.data?.user.access_token,
        },
        params: { branchId, productId },
      });
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching discount:', error);
      return null;
    }
  };

  const updateQuantity = async (id: number, change: number) => {
    const update = await api.patch(
      '/cart/update',
      { quantity: change, cartId: id },
      {
        headers: {
          Authorization: 'Bearer ' + session.data?.user?.access_token,
        },
      },
    );

    setDiscountedCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.id === id ? { ...cart, quantity: Math.max(1, change) } : cart,
      ),
    );
  };

  const deleteCart = async (id: number) => {
    try {
      await api.patch(
        '/cart/delete',
        { cartId: id },
        {
          headers: {
            Authorization: 'Bearer ' + session.data?.user?.access_token,
          },
        },
      );

      if (session.data?.user?.access_token) {
        dispatch(fetchCart(session.data.user.access_token));
      }

      setDiscountedCarts((prevCarts) =>
        prevCarts.filter((cart) => cart.id !== id),
      );
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const deleteAll = async () => {
    try {
      await api.patch(
        '/cart/delete-all',
        {},
        {
          headers: {
            Authorization: 'Bearer ' + session.data?.user.access_token,
          },
        },
      );
      setDiscountedCarts([]);
      if (session.data?.user?.access_token) {
        dispatch(fetchCart(session.data.user.access_token));
      }
    } catch (error) {
      console.error('Error deleting all cart items:', error);
    }
  };

  const subtotal = discountedCarts.reduce(
    (acc, cart) => acc + cart.discountedPrice * cart.quantity,
    0,
  );
  const total = subtotal;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Shopping Cart</h1>
      <nav className="text-sm text-center mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          Home
        </Link>{' '}
        /{' '}
        <Link href="/carts" className="text-primary">
          Shopping Cart
        </Link>
      </nav>
      {discountedCarts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CartList
              carts={discountedCarts}
              updateQuantity={updateQuantity}
              deleteCart={deleteCart}
            />
            <div className="p-4 flex justify-end">
              <AlertModal
                onConfirm={deleteAll}
                triggerText="Clear Shopping Cart"
                title="Are you absolutely sure?"
                description="This action cannot be undone. This will permanently delete all your cart items from our servers."
              />
            </div>
          </Card>
          <OrderSummary
            itemCount={discountedCarts.reduce(
              (acc, cart) => acc + cart.quantity,
              0,
            )}
            subtotal={subtotal}
            total={total}
            onCheckout={() => router.push('/checkout')}
          />
        </div>
      ) : (
        <p className="text-center text-xl">Cart is Empty</p>
      )}
    </div>
  );
}
