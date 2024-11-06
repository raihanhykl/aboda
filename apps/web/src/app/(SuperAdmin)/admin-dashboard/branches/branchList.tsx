import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IBranch } from '@/interfaces/branch';

interface BranchListProps {
  branches: IBranch[];
  selectedBranch: IBranch | null;
  onBranchClick: (branch: IBranch) => void;
  onAddBranch: () => void;
  isAdding: boolean;
}

export default function BranchList({
  branches,
  selectedBranch,
  onBranchClick,
  onAddBranch,
  isAdding,
}: BranchListProps) {
  return (
    <Card className="w-full lg:w-1/3">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Branches
          <Button size="icon" onClick={onAddBranch} disabled={isAdding}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {branches.map((branch) => (
            <li
              key={branch.id}
              onClick={() => onBranchClick(branch)}
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
  );
}
