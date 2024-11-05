import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { Address, Voucher, ShippingOption } from '../helpers/types';
// import {  } from '../types';

interface BillingDetailsProps {
  address: Address[];
  voucher: Voucher[];
  shippingOptions: ShippingOption[];
  formData: any;
  formErrors: Record<string, string>;
  handleFormChange: (name: string, value: any) => void;
  branchName: string;
}

export default function BillingDetails({
  address,
  voucher,
  shippingOptions,
  formData,
  formErrors,
  handleFormChange,
  branchName,
}: BillingDetailsProps) {
  return (
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
                  Address (Only allowed within 10Km from our {branchName}{' '}
                  Branch)
                </Label>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Why only 10km?</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Why only 10km?</AlertDialogTitle>
                      <AlertDialogDescription>
                        We limit deliveries to within 10km of our branch to
                        ensure quick and efficient service. This helps us
                        maintain the quality and freshness of our products,
                        especially for perishable items. It also allows us to
                        provide faster delivery times and reduce transportation
                        costs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction>Understood</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Link href="/my-address" className="text-[12px] text-right">
                Add my address?
              </Link>
            </div>
            <Select
              onValueChange={(value) =>
                handleFormChange('selectedAddress', Number(value))
              }
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
            {formErrors.address && (
              <p className="text-red-500 text-sm">{formErrors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="courier">Courier</Label>
            <Select
              onValueChange={(value) => handleFormChange('courier', value)}
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
            {formErrors.courier && (
              <p className="text-red-500 text-sm">{formErrors.courier}</p>
            )}
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
                handleFormChange(
                  'selectedShippingCost',
                  selectedCost?.cost[0].value || 0,
                );
                handleFormChange(
                  'selectedService',
                  selectedCost?.service || '',
                );
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
                      key={`${option.code}-${cost.service}`}
                      value={`${option.code}-${cost.service}`}
                    >
                      {cost.service} - {cost.description} - Rp.{' '}
                      {cost.cost[0].value.toLocaleString()}
                    </SelectItem>
                  )),
                )}
              </SelectContent>
            </Select>
            {formErrors.service && (
              <p className="text-red-500 text-sm">{formErrors.service}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
