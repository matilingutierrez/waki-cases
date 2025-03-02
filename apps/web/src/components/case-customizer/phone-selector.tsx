'use client';

import { PhoneModel } from '@/types/case-customizer';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export interface PhoneSelectorProps {
  phoneModels: PhoneModel[];
  selectedPhone: PhoneModel | null;
  onSelect: (phone: PhoneModel) => void;
  isLoading: boolean;
}

export function PhoneSelector({ 
  phoneModels, 
  selectedPhone, 
  onSelect, 
  isLoading 
}: PhoneSelectorProps) {
  
  const handleSelectChange = (value: string) => {
    const selectedPhone = phoneModels.find(phone => phone.id === value);
    if (selectedPhone) {
      onSelect(selectedPhone);
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-10" />;
  }

  return (
    <div className="w-full">
      <Select 
        value={selectedPhone?.id} 
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a phone model" />
        </SelectTrigger>
        <SelectContent>
          {phoneModels.map((phone) => (
            <SelectItem key={phone.id} value={phone.id}>
              {phone.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 