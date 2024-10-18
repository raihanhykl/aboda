'use client';

import { useState } from 'react';
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

export default function PaymentPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission here
    console.log('Form submitted', selectedFile);
  };

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
                  placeholder="Rp 100.000"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="bank">Bank Tujuan</Label>
                <Input
                  id="bank"
                  type="text"
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
