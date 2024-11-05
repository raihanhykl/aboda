'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { api } from '@/config/axios.config';

type Discount = {
  id: number;
  branchId: number;
  discount_type: 'PERCENTAGE' | 'FIXED' | 'BUY_ONE_GET_ONE';
  discount_value: number;
  start_date: string;
  end_date: string;
  productId: number | null;
  min_purchase_amount?: number;
  max_discount_amount?: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/discount');
      console.log(response.data, 'ini response discount');
      setDiscounts(response.data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setError('Failed to fetch discounts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product/all');
      console.log(response.data, 'ini response product');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleDiscountSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productId = formData.get('productId') as string;
    const discountData = {
      branchId: Number(formData.get('branchId')),
      discount_type: formData.get('discount_type') as
        | 'PERCENTAGE'
        | 'FIXED'
        | 'BUY_ONE_GET_ONE',
      discount_value: Number(formData.get('discount_value')),
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      productId: productId === 'all' ? null : Number(productId),
      min_purchase_amount: formData.get('min_purchase_amount')
        ? Number(formData.get('min_purchase_amount'))
        : undefined,
      max_discount_amount: formData.get('max_discount_amount')
        ? Number(formData.get('max_discount_amount'))
        : undefined,
    };

    try {
      if (currentDiscount) {
        await api.put(`/discount/${currentDiscount.id}`, discountData);
      } else {
        await api.post('/discount', discountData);
      }
      fetchDiscounts();
      setIsDiscountDialogOpen(false);
    } catch (error) {
      console.error('Error submitting discount:', error);
      setError('Failed to submit discount. Please try again.');
    }
  };

  const deleteDiscount = async (discountId: number) => {
    try {
      await api.delete(`/discount/${discountId}`);
      fetchDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      setError('Failed to delete discount. Please try again.');
    }
  };

  const filteredDiscounts = discounts.filter((discount) =>
    discount.productId
      ? products
          .find((p) => p.id === discount.productId)
          ?.name.toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true,
  );

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Discount Management
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="relative"></div>
        <Button
          onClick={() => {
            setCurrentDiscount(null);
            setIsDiscountDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Discount
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Max Discount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No discounts available.
                </TableCell>
              </TableRow>
            ) : (
              filteredDiscounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>{discount.discount_type}</TableCell>
                  <TableCell>{discount.discount_value}</TableCell>
                  <TableCell>
                    {new Date(discount.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(discount.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {discount.productId
                      ? products.find((p) => p.id === discount.productId)?.name
                      : 'All Products'}
                  </TableCell>
                  <TableCell>{discount.min_purchase_amount || 'N/A'}</TableCell>
                  <TableCell>{discount.max_discount_amount || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentDiscount(discount);
                        setIsDiscountDialogOpen(true);
                      }}
                      className="mr-2"
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDiscount(discount.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentDiscount ? 'Edit Discount' : 'Add Discount'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDiscountSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount_type" className="text-right">
                  Type
                </Label>
                <Select
                  name="discount_type"
                  defaultValue={currentDiscount?.discount_type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    <SelectItem value="BUY_ONE_GET_ONE">
                      Buy One Get One
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount_value" className="text-right">
                  Value
                </Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  defaultValue={currentDiscount?.discount_value}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={currentDiscount?.start_date?.split('T')[0]}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={currentDiscount?.end_date?.split('T')[0]}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productId" className="text-right">
                  Product
                </Label>
                <Select
                  name="productId"
                  defaultValue={currentDiscount?.productId?.toString() || 'all'}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a product (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={product.id.toString()}
                      >
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="min_purchase_amount" className="text-right">
                  Min Purchase
                </Label>
                <Input
                  id="min_purchase_amount"
                  name="min_purchase_amount"
                  type="number"
                  defaultValue={currentDiscount?.min_purchase_amount}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="max_discount_amount" className="text-right">
                  Max Discount
                </Label>
                <Input
                  id="max_discount_amount"
                  name="max_discount_amount"
                  type="number"
                  defaultValue={currentDiscount?.max_discount_amount}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branchId" className="text-right">
                  Branch ID
                </Label>
                <Input
                  id="branchId"
                  name="branchId"
                  type="number"
                  defaultValue={currentDiscount?.branchId}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentDiscount ? 'Update Discount' : 'Add Discount'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
