// File: components/StockManagement.tsx

import { useState } from 'react';

interface StockItem {
  id: number;
  productName: string;
  currentStock: number;
  storeLocation: string;
}

const initialStockData: StockItem[] = [
  { id: 1, productName: 'Apple', currentStock: 50, storeLocation: 'Store 1' },
  { id: 2, productName: 'Banana', currentStock: 30, storeLocation: 'Store 2' },
  // Add more items as needed
];

export default function StockManagement() {
  const [stockData, setStockData] = useState<StockItem[]>(initialStockData);

  const handleStockChange = (id: number, newStock: number) => {
    setStockData((prevStockData) =>
      prevStockData.map((item) =>
        item.id === id ? { ...item, currentStock: newStock } : item,
      ),
    );
  };

  return (
    <div className="stock-management">
      <h2 className="text-xl font-semibold mb-4">Manage Stock</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {stockData.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg">
            <h3 className="text-lg font-bold">{item.productName}</h3>
            <p>Location: {item.storeLocation}</p>
            <label htmlFor={`stock-${item.id}`} className="block mt-2">
              Current Stock:
            </label>
            <input
              type="number"
              id={`stock-${item.id}`}
              value={item.currentStock}
              onChange={(e) =>
                handleStockChange(item.id, parseInt(e.target.value))
              }
              className="w-full p-2 mt-1 border rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
