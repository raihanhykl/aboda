import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IAdminDetail } from '@/interfaces/branch';
import { Session } from 'next-auth';
import { getUnassignedAdmin, unassignAdminAction } from '@/action/admin.action';
import UnassignAdmin from '@/app/(SuperAdmin)/components/unassignAdmin';
import CreateAdminPopover from '@/app/(SuperAdmin)/components/createAdmin';

interface AdminListProps {
  branchAdmin: IAdminDetail[];
  setBranchAdmin: (admins: IAdminDetail[]) => void;
  isEditing: boolean;
  session: any | null;
}

export default function AdminList({
  branchAdmin,
  setBranchAdmin,
  isEditing,
  session,
}: AdminListProps) {
  const [showAdminSuggestions, setShowAdminSuggestions] = useState(false);
  const [availableAdmins, setAvailableAdmins] = useState<IAdminDetail[]>([]);

  const fetchAvailableAdmins = async () => {
    if (session.data?.user.access_token) {
      try {
        const res = await getUnassignedAdmin(session.data?.user.access_token);
        setAvailableAdmins(res.data.data as IAdminDetail[]);
      } catch (error) {
        console.error('Error fetching available admins:', error);
      }
    }
  };
  useEffect(() => {
    if (isEditing) {
      fetchAvailableAdmins();
    }
  }, [isEditing, fetchAvailableAdmins]);

  const handleDeleteAdmin = async (id: number) => {
    if (session.data?.user.access_token) {
      try {
        await unassignAdminAction(id, session.data.user.access_token);
        const updatedAdmins = branchAdmin.filter((admin) => admin.id !== id);

        setBranchAdmin(updatedAdmins);
        fetchAvailableAdmins();
      } catch (error) {
        console.error('Error unassigning admin:', error);
      }
    }
  };

  const handleAddAdmin = (admin: IAdminDetail) => {
    setBranchAdmin([...branchAdmin, admin]);
    setShowAdminSuggestions(false);
  };

  const handleAvailableAdmins = (newAdmin: IAdminDetail[]) => {
    if (newAdmin.length > 0)
      setAvailableAdmins((prevAdmins) => [...prevAdmins, ...newAdmin]);
  };

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {branchAdmin.map((admin) => (
          <li
            key={admin.id}
            className="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            {admin.User.first_name} {admin.User.last_name}
            {isEditing && (
              <UnassignAdmin
                adminName={admin.User.first_name}
                id={admin.id}
                handler={handleDeleteAdmin}
              />
            )}
          </li>
        ))}
      </ul>
      {isEditing && (
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowAdminSuggestions(!showAdminSuggestions)}
          >
            + Add Admin
          </Button>
          {showAdminSuggestions && (
            <Card className="absolute z-10 mt-1 w-full">
              <CardContent className="p-0">
                <ul className="max-h-60 overflow-auto">
                  <li className="text-green-500 p-2 hover:bg-green-100 cursor-pointer">
                    <CreateAdminPopover setAvailable={setAvailableAdmins} />
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
    </div>
  );
}
