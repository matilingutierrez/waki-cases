'use client';

import Image from 'next/image';
import { PhoneModel } from '@/types/case-customizer';
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
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="w-full aspect-[9/16] rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {phoneModels.map((phone) => (
        <div
          key={phone.id}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedPhone?.id === phone.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
          }`}
          onClick={() => onSelect(phone)}
        >
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-[9/16] mb-2">
              <Image
                src={phone.caseImageUrl}
                alt={phone.name}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-center font-medium">{phone.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 