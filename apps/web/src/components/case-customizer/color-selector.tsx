'use client';

import { useState } from 'react';
import { PhoneColor } from '@/types/case-customizer';
import { cn } from '@/lib/utils';

export interface ColorSelectorProps {
  colors: PhoneColor[];
  selectedColor: PhoneColor | null;
  onColorSelect: (color: PhoneColor) => void;
  isLoading?: boolean;
}

export function ColorSelector({ 
  colors, 
  selectedColor, 
  onColorSelect, 
  isLoading = false 
}: ColorSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Select Color</h3>
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i} 
              className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Color</h3>
      <div className="grid grid-cols-5 gap-3">
        {colors.map((color) => (
          <button
            key={color.id}
            className={cn(
              "relative h-10 w-10 rounded-full border-2 transition-all",
              selectedColor?.id === color.id 
                ? "border-blue-500 scale-110" 
                : "border-gray-200 hover:border-gray-300"
            )}
            style={{ backgroundColor: color.colorCode }}
            onClick={() => onColorSelect(color)}
            title={color.displayName}
          >
            {selectedColor?.id === color.id && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            )}
          </button>
        ))}
      </div>
      {selectedColor && (
        <p className="text-sm font-medium text-gray-700">
          {selectedColor.displayName}
        </p>
      )}
    </div>
  );
} 