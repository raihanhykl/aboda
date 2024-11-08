'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
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
  Product: {
    product_name: string;
  };
}

export default function InventoryManagement() {
  const [branches, setBranches] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branchId, setBranchId] = useState<number>(1);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [stockChange, setStockChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  const fetchBranches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/branch/get-all-branch', {
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      setBranches(response.data.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch branches');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.access_token]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/stocks/${branchId}/stocks`, {
        headers: {
          Authorization: `Bearer ${session?.user?.access_token}`,
        },
      });
      setProducts(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [branchId, session?.user?.access_token]);

  useEffect(() => {
    if (session) {
      fetchBranches();
    }
  }, [session, fetchBranches]);

  useEffect(() => {
    if (branchId) {
      fetchProducts();
    }
  }, [branchId, fetchProducts]);

  const handleBranchChange = (branchId: string) => {
    setBranchId(Number(branchId));
  };

  const openStockUpdateDialog = (product: Product) => {
    setCurrentProduct(product);
    setStockChange(product.stock);
    setIsDialogOpen(true);
  };

  const handleStockUpdate = async () => {
    if (!currentProduct) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.put(
        `/stocks/${branchId}/products/${currentProduct.id}/update-stock`,
        { stockChange },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      await fetchProducts();
      setIsDialogOpen(false);
      console.log(
        `Stock for ${currentProduct.Product.product_name} has been updated successfully.`,
      );
    } catch (error) {
      handleApiError(error, 'Failed to update stock');
    } finally {
      setIsLoading(false);
    }
  };

  const setStockToZero = async (productId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.put(
        `/stocks/${branchId}/products/${productId}/update-stock`,
        { stockChange: 0 },
        {
          headers: {
            Authorization: `Bearer ${session?.user?.access_token}`,
          },
        },
      );
      await fetchProducts();
      console.log('The product stock has been set to zero successfully.');
    } catch (error) {
      handleApiError(error, 'Failed to set stock to zero');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error(`${defaultMessage}:`, error);
    let errorMessage = defaultMessage;
    if (error.response) {
      errorMessage =
        error.response.data.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response received from server';
    } else {
      errorMessage = error.message;
    }
    setError(errorMessage);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Inventory Management</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

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

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Branch Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.Product.product_name}</TableCell>
                <TableCell>{product.Branch?.branch_name || 'N/A'}</TableCell>
                <TableCell>{product.stock}</TableCell>
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
                    onClick={() => setStockToZero(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the stock for {currentProduct?.Product.product_name} at{' '}
              {currentProduct?.Branch?.branch_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock-change" className="text-right">
                New Stock Value
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
            <Button onClick={handleStockUpdate} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
