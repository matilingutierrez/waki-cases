'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDrop, useDrag } from 'react-dnd';
import { Charm, PhoneModel } from '@/types/case-customizer';
import { Trash2 } from 'lucide-react';

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
  const [previewDimensions] = useState({ width: 240, height: 480 });
  const [isDraggingCharm, setIsDraggingCharm] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const caseContainerRef = useRef<HTMLDivElement>(null);
  
  // Reference to the drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['charm', 'placed-charm'],
    drop: (item: { charm?: Charm; id?: string; type?: string }, monitor) => {
      const dropOffset = monitor.getClientOffset();
      const containerRect = document.getElementById('case-preview-container')?.getBoundingClientRect();
      
      if (!dropOffset || !containerRect) return undefined;
      
      // Calculate position relative to the container
      const phoneRect = document.getElementById('phone-case')?.getBoundingClientRect();
      if (!phoneRect) return undefined;
      
      // Calculate position relative to the phone case
      const x = ((dropOffset.x - phoneRect.left) / phoneRect.width) * 100;
      const y = ((dropOffset.y - phoneRect.top) / phoneRect.height) * 100;
      
      // Ensure the charm is placed within the container bounds
      const boundedX = Math.max(10, Math.min(90, x));
      const boundedY = Math.max(10, Math.min(90, y));
      
      // If it's a new charm being placed
      if (item.charm && !item.id) {
        onCharmPlaced(item.charm, { x: boundedX, y: boundedY });
      }
      
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Trash bin drop target - positioned outside the case
  const [{ isOverTrash }, trashDrop] = useDrop({
    accept: 'placed-charm',
    drop: (item: { id: string }) => {
      if (item.id) {
        onCharmRemoved(item.id);
        // Reset drag state after removing a charm
        setIsDraggingCharm(false);
      }
      return undefined;
    },
    hover: () => {
      setTrashHovered(true);
    },
    collect: (monitor) => ({
      isOverTrash: !!monitor.isOver(),
    }),
  });

  // Monitor global drag state to show/hide trash bin
  useEffect(() => {
    // Force the trash bin to be visible during drag operations
    const handleGlobalDragStart = (e: Event) => {
      // Check if we're dragging a charm or placed charm
      const target = e.target as HTMLElement;
      if (target && (
          target.closest('[data-drag-type="charm"]') || 
          target.closest('[data-drag-type="placed-charm"]')
      )) {
        setIsDraggingCharm(true);
      }
    };
    
    const handleGlobalDragEnd = () => {
      setIsDraggingCharm(false);
      setTrashHovered(false);
    };

    document.addEventListener('dragstart', handleGlobalDragStart);
    document.addEventListener('dragend', handleGlobalDragEnd);

    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);

  // Determine if the phone is an iPhone to show the Apple logo
  const isIPhone = phoneModel.name.toLowerCase().includes('iphone');

  // Show drop indicator when dragging over the case
  const dropIndicatorClass = isOver && canDrop ? 'bg-blue-50' : '';

  return (
    <div className="relative w-full flex flex-col" style={{ minHeight: '520px' }} ref={containerRef}>
      {/* Case preview container */}
      <div 
        id="case-preview-container"
        ref={(node) => {
          drop(node as any);
          caseContainerRef.current = node;
        }}
        className={`relative w-full flex-1 flex items-center justify-center ${dropIndicatorClass}`}
      >
        {/* Phone case container */}
        <div 
          id="phone-case"
          className="relative border-2 border-gray-300 rounded-[30px] overflow-hidden bg-white"
          style={{ width: previewDimensions.width, height: previewDimensions.height }}
        >
          {/* Phone back design */}
          <div className="absolute inset-0 flex flex-col items-center">
            {/* Camera module for iPhone models */}
            {isIPhone && (
              <div className="absolute top-3 left-3 w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-5 h-5 bg-black rounded-full"></div>
                  <div className="w-5 h-5 bg-black rounded-full"></div>
                  <div className="w-5 h-5 bg-black rounded-full"></div>
                  {phoneModel.name.includes('Pro') && (
                    <div className="w-5 h-5 bg-black rounded-full"></div>
                  )}
                </div>
              </div>
            )}
            
            {/* Camera for Samsung models */}
            {phoneModel.name.toLowerCase().includes('samsung') && (
              <div className="absolute top-3 left-3 w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="grid grid-cols-1 gap-2">
                  <div className="w-5 h-5 bg-black rounded-full"></div>
                  <div className="w-5 h-5 bg-black rounded-full"></div>
                  <div className="w-5 h-5 bg-black rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Camera for Pixel models */}
            {phoneModel.name.toLowerCase().includes('pixel') && (
              <div className="absolute top-3 left-3 w-16 h-6 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                </div>
              </div>
            )}
            
            {/* Apple logo for iPhone models */}
            {isIPhone && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-gray-400 text-3xl">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.66 4.22-3.74 4.25z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Placed charms */}
          {placedCharms.map((placedCharm) => (
            <PlacedCharmItem
              key={placedCharm.id}
              placedCharm={placedCharm}
              onPositionUpdated={onCharmPositionUpdated}
            />
          ))}
        </div>
      </div>
      
      {/* Trash bin - positioned below the case */}
      <div 
        ref={trashDrop as any}
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 p-3 rounded-full 
          ${isOverTrash ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'} 
          transition-all duration-200 cursor-pointer ${isDraggingCharm ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ 
          width: '50px', 
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOverTrash ? '0 0 10px rgba(239, 68, 68, 0.5)' : '0 2px 5px rgba(0,0,0,0.1)',
          zIndex: 30
        }}
      >
        <Trash2 size={24} />
      </div>
    </div>
  );
}

interface PlacedCharmItemProps {
  placedCharm: { id: string; charm: Charm; position: { x: number; y: number } };
  onPositionUpdated: (id: string, newPosition: { x: number; y: number }) => void;
}

function PlacedCharmItem({ placedCharm, onPositionUpdated }: PlacedCharmItemProps) {
  const { id, charm, position } = placedCharm;
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
  
  // Make placed charms draggable for repositioning
  const [{ isDragging }, drag] = useDrag({
    type: 'placed-charm',
    item: { id, type: 'placed-charm' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
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
  }, [id]);
  
  // Allow dropping placed charms to reposition them
  const [, drop] = useDrop({
    accept: 'placed-charm',
    hover: (item: { id: string }, monitor) => {
      // Only handle if it's the same charm (for repositioning)
      if (item.id !== id) return;
      
      const dropOffset = monitor.getClientOffset();
      const phoneRect = document.getElementById('phone-case')?.getBoundingClientRect();
      
      if (dropOffset && phoneRect) {
        // Calculate new position relative to the phone case
        const x = ((dropOffset.x - phoneRect.left) / phoneRect.width) * 100;
        const y = ((dropOffset.y - phoneRect.top) / phoneRect.height) * 100;
        
        // Ensure the charm stays within bounds
        const boundedX = Math.max(10, Math.min(90, x));
        const boundedY = Math.max(10, Math.min(90, y));
        
        // Update position directly for instant feedback
        onPositionUpdated(id, { x: boundedX, y: boundedY });
      }
    },
  });
  
  return (
    <div
      ref={(node) => {
        // Apply both drag and drop refs to the same element
        drag(drop(node) as any);
        elementRef.current = node;
      }}
      className="absolute cursor-move"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        opacity: isDragging ? 0.5 : 1,
        zIndex: 20,
      }}
      data-dragging={isDragging}
      data-drag-type="placed-charm"
      data-charm-id={id}
    >
      <div className="relative" style={{ width: '40px', height: '40px' }}>
        <Image
          src={charm.imageUrl}
          alt={charm.name}
          width={40}
          height={40}
          className="object-contain"
          draggable="true"
        />
      </div>
    </div>
  );
} 