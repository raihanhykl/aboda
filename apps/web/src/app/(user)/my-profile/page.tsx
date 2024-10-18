'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';
import { editProfileSchema, registerSchema } from '@/schemas/auth.schemas';
import { editProfileAction } from '@/action/user.action';
import { useToast } from '@/hooks/use-toast';
type UserData = z.infer<typeof editProfileSchema> & {
  image: string;
  provider: string;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [updated, setUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    },
  });

  const fetchUserData = async () => {
    try {
      const { data } = await api.get('/user/get-user', {
        headers: {
          Authorization: `Bearer ${session?.data?.user.access_token}`,
        },
      });
      setUserData(data.data);
      form.reset(data.data);
      if (new Date().getDate() - new Date(data.data.updated_at).getDate() <= 1)
        setUpdated(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [session]);

  const onSubmit = async (values: z.infer<typeof editProfileSchema>) => {
    console.log('ngentottttuyy: ', values);
    setIsSubmitting(true);
    editProfileAction(values, session?.data?.user.access_token)
      .then(() => {
        fetchUserData();
        toast({
          description: 'Profile updated successfully',
        });
      })
      .catch((e) => {
        console.log('gagal ngentot');
        toast({
          description: e.message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (!userData)
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading user data
      </div>
    );

  const isGoogleUser = userData.provider === 'google';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl mx-auto bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage
                src={userData.image}
                alt={`${userData.first_name} ${userData.last_name}`}
              />
              <AvatarFallback>
                {userData.first_name}
                {userData.last_name}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-green-700">
              {userData.first_name} {userData.last_name}
            </h2>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {(
                ['first_name', 'last_name', 'email', 'phone_number'] as const
              ).map((field) => (
                <FormField
                  key={field}
                  control={form.control}
                  name={field}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {field.name
                          .replace('_', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </FormLabel>
                      <Input
                        {...field}
                        disabled={isGoogleUser}
                        className="border-green-300 focus:border-green-500"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              {isGoogleUser ? (
                <p className="text-sm text-yellow-600">
                  Your profile is managed by Google. You cannot edit these
                  details here.
                </p>
              ) : updated ? (
                <p>You have to wait for 24 hours to edit again</p>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white"
                >
                  Save Changes
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
