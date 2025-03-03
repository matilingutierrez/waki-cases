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

// Dimensiones del iPhone 13 Pro
const IPHONE_13_PRO = {
  viewport: { width: 390, height: 844 },
  camera: { width: 147, height: 155 },
  appleLogo: { width: 82, height: 52 },
  // Dimensiones del dije - ancho es aproximadamente 2/3 del ancho de la cámara
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
  // Obtener las dimensiones del viewport para el iPhone 13 Pro
  const getPhoneDimensions = () => {
    // Reducir escala para ajustar en la UI (aproximadamente 60% del tamaño original)
    const scaleFactor = 0.5;
    return {
      width: Math.round(IPHONE_13_PRO.viewport.width * scaleFactor),
      height: Math.round(IPHONE_13_PRO.viewport.height * scaleFactor)
    };
  };
  
  // Calcular dimensiones de la cámara basado en el mismo factor de escala
  const getCameraDimensions = () => {
    const scaleFactor = 0.6;
    return {
      width: Math.round(IPHONE_13_PRO.camera.width * scaleFactor),
      height: Math.round(IPHONE_13_PRO.camera.height * scaleFactor)
    };
  };
  
  // Calcular dimensiones del logo de Apple basado en el mismo factor de escala
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
  
  // Manejar la eliminación de todos los dijes cuando se hace clic en la papelera
  const handleRemoveAllCharms = () => {
    if (placedCharms.length === 0) return;
    
    // Crear una copia del array para evitar problemas con forEach y eliminación simultánea
    const charmsToRemove = [...placedCharms];
    charmsToRemove.forEach(charm => {
      onCharmRemoved(charm.id);
    });
  };
  
  // Manejar la funcionalidad de la papelera
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
  
  // Función para oscurecer un color por un porcentaje
  const darkenColor = (color: string, percent: number) => {
    // Eliminar el # si está presente
    const hex = color.replace('#', '');
    
    // Analizar los valores hex
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calcular valores más oscuros
    const darkerR = Math.floor(r * (1 - percent / 100));
    const darkerG = Math.floor(g * (1 - percent / 100));
    const darkerB = Math.floor(b * (1 - percent / 100));
    
    // Convertir de vuelta a hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };
  
  // Obtener el color de la cámara basado en el color del teléfono
  const getCameraColor = () => {
    if (!phoneColor) return '#1a1a1a'; // Color oscuro por defecto
    
    // Para colores muy oscuros, usar un tono ligeramente más claro
    if (phoneColor.name === 'graphite' || phoneColor.name === 'midnight') {
      return '#2a2a2a';
    }
    
    // Para otros colores, oscurecer el color del teléfono en un 40%
    return darkenColor(phoneColor.colorCode, 40);
  };
  
  // Obtener el color del logo de Apple basado en el color del teléfono
  const getAppleLogoColor = () => {
    if (!phoneColor) return '#999'; // Color gris por defecto
    
    // Para midnight y blue (colores oscuros), usar un color claro
    if (phoneColor.name === 'midnight' || phoneColor.name === 'blue') {
      return '#e2e2e2';
    }
    
    // Para graphite, usar un gris más oscuro que coincida con el iPhone real
    if (phoneColor.name === 'graphite') {
      return '#3a3a3c';
    }
    
    // Para gold, usar un tinte dorado
    if (phoneColor.name === 'gold') {
      return '#d4af37';
    }
    
    // Para red, usar un rojo ligeramente más oscuro
    if (phoneColor.name === 'red') {
      return '#8a000d';
    }
    
    // Para otros colores, usar un color que coincida con el teléfono pero ligeramente más oscuro
    // Esto crea un efecto de relieve sutil
    return darkenColor(phoneColor.colorCode, 20);
  };
  
  // Calculate the border radius for consistency
  const borderRadiusValue = '2rem';
  
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px]">
      {/* Contenedor de la funda del teléfono */}
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
          borderRadius: borderRadiusValue,
          transition: 'box-shadow 0.2s ease',
        }}
      >
        {/* Cuerpo del iPhone con el color seleccionado */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: phoneColor?.colorCode || '#e2e2e7', // Por defecto plateado si no hay color seleccionado
            border: '2px solid #d1d1d6',
            boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1,
            borderRadius: borderRadiusValue
          }}
        />
        
        {/* Superposición de la funda transparente */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
            border: isDraggingOver || isOver ? '2px dashed #3b82f6' : '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(1px)',
            zIndex: 10,
            borderRadius: borderRadiusValue
          }}
        />

        {/* Módulo de cámara - fijo para coincidir con la apariencia real del iPhone 13 Pro */}
        <div 
          className="absolute"
          style={{
            width: cameraDimensions.width,
            height: cameraDimensions.height,
            left: '5%',
            top: '3%',
            backgroundColor: getCameraColor(),
            zIndex: 5,
            padding: '8px',
            borderRadius: '1.5rem'
          }}
        >
          {/* Cuadrado de la cámara con esquinas redondeadas */}
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            {/* Flash - arriba a la derecha */}
            <div 
              className="absolute rounded-full"
              style={{
                width: '16%',
                height: '16%',
                right: '15%',
                top: '8%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(220,220,220,0.8) 70%)',
                boxShadow: 'inset 0 0 2px 1px rgba(0,0,0,0.2)'
              }}
            ></div>
            
            {/* Cámara superior izquierda */}
            <div 
              className="absolute rounded-full"
              style={{
                width: '42%',
                height: '42%',
                left: '6%',
                top: '6%',
                backgroundColor: 'black',
                boxShadow: 'inset 0 0 3px 2px rgba(0,0,0,0.5)',
                border: '2px solid rgba(50,50,50,0.8)',
                overflow: 'hidden'
              }}
            >
              <div 
                className="w-full h-full rounded-full" 
                style={{ 
                  background: 'radial-gradient(circle at 35% 35%, rgba(0,0,255,0.1) 0%, rgba(0,0,0,0.9) 70%)'
                }}
              ></div>
            </div>
            
            {/* Cámara inferior izquierda */}
            <div 
              className="absolute rounded-full"
              style={{
                width: '42%',
                height: '42%',
                left: '6%',
                top: '54%',
                backgroundColor: 'black',
                boxShadow: 'inset 0 0 3px 2px rgba(0,0,0,0.5)',
                border: '2px solid rgba(50,50,50,0.8)',
                overflow: 'hidden'
              }}
            >
              <div 
                className="w-full h-full rounded-full" 
                style={{ 
                  background: 'radial-gradient(circle at 35% 35%, rgba(0,0,255,0.1) 0%, rgba(0,0,0,0.9) 70%)'
                }}
              ></div>
            </div>
            
            {/* Cámara derecha */}
            <div 
              className="absolute rounded-full"
              style={{
                width: '42%',
                height: '42%',
                right: '6%',
                top: '30%',
                backgroundColor: 'black',
                boxShadow: 'inset 0 0 3px 2px rgba(0,0,0,0.5)',
                border: '2px solid rgba(50,50,50,0.8)',
                overflow: 'hidden'
              }}
            >
              <div 
                className="w-full h-full rounded-full" 
                style={{ 
                  background: 'radial-gradient(circle at 35% 35%, rgba(0,0,255,0.1) 0%, rgba(0,0,0,0.9) 70%)'
                }}
              ></div>
            </div>
            
            {/* Sensor LiDAR - abajo a la derecha */}
            <div 
              className="absolute rounded-full"
              style={{
                width: '16%',
                height: '16%',
                right: '15%',
                bottom: '8%',
                backgroundColor: '#333',
                boxShadow: 'inset 0 0 2px 1px rgba(0,0,0,0.5)'
              }}
            ></div>
          </div>
        </div>
        
        {/* Logo de Apple - con color que coincide con el teléfono y efecto de relieve */}
        <div 
          className="absolute"
          style={{
            width: appleLogoDimensions.width,
            height: appleLogoDimensions.height,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.3))',
            opacity: 0.9
          }}
        >
          <svg 
            viewBox="0 0 170 170" 
            fill={getAppleLogoColor()} 
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: phoneColor?.name === 'midnight' || phoneColor?.name === 'blue' 
                ? 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' 
                : phoneColor?.name === 'graphite'
                  ? 'drop-shadow(0px 1px 1px rgba(255,255,255,0.2))'
                  : 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))'
            }}
          >
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929 0.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002 0.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-0.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375-0.119-0.972-0.188-1.995-0.188-3.07 0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71 0.12 1.083 0.17 2.166 0.17 3.24z"/>
          </svg>
        </div>
        
        {/* Dijes colocados - ahora con un z-index más alto para aparecer sobre la funda transparente */}
        {placedCharms.map((placedCharm) => (
          <PlacedCharmItem 
            key={placedCharm.id} 
            placedCharm={placedCharm} 
            onPositionUpdated={onCharmPositionUpdated}
            onRotationUpdated={onCharmRotationUpdated}
          />
        ))}
      </div>
      
      {/* Instrucciones de rotación */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>Consejo: Mantén Shift + arrastra para rotar los charms</p>
      </div>
      
      {/* Papelera para eliminar dijes */}
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
          Limpiar
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
  
  // Obtener las dimensiones escaladas del dije, usando dimensiones personalizadas si se proporcionan
  const getCharmDimensions = () => {
    const scaleFactor = 0.6; // Mismo factor de escala usado para el teléfono
    
    // Usar dimensiones personalizadas del objeto charm si se proporcionan, de lo contrario usar las predeterminadas
    const baseWidth = charm.width || IPHONE_13_PRO.charm.width;
    const baseHeight = charm.height || IPHONE_13_PRO.charm.height;
    
    return {
      width: Math.round(baseWidth * scaleFactor),
      height: Math.round(baseHeight * scaleFactor)
    };
  };
  
  const charmDimensions = getCharmDimensions();
  
  // Crear una imagen de vista previa de tamaño fijo para arrastrar
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
  
  // Manejar el arrastre manual sin react-dnd
  useEffect(() => {
    if (!imageRef.current) return;
    
    let startX = 0;
    let startY = 0;
    let isDraggingElement = false;
    
    const handleMouseDown = (e: MouseEvent) => {
      // Si el usuario mantiene presionada la tecla Shift, iniciar rotación en lugar de arrastre
      if (e.shiftKey) {
        e.preventDefault();
        setIsRotating(true);
        return;
      }
      
      isDraggingElement = true;
      setIsDragging(true);
      startX = e.clientX - position.x;
      startY = e.clientY - position.y;
      
      // Prevenir comportamiento predeterminado
      e.preventDefault();
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isRotating) {
        // Manejar rotación
        if (imageRef.current) {
          const rect = imageRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Calcular ángulo entre el centro del elemento y la posición del ratón
          const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
          const degrees = angle * (180 / Math.PI) + 90; // +90 para que se sienta más natural
          
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
      
      // Actualizar posición directamente para un arrastre suave
      if (imageRef.current) {
        imageRef.current.style.left = `${newX}px`;
        imageRef.current.style.top = `${newY}px`;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (isRotating) {
        setIsRotating(false);
        // Actualizar rotación en el componente padre si existe el callback
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
      
      // Comprobar si estamos soltando en la papelera
      const trashElement = document.querySelector('[data-trash-bin="true"]');
      if (trashElement) {
        const trashRect = trashElement.getBoundingClientRect();
        if (
          e.clientX >= trashRect.left && 
          e.clientX <= trashRect.right && 
          e.clientY >= trashRect.top && 
          e.clientY <= trashRect.bottom
        ) {
          // Estamos sobre la papelera, no actualizar posición
          return;
        }
      }
      
      // Actualizar posición en el componente padre
      onPositionUpdated(id, { x: newX, y: newY });
    };
    
    // Agregar event listeners
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
  
  // Hacer que los dijes colocados sean arrastrables para reposicionamiento con react-dnd (para la papelera)
  const [, drag] = useDrag({
    type: 'placed-charm',
    item: { id, type: 'placed-charm' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Combinar refs
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
      
      {/* Indicador de rotación - solo mostrar cuando se está rotando activamente */}
      {isRotating && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-full flex items-center justify-center">
          <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
        </div>
      )}
      
      {/* Tooltip de instrucciones de rotación */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Mantén Shift + arrastra para rotar
      </div>
    </div>
  );
} 