'use client';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IBranch } from '@/interfaces/branch';
import RenderSelect from '@/components/cityProvince/renderSelect';
import MapComponent from './mapComponent';

interface BranchFormProps {
  branch: IBranch;
  isEditing: boolean;
  onSave: (branch: IBranch) => void;
  control: any;
  position: [number, number];
  setPosition: any;
  handleSubmit: any;
  selectedProvince: any;
  provinces2: any;
  cities2: any;
}

export default function BranchForm({
  branch,
  isEditing,
  onSave,
  control,
  position,
  setPosition,
  handleSubmit,
  selectedProvince,
  provinces2,
  cities2,
}: BranchFormProps) {
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
        // position={[branch.address.lat, branch.address.lon]}
        position={position}
        isEditing={isEditing}
        onPositionChange={handlePositionChange}
        setPosition={setPosition}
      />
    </form>
  );
}
