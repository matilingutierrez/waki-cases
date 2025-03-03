'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDrag } from 'react-dnd';
import { Charm } from '@/types/case-customizer';
import { Skeleton } from '@/components/ui/skeleton';

// Dimensiones del dije para iPhone 13 Pro - igual que en case-preview.tsx
const CHARM_DIMENSIONS = {
  width: 75,
  height: 75
};

// Factor de escala para visualización
const SCALE_FACTOR = 0.6;

export interface CharmSelectorProps {
  charms: Charm[];
  isLoading?: boolean;
}

export function CharmSelector({ charms, isLoading = false }: CharmSelectorProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Seleccionar Charms</h3>
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
      <h3 className="text-lg font-medium mb-4">Seleccionar Charms</h3>
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
  
  // Usar dimensiones fijas para todos los dijes en el selector
  const getCharmDimensions = () => {
    // Siempre usar las dimensiones predeterminadas para la vista del selector
    return {
      width: Math.round(CHARM_DIMENSIONS.width * SCALE_FACTOR),
      height: Math.round(CHARM_DIMENSIONS.height * SCALE_FACTOR)
    };
  };
  
  const charmDimensions = getCharmDimensions();
  
  // Crear una imagen de vista previa de tamaño fijo para arrastrar
  useEffect(() => {
    if (!previewRef.current) {
      previewRef.current = document.createElement('img');
      previewRef.current.src = charm.imageUrl;
      
      // Para la vista previa de arrastre, usar dimensiones personalizadas si se proporcionan
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

  // Hacer que el dije sea arrastrable
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
  
  // Manejar el inicio del arrastre para establecer una vista previa personalizada
  useEffect(() => {
    const handleDragStart = (e: Event) => {
      if (!previewRef.current) return;
      
      // Usar nuestra imagen pre-creada para la vista previa de arrastre
      const dragEvent = e as DragEvent;
      if (dragEvent.dataTransfer) {
        previewRef.current.style.display = 'block';
        
        // Para la vista previa de arrastre, usar dimensiones personalizadas si se proporcionan
        const previewWidth = charm.width ? Math.round(charm.width * SCALE_FACTOR) : charmDimensions.width;
        const previewHeight = charm.height ? Math.round(charm.height * SCALE_FACTOR) : charmDimensions.height;
        
        dragEvent.dataTransfer.setDragImage(
          previewRef.current, 
          previewWidth / 2, 
          previewHeight / 2
        );
        
        // Ocultar la vista previa después de un breve retraso
        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.style.display = 'none';
          }
        }, 0);
      }
    };
    
    // Agregar event listener a nuestro elemento
    if (imageRef.current) {
      imageRef.current.addEventListener('dragstart', handleDragStart);
    }
    
    return () => {
      if (imageRef.current) {
        imageRef.current.removeEventListener('dragstart', handleDragStart);
      }
    };
  }, [charm.width, charm.height, charmDimensions.width, charmDimensions.height]);

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

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
        <p className="text-sm text-gray-500">${formatPrice(charm.price)}</p>
      </div>
    </div>
  );
} 