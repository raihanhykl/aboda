'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllBranch, getUnassignedAdmin } from '@/action/admin.action';
import { IBranch, IAdminDetail } from '@/interfaces/branch';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateAdminPopover from '../../components/createAdmin';
import { api } from '@/config/axios.config';

export default function SuperAdminDashboard() {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [availableAdmins, setAvailableAdmins] = useState<IAdminDetail[]>([]);
  const [showAdminSuggestions, setShowAdminSuggestions] = useState(false);
  const [branchAdmin, setBranchAdmin] = useState<IAdminDetail[]>([]);
  const session = useSession();

  const { control, handleSubmit, reset } = useForm<IBranch>();

  useEffect(() => {
    if (isEditing || isAdding) {
      fetchAvailableAdmins();
    }
  }, [isEditing, isAdding]);

  useEffect(() => {
    if (selectedBranch) {
      setPosition([selectedBranch.address.lat, selectedBranch.address.lon]);
      reset(selectedBranch);
    }
  }, [selectedBranch, reset]);

  useEffect(() => {
    if (session.data?.user) {
      getAllBranch(session.data.user.access_token).then((res) => {
        const data = res?.data.data as IBranch[];
        setBranches(data);
        setSelectedBranch(data[0]);
        setBranchAdmin(data[0].AdminDetails);
      });
    }
  }, [session]);

  const fetchAvailableAdmins = async () => {
    getUnassignedAdmin(session.data?.user.access_token!)
      .then((res) => {
        setAvailableAdmins(res.data.data as IAdminDetail[]);
      })
      .catch((error) => {
        console.error('Error fetching available admins:', error.message);
      });
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  const handleBranchClick = (branch: IBranch) => {
    if (isAdding) {
      handleCancelAdd();
    }
    setSelectedBranch(branch);
    setBranchAdmin(branch.AdminDetails);
    setIsAdding(false);
    setIsEditing(false);
  };

  const handleSaveBranch = async (data: IBranch) => {
    const updatedBranch = {
      ...data,
      address: {
        ...data.address,
        lat: position[0],
        lon: position[1],
      },
      AdminDetails: branchAdmin,
    };
    if (isAdding) {
      setBranches([...branches.slice(0, -1), updatedBranch]);
      setIsAdding(false);
      await api.post(
        `/branch/create-branch`,
        { data: updatedBranch },
        {
          headers: {
            Authorization: 'Bearer ' + session.data?.user.access_token,
          },
        },
      );
    } else {
      setBranches(
        branches.map((branch) =>
          branch.id === updatedBranch.id ? updatedBranch : branch,
        ),
      );
      await api
        .put(
          `/branch/update-branch`,
          { data: updatedBranch },
          {
            headers: {
              Authorization: 'Bearer ' + session.data?.user.access_token,
            },
          },
        )
        .then(() => alert('success hit api'))
        .catch((err) => alert(`failed hit api: ${err.message}`));
    }
    setSelectedBranch(updatedBranch);
    setIsEditing(false);
  };

  const handleDeleteBranch = (id: number) => {
    setBranches(branches.filter((branch) => branch.id !== id));
    setSelectedBranch(null);
  };

  const handleAddBranch = () => {
    const newBranch: IBranch = {
      id: branches.length + 1,
      branch_name: 'New Branch',
      addressId: 0,
      address: {
        id: 0,
        cityId: 457,
        street: '',
        lon: 0,
        lat: 0,
        City: {
          id: 457,
          provinceId: 3,
          city: '',
          Province: {
            id: 3,
            name: '',
          },
        },
      },
      AdminDetails: [],
      ProductStocks: [],
    };
    setBranches([...branches, newBranch]);
    setSelectedBranch(newBranch);
    setPosition([newBranch.address.lat, newBranch.address.lon]);
    setIsAdding(true);
    setBranchAdmin([]);
    setIsEditing(true);
    reset(newBranch);
  };

  const handleCancelAdd = () => {
    if (isAdding && selectedBranch?.id === branches[branches.length - 1].id) {
      setBranches(branches.slice(0, -1));
    }
    setSelectedBranch(null);
    setIsAdding(false);
    setIsEditing(false);
  };

  const handleAddAdmin = (admin: IAdminDetail) => {
    if (selectedBranch) {
      setBranchAdmin((prev) => [...prev, admin]);
      setShowAdminSuggestions(false);
    }
  };

  const handleAvailableAdmins = (newAdmin: IAdminDetail[]) => {
    if (newAdmin.length > 0) setAvailableAdmins((prevAdmins) => [...newAdmin]);
  };

  return (
    <div className="  p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Branches
              <Button size="icon" onClick={handleAddBranch}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {branches &&
                branches.map((branch) => (
                  <li
                    key={branch.id}
                    onClick={() => handleBranchClick(branch)}
                    className={`cursor-pointer p-2 rounded transition-colors ${
                      selectedBranch?.id === branch.id
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {branch.branch_name}
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        {selectedBranch && (
          <Card className="w-full lg:w-2/3">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {isEditing
                  ? selectedBranch?.id === branches[branches.length - 1].id
                    ? 'Add New Branch'
                    : 'Edit Branch'
                  : 'Branch Details'}
                <div className="space-x-2">
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBranch(selectedBranch.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSubmit(handleSaveBranch)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelAdd}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="admins">Admins</TabsTrigger>
                  <TabsTrigger value="products">Products</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <form
                    onSubmit={handleSubmit(handleSaveBranch)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="branch_name">Branch Name</Label>
                        <Controller
                          name="branch_name"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="mt-1"
                            />
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="street">Street</Label>
                        <Controller
                          name="address.street"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              readOnly={!isEditing}
                              className="mt-1"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Controller
                          name="address.City.city"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              readOnly={!isEditing}
                              className="mt-1"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Controller
                          name="address.City.Province.name"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              readOnly={!isEditing}
                              className="mt-1"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </form>

                  <div>
                    <Label>Location</Label>
                    <div className="mt-1 h-64 rounded-md overflow-hidden">
                      <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                      </MapContainer>
                    </div>
                    {isEditing && (
                      <p className="mt-2 text-sm text-gray-500">
                        Click on the map to set the branch location.
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="admins">
                  <ul className="space-y-2">
                    {branchAdmin.map((admin) => (
                      <li
                        key={admin.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        {admin.User.first_name} {admin.User.last_name}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            // onClick={() => handleDeleteAdmin(admin.id)} // Add a function to handle admin deletion
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditing && (
                    <div className="relative mt-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowAdminSuggestions(!showAdminSuggestions)
                        }
                      >
                        + Add Admin
                      </Button>
                      {showAdminSuggestions && (
                        <Card className="absolute z-10 mt-1 w-full">
                          <CardContent className="p-0">
                            <ul className="max-h-60 overflow-auto">
                              <li className=" text-green-500 p-2 hover:bg-green-100 cursor-pointe">
                                <CreateAdminPopover
                                  setAvailable={handleAvailableAdmins}
                                />
                              </li>
                              {availableAdmins.map((admin: IAdminDetail) => (
                                <li
                                  key={admin.id}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleAddAdmin(admin)}
                                >
                                  {admin.User.first_name} {admin.User.last_name}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="products">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Product Name</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2 text-left">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBranch.ProductStocks.map((stock) => (
                        <tr key={stock.id} className="border-t">
                          <td className="px-4 py-2">
                            {stock.Product.product_name}
                          </td>
                          <td className="px-4 py-2">
                            {stock.Product.description}
                          </td>
                          <td className="px-4 py-2">
                            Rp. {stock.Product.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2">{stock.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
