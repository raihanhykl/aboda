'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Trash2, Edit } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';

interface Store {
  branch_name: ReactNode;
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  stock: number;
  Branch: {
    branch_name: string;
  };
}

export default function InventoryManagement() {
  const [branches, setBranches] = useState<Store[]>([]);
  const [product2, setProduct2] = useState<any[]>([]);
  const [branchId, setBranchId] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<any | null>(null);
  const [stockChange, setStockChange] = useState<number>(0);

  const { data: session } = useSession();

  useEffect(() => {
    fetchBranches();
  }, [session]);

  const fetchBranches = async () => {
    try {
      const response = await api.get(`/branch/get-all-branch`, {
        headers: {
          Authorization: 'Bearer ' + session?.user?.access_token,
        },
      });
      setBranches(response.data.data);
      console.log(response.data.data, 'ini response branches');
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [branchId]);

  const fetchProduct = async (): Promise<void> => {
    try {
      const response = await api.get(`/stocks/${branchId}/stocks`, {
        headers: {
          Authorization: 'Bearer ' + session?.user?.access_token,
        },
      });
      setProduct2(response.data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    }
  };

  const handleBranchChange = (branchId: string): void => {
    setBranchId(Number(branchId));
  };

  const openStockUpdateDialog = (
    product: Product,
    defaultStock: number,
  ): void => {
    console.log(product, 'ini product ya maniez');
    setCurrentProduct(product);
    setStockChange(defaultStock);
    setIsDialogOpen(true);
  };

  const handleStockUpdate = async (): Promise<void> => {
    if (!currentProduct) return;

    try {
      await api.put(
        `/stocks/${branchId}/products/${currentProduct.id}/update-stock`,
        { stockChange },
        {
          headers: {
            Authorization: 'Bearer ' + session?.user?.access_token,
          },
        },
      );
      await fetchProduct();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const deleteProduct = async (StockId: number): Promise<void> => {
    try {
      await api.put(
        `/stocks/${branchId}/products/${StockId}/update-stock`,
        { stockChange: 0 },
        {
          headers: {
            Authorization: 'Bearer ' + session?.user?.access_token,
          },
        },
      );
      await fetchProduct();
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

      <div className="mb-4">
        <Select onValueChange={handleBranchChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id.toString()}>
                {branch.branch_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>Branch Name</TableHead> {/* Added this column */}
            <TableHead>Current Stock</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {product2.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.Product.product_name}</TableCell>
              <TableCell>{product.Branch?.branch_name || 'N/A'}</TableCell>{' '}
              {/* Display Branch name */}
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="icon"
                  className="mr-2"
                  onClick={() => openStockUpdateDialog(product, product.stock)}
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
            <DialogTitle>Update Stock {branchId}</DialogTitle>
            <DialogDescription>
              Update the stock for {currentProduct?.Product.product_name} on{' '}
              {currentProduct?.Branch?.branch_name}
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
    </div>
  );
}
