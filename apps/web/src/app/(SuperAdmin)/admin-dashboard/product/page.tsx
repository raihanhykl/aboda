'use client';

import { useState, useEffect } from 'react';
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
import { api } from '@/config/axios.config';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  images: string[];
};

type Category = {
  id: number;
  name: string;
};

export default function ProductManagement() {
  const [product, setProduct] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get('/product/all');
        console.log('Fetched products:', response.data.data);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    const fetchCategory = async () => {
      try {
        const response = await api.get('/category');
        console.log('Fetched category:', response.data.data);
        setCategory(response.data.data);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    };

    fetchProduct();
    fetchCategory();
  }, []);

  const validateProduct = (productData: Omit<Product, 'id'>) => {
    if (
      product.some(
        (p) => p.name === productData.name && p.id !== currentProduct?.id,
      )
    ) {
      console.error('A product with this name already exists.');
      return false;
    }
    return true;
  };

  const validateCategory = (categoryData: Omit<Category, 'id'>) => {
    if (
      category.some(
        (c) => c.name === categoryData.name && c.id !== currentCategory?.id,
      )
    ) {
      console.error('A category with this name already exists.');
      return false;
    }
    return true;
  };

  const validateImage = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 1024 * 1024; // 1MB

    if (!validTypes.includes(file.type)) {
      console.error(
        'Invalid file type. Only jpg, jpeg, png, and gif are allowed.',
      );
      return false;
    }

    if (file.size > maxSize) {
      console.error('File size exceeds 1MB limit.');
      return false;
    }

    return true;
  };

  const handleProductSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      categoryId: Number(formData.get('categoryId')),
      images: currentProduct ? [...currentProduct.images] : [],
    };

    if (!validateProduct(productData)) return;

    const newImageUrls = newImages.map((file) => URL.createObjectURL(file));
    productData.images = [...productData.images, ...newImageUrls];

    if (currentProduct) {
      setProduct(
        product.map((p) =>
          p.id === currentProduct.id ? { ...productData, id: p.id } : p,
        ),
      );
      await api.put(`/product/${currentProduct.id}`, productData);
    } else {
      const response = await api.post('/product', productData);
      setProduct([...product, { ...productData, id: response.data.id }]);
    }

    setIsProductDialogOpen(false);
    setNewImages([]);
    setPreviewImages([]);
  };

  const handleCategorySubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const categoryData = {
      name: formData.get('name') as string,
    };

    if (!validateCategory(categoryData)) return;

    if (currentCategory) {
      setCategory(
        category.map((c) =>
          c.id === currentCategory.id ? { ...categoryData, id: c.id } : c,
        ),
      );
      await api.put(`/category/${currentCategory.id}`, categoryData);
    } else {
      const response = await api.post('/category', categoryData);
      setCategory([...category, { ...categoryData, id: response.data.id }]);
    }

    setIsCategoryDialogOpen(false);
  };

  const deleteProduct = async (productId: number) => {
    setProduct(product.filter((prod) => prod.id !== productId));
    await api.delete(`/product/${productId}`);
  };

  const deleteCategory = async (categoryId: number) => {
    setCategory(category.filter((cat) => cat.id !== categoryId));
    await api.delete(`/category/${categoryId}`);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(validateImage);
    setNewImages((prevImages) => [...prevImages, ...validFiles]);
    setPreviewImages((prevPreviews) => [
      ...prevPreviews,
      ...validFiles.map((file) => URL.createObjectURL(file)),
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

      <Tabs defaultValue="product" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
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
                  <TableHead className="hidden md:table-cell">
                    Category
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Images</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No products available.
                    </TableCell>
                  </TableRow>
                ) : (
                  product.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell>{prod.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {prod.description}
                      </TableCell>
                      <TableCell>RP. {prod.price}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {
                          category.find((cat) => cat.id === prod.categoryId)
                            ?.name
                        }
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {prod.images.length} images
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentProduct(prod);
                            setIsProductDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="ml-2"
                          onClick={() => deleteProduct(prod.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {category.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      No categories available.
                    </TableCell>
                  </TableRow>
                ) : (
                  category.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>{cat.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentCategory(cat);
                            setIsCategoryDialogOpen(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          className="ml-2"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
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
                  defaultValue={currentProduct?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={currentProduct?.description}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  defaultValue={currentProduct?.price}
                  required
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={currentProduct?.categoryId}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {category.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Images</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                <div className="flex flex-wrap mt-2">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 mr-2 mb-2">
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className="object-cover w-full h-full rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 text-red-500"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {currentProduct &&
                  currentProduct.images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 mr-2 mb-2">
                      <img
                        src={image}
                        alt={`Existing ${index}`}
                        className="object-cover w-full h-full rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 text-red-500"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentProduct ? 'Update Product' : 'Add Product'}
              </Button>
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

      {/* Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
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
                  defaultValue={currentCategory?.name}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {currentCategory ? 'Update Category' : 'Add Category'}
              </Button>
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
