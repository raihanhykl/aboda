'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/config/axios.config';
import { z } from 'zod';
import { setFirstPassword } from '@/schemas/auth.schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  checkVerifyEmailAction,
  setFirstPasswordAction,
} from '@/action/auth.action';
import { ErrorMessage } from '@hookform/error-message';
import Link from 'next/link';
import VerificationError from './verifcationError';
import VerificationVerified from './verificationVerified';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

type Props = {
  params: {
    token: string;
  };
};

export default function Page({ params }: Props) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  const form = useForm<z.infer<typeof setFirstPassword>>({
    resolver: zodResolver(setFirstPassword),
    defaultValues: {},
  });
  const {
    register,
    setError: setFormError,
    formState: { errors },
    handleSubmit,
  } = form;

  const onSubmit = (values: z.infer<typeof setFirstPassword>) => {
    setIsSubmitting(true);
    setFirstPasswordAction(params.token, values.password)
      .then(() => {
        router.push('/signin');
      })
      .catch((e) => {
        setFormError('password', {
          type: 'custom',
          message: e.message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await checkVerifyEmailAction(params.token);
        if (res.data.data.is_verified == 1) setVerified(true);
      } catch (err) {
        setError('Verification failed or already verified.');
      }
    };

    verifyEmail();
  }, [params.token]);

  if (error) {
    return <VerificationError />;
  }

  if (verified) {
    return <VerificationVerified />;
  }

  return (
    <>
      <div className=" bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Email and Set Password
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Set Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    {...register('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1B8057] focus:border-[#1B8057] sm:text-sm"
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
              </div>
              <ErrorMessage errors={errors} name={'password'} />
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    {...register('confirmPassword')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1B8057] focus:border-[#1B8057] sm:text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setConfirmShowPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <ErrorMessage errors={errors} name={'confirmPassword'} />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1B8057] hover:bg-[#12563b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B8057]"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify and Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
