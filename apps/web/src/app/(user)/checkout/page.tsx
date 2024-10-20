'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Address {
  id: number;
  address: {
    street: string;
    City: {
      id: number;
      city: string;
      Province: {
        name: string;
      };
    };
  };
}

interface Voucher {
  id: number;
  voucher_name: string;
  discount_value: number;
}

interface Cart {
  ProductStock: {
    Product: {
      price: number;
      weight: number;
    };
    Branch: {
      branch_name: string;
      address: {
        cityId: number;
      };
    };
  };
  quantity: number;
}

interface ShippingCost {
  service: string;
  description: string;
  cost: {
    value: number;
    etd: string;
    note: string;
  }[];
}

interface ShippingOption {
  code: string;
  name: string;
  costs: ShippingCost[];
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const router = useRouter();
  const session = useSession();
  const [address, setAddress] = useState<Address[]>([]);
  const [voucher, setVoucher] = useState<Voucher[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [courier, setCourier] = useState('');
  const [origin, setOrigin] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingCost, setSelectedShippingCost] = useState<
    number | null
  >(null);
  const [snapToken, setSnapToken] = useState<string | null>(null); // State for Snap token
  const [selectedService, setSelectedService] = useState<string>(''); // Add service state
  const [selectedVoucher, setSelectedVoucher] = useState<number | null>(null); // Add service state
  const [selectedAddress, setSelectedAddress] = useState<number>(); // Add service state

  useEffect(() => {
    const snapScript: string = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey: any = 'SB-Mid-client-c7SnHqsRuZTiamhl';

    const script = document.createElement('script');
    script.src = snapScript;

    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resAddress = await api.get(`/address/get-user-address-branch`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });

        const resVouchers = await api.get(`/user/get-all-user-vouchers`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });

        const resCart = await api.get(`/cart/get`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });

        setAddress(resAddress.data.data);
        setVoucher(resVouchers.data.data);
        setCarts(resCart.data.data);

        if (resCart.data.success && resCart.data.data.length > 0) {
          const firstProductBranchCityId =
            resCart.data.data[0].ProductStock.Branch.address.cityId;
          setOrigin(firstProductBranchCityId);
        }
      } catch (error) {
        console.error('Error fetching data.', error);
      }
    };

    if (session.status === 'authenticated') {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    const fetchShippingCost = async () => {
      if (courier && selectedCity && weight > 0 && origin) {
        try {
          const response = await axios.post('/api/rajaongkir', {
            origin,
            destination: selectedCity,
            weight: weight,
            courier: courier,
          });
          console.log(response.data);

          const results = response.data.rajaongkir.results;
          const shippingServices: ShippingOption[] = results.map(
            (result: any) => ({
              code: result.code,
              name: result.name,
              costs: result.costs,
            }),
          );

          setShippingOptions(shippingServices);
        } catch (error) {
          console.error('Error fetching shipping details.', error);
        }
      }
    };

    fetchShippingCost();
  }, [courier, selectedCity, weight, origin]);

  useEffect(() => {
    const totalWeight = calculateTotalWeight(carts);
    setWeight(totalWeight);
  }, [carts]);

  const handleAddressChange = (value: string) => {
    const selected = address.find((addr) => addr.id.toString() === value);
    setSelectedAddress(selected?.id);
    if (selected) {
      setSelectedCity(selected.address.City.id);
    }
  };

  const calculateSubTotal = (carts: Cart[]) => {
    return carts.reduce((acc, cart) => {
      return acc + cart.ProductStock.Product.price * cart.quantity;
    }, 0);
  };

  const calculateTotalWeight = (carts: Cart[]) => {
    return carts.reduce((acc, cart) => {
      return acc + cart.ProductStock.Product.weight * cart.quantity;
    }, 0);
  };

  const calculateVoucherDiscount = (voucher: Voucher[], subTotal: number) => {
    if (voucher.length > 0) {
      const discountValue = voucher[0]?.discount_value || 1;
      return (subTotal * discountValue) / 100;
    }
    return 0;
  };

  const handleMakeOrder = async () => {
    const subTotal = calculateSubTotal(carts);
    const totalAmount =
      subTotal +
      (selectedShippingCost || 0) -
      calculateVoucherDiscount(voucher, subTotal);

    try {
      const response = await api.post(
        '/order/add-order',
        {
          origin: origin,
          destination: selectedCity,
          weight: weight,
          courier: courier,
          service: selectedService, // Send selected service to the backend
          user_voucher_id: selectedVoucher || null,
          shipping_price: selectedShippingCost || 0,
          payment_id: paymentMethod === 'gateway' ? 1 : 2, // Example payment ID logic
          user_address_id: selectedAddress,
          expedition: courier,
          expedition_detail: selectedService, // Send service as expedition detail
        },
        {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        },
      );
      console.log(
        {
          origin,
          destination: selectedCity,
          weight,
          courier,
          service: selectedService,
          user_voucher_id: selectedVoucher || null,
          shipping_price: selectedShippingCost || 0,
          payment_id: paymentMethod === 'gateway' ? 1 : 2,
          user_address_id: selectedAddress,
          expedition: courier,
          expedition_detail: selectedService,
        },
        'Data sent to the backend',
      );

      // Individual logs for specific fields
      console.log(selectedService, 'ini selected service');
      console.log(selectedVoucher, 'ini selected voucher');
      console.log(selectedShippingCost, 'ini selected shipping cost');
      console.log(paymentMethod, 'ini payment method');
      console.log(selectedAddress, 'ini selected address');

      // console.log('Order created:', response.data);
      // router.push('/order-success'); // Redirect to success page or handle accordingly
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handlePayment = async () => {
    const subTotal = calculateSubTotal(carts); // Menghitung subtotal dari carts
    const totalAmount =
      subTotal +
      (selectedShippingCost || 0) -
      calculateVoucherDiscount(voucher, subTotal); // Total setelah diskon dan shipping cost
    console.log(totalAmount, 'ini total amount');

    try {
      const response = await axios.post('/api/payment', {
        carts: carts, // Mengirim carts ke backend
        shippingCost: totalAmount || 0, // Mengirim biaya pengiriman
      });

      console.log(response, 'ini response');
      // (window as any).snap.pay(response.data.token);

      // if (typeof window.snap !== 'undefined') {
      // (window as any).snap.pay('0ef8bf1c-a9f1-48cd-88d8-e24919e0c32d');

      console.log(window.snap.pay(response.data.token));

      // window.snap.pay('0ef8bf1c-a9f1-48cd-88d8-e24919e0c32d', {
      //   onSuccess: function (result) {
      //     console.log('payment success:', result);
      //   },
      //   onPending: function (result) {
      //     console.log('payment pending:', result);
      //   },
      //   onError: function (result) {
      //     console.error('payment error:', result);
      //   },
      //   onClose: function () {
      //     console.log('payment popup closed');
      //   },
      // });

      // } else {
      //   console.error('Snap is not loaded');
      // }
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'manual') {
      router.push('/checkout-manual'); // Redirect ke halaman manual transfer
    } else if (paymentMethod === 'gateway') {
      handlePayment(); // Eksekusi pembayaran dengan payment gateway
    } else {
      console.log('Please select a payment method');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>
      <nav className="text-sm text-center mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          Home
        </Link>{' '}
        /{' '}
        <Link
          href="/carts"
          className="text-muted-foreground hover:text-primary"
        >
          Shopping Cart
        </Link>{' '}
        / <span className="text-primary">Checkout</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="address">
                        Address (Only allowed within 10Km from our{' '}
                        {carts[0]?.ProductStock.Branch.branch_name} Branch)
                      </Label>
                      <AlertDialog
                        open={isAlertOpen}
                        onOpenChange={setIsAlertOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <HelpCircle className="h-4 w-4" />
                            <span className="sr-only">Why only 10km?</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Why only 10km?</AlertDialogTitle>
                            <AlertDialogDescription>
                              We limit deliveries to within 10km of our branch
                              to ensure quick and efficient service. This helps
                              us maintain the quality and freshness of our
                              products, especially for perishable items. It also
                              allows us to provide faster delivery times and
                              reduce transportation costs.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction>Understood</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <Link
                      href="/add-address"
                      className="text-[12px] text-right"
                    >
                      Add my address?
                    </Link>
                  </div>
                  <Select
                    onValueChange={handleAddressChange}
                    defaultValue={address[0]?.id.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Address" />
                    </SelectTrigger>
                    <SelectContent>
                      {address.map((addr) => (
                        <SelectItem key={addr.id} value={addr.id.toString()}>
                          {addr.address.street}, {addr.address.City.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voucher">Voucher</Label>
                  <Select
                    onValueChange={(value) => {
                      const selected = voucher.find(
                        (v) => v.id.toString() === value,
                      );
                      setSelectedVoucher(selected ? selected.id : null);
                    }}
                    defaultValue={voucher[0]?.id.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      {voucher.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.voucher_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier">Courier</Label>
                  <Select
                    onValueChange={(value) => {
                      setCourier(value);
                    }}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Courier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jne">JNE</SelectItem>
                      <SelectItem value="pos">POS Indonesia</SelectItem>
                      <SelectItem value="tiki">TIKI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-service">Shipping Service</Label>
                  <Select
                    onValueChange={(value) => {
                      const [selectedCode, selectedService] = value.split('-');
                      const selectedOption = shippingOptions.find(
                        (option) => option.code === selectedCode,
                      );
                      const selectedCost = selectedOption?.costs.find(
                        (cost) => cost.service === selectedService,
                      );
                      setSelectedShippingCost(selectedCost?.cost[0].value || 0);
                      setSelectedService(selectedCost?.service || '');
                    }}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shipping Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingOptions.map((option) =>
                        option.costs.map((cost) => (
                          <SelectItem
                            key={cost.service}
                            value={`${option.code}-${cost.service}`}
                          >
                            {cost.service} - {cost.description} - Rp.{' '}
                            {cost.cost[0].value}
                          </SelectItem>
                        )),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>
                    {carts.reduce((acc, cart) => acc + cart.quantity, 0)}
                  </span>{' '}
                </div>
                <div className="flex justify-between">
                  <span>Sub Total</span>
                  <span>
                    Rp. {calculateSubTotal(carts).toLocaleString()}
                  </span>{' '}
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    Rp. {selectedShippingCost?.toLocaleString() || '0'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Discount Voucher</span>
                  <span className="text-red-500">
                    -Rp.{' '}
                    {calculateVoucherDiscount(
                      voucher,
                      calculateSubTotal(carts),
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Select Payment Method</Label>
                  <Select
                    onValueChange={(value) => setPaymentMethod(value)}
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
                </div>

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    Rp.{' '}
                    {(
                      calculateSubTotal(carts) +
                      (selectedShippingCost || 0) -
                      calculateVoucherDiscount(
                        voucher,
                        calculateSubTotal(carts),
                      )
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-3"
                onClick={handleCheckout}
              >
                Proceed to Payment
              </Button>

              <Button
                type="submit"
                className="w-full mt-3"
                onClick={handleMakeOrder}
              >
                Make an Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
