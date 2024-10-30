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
  FormDescription,
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
import { toast } from '@/components/ui/use-toast';
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

export function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [isBOGO, setIsBOGO] = useState(false);

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

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

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

  async function fetchDiscounts() {
    try {
      const response = await fetch('/api/discounts');
      if (!response.ok) throw new Error('Failed to fetch discounts');
      const data = await response.json();
      setDiscounts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch discounts. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch products. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function onSubmit(values: Discount) {
    setIsLoading(true);
    try {
      const url = editingDiscount
        ? `/api/discounts/${editingDiscount.id}`
        : '/api/discounts';
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

      toast({
        title: editingDiscount ? 'Discount updated' : 'Discount created',
        description: `The discount has been ${editingDiscount ? 'updated' : 'created'} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingDiscount(null);
      form.reset();
      fetchDiscounts();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'There was a problem saving the discount. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteDiscount(id: number) {
    if (!confirm('Are you sure you want to delete this discount?')) return;

    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete discount');

      toast({
        title: 'Discount deleted',
        description: 'The discount has been deleted successfully.',
      });

      fetchDiscounts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete discount. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Discount Management</h1>

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
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          isBOGO ? 'N/A for BOGO' : 'Enter discount value'
                        }
                        {...field}
                        disabled={isBOGO}
                        value={isBOGO ? '' : field.value}
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={`w-[240px] pl-3 text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date('2100-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={`w-[240px] pl-3 text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date > new Date('2100-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : editingDiscount
                    ? 'Update Discount'
                    : 'Create Discount'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
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
                  products.find((p) => p.id.toString() === discount.productId)
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
                  variant="outline"
                  className="mr-2"
                  onClick={() => {
                    setEditingDiscount(discount);
                    setIsDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteDiscount(discount.id!)}
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
