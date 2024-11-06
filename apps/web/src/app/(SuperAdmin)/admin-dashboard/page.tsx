'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/config/axios.config';

type Product = {
  id: number;
  product_name: string;
};

type ProductStock = {
  Product: Product;
  quantity: number;
  status: 'in' | 'out';
  stock_after: number;
  stock: number;
  Branch: {
    id: number;
    branch_name: string;
  };
};

type StockHistoryEntry = {
  ProductStock: ProductStock;
  stock_after: number;
  status: 'in' | 'out';
  quantity: number;
};

type ProcessedStockData = {
  product: string;
  additions: number;
  reductions: number;
  finalStock: number;
};

export default function AdminDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockHistory();
  }, [selectedStore, date]);

  const fetchStockHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<StockHistoryEntry[]>('/stocks/history', {
        params: {
          branchId: selectedStore !== 'all' ? selectedStore : undefined,
          date: date ? format(date, 'yyyy-MM-dd') : undefined,
        },
      });
      setStockHistory(response.data);
      console.log(response.data, 'ini stock history');
    } catch (err) {
      console.error('Error fetching stock history:', err);
      setError('Failed to fetch stock history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processStockData = (): ProcessedStockData[] => {
    const productMap = new Map<number, ProcessedStockData>();

    stockHistory.forEach((entry) => {
      const { Product, stock } = entry.ProductStock;

      if (!productMap.has(Product.id)) {
        productMap.set(Product.id, {
          product: Product.product_name,
          additions: 0,
          reductions: 0,
          finalStock: 0,
        });
      }

      //   const productData = productMap.get(Product.id);
      //   if (productData) {
      //     if (status === 'in') {
      //       productData.additions += quantity;
      //     } else if (status === 'out') {
      //       productData.reductions += quantity;
      //     }
      //     productData.finalStock = entry.stock_after;
      //   }
      // });

      const productData = productMap.get(Product.id);
      if (productData) {
        console.log(entry.status, 'ini status');

        if (entry.status === 'in') {
          productData.additions += entry.quantity;
        } else if (entry.status === 'out') {
          productData.reductions += entry.quantity;
        }

        productData.finalStock = entry.stock_after;
      }
    });

    return Array.from(productMap.values());
  };

  //   const processStockData = (): ProcessedStockData[] => {
  //   const productMap = new Map<number, ProcessedStockData>();

  //   // Iterate through stock history to calculate additions, reductions, and final stock
  //   stockHistory.forEach((entry) => {
  //     const { Product, quantity, status, stock_after } = entry.ProductStock;
  //     console.log('Processing:', Product.product_name, quantity, status, stock_after); // Cek data per item

  //     if (!productMap.has(Product.id)) {
  //       productMap.set(Product.id, {
  //         product: Product.product_name,
  //         additions: 0,
  //         reductions: 0,
  //         finalStock: 0,  // Initialize finalStock
  //       });
  //     }

  //     const productData = productMap.get(Product.id);
  //     if (productData) {
  //       if (status === 'in') {
  //         productData.additions += quantity;
  //       } else if (status === 'out') {
  //         productData.reductions += quantity;
  //       }

  //       productData.finalStock = stock_after;
  //     }
  //   });

  //   console.log('Processed data:', Array.from(productMap.values())); // Cek hasil pemrosesan
  //   return Array.from(productMap.values());
  // };

  const stockData = processStockData();

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="1">Store 1</SelectItem>
              <SelectItem value="2">Store 2</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Product</th>
                      <th className="text-right">Additions</th>
                      <th className="text-right">Reductions</th>
                      <th className="text-right">Final Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product}</td>
                        <td className="text-right">{item.additions}</td>
                        <td className="text-right">{item.reductions}</td>
                        <td className="text-right">{item.finalStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Stock Changes Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="additions" fill="#82ca9d" />
                  <Bar dataKey="reductions" fill="#8884d8" />
                  <Bar dataKey="finalStock" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
