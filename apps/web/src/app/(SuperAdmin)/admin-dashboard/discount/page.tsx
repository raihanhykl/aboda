'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';

// Validation schema for discount form
const discountSchema = z.object({
  id: z.number().optional(),
  productId: z.string().min(1, { message: 'Product is required' }),
  discount_type: z.enum(['percentage', 'fixed', 'bogo']),
  discount_value: z.string().min(1, { message: 'Discount value is required' }),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
});

type Discount = z.infer<typeof discountSchema>;

type Product = {
  id: number;
  product_name: string;
};

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [isBOGO, setIsBOGO] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setting up the form with validation
  const form = useForm<Discount>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      productId: '',
      discount_type: 'percentage',
      discount_value: '',
      start_date: new Date(),
      end_date: new Date(),
    },
  });

  // Fetch discounts and products on component mount
  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  // Reset form values when editing a discount
  useEffect(() => {
    if (editingDiscount) {
      form.reset({
        ...editingDiscount,
        start_date: new Date(editingDiscount.start_date),
        end_date: new Date(editingDiscount.end_date),
      });
    } else {
      form.reset();
    }
  }, [editingDiscount, form]);

  // Fetch all discounts from the API
  async function fetchDiscounts() {
    try {
      const response = await fetch('/api/discount');
      if (!response.ok) throw new Error('Failed to fetch discounts');
      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      console.error('Failed to fetch discounts:', error);
      setErrorMessage('Failed to load discounts. Please try again later.');
    }
  }

  // Fetch all products from the API
  async function fetchProducts() {
    try {
      const response = await fetch('/api/product');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setErrorMessage('Failed to load products. Please try again later.');
    }
  }

  // Handle form submission
  async function onSubmit(values: Discount) {
    setIsLoading(true);
    setErrorMessage(null); // Reset error message

    try {
      const url = editingDiscount
        ? `/api/discount/${editingDiscount.id}`
        : '/api/discount';
      const method = editingDiscount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
          discount_value:
            values.discount_type === 'bogo' ? '0' : values.discount_value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save discount');
      }

      console.log(
        `${editingDiscount ? 'Discount updated' : 'Discount created'} successfully.`,
      );
      setIsDialogOpen(false);
      setEditingDiscount(null);
      form.reset();
      fetchDiscounts();
    } catch (error) {
      console.error('Failed to save discount:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'An error occurred.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Handle discount deletion
  async function deleteDiscount(id: number) {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const response = await fetch(`/api/discount/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete discount');

      console.log('The discount has been deleted successfully.');
      fetchDiscounts();
    } catch (error) {
      console.error('Failed to delete discount:', error);
      setErrorMessage('Failed to delete the discount. Please try again later.');
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Discount Management</h1>
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditingDiscount(null)} className="mb-5">
            Create Discount
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? 'Edit Discount' : 'Create Discount'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product.id}
                            value={product.id.toString()}
                          >
                            {product.product_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setIsBOGO(value === 'bogo');
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="bogo">Buy One Get One</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Discount Value {isBOGO && '(Set value to 0)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={isBOGO ? '0' : 'Enter value'}
                        {...field}
                        disabled={isBOGO}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <CalendarIcon className="mr-2" />
                          {format(field.value, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onDayClick={(day) => {
                            field.onChange(day);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <CalendarIcon className="mr-2" />
                          {format(field.value, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onDayClick={(day) => {
                            field.onChange(day);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Discount'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Discount Type</TableHead>
            <TableHead>Discount Value</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discounts.map((discount) => (
            <TableRow key={discount.id}>
              <TableCell>
                {
                  products.find((p) => p.id === +discount.productId)
                    ?.product_name
                }
              </TableCell>
              <TableCell>{discount.discount_type}</TableCell>
              <TableCell>{discount.discount_value}</TableCell>
              <TableCell>
                {format(new Date(discount.start_date), 'PPP')}
              </TableCell>
              <TableCell>
                {format(new Date(discount.end_date), 'PPP')}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setEditingDiscount(discount);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (discount.id !== undefined) {
                      deleteDiscount(discount.id);
                    } else {
                      console.error('Discount ID is undefined, cannot delete.');
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
