'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check } from 'lucide-react';

interface SetMainAddressButtonProps {
  isMainAddress: boolean;
  onSetMainAddress: () => void;
}

export default function SetMainAddressButton({
  isMainAddress,
  onSetMainAddress,
}: SetMainAddressButtonProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSetMainAddress = () => {
    setIsPopoverOpen(false);
    onSetMainAddress();
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isMainAddress ? 'default' : 'outline'}
          disabled={isMainAddress}
          className={`w-fit text-xs md:text-sm px-3 mx-3 ${!isMainAddress && 'mx-2'}`}
        >
          {isMainAddress ? (
            <div className=" flex items-center">
              {/* <div className=" flex items-center text-green-800 bg-green-100"> */}
              <Check className="mr-1 h-4 w-4 md:mr-2 md:h-4 md:w-4" /> Main
              address
            </div>
          ) : (
            'Set as main address'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Confirm Main Address</h4>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to set this as your main address?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setIsPopoverOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetMainAddress}>Confirm</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
