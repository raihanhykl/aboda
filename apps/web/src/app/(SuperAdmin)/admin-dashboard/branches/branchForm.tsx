// 'use client';
// import { useForm, Controller } from 'react-hook-form';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { IBranch } from '@/interfaces/branch';
// import RenderSelect from '@/components/cityProvince/renderSelect';
// import MapComponent from './mapComponent';
// import { useEffect, useState } from 'react';
// import { useSession } from 'next-auth/react';
// import { fetchData } from '@/action/user.action';

// interface BranchFormProps {
//   branch: IBranch;
//   isEditing: boolean;
//   onSave: (branch: IBranch) => void;
// }

// export default function BranchForm({
//   branch,
//   isEditing,
//   onSave,
// }: BranchFormProps) {
//   const { control, handleSubmit, watch } = useForm<IBranch>({
//     defaultValues: branch,
//   });
//   const [provinces, setProvinces] = useState<any[]>([]);
//   const [cities, setCities] = useState<any[]>([]);
//   const selectedProvince = watch('address.City.Province.id');

//   const session = useSession();
//   useEffect(() => {
//     if (session.data?.user) {
//       fetchData(
//         '/address/get-provinces',
//         setProvinces,
//         session.data.user.access_token,
//       );
//     }
//   }, [session]);
//   useEffect(() => {
//     if (!session.data?.user) return;
//     selectedProvince &&
//       fetchData(
//         `/address/get-city-by-province?provinceId=${selectedProvince}`,
//         setCities,
//         session.data.user?.access_token,
//       );
//   }, [selectedProvince]);

//   return (
//     <form onSubmit={handleSubmit(onSave)} className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <div className="col-span-2">
//           <Label htmlFor="branch_name">Branch Name</Label>
//           <Controller
//             name="branch_name"
//             control={control}
//             render={({ field }) => (
//               <Input {...field} disabled={!isEditing} className="mt-1" />
//             )}
//           />
//         </div>
//         <div className="col-span-2">
//           <Label htmlFor="street">Street</Label>
//           <Controller
//             name="address.street"
//             control={control}
//             render={({ field }) => (
//               <Input {...field} disabled={!isEditing} className="mt-1" />
//             )}
//           />
//         </div>
//         <div>
//           <Label htmlFor="city">City</Label>
//           <RenderSelect
//             name="address.City.id"
//             placeholder={branch.address.City.city}
//             items={cities} // You'll need to fetch and pass the cities
//             valueKey="id"
//             labelKey="city"
//             control={control}
//             disabled={!isEditing}
//           />
//         </div>
//         <div>
//           <Label htmlFor="province">Province</Label>
//           <RenderSelect
//             name="address.City.Province.id"
//             placeholder={branch.address.City.Province.name}
//             items={provinces} // You'll need to fetch and pass the provinces
//             valueKey="id"
//             labelKey="name"
//             control={control}
//             disabled={!isEditing}
//           />
//         </div>
//       </div>
//       <MapComponent
//         position={[branch.address.lat, branch.address.lon]}
//         isEditing={isEditing}
//       />
//     </form>
//   );
// }

'use client';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IBranch } from '@/interfaces/branch';
import RenderSelect from '@/components/cityProvince/renderSelect';
import MapComponent from './mapComponent';
import { useEffect, useState } from 'react';
import { fetchData } from '@/action/user.action';
import { useSession } from 'next-auth/react';

interface BranchFormProps {
  branch: IBranch;
  isEditing: boolean;
  onSave: (branch: IBranch) => void;
  provinces: any[];
  cities: any[];
}

export default function BranchForm({
  branch,
  isEditing,
  onSave,
  provinces,
  cities,
}: BranchFormProps) {
  const { control, handleSubmit, watch } = useForm<IBranch>({
    defaultValues: branch,
  });
  const [provinces2, setProvinces] = useState<any[]>([]);
  const [cities2, setCities] = useState<any[]>([]);
  const selectedProvince = watch('address.City.Province.id');

  const session = useSession();
  useEffect(() => {
    if (session.data?.user) {
      fetchData(
        '/address/get-provinces',
        setProvinces,
        session.data.user.access_token,
      );
    }
  }, [session]);
  useEffect(() => {
    if (!session.data?.user) return;
    selectedProvince &&
      fetchData(
        `/address/get-city-by-province?provinceId=${selectedProvince}`,
        setCities,
        session.data.user?.access_token,
      );
  }, [selectedProvince]);

  const handlePositionChange = (newPosition: [number, number]) => {
    const [lat, lon] = newPosition;
    onSave({ ...branch, address: { ...branch.address, lat, lon } });
  };

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="branch_name">Branch Name</Label>
          <Controller
            name="branch_name"
            control={control}
            render={({ field }) => (
              <Input {...field} disabled={!isEditing} className="mt-1" />
            )}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="street">Street</Label>
          <Controller
            name="address.street"
            control={control}
            render={({ field }) => (
              <Input {...field} disabled={!isEditing} className="mt-1" />
            )}
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <RenderSelect
            name="address.City.id"
            placeholder={branch.address.City.city}
            items={cities2}
            valueKey="id"
            labelKey="city"
            control={control}
            disabled={!isEditing || !selectedProvince}
          />
        </div>
        <div>
          <Label htmlFor="province">Province</Label>
          <RenderSelect
            name="address.City.Province.id"
            placeholder={branch.address.City.Province.name}
            items={provinces2}
            valueKey="id"
            labelKey="name"
            control={control}
            disabled={!isEditing}
          />
        </div>
      </div>
      <MapComponent
        position={[branch.address.lat, branch.address.lon]}
        isEditing={isEditing}
        onPositionChange={handlePositionChange}
      />
    </form>
  );
}
