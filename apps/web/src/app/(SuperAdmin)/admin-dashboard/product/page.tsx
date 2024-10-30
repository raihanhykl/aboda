'use client';

import { useState, useRef } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Mock data for demonstration
const mockProducts = [
  {
    id: 1,
    name: 'Product 1',
    category: 'Electronics',
    price: 100,
    stock: 50,
    images: [],
  },
  {
    id: 2,
    name: 'Product 2',
    category: 'Clothing',
    price: 50,
    stock: 100,
    images: [],
  },
  {
    id: 3,
    name: 'Product 3',
    category: 'Home',
    price: 75,
    stock: 25,
    images: [],
  },
];

const mockCategories = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'];

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: File[];
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    images: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewProduct((prev) => ({ ...prev, category: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewProduct((prev) => ({
        ...prev,
        images: Array.from(e.target.files || []),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = products.length + 1;
    setProducts((prev) => [...prev, { id, ...newProduct }]);
    setIsOpen(false);
    setNewProduct({ name: '', category: '', price: 0, stock: 0, images: [] });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
              <Select onValueChange={handleSelectChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                name="price"
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={handleInputChange}
                required
              />
              <Input
                name="stock"
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={handleInputChange}
                required
              />
              <Textarea
                name="description"
                placeholder="Product Description"
                onChange={handleInputChange}
              />
              <div>
                <Label htmlFor="product-images">Product Images</Label>
                <Input
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload Images
                </Button>
                {newProduct.images.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {newProduct.images.length} image(s) selected
                  </p>
                )}
              </div>
              <Button type="submit">Add Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Images</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.images.length} image(s)</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
