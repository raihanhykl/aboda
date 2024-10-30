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
import DeleteBranch from '@/app/(SuperAdmin)/components/deleteBranch';
import { useSession } from 'next-auth/react';
import { crudUserAddress, getUserAddressesAction } from '@/action/user.action';
import { api } from '@/config/axios.config';

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
  const [selectedProvice, setSelectedProvince] = useState<any[]>([]);
  const [selectedCities, setSelectedCities] = useState<any[]>([]);

  const { handleSubmit, reset, control } = useForm<UserAddress>();

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
      setSelectedAddress(data[0]);
      setPosition([data[0].address.lat, data[0].address.lon]);
      reset(data[0]);
    });
  }, [session.data?.user]);

  const handleAddAddress = () => {
    const newAddress: UserAddress = {
      id: addresses[addresses.length - 1].id + 1,
      userId: addresses[0].userId,
      addressId: addresses[0].addressId,
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
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, 13); // Memusatkan peta ke posisi baru
      }
    }, [position, map]);
    return null;
  };

  const handleBranchClick = (address: UserAddress) => {
    if (isAdding) {
      handleCancelAdd();
    }
    setSelectedAddress(address);
    setIsAdding(false);
    setIsEditing(false);
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
    setAddresses(addresses.filter((a) => a.id !== id));
    setSelectedAddress(null);
  };

  const onSubmit = async (data: UserAddress) => {
    const updatedAddress = {
      ...data,
      address: { ...data.address, lat: position[0], lon: position[1] },
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
    )
      .then(() => {
        alert('success');
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
      })
      .catch(() => alert('failed'));

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
          <Button size="icon" variant="outline" onClick={handleAddAddress}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {addresses.length > 0 &&
              addresses.map((address) => (
                <div
                  key={address.address.id}
                  className={`p-3 rounded-lg cursor-pointer ${selectedAddress?.address.id === address.address.id ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setSelectedAddress(address);
                    handleCancelAdd();
                  }}
                >
                  <div className="font-medium">
                    {address.address.street || 'New Address'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {address.address.City.city}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {selectedAddress && (
        <Card className="w-full md:w-2/3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Address Details</CardTitle>
            <div className={`space-x-2`}>
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <DeleteBranch
                  // branchName={selectedBranch.branch_name}
                  // id={selectedBranch.id}
                  // handler={handleDeleteBranch}
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
                    <Controller
                      control={control}
                      name="address.City.city"
                      render={({ field }) => (
                        <Input {...field} disabled={!isEditing} />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Controller
                      control={control}
                      name="address.City.Province.name"
                      render={({ field }) => (
                        <Input {...field} disabled={!isEditing} />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="h-[300px] relative">
                <MapContainer
                  center={[
                    selectedAddress.address.lat,
                    selectedAddress.address.lon,
                  ]}
                  zoom={13}
                  className="h-full w-full z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      selectedAddress.address.lat,
                      selectedAddress.address.lon,
                    ]}
                  />
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
