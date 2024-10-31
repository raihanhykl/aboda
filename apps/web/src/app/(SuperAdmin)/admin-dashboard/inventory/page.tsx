'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Mock data - replace with actual API calls
const stores = [
  { id: 1, name: 'Store A' },
  { id: 2, name: 'Store B' },
  { id: 3, name: 'Store C' },
];

const initialProducts = [
  { id: 1, name: 'Product 1', stock: { 1: 100, 2: 150, 3: 200 } },
  { id: 2, name: 'Product 2', stock: { 1: 50, 2: 75, 3: 100 } },
  { id: 3, name: 'Product 3', stock: { 1: 200, 2: 250, 3: 300 } },
];

type Product = {
  id: number;
  name: string;
  stock: { [key: number]: number };
};

type StockJournal = {
  id: number;
  productId: number;
  storeId: number;
  quantity: number;
  type: 'addition' | 'reduction';
  date: Date;
};

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedStore, setSelectedStore] = useState<number>(1);
  const [stockJournal, setStockJournal] = useState<StockJournal[]>([]);
  const [isMainAdmin, setIsMainAdmin] = useState(true); // Set this based on user role
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [stockChange, setStockChange] = useState(0);

  useEffect(() => {
    // Fetch products and stock journal from API
    // setProducts(fetchedProducts)
    // setStockJournal(fetchedStockJournal)
  }, []);

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(Number(storeId));
  };

  const openStockUpdateDialog = (product: Product) => {
    setCurrentProduct(product);
    setStockChange(0);
    setIsDialogOpen(true);
  };

  const handleStockUpdate = () => {
    if (!currentProduct) return;

    const newJournalEntry: StockJournal = {
      id: stockJournal.length + 1,
      productId: currentProduct.id,
      storeId: selectedStore,
      quantity: Math.abs(stockChange),
      type: stockChange > 0 ? 'addition' : 'reduction',
      date: new Date(),
    };

    setStockJournal([...stockJournal, newJournalEntry]);

    const updatedProducts = products.map((product) => {
      if (product.id === currentProduct.id) {
        const newStock = { ...product.stock };
        newStock[selectedStore] = (newStock[selectedStore] || 0) + stockChange;
        return { ...product, stock: newStock };
      }
      return product;
    });

    setProducts(updatedProducts);
    setIsDialogOpen(false);
  };

  const deleteProduct = (productId: number) => {
    setProducts(products.filter((product) => product.id !== productId));
    // Also delete from API
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

      {isMainAdmin && (
        <div className="mb-4">
          <Select onValueChange={handleStoreChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.stock[selectedStore] || 0}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2"
                  onClick={() => openStockUpdateDialog(product)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the stock for {currentProduct?.name} in{' '}
              {stores.find((store) => store.id === selectedStore)?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock-change" className="text-right">
                Stock Change
              </Label>
              <Input
                id="stock-change"
                type="number"
                className="col-span-3"
                value={stockChange}
                onChange={(e) => setStockChange(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleStockUpdate}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h2 className="text-2xl font-bold mt-8 mb-4">Stock Journal</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockJournal.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.date.toLocaleString()}</TableCell>
              <TableCell>
                {products.find((p) => p.id === entry.productId)?.name}
              </TableCell>
              <TableCell>
                {stores.find((s) => s.id === entry.storeId)?.name}
              </TableCell>
              <TableCell>{entry.type}</TableCell>
              <TableCell>{entry.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
