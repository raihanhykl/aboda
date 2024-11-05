// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import Image from 'next/image';
// import { api } from '@/config/axios.config';

// export interface Product {
//   id: number;
//   product_name: string;
//   image: string;
//   category: string;
//   price: number;
//   button: boolean;
//   isOutOfStock: boolean;
// }

// export default function ProductCard({
//   id,
//   product_name,
//   image,
//   category,
//   price,
//   button = true,
// }: Product) {
//   return (
//     <Card className="overflow-hidden" key={id}>
//       <CardHeader className="p-0">
//         <Image
//           src={`http://localhost:8000/api/product/`}
//           alt={product_name}
//           width={400}
//           height={200}
//           className="w-full h-48 object-cover"
//         />
//       </CardHeader>
//       <CardContent className="p-4">
//         {/* <p className="text-sm text-gray-500">{category}</p> */}
//         <CardTitle className="text-lg">{product_name}</CardTitle>
//         <p className="text-lg font-bold">Rp. {price.toLocaleString()}</p>
//       </CardContent>
//       {button && (
//         <CardFooter className="p-4 pt-0">
//           <Button className="w-full">Add To Cart</Button>
//         </CardFooter>
//       )}
//     </Card>
//   );
//   console.log(image, product_name, category, price, button);
// }
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { identity } from 'cypress/types/lodash';
import Image from 'next/image';
import Link from 'next/link';

export interface Product {
  id: number;
  product_name: string;
  image: Image[];
  price: number;
  button?: boolean;
}

export interface Image {
  id: number;
  imageUrl: string;
  productId: number;
}

export default function ProductCard({
  id,
  product_name,
  image,
  price,
  button = true,
}: Product) {
  return (
    <Link href={`/product/${id}`} passHref>
      <Card className="overflow-hidden" key={id}>
        <CardHeader className="p-0">
          <Image
            src={`http://localhost:8000/product/${image}`}
            alt={product_name}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg">{product_name}</CardTitle>
          <p className="text-lg font-bold">Rp. {price.toLocaleString()}</p>
        </CardContent>
        {button && (
          <CardFooter className="p-4 pt-0">
            <Button className="w-full">Add To Cart</Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
