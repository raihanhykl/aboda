'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/config/axios.config';
import axios from 'axios';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  images: string[];
  weight: number;
};

type Category = {
  id: number;
  name: string;
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: sessionData } = useSession();

  useEffect(() => {
    if (sessionData?.user?.access_token) {
      fetchProducts();
      fetchCategories();
    }
  }, [sessionData]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product/all', {
        headers: {
          Authorization: `Bearer ${sessionData?.user?.access_token}`,
        },
      });

      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category', {
        headers: {
          Authorization: `Bearer ${sessionData?.user?.access_token}`,
        },
      });

      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProductSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const productData = {
      product_name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      categoryId: Number(formData.get('categoryId')),
      weight: Number(formData.get('weight')),
    };

    if (
      products.some(
        (product) =>
          product.name === productData.product_name &&
          (!currentProduct || currentProduct.id !== product.id),
      )
    ) {
      setError('Product name must be unique. Please choose a different name.');
      return;
    }

    const headers = {
      Authorization: `Bearer ${sessionData?.user?.access_token}`,
      'Content-Type': 'multipart/form-data',
    };

    try {
      if (currentProduct) {
        const updateFormData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          updateFormData.append(key, value.toString());
        });
        newImages.forEach((file) => {
          updateFormData.append('image', file);
        });

        const response = await api.put(
          `/product/${currentProduct.id}`,
          updateFormData,
          {
            headers,
          },
        );

        if (response.data && response.data.success) {
          setProducts(
            products.map((p) =>
              p.id === currentProduct.id ? { ...p, ...productData } : p,
            ),
          );
          setIsProductDialogOpen(false);
          setNewImages([]);
          setPreviewImages([]);
          fetchProducts();
        } else {
          throw new Error(response.data.message || 'Failed to update product');
        }
      } else {
        const createFormData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          createFormData.append(key, value.toString());
        });
        newImages.forEach((file) => {
          createFormData.append('image', file);
        });

        console.log(
          'Creating product with data:',
          Object.fromEntries(createFormData),
        );

        const response = await api.post('/product', createFormData, {
          headers,
        });

        if (response.data && response.data.success) {
          setProducts([
            ...products,
            {
              ...productData,
              id: response.data.id,
              name: '',
              images: [],
            },
          ]);
          setIsProductDialogOpen(false);
          setNewImages([]);
          setPreviewImages([]);
          fetchProducts(); // Refresh the product list
        } else {
          throw new Error(response.data.message || 'Failed to create product');
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
        setError(
          `Error saving product: ${error.response?.data?.message || error.message}`,
        );
      } else {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred while saving the product.');
      }
    }
  };

  const handleCategorySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const categoryData = {
      name: formData.get('name') as string,
    };

    const headers = {
      Authorization: `Bearer ${sessionData?.user?.access_token}`,
    };

    try {
      if (currentCategory) {
        await api.put(`/category/${currentCategory.id}`, categoryData, {
          headers,
        });
        setCategories(
          categories.map((c) =>
            c.id === currentCategory.id ? { ...categoryData, id: c.id } : c,
          ),
        );
      } else {
        const response = await api.post('/category', categoryData, { headers });
        setCategories([
          ...categories,
          { ...categoryData, id: response.data.id },
        ]);
      }
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await api.delete(`/product/delete/${productId}`, {
        headers: {
          Authorization: `Bearer ${sessionData?.user?.access_token}`,
        },
      });

      if (response.data?.message === 'Product deleted successfully') {
        setProducts(products.filter((prod) => prod.id !== productId));
      } else {
        throw new Error(response.data?.message || 'Failed to delete product');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error deleting product:',
          error.response?.data || error.message,
        );
        setError(
          `Failed to delete product: ${error.response?.data?.message || error.message}`,
        );
      } else {
        console.error('Unexpected error deleting product:', error);
        setError('An unexpected error occurred while deleting the product.');
      }
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.delete(`/category/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${sessionData?.user?.access_token}`,
        },
      });
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          'Error deleting category:',
          error.response?.data || error.message,
        );
        setError(
          `Failed to delete category: ${error.response?.data?.message || error.message}`,
        );
      } else {
        console.error('Unexpected error deleting category:', error);
        setError('An unexpected error occurred while deleting the category.');
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewImages((prevImages) => [...prevImages, ...files]);
    setPreviewImages((prevPreviews) => [
      ...prevPreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index: number) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setPreviewImages((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index),
    );
  };

  const removeExistingImage = (index: number) => {
    if (currentProduct) {
      const updatedImages = currentProduct.images.filter((_, i) => i !== index);
      setCurrentProduct({ ...currentProduct, images: updatedImages });
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Product Management
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Tabs defaultValue="product" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product">Products</TabsTrigger>
          <TabsTrigger value="category">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="product">
          <Button
            onClick={() => {
              setCurrentProduct(null);
              setIsProductDialogOpen(true);
            }}
            className="mb-4"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {product.description}
                    </TableCell>
                    <TableCell>{`Rp ${product.price.toLocaleString()}`}</TableCell>
                    <TableCell className="font-medium">
                      {product.weight} kg
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentProduct(product);
                          setIsProductDialogOpen(true);
                        }}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="category">
          <Button
            onClick={() => {
              setCurrentCategory(null);
              setIsCategoryDialogOpen(true);
            }}
            className="mb-4"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCurrentCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProductSubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentProduct?.name || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={currentProduct?.description || ''}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={currentProduct?.price || ''}
                  required
                  placeholder="Price in Rupiah"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  defaultValue={currentProduct?.weight || ''}
                  required
                  placeholder="Weight in kilograms"
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  name="categoryId"
                  defaultValue={
                    currentProduct?.categoryId
                      ? currentProduct.categoryId.toString()
                      : ''
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) =>
                      category.id ? (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ) : null,
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="mt-2">
                  {previewImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative inline-block mr-2 mb-2"
                    >
                      <img
                        src={image}
                        alt={`Image ${index}`}
                        className="w-16 h-16 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 p-1 bg-white rounded-full"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
              <Button
                variant="outline"
                onClick={() => setIsProductDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentCategory?.name || ''}
                  required
                />
                <Label htmlFor="images">Images</Label>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
