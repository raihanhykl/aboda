import { AddressFormData } from '@/interfaces/address';
import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type Props = {
  name: keyof AddressFormData;
  placeholder: string;
  items: any[];
  valueKey: string;
  labelKey: string;
  control: any;
};

export default function RenderSelect({
  name,
  placeholder,
  items,
  valueKey,
  labelKey,
  control,
}: Props) {
  return (
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
              <SelectItem
                key={item[valueKey]}
                value={item[valueKey].toString()}
              >
                {item[labelKey]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

// const renderSelect = (
//     name: keyof AddressFormData,
//     placeholder: string,
//     items: any[],
//     valueKey: string,
//     labelKey: string,
//   ) => (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field }) => (
//         <Select onValueChange={field.onChange}>
//           <SelectTrigger>
//             <SelectValue placeholder={placeholder} />
//           </SelectTrigger>
//           <SelectContent className="relative z-50">
//             {items.map((item) => (
//               <SelectItem
//                 key={item[valueKey]}
//                 value={item[valueKey].toString()}
//               >
//                 {item[labelKey]}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       )}
//     />
//   );
