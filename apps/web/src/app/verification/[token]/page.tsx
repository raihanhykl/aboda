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

type Props = {
  params: {
    token: string;
  };
};

export default function Page({ params }: Props) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        await checkVerifyEmailAction(params.token);
        setVerified(true);
      } catch (err) {
        console.error('Verification error:', err);
        setError('Verification failed or already verified.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [params.token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Already Verified
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">{error}</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-6">
              <p className="text-center text-sm text-gray-700">
                You no longer need to verify your account. Please proceed to
                login.
              </p>
              <div>
                <Link
                  href="/signin"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    required
                    {...register('password')}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
              </div>
              <ErrorMessage errors={errors} name={'password'} />

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
