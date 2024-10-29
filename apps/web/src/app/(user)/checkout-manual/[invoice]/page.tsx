'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Props = {
  params: {
    invoice: string;
  };
};

type OrderData = {
  id: string;
  total_price: number;
  // Add other fields as necessary
};

export default function PaymentPage({ params }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/order/${params.invoice}`, {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        });
        if (res.data && res.data.data) {
          setOrder(res.data.data);
        } else {
          throw new Error('No data received from the server');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Gagal memuat data pesanan. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.data?.user.access_token) {
      fetchProduct();
    }
  }, [params.invoice, session?.data?.user.access_token]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile || !order) {
      alert('Harap pilih file dan pastikan data order sudah tersedia.');
      return;
    }

    const formData = new FormData();
    formData.append('id', order.id);
    formData.append('image', selectedFile);

    try {
      const res = await api.post('/order/update-payment-proof', formData, {
        headers: {
          Authorization: 'Bearer ' + session?.data?.user.access_token,
        },
      });

      if (res.status === 200) {
        // alert('Bukti pembayaran berhasil diunggah.');
        router.push('/order');
      } else {
        alert('Gagal mengunggah bukti pembayaran.');
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      alert('Terjadi kesalahan saat mengirim bukti pembayaran.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-lg font-semibold">Memuat data pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Informasi Pesanan</CardTitle>
            <CardDescription>
              {error || 'Tidak ada data pesanan yang tersedia.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Pembayaran Transfer Manual</CardTitle>
          <CardDescription>
            Silakan unggah bukti pembayaran Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Jumlah Pembayaran</Label>
                <Input
                  id="amount"
                  type="text"
                  className="font-semibold text-center"
                  value={`Rp. ${order.total_price.toLocaleString()}`}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank Tujuan</Label>
                <Input
                  id="bank"
                  type="text"
                  className="font-semibold text-center"
                  value="Bank BCA - 6043392587 - PT Aboda Digital"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="file">Unggah Bukti Pembayaran</Label>
                <div className="mt-2">
                  <Label htmlFor="file" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto max-h-48 object-contain"
                        />
                      ) : (
                        <div className="text-gray-500">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <span className="mt-2 block">
                            Klik untuk memilih file
                          </span>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" onClick={handleSubmit}>
            Kirim Bukti Pembayaran
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
