'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { signIn, useSession } from 'next-auth/react';
import { Trash2 } from 'lucide-react';
import { editProfileSchema } from '@/schemas/auth.schemas';
import { editProfileAction } from '@/action/user.action';
import ChangePasswordButton from './components/changepassword';
import { BASE_API_URL } from '@/config';

type FormData = z.infer<typeof editProfileSchema>;

export default function MyProfile() {
  const [initial, setInitial] = useState<string | null>(null);
  const session = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isGoogleUser = session?.data?.user?.provider === 'google';
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {},
  });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  let avatar = `${BASE_API_URL}/profile/${session.data?.user.image}`;
  if (session?.data?.user?.image?.startsWith('http')) {
    avatar = session.data.user.image;
  }

  useEffect(() => {
    if (session?.data?.user) {
      const initial = `${session.data.user.first_name && session?.data?.user.first_name[0]}${
        session.data.user.last_name && session?.data?.user.last_name![0]
      }`;
      reset({
        first_name: session?.data.user.name || session?.data?.user.first_name,
        last_name: session?.data?.user.last_name,
        email: session?.data?.user.email!,
        phone_number: session?.data?.user.phone_number,
      });
      setInitial(
        () =>
          `${(session.data.user.name && session.data.user?.name[0]) || initial}`,
      );
    }
  }, [session]);

  const onSubmit = async (data: z.infer<typeof editProfileSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(`${key}`, value);
      });
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      if (isDeleting) {
        formData.append('isDeleting', 'yes');
      }
      await editProfileAction(formData, session?.data?.user.access_token).then(
        async (data) => {
          reset({
            first_name: data.data.data.first_name,
            last_name: data.data.data.last_name,
            email: data.data.data.email,
            phone_number: data.data.data.phone_number,
          });

          await signIn('credentials', {
            access_token: session.data?.user.access_token,
            redirect: false,
          });
          toast({
            title: 'Profile updated',
            description: 'Your profile has been successfully updated.',
          });
          setIsEditing(false);
          setIsDeleting(false);
        },
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className=" flex justify-between">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <ChangePasswordButton />
      </div>
      <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className=" relative">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={previewUrl ? previewUrl : avatar}
                  alt="Profile picture"
                />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div
                className={` absolute bottom-0 left-36 ${isEditing ? 'block' : 'hidden'}`}
                onClick={() => {
                  setPreviewUrl('kosong');
                  setSelectedFile(null);
                  setIsDeleting(true);
                }}
              >
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
            </div>
            {isEditing && (
              <Label
                htmlFor="profilePicture"
                className="cursor-pointer mt-4 text-sm text-primary hover:underline"
              >
                Change profile picture
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </Label>
            )}
            <div className="mt-4 text-center">
              <p className="font-semibold text-lg">
                {(session.data?.user && session.data?.user.name) ||
                  (session.data?.user &&
                    session?.data?.user.first_name +
                      ' ' +
                      session?.data?.user.last_name)}
              </p>
              <p className="text-muted-foreground">
                Referral Code:{' '}
                {(session.data?.user &&
                  session.data?.user.UserDetails?.referral_code) ||
                  'N/A'}
              </p>
              <p className="text-muted-foreground">
                {session.data?.user && session.data?.user.phone_number}
              </p>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    disabled={!isEditing}
                  />
                  {errors.first_name && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    disabled={!isEditing}
                  />
                  {errors.last_name && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditing || isGoogleUser}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  {...register('phone_number')}
                  disabled={!isEditing}
                />
                {errors.phone_number && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile{' '}
                    {session.data?.user?.provider &&
                      session.data?.user?.provider}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setPreviewUrl(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {/* {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />} */}
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
