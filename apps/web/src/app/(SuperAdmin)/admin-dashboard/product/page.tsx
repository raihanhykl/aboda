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

// Mock data - replace with actual API calls
const initialProducts = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Description 1',
    price: 10,
    categoryId: 1,
    images: ['image1.jpg', 'image2.jpg'],
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Description 2',
    price: 20,
    categoryId: 2,
    images: ['image3.jpg', 'image4.jpg'],
  },
];

const initialCategories = [
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' },
];

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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isMainAdmin, setIsMainAdmin] = useState(true); // Set this based on user role
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    // Fetch products and categories from API
    // setProducts(fetchedProducts)
    // setCategories(fetchedCategories)
  }, []);

  const validateProduct = (product: Omit<Product, 'id'>) => {
    if (
      products.some(
        (p) => p.name === product.name && p.id !== currentProduct?.id,
      )
    ) {
      // Removed toast notification
      console.error('A product with this name already exists.');
      return false;
    }
    return true;
  };

  const validateCategory = (category: Omit<Category, 'id'>) => {
    if (
      categories.some(
        (c) => c.name === category.name && c.id !== currentCategory?.id,
      )
    ) {
      // Removed toast notification
      console.error('A category with this name already exists.');
      return false;
    }
    return true;
  };

  const validateImage = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 1024 * 1024; // 1MB

    if (!validTypes.includes(file.type)) {
      // Removed toast notification
      console.error(
        'Invalid file type. Only jpg, jpeg, png, and gif are allowed.',
      );
      return false;
    }

    if (file.size > maxSize) {
      // Removed toast notification
      console.error('File size exceeds 1MB limit.');
      return false;
    }

    return true;
  };

  const handleProductSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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

    // Here you would typically upload the images and get their URLs
    const newImageUrls = newImages.map((file) => URL.createObjectURL(file));
    productData.images = [...productData.images, ...newImageUrls];

    if (currentProduct) {
      setProducts(
        products.map((p) =>
          p.id === currentProduct.id ? { ...productData, id: p.id } : p,
        ),
      );
    } else {
      setProducts([...products, { ...productData, id: products.length + 1 }]);
    }

    setIsProductDialogOpen(false);
    setNewImages([]);
    setPreviewImages([]);
  };

  const handleCategorySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const categoryData = {
      name: formData.get('name') as string,
    };

    if (!validateCategory(categoryData)) return;

    if (currentCategory) {
      setCategories(
        categories.map((c) =>
          c.id === currentCategory.id ? { ...categoryData, id: c.id } : c,
        ),
      );
    } else {
      setCategories([
        ...categories,
        { ...categoryData, id: categories.length + 1 },
      ]);
    }

    setIsCategoryDialogOpen(false);
  };

  const deleteProduct = (productId: number) => {
    setProducts(products.filter((product) => product.id !== productId));
    // Also delete from API
  };

  const deleteCategory = (categoryId: number) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
    // Also delete from API
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

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {isMainAdmin && (
            <Button
              onClick={() => {
                setCurrentProduct(null);
                setIsProductDialogOpen(true);
              }}
              className="mb-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          )}

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
                  {isMainAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {product.description}
                    </TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {
                        categories.find((cat) => cat.id === product.categoryId)
                          ?.name
                      }
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {product.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={product.name}
                          className="h-16 w-16 object-cover"
                        />
                      ))}
                    </TableCell>
                    {isMainAdmin && (
                      <TableCell>
                        <Button
                          onClick={() => {
                            setCurrentProduct(product);
                            setIsProductDialogOpen(true);
                          }}
                          variant="outline"
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-500"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          {isMainAdmin && (
            <Button
              onClick={() => {
                setCurrentCategory(null);
                setIsCategoryDialogOpen(true);
              }}
              className="mb-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {isMainAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    {isMainAdmin && (
                      <TableCell>
                        <Button
                          onClick={() => {
                            setCurrentCategory(category);
                            setIsCategoryDialogOpen(true);
                          }}
                          variant="outline"
                          className="mr-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-500"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

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
                <Label htmlFor="name">Product Name</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={currentProduct?.categoryId || ''}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
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
                    <div key={index} className="relative mr-2 mb-2">
                      <img
                        src={image}
                        alt="preview"
                        className="h-16 w-16 object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentCategory?.name || ''}
                  required
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
