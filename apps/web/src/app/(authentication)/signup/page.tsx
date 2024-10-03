'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    termsAgreed: false,
    notificationSettings: false,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
    setIsVisible(false);
    setTimeout(() => {
      router.push('/');
    }, 500);
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-green-50"
                />
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-green-50"
                />
              </div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-green-50"
              />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-green-50"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  name="termsAgreed"
                  checked={formData.termsAgreed}
                  onCheckedChange={(checked: any) =>
                    setFormData((prev) => ({
                      ...prev,
                      termsAgreed: checked as boolean,
                    }))
                  }
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  Creating an account you're okay with our Terms of Service,
                  Privacy Policy and our default notification settings
                </label>
              </div>
              <div className="flex justify-between items-center">
                <Button type="submit" className=" text-white">
                  SIGN UP
                </Button>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    name="notificationSettings"
                    checked={formData.notificationSettings}
                    onCheckedChange={(checked: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        notificationSettings: checked as boolean,
                      }))
                    }
                  />
                  <label
                    htmlFor="notifications"
                    className="text-xs text-gray-500"
                  >
                    I accept terms and policy
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
