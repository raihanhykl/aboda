'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  ChevronDown,
  Users,
  ShoppingCart,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import ProductStockTable from '../components/product-stock';
import StockManagement from '../components/stockManagement'; // Importing your StockManagement component

const data = [
  { name: '5k', value: 20 },
  { name: '10k', value: 30 },
  // other data...
];

const salesData = [
  {
    month: 'January',
    totalSales: 5000,
    categories: [{ name: 'Fruits', sales: 2000 }],
  },
  // other sales data...
];

const stockData = [
  {
    month: 'January',
    product: 'Apple',
    additions: 100,
    deductions: 50,
    endingStock: 500,
  },
  // other stock data...
];

const menuItems = [
  { name: 'Dashboard', active: true },
  { name: 'Products', active: false },
  { name: 'Order Lists', active: false },
  { name: 'Product Stock', active: false },
  { name: 'Sales Report', active: false },
  { name: 'Stock Management', active: false },
];

export default function Component() {
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');
  const [role, setRole] = useState('admin');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-green-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">Aboda</h1>
        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`w-full text-left py-2 px-4 rounded ${
                item.name === activeMenuItem
                  ? 'bg-green-600'
                  : 'hover:bg-green-600'
              }`}
              onClick={() => setActiveMenuItem(item.name)}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <div className="mt-auto"></div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{activeMenuItem}</h2>
        </header>

        {/* Dashboard Content */}
        {activeMenuItem === 'Dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total User
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">40,689</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">8.5% Up</span> from yesterday
                </p>
              </CardContent>
            </Card>
            {/* Other Cards... */}
          </div>
        )}

        {/* Sales Report Section */}
        {activeMenuItem === 'Sales Report' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Monthly Sales Report</h3>
            {salesData.map((report) => (
              <Card key={report.month} className="mb-4">
                <CardHeader>
                  <CardTitle>{report.month}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Sales: ${report.totalSales}</p>
                  <p>Sales by Category:</p>
                  <ul>
                    {report.categories.map((category) => (
                      <li key={category.name}>
                        {category.name}: ${category.sales}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stock Management Section */}
        {activeMenuItem === 'Stock Management' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Stock Management</h3>
            <StockManagement />{' '}
            {/* Render your StockManagement component here */}
          </div>
        )}

        {/* Stock Report Section */}
        {activeMenuItem === 'Stock Report' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Monthly Stock Report</h3>
            {stockData.map((stock) => (
              <Card key={stock.product + stock.month} className="mb-4">
                <CardHeader>
                  <CardTitle>
                    {stock.product} - {stock.month}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Additions: {stock.additions}</p>
                  <p>Total Deductions: {stock.deductions}</p>
                  <p>Ending Stock: {stock.endingStock}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
