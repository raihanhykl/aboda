'use client';
import { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IBranch, IAdminDetail } from '@/interfaces/branch';
import DeleteBranch from '../../../components/deleteBranch';
import ProductList from './productList';
import AdminList from './adminList';
import { Controller, useForm } from 'react-hook-form';
import { fetchData } from '@/action/user.action';
import BranchForm from './branchForm';

interface BranchDetailsProps {
  branch: IBranch;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onSave: (branch: IBranch) => void;
  onCancel: () => void;
  onDelete: (id: number) => void;
  session: any | null;
  provinces: any[];
  cities: any[];
  admins: IAdminDetail[];
  position: [number, number];
  setPosition: any;
}

export default function BranchDetails({
  branch,
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  onDelete,
  session,
  position,
  setPosition,
}: BranchDetailsProps) {
  const [branchAdmin, setBranchAdmin] = useState(branch.AdminDetails);
  const { control, handleSubmit, watch, reset } = useForm<IBranch>({
    defaultValues: branch,
  });
  const selectedProvince = watch('address.City.Province.id');

  const onSaveTesting = (branch: IBranch) => {
    alert(JSON.stringify(branch));
  };
  const [provinces2, setProvinces] = useState<any[]>([]);
  const [cities2, setCities] = useState<any[]>([]);
  useEffect(() => {
    if (session.data?.user) {
      fetchData(
        '/address/get-provinces',
        setProvinces,
        session.data.user.access_token,
      );
    }
    reset(branch);
  }, [session, branch, reset]);
  useEffect(() => {
    if (!session.data?.user) return;
    selectedProvince &&
      fetchData(
        `/address/get-city-by-province?provinceId=${selectedProvince}`,
        setCities,
        session.data.user?.access_token,
      );
  }, [selectedProvince]);
  const handleUpdateBranchAdmin = (updatedAdmins: IAdminDetail[]) => {
    setBranchAdmin(updatedAdmins);
    onSave({ ...branch, AdminDetails: updatedAdmins });
  };

  return (
    <Card className="w-full lg:w-2/3">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {isEditing
            ? branch.id === 0
              ? 'Add New Branch'
              : 'Edit Branch'
            : 'Branch Details'}
          <div
            className={`space-x-2 ${session.data?.user.roleId !== 2 && 'hidden'}`}
          >
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
                  branchName={branch.branch_name}
                  id={branch.id}
                  handler={onDelete}
                />
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmit(onSave)}
                >
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel}>
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
            <TabsTrigger
              value="admins"
              disabled={session.data?.user.roleId !== 2}
            >
              Admins
            </TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <BranchForm
              branch={branch}
              isEditing={isEditing}
              onSave={onSaveTesting}
              control={control}
              position={position}
              setPosition={setPosition}
              handleSubmit={handleSubmit}
              selectedProvince={selectedProvince}
              provinces2={provinces2}
              cities2={cities2}
            />
          </TabsContent>

          <TabsContent value="admins">
            <AdminList
              branchAdmin={branch.AdminDetails}
              setBranchAdmin={handleUpdateBranchAdmin}
              isEditing={isEditing}
              session={session}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductList products={branch.ProductStocks} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
