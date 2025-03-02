'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useDrop, useDrag } from 'react-dnd';
import { Charm, PhoneModel } from '@/types/case-customizer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface CasePreviewProps {
  phoneModel: PhoneModel;
  placedCharms: Array<{ id: string; charm: Charm; position: { x: number; y: number } }>;
  onCharmPlaced: (charm: Charm, position: { x: number; y: number }) => void;
  onCharmRemoved: (charmId: string) => void;
  onCharmPositionUpdated: (charmId: string, newPosition: { x: number; y: number }) => void;
}

export function CasePreview({ 
  phoneModel, 
  placedCharms, 
  onCharmPlaced, 
  onCharmRemoved,
  onCharmPositionUpdated
}: CasePreviewProps) {
  const [previewDimensions, setPreviewDimensions] = useState({ width: 300, height: 600 });
  
  // Reference to the drop target
  const [{ isOver }, drop] = useDrop({
    accept: 'charm',
    drop: (item: { charm: Charm }, monitor) => {
      const dropOffset = monitor.getClientOffset();
      const containerRect = document.getElementById('case-preview-container')?.getBoundingClientRect();
      
      if (dropOffset && containerRect) {
        // Calculate position relative to the container
        const x = ((dropOffset.x - containerRect.left) / containerRect.width) * 100;
        const y = ((dropOffset.y - containerRect.top) / containerRect.height) * 100;
        
        onCharmPlaced(item.charm, { x, y });
      }
      
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      id="case-preview-container"
      ref={drop as any} 
      className={`relative w-full h-full flex items-center justify-center ${isOver ? 'bg-blue-50' : ''}`}
    >
      {/* Phone case image */}
      <div className="relative">
        <Image
          src={phoneModel.caseImageUrl}
          alt={`${phoneModel.name} case`}
          width={previewDimensions.width}
          height={previewDimensions.height}
          className="object-contain"
        />
        
        {/* Placed charms */}
        {placedCharms.map((placedCharm) => (
          <PlacedCharmItem
            key={placedCharm.id}
            placedCharm={placedCharm}
            onRemove={onCharmRemoved}
            onPositionUpdated={onCharmPositionUpdated}
          />
        ))}
      </div>
    </div>
  );
}

interface PlacedCharmItemProps {
  placedCharm: { id: string; charm: Charm; position: { x: number; y: number } };
  onRemove: (id: string) => void;
  onPositionUpdated: (id: string, newPosition: { x: number; y: number }) => void;
}

function PlacedCharmItem({ placedCharm, onRemove, onPositionUpdated }: PlacedCharmItemProps) {
  const { id, charm, position } = placedCharm;
  
  // Make placed charms draggable for repositioning
  const [{ isDragging }, drag] = useDrag({
    type: 'placed-charm',
    item: { id, type: 'placed-charm' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Allow dropping placed charms to reposition them
  const [, drop] = useDrop({
    accept: 'placed-charm',
    hover: (item: { id: string }, monitor) => {
      // Only handle if it's the same charm (for repositioning)
      if (item.id !== id) return;
      
      const dropOffset = monitor.getClientOffset();
      const containerRect = document.getElementById('case-preview-container')?.getBoundingClientRect();
      
      if (dropOffset && containerRect) {
        // Calculate new position relative to the container
        const x = ((dropOffset.x - containerRect.left) / containerRect.width) * 100;
        const y = ((dropOffset.y - containerRect.top) / containerRect.height) * 100;
        
        // Update position directly for instant feedback
        onPositionUpdated(id, { x, y });
      }
    },
  });
  
  return (
    <div
      ref={(node) => {
        // Apply both drag and drop refs to the same element
        drag(drop(node) as any);
      }}
      className="absolute cursor-move"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: isDragging ? 0.5 : 1,
        zIndex: 10,
      }}
    >
      <div className="relative group">
        <Image
          src={charm.imageUrl}
          alt={charm.name}
          width={50}
          height={50}
          className="object-contain"
        />
        
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onRemove(id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 