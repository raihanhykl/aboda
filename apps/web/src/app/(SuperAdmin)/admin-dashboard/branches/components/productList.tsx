import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductStock } from '@/interfaces/branch';

interface ProductListProps {
  products: ProductStock[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((stock) => (
          <TableRow key={stock.id}>
            <TableCell>{stock.Product.product_name}</TableCell>
            <TableCell>{stock.Product.description}</TableCell>
            <TableCell>
              Rp. {stock.Product.price.toLocaleString('id-ID')}
            </TableCell>
            <TableCell>{stock.stock}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
