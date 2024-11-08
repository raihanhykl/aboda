'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getAllBranch } from '@/action/admin.action';
import { IAdminDetail, IBranch } from '@/interfaces/branch';
import { fetchData } from '@/action/user.action';
import { api } from '@/config/axios.config';
import BranchList from './components/branchList';
import BranchDetails from './components/branchDetails';

export default function SuperAdminDashboard() {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [branchAdmin, setBranchAdmin] = useState<IAdminDetail[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const session = useSession();
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (session.data?.user) {
      getAllBranch(session.data.user.access_token).then((res) => {
        const data = res?.data.data as IBranch[];
        setBranches(data);
        setSelectedBranch(data[0]);
        setPosition([data[0].address.lat, data[0].address.lon]);
      });
      fetchData(
        '/address/get-provinces',
        setProvinces,
        session.data.user.access_token,
      );
    }
  }, [session]);

  useEffect(() => {
    if (!session.data?.user || !selectedBranch) return;
    fetchData(
      `/address/get-city-by-province?provinceId=${selectedBranch.address.City.Province.id}`,
      setCities,
      session.data.user?.access_token,
    );
  }, [selectedBranch, session]);

  const handleBranchClick = (branch: IBranch) => {
    if (isAdding) {
      handleCancelAdd();
    }
    setBranchAdmin(branch.AdminDetails);
    setSelectedBranch(branch);
    setIsAdding(false);
    setIsEditing(false);
    setPosition([branch.address.lat, branch.address.lon]);
  };

  const handleAddBranch = () => {
    const newBranch: IBranch = {
      id: branches[branches.length - 1].id + 1,
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
    setIsAdding(true);
    setIsEditing(true);
  };

  const handleCancelAdd = () => {
    if (isAdding && selectedBranch?.id === branches[branches.length - 1].id) {
      setBranches(branches.slice(0, -1));
    }
    setSelectedBranch(null);
    setIsAdding(false);
    setIsEditing(false);
  };

  const handleSaveBranch = async (updatedBranch: IBranch) => {
    const finalBranch = {
      ...updatedBranch,
      address: {
        ...updatedBranch.address,
        lat: position[0],
        lon: position[1],
      },
    };
    if (isAdding) {
      try {
        setBranches([...branches.slice(0, -1), finalBranch]);
        await api.post(
          `/branch/create-branch`,
          { data: finalBranch },
          {
            headers: {
              Authorization: 'Bearer ' + session.data?.user.access_token,
            },
          },
        );
        alert('success');
        setBranches([...branches.slice(0, -1), updatedBranch]);
        setIsAdding(false);
      } catch (error) {
        console.error('Error creating branch:', error);
      }
    } else {
      try {
        await api.put(
          `/branch/update-branch`,
          { data: finalBranch },
          {
            headers: {
              Authorization: 'Bearer ' + session.data?.user.access_token,
            },
          },
        );
        setBranches(
          branches.map((branch) =>
            branch.id === updatedBranch.id ? updatedBranch : branch,
          ),
        );
      } catch (error) {
        console.error('Error updating branch:', error);
      }
    }
    setSelectedBranch(updatedBranch);
    setIsEditing(false);
  };

  const handleDeleteBranch = async (id: number) => {
    try {
      await api.put(
        `branch/delete-branch/${id}`,
        {},
        {
          headers: {
            Authorization: 'Bearer ' + session.data?.user.access_token,
          },
        },
      );
      setBranches(branches.filter((branch) => branch.id !== id));
      setSelectedBranch(null);
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <BranchList
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchClick={handleBranchClick}
          onAddBranch={handleAddBranch}
          isAdding={isAdding}
          session={session && session}
        />
        {selectedBranch && (
          <BranchDetails
            branch={selectedBranch}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onSave={handleSaveBranch}
            onCancel={handleCancelAdd}
            onDelete={handleDeleteBranch}
            session={session}
            provinces={provinces}
            cities={cities}
            admins={branchAdmin}
            position={position}
            setPosition={setPosition}
          />
        )}
      </div>
    </div>
  );
}
