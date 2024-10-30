'use client';
import { useEffect, useState } from 'react';
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
import { useSession } from 'next-auth/react';
import { api } from '@/config/axios.config';
import { addAddressSchema } from '@/schemas/address.schemas';
import L from 'leaflet';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { setAddresses } from '@/state/addresses/addressesSlice';
import { AddressFormData } from '@/interfaces/address';
import RenderSelect from '@/components/cityProvince/renderSelect';

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
const renderSelect = (
  name: keyof AddressFormData,
  placeholder: string,
  items: any[],
  valueKey: string,
  labelKey: string,
  control: any,
) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <Select onValueChange={field.onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="relative z-50">
          {items.map((item) => (
            <SelectItem key={item[valueKey]} value={item[valueKey].toString()}>
              {item[labelKey]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
);

export default function AddAddress() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const { data: session } = useSession();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addAddressSchema),
    defaultValues: {
      street: '',
      selectedProvince: null,
      selectedCity: null,
      lon: null,
      lat: null,
    },
  });

  const selectedProvince = watch('selectedProvince');

  useEffect(() => {
    const fetchData = async (
      url: string,
      setter: React.Dispatch<React.SetStateAction<any[]>>,
    ) => {
      try {
        const res = await api.get(url, {
          headers: {
            Authorization: 'Bearer ' + session?.user.access_token,
          },
        });
        setter(res.data.data);
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    };

    session && fetchData('/address/get-provinces', setProvinces);
    selectedProvince &&
      fetchData(
        `/address/get-city-by-province?provinceId=${selectedProvince}`,
        setCities,
      );
  }, [session, selectedProvince]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setCoordinates([e.latlng.lat, e.latlng.lng]);
        setValue('lat', e.latlng.lat);
        setValue('lon', e.latlng.lng);
      },
    });
    return coordinates ? <Marker position={coordinates} /> : null;
  }

  const onSubmit = async (data: AddressFormData) => {
    try {
      const res = await api.post(
        '/address/add-user-address',
        {
          street: data.street,
          cityId: data.selectedCity,
          lon: data.lon,
          lat: data.lat,
        },
        {
          headers: {
            Authorization: 'Bearer ' + session?.user.access_token,
          },
        },
      );

      const result = [res.data.data];
      dispatch(
        setAddresses(
          result.map((item: any) => ({
            longitude: item.address.lon,
            latitude: item.address.lat,
            city: item.address.City.city,
            street: item.address.street,
          })),
        ),
      );
      alert('Address added successfully!');
    } catch (error) {
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

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="street"
          control={control}
          render={({ field }) => (
            <Input placeholder="Street Address" {...field} />
          )}
        />
        {errors.street && (
          <p className="text-red-500 text-sm">{errors.street.message}</p>
        )}
        <RenderSelect
          name="selectedProvince"
          placeholder="Select Province"
          items={provinces}
          valueKey="id"
          labelKey="name"
          control={control}
        />
        {errors.selectedProvince && (
          <p className="text-red-500 text-sm">
            {errors.selectedProvince.message}
          </p>
        )}

        {renderSelect(
          'selectedCity',
          'Select City',
          cities,
          'id',
          'city',
          control,
        )}
        {errors.selectedCity && (
          <p className="text-red-500 text-sm">{errors.selectedCity.message}</p>
        )}

        <div className="w-full h-64 relative z-10">
          <MapContainer
            center={[-6.301478, 106.651003]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker />
          </MapContainer>
        </div>

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
