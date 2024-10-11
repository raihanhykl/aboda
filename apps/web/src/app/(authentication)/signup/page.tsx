'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/schemas/auth.schemas';
import { registerAction } from '@/action/auth.action';
import { ErrorMessage } from '@hookform/error-message';
import { useToast } from '@/hooks/use-toast';

export default function SignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {},
  });

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

  const router = useRouter();

  const onSubmit = (value: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    registerAction(value)
      .then((res: any) => {
        console.log(isSubmitting, 'ini is submitting');
        toast({
          description: res.message,
        });
        setIsVisible(false);
        setTimeout(() => {
          router.push('/signin');
        }, 500);
      })
      .catch((e) => {
        setError('phone_number', {
          type: 'manual',
          message: e.message,
        });
        toast({
          description: e.message,
        });

        console.log(e);
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
          {/* Left side - Green section */}
          <div
            className={` text-white p-8 md:w-2/5 flex flex-col justify-between  transition-transform duration-500 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Aboda</h2>
              <p className="mb-6">Freshness and Quality at Your Fingertips</p>
              <div className=" hidden w-16 h-16 bg-white rounded-full md:flex items-center justify-center">
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
                  router.push('/signin');
                }, 500);
              }}
            >
              SIGN IN
            </Button>
          </div>

          {/* Right side - Sign up form */}
          <div
            className={`bg-white p-8 md:w-3/5 rounded-3xl  transition-transform duration-500 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <h2 className="text-2xl font-bold text-[#1B8057] mb-6">
              Sign up to Aboda
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  placeholder="Name"
                  {...register('first_name')}
                  className="bg-green-50"
                />
                <ErrorMessage errors={errors} name={'first_name'} />

                <Input
                  type="text"
                  placeholder="Username"
                  {...register('last_name')}
                  className="bg-green-50"
                />
                <ErrorMessage errors={errors} name={'last_name'} />
              </div>
              <Input
                type="email"
                {...register('email')}
                placeholder="Email"
                className="bg-green-50"
              />
              <ErrorMessage errors={errors} name={'email'} />

              <Input
                type="text"
                {...register('phone_number')}
                placeholder="phone_number"
                className="bg-green-50"
              />
              <ErrorMessage errors={errors} name={'phone_number'} />

              <div className="flex flex-row-reverse justify-between items-center">
                <div className="flex flex-col items-start justify-center">
                  <Input
                    type="text"
                    {...register('f_referral_code')}
                    placeholder="Referral Code (Optional)"
                    className="bg-green-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className=" text-white"
                >
                  {isSubmitting ? 'Loading...' : 'SIGN UP'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
