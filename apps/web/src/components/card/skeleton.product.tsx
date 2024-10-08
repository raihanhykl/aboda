import { Card } from 'flowbite-react';
import { CardContent, CardFooter, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-2/3 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
