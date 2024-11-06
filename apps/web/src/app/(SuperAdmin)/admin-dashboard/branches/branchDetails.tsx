// import { useState } from 'react';
// import { Edit } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { IBranch } from '@/interfaces/branch';
// import { Session } from 'next-auth';
// import DeleteBranch from '../../components/deleteBranch';
// import BranchForm from './branchForm';
// import AdminList from './adminList';
// import ProductList from './productList';

// interface BranchDetailsProps {
//   branch: IBranch;
//   isEditing: boolean;
//   setIsEditing: (isEditing: boolean) => void;
//   onSave: (branch: IBranch) => void;
//   onCancel: () => void;
//   onDelete: (id: number) => void;
//   session: any | null;
// }

// export default function BranchDetails({
//   branch,
//   isEditing,
//   setIsEditing,
//   onSave,
//   onCancel,
//   onDelete,
//   session,
// }: BranchDetailsProps) {
//   const [branchAdmin, setBranchAdmin] = useState(branch.AdminDetails);

//   return (
//     <Card className="w-full lg:w-2/3">
//       <CardHeader>
//         <CardTitle className="flex justify-between items-center">
//           {isEditing
//             ? branch.id === 0
//               ? 'Add New Branch'
//               : 'Edit Branch'
//             : 'Branch Details'}
//           <div
//             className={`space-x-2 ${session.data?.user.roleId !== 2 && 'hidden'}`}
//           >
//             {!isEditing ? (
//               <>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setIsEditing(true)}
//                 >
//                   <Edit className="h-4 w-4 mr-2" />
//                   Edit
//                 </Button>
//                 <DeleteBranch
//                   branchName={branch.branch_name}
//                   id={branch.id}
//                   handler={onDelete}
//                 />
//               </>
//             ) : (
//               <>
//                 <Button
//                   variant="default"
//                   size="sm"
//                   onClick={() => onSave(branch)}
//                 >
//                   Save
//                 </Button>
//                 <Button variant="outline" size="sm" onClick={onCancel}>
//                   Cancel
//                 </Button>
//               </>
//             )}
//           </div>
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="details">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="details">Details</TabsTrigger>
//             <TabsTrigger
//               value="admins"
//               disabled={session.data?.user.roleId !== 2}
//             >
//               Admins
//             </TabsTrigger>
//             <TabsTrigger value="products">Products</TabsTrigger>
//           </TabsList>

//           <TabsContent value="details">
//             <BranchForm branch={branch} isEditing={isEditing} onSave={onSave} />
//           </TabsContent>

//           <TabsContent value="admins">
//             <AdminList
//               branchAdmin={branchAdmin}
//               setBranchAdmin={setBranchAdmin}
//               isEditing={isEditing}
//               session={session}
//             />
//           </TabsContent>

//           <TabsContent value="products">
//             <ProductList products={branch.ProductStocks} />
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }

import { useState } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IBranch, IAdminDetail } from '@/interfaces/branch';
import { Session } from 'next-auth';
import DeleteBranch from '../../components/deleteBranch';
import ProductList from './productList';
import AdminList from './adminList';
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
}

export default function BranchDetails({
  branch,
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  onDelete,
  session,
  provinces,
  cities,
  admins,
}: BranchDetailsProps) {
  const [branchAdmin, setBranchAdmin] = useState(branch.AdminDetails);

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
                  onClick={() => onSave(branch)}
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
              onSave={onSave}
              provinces={provinces}
              cities={cities}
            />
          </TabsContent>

          <TabsContent value="admins">
            <AdminList
              branchAdmin={admins}
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
