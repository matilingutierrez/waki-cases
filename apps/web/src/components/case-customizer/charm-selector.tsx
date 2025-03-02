'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useDrag } from 'react-dnd';
import { Charm } from '@/types/case-customizer';
import { Skeleton } from '@/components/ui/skeleton';

export interface CharmSelectorProps {
  charms: Charm[];
  isLoading: boolean;
}

export function CharmSelector({ charms, isLoading }: CharmSelectorProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="w-full aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {charms.map((charm) => (
        <CharmItem key={charm.id} charm={charm} />
      ))}
    </div>
  );
}

interface CharmItemProps {
  charm: Charm;
}

function CharmItem({ charm }: CharmItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'charm',
    item: { charm },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Create a custom drag preview
  useEffect(() => {
    // This effect is for custom drag preview, but we'll use the default
    // behavior for simplicity and to avoid browser compatibility issues
  }, []);

  return (
    <div
      ref={drag as any}
      className={`p-2 border rounded-md cursor-grab transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-square mb-2">
          <Image
            src={charm.imageUrl}
            alt={charm.name}
            fill
            className="object-contain"
          />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">{charm.name}</p>
          <p className="text-xs text-gray-500">${charm.price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
} 