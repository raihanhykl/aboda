'use client';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { api } from '@/config/axios.config';
import { addAddressSchema } from '@/schemas/address.schemas'; // Import Zod schema
import { z } from 'zod';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Set default marker icon (Leaflet uses images for markers)
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function AddAddress() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [street, setStreet] = useState<string>('');
  const [lon, setLon] = useState<number | null>(null); // Longitude state
  const [lat, setLat] = useState<number | null>(null); // Latitude state
  const [errors, setErrors] = useState<any>(null); // State to store validation errors
  const session = useSession();

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await api.get('/address/get-provinces');
        setProvinces(res.data.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };

    if (session.status === 'authenticated') {
      fetchProvinces();
    }
  }, [session]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvince) return;

      try {
        const res = await api.get(
          `/address/get-city-by-province?provinceId=${selectedProvince}`,
          {
            headers: {
              Authorization: 'Bearer ' + session?.data?.user.access_token,
            },
          },
        );
        setCities(res.data.data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    };

    if (selectedProvince) {
      fetchCities();
    }
  }, [selectedProvince, session]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLat(e.latlng.lat);
        setLon(e.latlng.lng);
      },
    });

    return lat && lon ? <Marker position={[lat, lon]} /> : null;
  }

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();

    // Data to be validated
    const formData = {
      street,
      selectedProvince,
      selectedCity,
      lon,
      lat,
    };

    const validationResult = addAddressSchema.safeParse(formData);
    if (!validationResult.success) {
      setErrors(validationResult.error.format());
      return;
    }

    try {
      // console.log(street, selectedCity, lon, lat);
      const res = await api.post(
        '/address/add-user-address',
        {
          street,
          cityId: selectedCity,
          lon,
          lat,
        },
        {
          headers: {
            Authorization: 'Bearer ' + session?.data?.user.access_token,
          },
        },
      );

      console.log('Address added successfully:', res.data);
      alert('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-1 text-center">Add Address</h1>
      <p className="text-sm text-gray-500 mb-8 text-center">
        <a href="/" className="hover:underline">
          Home
        </a>{' '}
        / Add Address
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="Street Address"
          value={street}
          onChange={(e) => setStreet(e.target.value)} // Set street state
        />
        {errors?.street && (
          <p className="text-red-500 text-sm">{errors.street._errors[0]}</p>
        )}

        <Select onValueChange={(value) => setSelectedProvince(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent className="relative z-50">
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id.toString()}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.selectedProvince && (
          <p className="text-red-500 text-sm">
            {errors.selectedProvince._errors[0]}
          </p>
        )}

        <div className="relative z-50">
          <Select onValueChange={(value) => setSelectedCity(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent className="relative z-50">
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {errors?.selectedCity && (
          <p className="text-red-500 text-sm">
            {errors.selectedCity._errors[0]}
          </p>
        )}

        <div className="w-full h-64 relative z-10">
          <MapContainer
            center={[-6.301478160691095, 106.6510033607483]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
          </MapContainer>
        </div>

        {errors?.lat && (
          <p className="text-red-500 text-sm">{errors.lat._errors[0]}</p>
        )}
        {errors?.lon && (
          <p className="text-red-500 text-sm">{errors.lon._errors[0]}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Save
        </Button>
      </form>
    </div>
  );
}
