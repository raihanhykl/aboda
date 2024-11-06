'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/state/store';
import { fetchCart } from '@/state/cart/cartSlice';
import { api } from '@/config/axios.config';
import Link from 'next/link';
import { z } from 'zod';
import { Cart, Address, Voucher, ShippingOption } from '../helpers/types';
import { fetchShippingCost, applyDiscounts } from '../helpers/utils';
import BillingDetails from '../components/BillingDetails';
import OrderSummary from '../components/OrderPayment';

const checkoutSchema = z.object({
  address: z.string().nonempty('Address is required.'),
  courier: z.string().nonempty('Shipping courier is required.'),
  service: z.string().nonempty('Shipping service is required.'),
  paymentMethod: z.string().nonempty('Payment method is required.'),
});

export default function CheckoutPage() {
  const [address, setAddress] = useState<Address[]>([]);
  const [voucher, setVoucher] = useState<Voucher[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [discountedCarts, setDiscountedCarts] = useState<Cart[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [formData, setFormData] = useState({
    selectedAddress: undefined as number | undefined,
    selectedCity: null as number | null,
    courier: '',
    selectedService: '',
    selectedShippingCost: null as number | null,
    selectedVoucher: null as number | null,
    paymentMethod: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState<number | null>(null);
  const [weight, setWeight] = useState<number>(0);

  const session = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (session.status === 'authenticated') {
      fetchInitialData();
    }
  }, [session]);

  useEffect(() => {
    fetchShippingCost(
      formData.courier,
      formData.selectedCity,
      weight,
      origin,
      setShippingOptions,
    );
  }, [formData.courier, formData.selectedCity, weight, origin]);

  useEffect(() => {
    setWeight(calculateTotalWeight(carts));
  }, [carts]);

  const fetchInitialData = async () => {
    try {
      const [resAddress, resVouchers, resCart] = await Promise.all([
        api.get(`/address/get-user-address-branch`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        }),
        api.get(`/user/get-all-user-vouchers`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        }),
        api.get(`/cart/get`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        }),
      ]);

      setAddress(resAddress.data.data);
      setVoucher(resVouchers.data.data);
      setCarts(resCart.data.data);

      const discountedItems = await applyDiscounts(
        resCart.data.data,
        session?.data?.user.access_token,
      );
      setDiscountedCarts(discountedItems);

      if (resCart.data.success && resCart.data.data.length > 0) {
        setOrigin(resCart.data.data[0].ProductStock.Branch.address.cityId);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleFormChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // If the address is being changed, update the selectedCity as well
    if (name === 'selectedAddress') {
      const selectedAddr = address.find((addr) => addr.id === value);
      if (selectedAddr) {
        setFormData((prev) => ({
          ...prev,
          selectedCity: selectedAddr.address.City.id,
        }));
      }
    }
  };

  const handleMakeOrder = async () => {
    const validation = checkoutSchema.safeParse({
      address: formData.selectedAddress
        ? formData.selectedAddress.toString()
        : '',
      courier: formData.courier,
      service: formData.selectedService,
      paymentMethod: formData.paymentMethod,
    });

    if (!validation.success) {
      const errors = validation.error.errors.reduce(
        (acc, error) => {
          acc[error.path[0]] = error.message;
          return acc;
        },
        {} as Record<string, string>,
      );
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    try {
      await api.post(
        '/order/add-order',
        {
          origin: origin,
          destination: formData.selectedCity,
          weight: weight,
          courier: formData.courier,
          service: formData.selectedService,
          user_voucher_id: formData.selectedVoucher,
          shipping_price: formData.selectedShippingCost || 0,
          payment_id: formData.paymentMethod === 'gateway' ? 1 : 2,
          user_address_id: formData.selectedAddress,
          expedition: formData.courier,
          expedition_detail: formData.selectedService,
        },
        {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        },
      );
      router.push('/order');
      if (session.data?.user?.access_token) {
        dispatch(fetchCart(session.data.user.access_token));
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const calculateTotalWeight = (carts: Cart[]) => {
    return carts.reduce(
      (acc, cart) => acc + cart.ProductStock.Product.weight * cart.quantity,
      0,
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
      <nav className="text-sm text-center mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          Home
        </Link>{' '}
        /
        <Link
          href="/carts"
          className="text-muted-foreground hover:text-primary"
        >
          Shopping Cart
        </Link>{' '}
        /<span className="text-primary">Checkout</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BillingDetails
          address={address}
          voucher={voucher}
          shippingOptions={shippingOptions}
          formData={formData}
          formErrors={formErrors}
          handleFormChange={handleFormChange}
          branchName={carts[0]?.ProductStock.Branch.branch_name}
        />
        <OrderSummary
          carts={carts}
          discountedCarts={discountedCarts}
          formData={formData}
          formErrors={formErrors}
          handleFormChange={handleFormChange}
          handleMakeOrder={handleMakeOrder}
        />
      </div>
    </div>
  );
}
