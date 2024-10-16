'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { env } from 'process';
import axios from 'axios';

export default function CheckoutPage() {
  const session = useSession();
  const [address, setAddress] = useState<any[]>([]);
  const [voucher, setVoucher] = useState<any[]>([]);
  const [carts, setCarts] = useState<any[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [courier, setCourier] = useState('');
  const [shipping, setShipping] = useState<any[]>([]);
  const [origin, setOrigin] = useState(null); // Set your origin branch ID
  const [selectedCity, setSelectedCity] = useState(null); // To store selected destination city
  const [weight, setWeight] = useState(0); // Weight of the items
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/address/get-user-address-branch`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });

        const res2 = await api.get(`/user/get-all-user-vouchers`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });

        const res3 = await api.get(`/cart/get`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });
        setAddress(res.data.data);
        setVoucher(res2.data.data);
        setCarts(res3.data.data);
      } catch (error) {
        console.error('Error fetching user address.', error);
      }
    };

    if (session.status === 'authenticated') {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    const fetchShippingCost = async () => {
      if (courier && selectedCity && weight > 0) {
        try {
          const response = await axios.post(
            `https://api.rajaongkir.com/starter/cost`,
            {
              origin, // origin city ID
              destination: selectedCity, // selected destination city ID
              weight: weight, // weight in grams
              courier: courier, // selected courier
            },
            {
              headers: {
                key:
                  process.env.RAJA_ONGKIR_KEY ||
                  '6217fa0987d802058e79fa9a345c6923',
              },
            },
          );

          // Set shipping options from the API response
          setShippingOptions(response.data.rajaongkir.results);
          setShipping(response.data.data);
        } catch (error) {
          console.error('Error fetching shipping details.', error);
        }
      }
    };

    fetchShippingCost();
  }, [courier, selectedCity, weight]);

  // Calculate the total weight based on items in the cart
  useEffect(() => {
    const totalWeight = calculateTotalWeight(carts);
    setWeight(totalWeight * 1000); // Convert to grams
  }, [carts]);

  // Handle the address selection change
  const handleAddressChange = (value: string) => {
    // Assuming `value` is the selected address ID
    const selectedAddress = address.find(
      (addr) => addr.id.toString() === value,
    );
    if (selectedAddress) {
      setSelectedCity(selectedAddress.address.City.id); // Assuming City has an ID
    }
  };

  const calculateSubTotal = (carts: any[]) => {
    return carts.reduce((acc, cart) => {
      return acc + cart.ProductStock.Product.price * cart.quantity;
    }, 0);
  };

  const calculateTotalWeight = (carts: any[]) => {
    return carts.reduce((acc, cart) => {
      return acc + cart.ProductStock.Product.weight * cart.quantity;
    }, 0);
  };

  // const calculateShippingCost = (totalWeight: number) => {
  //   const baseRate = 10000;
  //   return baseRate + totalWeight * 200;
  // };

  const calculateVoucherDiscount = (voucher: any[], subTotal: number) => {
    if (voucher.length > 0) {
      const discountValue = voucher[0]?.discount_value || 1;
      return (subTotal * discountValue) / 100;
    }
    return 0;
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
                    <Link href="/add-address" className="text-[12px]">
                      Add my address?
                    </Link>
                  </div>

                  <Select onValueChange={handleAddressChange}>
                    <SelectTrigger id="address">
                      <SelectValue placeholder="Select Address" />
                    </SelectTrigger>
                    <SelectContent>
                      {address.length > 0 ? (
                        address.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id.toString()}>
                            {addr.address.street}, {addr.address.City.city},{' '}
                            {addr.address.City.Province.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          value="no-address"
                          className="text-muted-foreground cursor-not-allowed"
                          disabled
                        >
                          No address found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voucher">Voucher</Label>
                  <Select>
                    <SelectTrigger id="voucher">
                      <SelectValue placeholder="Select Voucher" />
                    </SelectTrigger>
                    <SelectContent>
                      {voucher.length > 0 ? (
                        voucher.map((vouch) => (
                          <SelectItem
                            key={vouch.id}
                            value={vouch.id.toString()}
                          >
                            {vouch.voucher_name} - Discount:{' '}
                            {vouch.discount_value}%
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          value="no-voucher"
                          className="text-muted-foreground cursor-not-allowed"
                          disabled
                        >
                          No voucher available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier">Courier</Label>
                  <Select onValueChange={setCourier}>
                    <SelectTrigger id="courier">
                      <SelectValue placeholder="Select Courier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jne">JNE</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="tiki">TIKI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courier">Courier Service</Label>
                  <Select>
                    <SelectTrigger id="courier">
                      <SelectValue placeholder="Select Courier Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jne">JNE</SelectItem>
                      <SelectItem value="pos">POS</SelectItem>
                      <SelectItem value="tiki">TIKI</SelectItem>
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
                    Rp.{' '}
                    {/* {calculateShippingCost(
                        calculateTotalWeight(carts),
                      ).toLocaleString()} */}
                  </span>{' '}
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

                {/* Total */}
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    Rp.{' '}
                    {(
                      calculateSubTotal(carts) +
                      // calculateShippingCost(calculateTotalWeight(carts))
                      -calculateVoucherDiscount(
                        voucher,
                        calculateSubTotal(carts),
                      )
                    ).toLocaleString()}
                  </span>
                </div>
                <Button className="w-full">Proceed to Payment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
