import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

// Definisikan tipe untuk variant
type Variant =
  | 'outline'
  | 'link'
  | 'default'
  | 'destructive'
  | 'secondary'
  | 'ghost'
  | null
  | undefined;

interface AlertModalProps {
  onConfirm: () => void;
  triggerText: string;
  title: string;
  description: string;
  variant?: Variant; // Gunakan tipe Variant
}

export default function AlertModal({
  onConfirm,
  triggerText,
  title,
  description,
  variant = 'outline', // Nilai default "outline"
}: AlertModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant}>{triggerText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
