'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@hookform/error-message';
import {
  forgotPasswordAction,
  googleAuthenticate,
  loginAction,
} from '@/action/auth.action';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import google from '@/../public/Google.svg.png';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { forgotPasswordSchema } from '@/schemas/auth.schemas';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';

export default function SignIn() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const qparams = useSearchParams();
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {},
  });

  const router = useRouter();
  const {
    register,
    setError,
    formState: { errors },
    handleSubmit,
  } = form;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsSubmitting(true);
    forgotPasswordAction(values.email)
      .then(() => {
        toast({
          description: 'Check your email for a link to reset your password',
        });
      })
      .catch((e) => {
        toast({
          description: e.message,
        });
        setError('email', {
          type: 'manual',
          message: e.message,
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  return (
    <div
      className={`flex flex-col justify-center items-center flex-grow bg-gray-100 p-4`}
    >
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="flex bg-[#1B8057] flex-col md:flex-row">
          <div
            className={`bg-white p-8 md:w-3/5 rounded-3xl  transition-transform duration-500 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <Button>
              <ChevronLeft onClick={() => router.back()} />
            </Button>
            <h2 className="text-2xl font-bold text-[#1B8057] my-3">
              Forgot Password
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <label htmlFor="email" className="text-gray-600 text-sm">
                Enter your email address below, and we&apos;ll send you a link
                to reset your password.
              </label>
              <Input
                type="email"
                placeholder="Email"
                {...register('email')}
                className="bg-green-50"
              />
              <ErrorMessage errors={errors} name={'email'} />
              <div className="flex justify-between items-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className=" text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </form>
          </div>
          {/* Right side - green section */}
          <div
            className={` text-white p-8 md:w-2/5 flex flex-col justify-between  transition-transform duration-500 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Aboda</h2>
              <p className="mb-6">Freshness and Quality at Your Fingertips</p>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#1B8057]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white text-[#1B8057] hover:bg-green-50"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  router.push('/signup');
                }, 500);
              }}
            >
              {isSubmitting ? 'Signing in...' : 'SIGN UP'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
