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
import MyProfile from '@/app/(user)/my-profile/component/my-profile';
import { BASE_API_URL } from '@/config';

interface ProfileMenuProps {
  image?: string;
  name?: string;
}

export default function ProfileMenu({ image, name }: ProfileMenuProps) {
  const displayName = name || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const router = useRouter();
  let avatar = `${BASE_API_URL}/profile/${image}`;
  if (image?.startsWith('http')) {
    avatar = image;
  }
  //  `http://localhost:8000/profile/${image}`
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" bg-[#1B8057]">
        <Button variant="outline" className="flex items-center gap-2 px-3 py-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className=" text-[#1B8057]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push('/my-profile2')}>
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/my-address')}>
          My Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/order')}>
          My Order
        </DropdownMenuItem>
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
          <AlertDialogContent className=" z-autp">
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
