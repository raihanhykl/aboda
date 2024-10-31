'use client';

import { useState } from 'react';
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
import { UserMinus } from 'lucide-react';

interface UnassignAdminProps {
  adminName: string;
  id: number;
  handler: (branchId: number) => void;
}

export default function UnassignAdmin({
  adminName,
  id,
  handler,
}: UnassignAdminProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUnassign = () => {
    // Implement your unassign logic here
    handler(id);
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className=" text-xs">
          <UserMinus className="mr-2 h-4 w-4 text-md" />
          Unassign Admin
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will unassign the admin
            <span className="font-semibold"> {adminName} </span>
            from this branch. They will no longer have administrative access to
            this branch.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnassign}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Unassign Admin
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
