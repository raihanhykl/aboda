'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { changePassword } from '@/action/user.action';
import { useSession } from 'next-auth/react';
import { changePasswordSchema } from '@/schemas/auth.schemas';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, 'Old password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters'),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: "Confirm password doesn't match with your new password",
        path: ['confirmPassword'],
      });
    }
  });

type PasswordFormValues = z.infer<typeof changePasswordSchema>;

const PasswordInput = ({ field, label, placeholder, error }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            {...field}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};

export default function ChangePasswordButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    changePassword(data, session?.data?.user?.access_token!)
      .then(() => {
        toast({
          title: 'Success!',
          description: 'You have successfully changed your password.',
        });
        setIsSubmitting(false);
        setIsDialogOpen(false);
        form.reset();
      })
      .catch((error) => {
        setIsSubmitting(false);

        form.setError('oldPassword', {
          type: 'manual',
          message: error.message,
        });
      });
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Change Password</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] w-[95%] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one. Make sure it's
              strong and unique!
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <PasswordInput
                    field={field}
                    label="Current Password"
                    placeholder="Enter your current password"
                    error={form.formState.errors.oldPassword?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <PasswordInput
                    field={field}
                    label="New Password"
                    placeholder="Enter your new password"
                    error={form.formState.errors.newPassword?.message}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <PasswordInput
                    field={field}
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    error={form.formState.errors.confirmPassword?.message}
                  />
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Changing Password</span>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </>
                  ) : (
                    <>Change Password</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to change your password?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your password will be updated
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Changing Password</span>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </>
              ) : (
                'Yes, change my password'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Button } from '@/components/ui/button';
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
// import { Eye, EyeOff } from 'lucide-react';

// const passwordSchema = z
//   .object({
//     oldPassword: z
//       .string()
//       .min(8, 'Old password must be at least 8 characters'),
//     newPassword: z
//       .string()
//       .min(8, 'New password must be at least 8 characters'),
//     confirmPassword: z
//       .string()
//       .min(8, 'Confirm password must be at least 8 characters'),
//   })
//   .superRefine(({ newPassword, confirmPassword }, ctx) => {
//     if (newPassword !== confirmPassword) {
//       ctx.addIssue({
//         code: 'custom',
//         message: "Confirm password doesn't match with your new password",
//         path: ['confirmPassword'],
//       });
//     }
//   });

// type PasswordFormValues = z.infer<typeof passwordSchema>;

// const PasswordInput = ({ field, label, placeholder, error }: any) => {
//   const [showPassword, setShowPassword] = useState(false);
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700">{label}</label>
//       <div className="relative mt-1">
//         <input
//           type={showPassword ? 'text' : 'password'}
//           placeholder={placeholder}
//           {...field}
//           className="input"
//         />
//         <Button
//           type="button"
//           variant="ghost"
//           size="sm"
//           className="absolute right-0 top-0 h-full px-3 py-2"
//           onClick={() => setShowPassword(!showPassword)}
//         >
//           {showPassword ? (
//             <EyeOff className="h-4 w-4" />
//           ) : (
//             <Eye className="h-4 w-4" />
//           )}
//         </Button>
//       </div>
//       {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//     </div>
//   );
// };

// export default function ChangePasswordButton() {
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isAlertOpen, setIsAlertOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     handleSubmit,
//     control,
//     formState: { errors, isValid },
//   } = useForm<PasswordFormValues>({
//     resolver: zodResolver(passwordSchema),
//     mode: 'onChange',
//   });

//   const onSubmit = async (data: PasswordFormValues) => {
//     setIsSubmitting(true);
//     await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
//     setIsAlertOpen(true);
//     setIsSubmitting(false);
//   };

//   const handleConfirmSubmit = () => {
//     setIsAlertOpen(false);
//     setIsDialogOpen(false);
//   };

//   return (
//     <>
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogTrigger asChild>
//           <Button variant="default">Change Password</Button>
//         </DialogTrigger>
//         <DialogContent className="sm:max-w-[425px] w-[95%] max-w-md mx-auto">
//           <DialogHeader>
//             <DialogTitle>Change Password</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {['oldPassword', 'newPassword', 'confirmPassword'].map(
//               (name, idx) => (
//                 <Controller
//                   key={name}
//                   name={name as keyof PasswordFormValues}
//                   control={control}
//                   render={({ field }) => (
//                     <PasswordInput
//                       field={field}
//                       label={
//                         name === 'oldPassword'
//                           ? 'Current Password'
//                           : name === 'newPassword'
//                             ? 'New Password'
//                             : 'Confirm New Password'
//                       }
//                       placeholder={`Enter your ${name === 'oldPassword' ? 'current password' : name === 'newPassword' ? 'new password' : 'confirm new password'}`}
//                       error={errors[name as keyof PasswordFormValues]?.message}
//                     />
//                   )}
//                 />
//               ),
//             )}
//             <DialogFooter>
//               <Button
//                 type="button"
//                 variant="secondary"
//                 onClick={() => setIsDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={!isValid || isSubmitting}>
//                 {isSubmitting ? 'Changing Password...' : 'Change Password'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               Are you sure you want to change your password?
//             </AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={handleConfirmSubmit}>
//               Yes, change my password
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
