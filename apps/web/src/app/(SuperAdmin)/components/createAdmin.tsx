'use client';

import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAdminSchema } from '@/schemas/auth.schemas';
import { createAdminAction } from '@/action/admin.action';
import { useSession } from 'next-auth/react';
import { IAdminDetail } from '@/interfaces/branch';

export default function CreateAdminPopover({ setAvailable }: any) {
  const session = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmit = async (value: z.infer<typeof createAdminSchema>) => {
    await createAdminAction(value, session.data?.user.access_token!)
      .then((res) => {
        alert(`success: ${res.message}`);
        console.log(res.data.data);
        setAvailable(res.data.data as IAdminDetail[]);
      })
      .catch((err) => {
        alert(`failed: ${err.message}`);
      });
    reset();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className=" flex">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Admin
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <h2 className="font-semibold text-lg">Create New Store Admin</h2>
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input id="first_name" {...register('first_name')} />
            {errors.first_name && (
              <p className="text-sm text-red-500">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              {...register('last_name', { required: 'Last name is required' })}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              {...register('phone_number', {
                required: 'Phone number is required',
              })}
            />
            {errors.phone_number && (
              <p className="text-sm text-red-500">
                {errors.phone_number.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Note: The default password will be set to "admin123"
          </p>
          <Button type="submit">Create Admin</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
