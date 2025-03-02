'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDrag } from 'react-dnd';
import { Charm } from '@/types/case-customizer';
import { Skeleton } from '@/components/ui/skeleton';

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
  const elementRef = useRef<HTMLDivElement | null>(null);
  
  // Create a fixed-size preview image for dragging
  useEffect(() => {
    if (!previewRef.current) {
      previewRef.current = document.createElement('img');
      previewRef.current.src = charm.imageUrl;
      previewRef.current.width = 40;
      previewRef.current.height = 40;
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
  }, [charm.imageUrl]);

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
        dragEvent.dataTransfer.setDragImage(previewRef.current, 20, 20);
        
        // Hide the preview after a short delay
        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.style.display = 'none';
          }
        }, 0);
      }
    };
    
    // Add event listener to our element
    if (elementRef.current) {
      elementRef.current.addEventListener('dragstart', handleDragStart);
    }
    
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('dragstart', handleDragStart);
      }
    };
  }, [charm.id]);

  return (
    <div
      ref={(node) => {
        drag(node as any);
        elementRef.current = node;
      }}
      className={`flex flex-col items-center p-2 rounded-lg cursor-move transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      data-drag-type="charm"
    >
      <div className="relative w-16 h-16 mb-2">
        <Image
          src={charm.imageUrl}
          alt={charm.name}
          fill
          className="object-contain"
          draggable="true"
        />
      </div>
      <span className="text-sm text-center">{charm.name}</span>
      <span className="text-xs text-gray-500">${charm.price.toFixed(2)}</span>
    </div>
  );
} 