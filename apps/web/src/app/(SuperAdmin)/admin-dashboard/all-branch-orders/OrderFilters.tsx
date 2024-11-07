import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { api } from '@/config/axios.config';
import { useSession } from 'next-auth/react';

type Branch = {
  id: number;
  branch_name: string;
};

interface Filters {
  status: string;
  date: string;
  branch: string;
  search: string;
}

interface OrderFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export function OrderFilters({ filters, setFilters }: OrderFiltersProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const session = useSession();

  useEffect(() => {
    fetchBranches();
  }, [session]);

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branch/get-all-branch', {
        headers: {
          Authorization: 'Bearer ' + session?.data?.user.access_token,
        },
      });
      if (response.data && response.data.data) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Input
          type="text"
          placeholder="Search orders..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full max-w-xs"
        />
        <Select
          onValueChange={(value) => setFilters({ ...filters, date: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by Date" />
          </SelectTrigger>
          <SelectContent className="max-w-[90vw]">
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="this_year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        {session.data?.user.roleId === 2 && (
          <Select
            value={filters.branch}
            onValueChange={(value) => setFilters({ ...filters, branch: value })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Branch" />
            </SelectTrigger>
            <SelectContent className="max-w-[90vw]">
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.branch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="max-w-[90vw]">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="awaiting_confirmation">
              Awaiting Confirmation
            </SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
