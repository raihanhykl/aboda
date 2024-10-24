import { Metadata } from 'next';
import Image from 'next/image';

import { Sidebar } from '@/components/sidebar';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Example dashboard app built using the components.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center space-x-4">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Logo"
              width={32}
              height={32}
            />
            <h1 className="text-2xl font-bold">DashStack</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="md:w-[100px] lg:w-[300px]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="English"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>English</span>
            </div>
            <div className="flex items-center space-x-2">
              <Image
                src="/placeholder.svg?height=32&width=32"
                alt="User"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>Moni Roy</span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
