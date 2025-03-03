'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDrop, useDrag } from 'react-dnd';
import { Charm, PhoneModel, PhoneColor } from '@/types/case-customizer';
import { Trash2 } from 'lucide-react';

export interface CasePreviewProps {
  phoneModel: PhoneModel;
  phoneColor: PhoneColor | null;
  placedCharms: Array<{ id: string; charm: Charm; position: { x: number; y: number }; rotation?: number }>;
  onCharmPlaced: (charm: Charm, position: { x: number; y: number }) => void;
  onCharmRemoved: (charmId: string) => void;
  onCharmPositionUpdated: (charmId: string, newPosition: { x: number; y: number }) => void;
  onCharmRotationUpdated?: (charmId: string, newRotation: number) => void;
}

// iPhone 13 Pro viewport dimensions
const IPHONE_13_PRO = {
  viewport: { width: 390, height: 844 },
  camera: { width: 147, height: 155 },
  appleLogo: { width: 82, height: 52 },
  // Add charm dimensions - width is about 2/3 of camera width
  charm: { width: 98, height: 49 }
};

export function CasePreview({ 
  phoneModel, 
  phoneColor,
  placedCharms, 
  onCharmPlaced, 
  onCharmRemoved,
  onCharmPositionUpdated,
  onCharmRotationUpdated
}: CasePreviewProps) {
  // Get the viewport dimensions for the iPhone 13 Pro
  const getPhoneDimensions = () => {
    // Scale down to fit in the UI (about 60% of original size)
    const scaleFactor = 0.5;
    return {
      width: Math.round(IPHONE_13_PRO.viewport.width * scaleFactor),
      height: Math.round(IPHONE_13_PRO.viewport.height * scaleFactor)
    };
  };
  
  // Calculate camera dimensions based on the same scale factor
  const getCameraDimensions = () => {
    const scaleFactor = 0.6;
    return {
      width: Math.round(IPHONE_13_PRO.camera.width * scaleFactor),
      height: Math.round(IPHONE_13_PRO.camera.height * scaleFactor)
    };
  };
  
  // Calculate Apple logo dimensions based on the same scale factor
  const getAppleLogoDimensions = () => {
    const scaleFactor = 0.6;
    return {
      width: Math.round(IPHONE_13_PRO.appleLogo.width * scaleFactor),
      height: Math.round(IPHONE_13_PRO.appleLogo.height * scaleFactor)
    };
  };
  
  const dimensions = getPhoneDimensions();
  const cameraDimensions = getCameraDimensions();
  const appleLogoDimensions = getAppleLogoDimensions();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedCharm, setDraggedCharm] = useState<Charm | null>(null);
  
  // Make the phone case a drop target for charms
  const [{ isOver }, drop] = useDrop({
    accept: ['charm', 'placed-charm'],
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
    drop: (item: any, monitor) => {
      // Get drop position relative to the container
      const dropOffset = monitor.getClientOffset();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (dropOffset && containerRect) {
        // Calculate position relative to the container
        const x = dropOffset.x - containerRect.left;
        const y = dropOffset.y - containerRect.top;
        
        // If it's a new charm being added
        if (item.type === 'charm') {
          onCharmPlaced(item.charm, { x, y });
        }
      }
      
      return { dropped: true };
    },
  });
  
  // Track global drag state for visual feedback
  useEffect(() => {
    const handleGlobalDragStart = (e: Event) => {
      const dragEvent = e as DragEvent;
      const target = dragEvent.target as HTMLElement;
      
      // Check if we're dragging a charm
      if (target.dataset.dragType === 'charm') {
        const charmId = target.closest('[data-charm-id]')?.getAttribute('data-charm-id');
        if (charmId) {
          // Since we don't have access to all charms here, just set dragging state
          setIsDraggingOver(true);
        }
      }
    };
    
    const handleGlobalDragEnd = () => {
      setIsDraggingOver(false);
      setDraggedCharm(null);
    };
    
    // Add global event listeners
    document.addEventListener('dragstart', handleGlobalDragStart);
    document.addEventListener('dragend', handleGlobalDragEnd);
    
    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
      document.removeEventListener('dragend', handleGlobalDragEnd);
    };
  }, []);
  
  // Handle removing all charms when trash is clicked
  const handleRemoveAllCharms = () => {
    if (placedCharms.length === 0) return;
    
    // Create a copy of the array to avoid issues with forEach and simultaneous removal
    const charmsToRemove = [...placedCharms];
    charmsToRemove.forEach(charm => {
      onCharmRemoved(charm.id);
    });
  };
  
  // Handle trash bin functionality
  const [{ isOverTrash }, trashDrop] = useDrop({
    accept: 'placed-charm',
    collect: (monitor) => ({
      isOverTrash: !!monitor.isOver(),
    }),
    drop: (item: { id: string }) => {
      onCharmRemoved(item.id);
      return { dropped: true };
    },
  });
  
  // Function to darken a color by a percentage
  const darkenColor = (color: string, percent: number) => {
    // Remove the # if present
    const hex = color.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate darker values
    const darkerR = Math.floor(r * (1 - percent / 100));
    const darkerG = Math.floor(g * (1 - percent / 100));
    const darkerB = Math.floor(b * (1 - percent / 100));
    
    // Convert back to hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };
  
  // Get camera color based on phone color
  const getCameraColor = () => {
    if (!phoneColor) return '#1a1a1a'; // Default dark color
    
    // For very dark colors, use a slightly lighter shade
    if (phoneColor.name === 'graphite' || phoneColor.name === 'midnight') {
      return '#2a2a2a';
    }
    
    // For other colors, darken the phone color by 40%
    return darkenColor(phoneColor.colorCode, 40);
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px]">
      {/* Phone case container */}
      <div 
        ref={(node) => {
          drop(node as any);
          containerRef.current = node;
        }}
        id="phone-case"
        className="relative overflow-hidden"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          boxSizing: 'border-box',
          borderRadius: '40px',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* iPhone body with selected color */}
        <div 
          className="absolute inset-0 rounded-[40px]"
          style={{
            backgroundColor: phoneColor?.colorCode || '#e2e2e7', // Default to silver if no color selected
            border: '2px solid #d1d1d6',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1
          }}
        />
        
        {/* Transparent case overlay */}
        <div 
          className="absolute inset-0 rounded-[40px]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
            border: isDraggingOver || isOver ? '2px dashed #3b82f6' : '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(1px)',
            zIndex: 10
          }}
        />

        {/* Camera module - now with color matching the phone */}
        <div 
          className="absolute rounded-2xl"
          style={{
            width: cameraDimensions.width,
            height: cameraDimensions.height,
            left: '10%',
            top: '3%',
            backgroundColor: getCameraColor(),
            zIndex: 5
          }}
        >
          {/* Camera lenses */}
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="bg-black rounded-full aspect-square" style={{ boxShadow: 'inset 0 0 2px 1px rgba(0,0,0,0.5)' }}></div>
            <div className="bg-black rounded-full aspect-square" style={{ boxShadow: 'inset 0 0 2px 1px rgba(0,0,0,0.5)' }}></div>
            <div className="bg-black rounded-full aspect-square" style={{ boxShadow: 'inset 0 0 2px 1px rgba(0,0,0,0.5)' }}></div>
            <div className="bg-black rounded-full aspect-square" style={{ boxShadow: 'inset 0 0 2px 1px rgba(0,0,0,0.5)' }}></div>
          </div>
        </div>
        
        {/* Apple logo - adjust color based on phone color */}
        <div 
          className="absolute"
          style={{
            width: appleLogoDimensions.width,
            height: appleLogoDimensions.height,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5
          }}
        >
          <svg viewBox="0 0 170 170" fill={phoneColor?.name === 'graphite' || phoneColor?.name === 'midnight' ? '#e2e2e2' : '#999'} xmlns="http://www.w3.org/2000/svg">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.24z"/>
          </svg>
        </div>
        
        {/* Placed charms - now with higher z-index to appear above the transparent case */}
        {placedCharms.map((placedCharm) => (
          <PlacedCharmItem 
            key={placedCharm.id} 
            placedCharm={placedCharm} 
            onPositionUpdated={onCharmPositionUpdated}
            onRotationUpdated={onCharmRotationUpdated}
          />
        ))}
      </div>
      
      {/* Rotation instructions */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>Tip: Hold Shift + drag to rotate charms</p>
      </div>
      
      {/* Trash bin for removing charms */}
      <div 
        ref={trashDrop as any}
        className="mt-6 p-4 rounded-lg border-2 cursor-pointer flex items-center justify-center"
        style={{
          borderColor: isOverTrash ? '#ef4444' : '#e5e7eb',
          backgroundColor: isOverTrash ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
        data-trash-bin="true"
        onClick={handleRemoveAllCharms}
      >
        <Trash2 
          size={24} 
          color={isOverTrash ? '#ef4444' : '#6b7280'} 
        />
        <span className="ml-2 text-sm font-medium">
          Clear
        </span>
      </div>
    </div>
  );
}

interface PlacedCharmItemProps {
  placedCharm: { id: string; charm: Charm; position: { x: number; y: number }; rotation?: number };
  onPositionUpdated: (id: string, newPosition: { x: number; y: number }) => void;
  onRotationUpdated?: (id: string, newRotation: number) => void;
}

function PlacedCharmItem({ placedCharm, onPositionUpdated, onRotationUpdated }: PlacedCharmItemProps) {
  const { id, charm, position, rotation = 0 } = placedCharm;
  const previewRef = useRef<HTMLImageElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(rotation);
  
  // Get the scaled charm dimensions, using custom dimensions if provided
  const getCharmDimensions = () => {
    const scaleFactor = 0.6; // Same scale factor as used for the phone
    
    // Use custom dimensions from the charm object if provided, otherwise use default
    const baseWidth = charm.width || IPHONE_13_PRO.charm.width;
    const baseHeight = charm.height || IPHONE_13_PRO.charm.height;
    
    return {
      width: Math.round(baseWidth * scaleFactor),
      height: Math.round(baseHeight * scaleFactor)
    };
  };
  
  const charmDimensions = getCharmDimensions();
  
  // Create a fixed-size preview image for dragging
  useEffect(() => {
    if (!previewRef.current) {
      previewRef.current = document.createElement('img');
      previewRef.current.src = charm.imageUrl;
      previewRef.current.width = charmDimensions.width;
      previewRef.current.height = charmDimensions.height;
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
  }, [charm.imageUrl, charmDimensions.width, charmDimensions.height]);
  
  // Handle manual dragging without react-dnd
  useEffect(() => {
    if (!imageRef.current) return;
    
    let startX = 0;
    let startY = 0;
    let isDraggingElement = false;
    
    const handleMouseDown = (e: MouseEvent) => {
      // If user is holding Shift key, start rotation instead of dragging
      if (e.shiftKey) {
        e.preventDefault();
        setIsRotating(true);
        return;
      }
      
      isDraggingElement = true;
      setIsDragging(true);
      startX = e.clientX - position.x;
      startY = e.clientY - position.y;
      
      // Prevent default behavior
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isRotating) {
        // Handle rotation
        if (imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Calculate angle between center of element and mouse position
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          const degrees = angle * (180 / Math.PI) + 90; // +90 to make it feel more natural
          
          setCurrentRotation(degrees);
          
          if (imageRef.current) {
            imageRef.current.style.transform = `rotate(${degrees}deg)`;
          }
        }
        return;
      }
      
      if (!isDraggingElement) return;
      
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      // Update position directly for smooth dragging
      if (imageRef.current) {
        imageRef.current.style.left = `${newX}px`;
        imageRef.current.style.top = `${newY}px`;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (isRotating) {
        setIsRotating(false);
        // Update rotation in parent component if callback exists
        if (onRotationUpdated) {
          onRotationUpdated(id, currentRotation);
        }
        return;
      }
      
      if (!isDraggingElement) return;
      
      isDraggingElement = false;
      setIsDragging(false);
      
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      // Check if we're dropping on the trash
      const trashElement = document.querySelector('[data-trash-bin="true"]');
      if (trashElement) {
        const trashRect = trashElement.getBoundingClientRect();
        if (
          e.clientX >= trashRect.left && 
          e.clientX <= trashRect.right && 
          e.clientY >= trashRect.top && 
          e.clientY <= trashRect.bottom
        ) {
          // We're over the trash, don't update position
          return;
        }
      }
      
      // Update position in parent component
      onPositionUpdated(id, { x: newX, y: newY });
    };
    
    // Add event listeners
    imageRef.current.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, position.x, position.y, onPositionUpdated, isRotating, onRotationUpdated, currentRotation]);
  
  // Make placed charms draggable for repositioning with react-dnd (for trash bin)
  const [, drag] = useDrag({
    type: 'placed-charm',
    item: { id, type: 'placed-charm' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Combine refs
  const combinedRef = (node: HTMLDivElement | null) => {
    drag(node);
    imageRef.current = node;
  };

  return (
    <div
      ref={combinedRef}
      className="absolute cursor-move"
      style={{
        left: position.x,
        top: position.y,
        opacity: isDragging ? 0.5 : 1,
        width: charmDimensions.width,
        height: charmDimensions.height,
        zIndex: 20,
        touchAction: 'none',
        transform: `rotate(${currentRotation}deg)`,
        transformOrigin: 'center center',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      }}
      data-charm-id={id}
    >
      <Image
        src={charm.imageUrl}
        alt={charm.name}
        fill
        style={{ objectFit: 'contain', pointerEvents: 'none' }}
        draggable={false}
      />
      
      {/* Rotation indicator - only show when actively rotating */}
      {isRotating && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
        </div>
      )}
      
      {/* Rotation instructions tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Hold Shift + drag to rotate
      </div>
    </div>
  );
} 