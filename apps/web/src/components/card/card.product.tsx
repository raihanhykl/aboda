import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  image: string;
  category: string;
  price: number;
}

export default function ProductCard({
  id,
  name,
  image,
  category,
  price,
}: Product) {
  return (
    <Card className="overflow-hidden" key={id}>
      <CardHeader className="p-0">
        <Image
          src={image}
          alt={name}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-sm text-gray-500">{category}</p>
        <CardTitle className="text-lg">{name}</CardTitle>
        <p className="text-lg font-bold">Rp. {price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full">Add To Cart</Button>
      </CardFooter>
    </Card>
  );
}
