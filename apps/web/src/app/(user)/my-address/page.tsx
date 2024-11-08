'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusIcon, Edit } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Address, UserAddress } from '@/interfaces/branch';
import { signIn, useSession } from 'next-auth/react';
import {
  crudUserAddress,
  deleteUserAddress,
  fetchData,
  getUserAddressesAction,
  setDefaultUserAddress,
} from '@/action/user.action';
import RenderSelect from '@/components/cityProvince/renderSelect';
import DeleteUserAddress from './components/deleteUserAddress';
import SetMainAddressButton from './components/setMainAddress';
import { add, set } from 'cypress/types/lodash';

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function Component() {
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const session = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>();
  const [isAdding, setIsAdding] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [tempCities, setTempCities] = useState<any[]>([]);

  const { handleSubmit, reset, watch, control } = useForm<UserAddress>();

  const selectedProvince = watch('address.City.Province.id');

  useEffect(() => {
    if (selectedAddress) {
      setPosition([selectedAddress.address.lat, selectedAddress.address.lon]);
      reset(selectedAddress);
    }
  }, [selectedAddress, reset]);

  useEffect(() => {
    if (!session.data?.user) return;
    getUserAddressesAction(session.data?.user.access_token).then((res) => {
      const data = res.data.data as UserAddress[];
      setAddresses(data);
      if (data.length > 0) {
        // setSelectedAddress(data[0]);
        setSelectedAddress(
          data.find((address) => address.isDefault === 1) || data[0],
        );
        setPosition([data[0].address.lat, data[0].address.lon]);
        reset(data[0]);
      }
    });
    fetchData(
      '/address/get-provinces',
      setProvinces,
      session.data.user.access_token,
    );
  }, [session.data?.user, reset]);

  useEffect(() => {
    if (!session.data?.user) return;
    selectedProvince &&
      fetchData(
        `/address/get-city-by-province?provinceId=${selectedProvince}`,
        setCities,
        session.data.user?.access_token,
      );
  }, [selectedProvince, session.data?.user]);

  const handleAddAddress = () => {
    const newAddress: UserAddress = {
      id: addresses.length > 0 ? addresses[addresses.length - 1].id + 1 : 1,
      userId: addresses.length > 0 ? addresses[0].userId : 1,
      addressId: addresses.length > 0 ? addresses[0].addressId : 1,
      isDefault: addresses.length > 0 ? 0 : 1,
      address: {
        id: Date.now(),
        cityId: 0,
        street: '',
        lon: 106.6537,
        lat: -6.3015,
        City: {
          id: 0,
          provinceId: 0,
          city: '',
          Province: {
            id: 0,
            name: '',
          },
        },
      },
    };
    setIsAdding(true);
    setIsEditing(true);
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress);
  };

  const handleSetMainAddress = async () => {
    await setDefaultUserAddress(
      selectedAddress?.id!,
      session.data?.user.access_token!,
    ).then(() => {
      if (selectedAddress) {
        setSelectedAddress((prev) => ({ ...prev!, isDefault: 1 }));
        setAddresses((prevAddresses) =>
          prevAddresses.map((address) => ({
            ...address,
            isDefault: address.id === selectedAddress.id ? 1 : 0,
          })),
        );
      }
    });
    await signIn('credentials', {
      access_token: session.data?.user.access_token,
      redirect: false,
    });
  };
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, 13);
      }
    }, [position, map]);

    return null;
  };
  const handleCancelAdd = () => {
    if (
      isAdding &&
      selectedAddress?.id === addresses[addresses.length - 1].id
    ) {
      setAddresses(addresses.slice(0, -1));
    }
    setIsAdding(false);
    setIsEditing(false);
  };
  const handleDelete = async (id: number) => {
    await deleteUserAddress(id, session.data?.user?.access_token!)
      .then(() => {
        if (selectedAddress?.isDefault === 1) {
          setAddresses((prevAddresses) =>
            prevAddresses.map((address, index) => ({
              ...address,
              isDefault: index === 0 ? 1 : 0,
            })),
          );
        }
        setAddresses((prevAddresses) =>
          prevAddresses.filter((a) => a.id !== id),
        );
        setSelectedAddress(null);
        setIsAdding(false);
        setIsEditing(false);
      })
      .catch(() => alert('failed'));
  };

  const onSubmit = async (data: UserAddress) => {
    const updatedAddress = {
      ...data,
      address: {
        ...data.address,
        lat: position[0],
        lon: position[1],
      },
    };
    setAddresses(
      addresses.map((a) =>
        a.address.id === selectedAddress?.address.id
          ? { ...updatedAddress }
          : a,
      ),
    );
    await crudUserAddress(
      updatedAddress,
      position,
      session.data?.user.access_token,
      isAdding,
    ).then(() => {
      setIsEditing(false);
      setSelectedAddress(updatedAddress);
      if (isAdding) {
        setAddresses([...addresses.slice(0, -1), updatedAddress]);
      } else {
        setAddresses(
          addresses.map((address) =>
            address.id === updatedAddress.id ? updatedAddress : address,
          ),
        );
      }
      setIsAdding(false);
    });
    await signIn('credentials', {
      access_token: session.data?.user.access_token,
      redirect: false,
    }).catch(() => alert('failed'));
    setSelectedAddress(updatedAddress);
  };
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        if (selectedAddress && isEditing) {
          setPosition([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4">
      <Card className="w-full md:w-1/3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Addresses</CardTitle>
          <Button
            disabled={isAdding}
            size="icon"
            variant="outline"
            onClick={handleAddAddress}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {addresses.length > 0 &&
              addresses.map((address) => (
                <div
                  key={address.address.id}
                  className={`p-3 rounded-lg flex justify-between items-center cursor-pointer ${selectedAddress?.address.id === address.address.id ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setSelectedAddress(address);
                    handleCancelAdd();
                  }}
                >
                  <div>
                    <div className="font-medium">
                      {address.address.street || 'New Address'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {address.address.City.city}
                    </div>
                  </div>
                  {address.isDefault == 1 && (
                    <div className=" flex items-end text-xs px-4 py-1 h-fit rounded-md bg-green-300 text-green-900">
                      Main
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {selectedAddress && (
        <Card className="w-full md:w-2/3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Address Details</CardTitle>
            <SetMainAddressButton
              isMainAddress={
                selectedAddress && Boolean(selectedAddress.isDefault)
              }
              onSetMainAddress={handleSetMainAddress}
            />
            <div className={`space-x-2 flex`}>
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 md:mr-2" />
                    <span className=" hidden md:block">Edit</span>
                  </Button>
                  <DeleteUserAddress
                    street={selectedAddress.address.street}
                    id={selectedAddress.id}
                    handler={handleDelete}
                  />
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                  >
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelAdd}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street</Label>
                  <Controller
                    control={control}
                    name="address.street"
                    render={({ field }) => (
                      <Input
                        {...field}
                        disabled={!isEditing}
                        className=" mt-1"
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <RenderSelect
                      name="address.City.id"
                      placeholder={selectedAddress.address.City.city}
                      items={cities}
                      valueKey="id"
                      labelKey="city"
                      control={control}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <RenderSelect
                      name="address.City.Province.id"
                      placeholder={selectedAddress.address.City.Province.name}
                      items={provinces}
                      valueKey="id"
                      labelKey="name"
                      control={control}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="h-[300px] relative">
                <MapContainer
                  center={position}
                  zoom={13}
                  className="h-full w-full z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />{' '}
                  <MapEvents />
                  <MapUpdater />
                </MapContainer>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
