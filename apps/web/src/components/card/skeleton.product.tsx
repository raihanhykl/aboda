import { Card } from 'flowbite-react';
import { CardContent, CardFooter, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type Props = {
  button?: boolean;
};
export default function ProductCardSkeleton({ button = true }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-40" />
      </CardHeader>
      <CardContent className="p-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
      {button && (
        <CardFooter className="p-4 pt-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      )}
    </Card>
  );
}
