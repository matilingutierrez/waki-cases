'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDrag } from 'react-dnd';
import { Charm } from '@/types/case-customizer';
import { Skeleton } from '@/components/ui/skeleton';

// iPhone 13 Pro charm dimensions - same as in case-preview.tsx
const CHARM_DIMENSIONS = {
  width: 75,
  height: 75
};

// Scale factor for display
const SCALE_FACTOR = 0.6;

export interface CharmSelectorProps {
  charms: Charm[];
  isLoading?: boolean;
}

export function CharmSelector({ charms, isLoading = false }: CharmSelectorProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Select Charms</h3>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="w-full aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Select Charms</h3>
      <div className="grid grid-cols-3 gap-4">
        {charms.map((charm) => (
          <CharmItem key={charm.id} charm={charm} />
        ))}
      </div>
    </div>
  );
}

interface CharmItemProps {
  charm: Charm;
}

function CharmItem({ charm }: CharmItemProps) {
  const previewRef = useRef<HTMLImageElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  
  // Use fixed dimensions for all charms in the selector
  const getCharmDimensions = () => {
    // Always use the default dimensions for the selector view
    return {
      width: Math.round(CHARM_DIMENSIONS.width * SCALE_FACTOR),
      height: Math.round(CHARM_DIMENSIONS.height * SCALE_FACTOR)
    };
  };
  
  const charmDimensions = getCharmDimensions();
  
  // Create a fixed-size preview image for dragging
  useEffect(() => {
    if (!previewRef.current) {
      previewRef.current = document.createElement('img');
      previewRef.current.src = charm.imageUrl;
      
      // For the drag preview, use custom dimensions if provided
      const previewWidth = charm.width ? Math.round(charm.width * SCALE_FACTOR) : charmDimensions.width;
      const previewHeight = charm.height ? Math.round(charm.height * SCALE_FACTOR) : charmDimensions.height;
      
      previewRef.current.width = previewWidth;
      previewRef.current.height = previewHeight;
      previewRef.current.style.objectFit = 'contain';
      previewRef.current.style.opacity = '1';
      document.body.appendChild(previewRef.current);
      previewRef.current.style.display = 'none';
    }
    
    return () => {
      if (previewRef.current) {
        document.body.removeChild(previewRef.current);
        previewRef.current = null;
      }
    };
  }, [charm.imageUrl, charm.width, charm.height, charmDimensions.width, charmDimensions.height]);

  // Make charm draggable
  const [{ isDragging }, drag] = useDrag({
    type: 'charm',
    item: { charm, type: 'charm' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    options: {
      dropEffect: 'copy',
    },
  });
  
  // Handle drag start to set custom preview
  useEffect(() => {
    const handleDragStart = (e: Event) => {
      if (!previewRef.current) return;
      
      // Use our pre-created image for the drag preview
      const dragEvent = e as DragEvent;
      if (dragEvent.dataTransfer) {
        previewRef.current.style.display = 'block';
        
        // For the drag preview, use custom dimensions if provided
        const previewWidth = charm.width ? Math.round(charm.width * SCALE_FACTOR) : charmDimensions.width;
        const previewHeight = charm.height ? Math.round(charm.height * SCALE_FACTOR) : charmDimensions.height;
        
        dragEvent.dataTransfer.setDragImage(
          previewRef.current, 
          previewWidth / 2, 
          previewHeight / 2
        );
        
        // Hide the preview after a short delay
        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.style.display = 'none';
          }
        }, 0);
      }
    };
    
    // Add event listener to our element
    if (imageRef.current) {
      imageRef.current.addEventListener('dragstart', handleDragStart);
    }
    
    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('dragstart', handleDragStart);
      }
    };
  }, [charm.width, charm.height, charmDimensions.width, charmDimensions.height]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={(node) => {
          drag(node as any);
          imageRef.current = node;
        }}
        className={`relative cursor-grab ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        style={{
          width: charmDimensions.width,
          height: charmDimensions.height
        }}
      >
        <Image
          src={charm.imageUrl}
          alt={charm.name}
          fill
          style={{ objectFit: 'contain' }}
          draggable
        />
      </div>
      <div className="mt-2 text-center">
        <p className="font-medium">{charm.name}</p>
        <p className="text-sm text-gray-500">${charm.price.toFixed(2)}</p>
      </div>
    </div>
  );
} 