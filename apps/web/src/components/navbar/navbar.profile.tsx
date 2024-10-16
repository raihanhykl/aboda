import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { actionLogout } from '@/action/auth.action';
import { useRouter } from 'next/navigation';

interface ProfileMenuProps {
  image?: string;
  name?: string;
}

export default function ProfileMenu({ image, name }: ProfileMenuProps) {
  const displayName = name || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" bg-[#1B8057]">
        <Button variant="outline" className="flex items-center gap-2 px-3 py-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={image} alt={displayName} />
            <AvatarFallback className=" text-[#1B8057]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push('/my-profile')}>
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem>Transaction</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-red-600"
            >
              Sign Out
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to sign out?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You will need to sign in again to
                access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => actionLogout()}>
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
