'use client';

import { useState, useEffect, useCallback } from 'react';
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
  updatedAt: string;
};

type ProcessedStockData = {
  product: string;
  additions: number;
  reductions: number;
  finalStock: number;
};

type SalesData = {
  product: string;
  quantitySold: number;
};

export default function AdminDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockHistory = useCallback(async () => {
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
    } catch (err) {
      console.error('Error fetching stock history:', err);
      setError('Failed to fetch stock history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedStore, date]);

  useEffect(() => {
    fetchStockHistory();
  }, [fetchStockHistory]);

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

      const productData = productMap.get(Product.id);
      if (productData) {
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

  const processSalesData = (): SalesData[] => {
    const salesMap = new Map<number, SalesData>();

    stockHistory
      .filter((entry) => entry.status === 'out')
      .forEach((entry) => {
        const { Product } = entry.ProductStock;

        if (!salesMap.has(Product.id)) {
          salesMap.set(Product.id, {
            product: Product.product_name,
            quantitySold: 0,
          });
        }

        const salesData = salesMap.get(Product.id);
        if (salesData) {
          salesData.quantitySold += entry.quantity;
        }
      });

    return Array.from(salesMap.values());
  };

  const uniqueBranches = Array.from(
    new Set(stockHistory.map((entry) => entry.ProductStock.Branch.id)),
  )
    .map((branchId) => {
      const branch = stockHistory.find(
        (entry) => entry.ProductStock.Branch.id === branchId,
      )?.ProductStock.Branch;
      return branch ? { id: branch.id, name: branch.branch_name } : null;
    })
    .filter(Boolean);

  const stockData = processStockData();
  const salesData = processSalesData();

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
              {uniqueBranches.map((branch) => (
                <SelectItem key={branch?.id} value={branch?.id.toString()!}>
                  {branch?.name}
                </SelectItem>
              ))}
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

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Product</th>
                      <th className="text-right">Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product}</td>
                        <td className="text-right">{item.quantitySold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Sales Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantitySold" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
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
