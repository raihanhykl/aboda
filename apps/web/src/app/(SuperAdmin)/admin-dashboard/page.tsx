// 'use client';

// import { useState } from 'react';
// import { CalendarIcon } from 'lucide-react';
// import { format } from 'date-fns';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';

// // Mock data (replace with actual data fetching logic)
// const salesData = [
//   { month: 'Jan', sales: 1000 },
//   { month: 'Feb', sales: 1500 },
//   { month: 'Mar', sales: 1200 },
//   { month: 'Apr', sales: 1800 },
//   { month: 'May', sales: 2000 },
//   { month: 'Jun', sales: 2400 },
// ];

// const categoryData = [
//   { category: 'Electronics', sales: 5000 },
//   { category: 'Clothing', sales: 3000 },
//   { category: 'Books', sales: 2000 },
//   { category: 'Home & Garden', sales: 1500 },
//   { category: 'Toys', sales: 1000 },
// ];

// const productData = [
//   { product: 'Laptop', sales: 2000 },
//   { product: 'Smartphone', sales: 1500 },
//   { product: 'Headphones', sales: 1000 },
//   { product: 'Tablet', sales: 800 },
//   { product: 'Smartwatch', sales: 600 },
// ];

// const stockData = [
//   { product: 'Laptop', additions: 50, reductions: 30, finalStock: 120 },
//   { product: 'Smartphone', additions: 100, reductions: 80, finalStock: 220 },
//   { product: 'Headphones', additions: 200, reductions: 150, finalStock: 350 },
//   { product: 'Tablet', additions: 30, reductions: 20, finalStock: 60 },
//   { product: 'Smartwatch', additions: 80, reductions: 60, finalStock: 100 },
// ];

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// export default function AdminDashboard() {
//   const [date, setDate] = useState<Date | undefined>(new Date());
//   const [selectedStore, setSelectedStore] = useState<string>('all');

//   return (
//     <div className="container mx-auto p-8">
//       <div className="mb-8 flex items-center justify-between">
//         <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//         <div className="flex items-center space-x-4">
//           <Select value={selectedStore} onValueChange={setSelectedStore}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Select store" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Stores</SelectItem>
//               <SelectItem value="store1">Store 1</SelectItem>
//               <SelectItem value="store2">Store 2</SelectItem>
//             </SelectContent>
//           </Select>
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button
//                 variant={'outline'}
//                 className={cn(
//                   'w-[280px] justify-start text-left font-normal',
//                   !date && 'text-muted-foreground',
//                 )}
//               >
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 {date ? format(date, 'PPP') : <span>Pick a date</span>}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0">
//               <Calendar
//                 mode="single"
//                 selected={date}
//                 onSelect={setDate}
//                 initialFocus
//               />
//             </PopoverContent>
//           </Popover>
//         </div>
//       </div>

//       <Tabs defaultValue="sales" className="space-y-4">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="sales">Sales Report</TabsTrigger>
//           <TabsTrigger value="stock">Stock Report</TabsTrigger>
//         </TabsList>
//         <TabsContent value="sales" className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Monthly Sales</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <BarChart data={salesData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Bar dataKey="sales" fill="#8884d8" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Sales by Category</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <PieChart>
//                     <Pie
//                       data={categoryData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       outerRadius={150}
//                       fill="#8884d8"
//                       dataKey="sales"
//                       label={({ category, percent }) =>
//                         `${category} ${(percent * 100).toFixed(0)}%`
//                       }
//                     >
//                       {categoryData.map((entry, index) => (
//                         <Cell
//                           key={`cell-${index}`}
//                           fill={COLORS[index % COLORS.length]}
//                         />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//         <TabsContent value="stock" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Stock Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr>
//                       <th className="text-left">Product</th>
//                       <th className="text-right">Additions</th>
//                       <th className="text-right">Reductions</th>
//                       <th className="text-right">Final Stock</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {stockData.map((item, index) => (
//                       <tr key={index}>
//                         <td>{item.product}</td>
//                         <td className="text-right">{item.additions}</td>
//                         <td className="text-right">{item.reductions}</td>
//                         <td className="text-right">{item.finalStock}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader>
//               <CardTitle>Stock Changes Visualization</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={stockData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="product" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="additions" fill="#82ca9d" />
//                   <Bar dataKey="reductions" fill="#8884d8" />
//                   <Bar dataKey="finalStock" fill="#ffc658" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

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
};

type StockHistoryEntry = {
  ProductStock: ProductStock;
  stock_after: number;
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
      const { Product, quantity, status } = entry.ProductStock;
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
        if (status === 'in') {
          productData.additions += quantity;
        } else {
          productData.reductions += quantity;
        }
        productData.finalStock = entry.stock_after;
      }
    });

    return Array.from(productMap.values());
  };

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
