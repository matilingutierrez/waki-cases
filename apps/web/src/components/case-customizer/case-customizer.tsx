'use client';

import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { CasePreview } from './case-preview';
import { PhoneSelector } from './phone-selector';
import { CharmSelector } from './charm-selector';
import { ColorSelector } from './color-selector';
import { useCharms } from '@/hooks/use-charms';
import { usePhoneModels } from '@/hooks/use-phone-models';
import { usePhoneColors } from '@/hooks/use-phone-colors';
import { Charm, PhoneModel, PhoneColor } from '@/types/case-customizer';

export function CaseCustomizer() {
  const { phoneModels, isLoading: isLoadingPhones } = usePhoneModels();
  const { charms, isLoading: isLoadingCharms } = useCharms();
  const { colors, isLoading: isLoadingColors } = usePhoneColors();
  const [selectedPhone, setSelectedPhone] = useState<PhoneModel | null>(null);
  const [selectedColor, setSelectedColor] = useState<PhoneColor | null>(null);
  const [placedCharms, setPlacedCharms] = useState<Array<{ id: string; charm: Charm; position: { x: number; y: number }; rotation?: number }>>([]);

  // Auto-select iPhone 13 Pro when phone models are loaded
  useEffect(() => {
    if (phoneModels.length > 0 && !selectedPhone) {
      const iphone13Pro = phoneModels[0];
      if (iphone13Pro) {
        setSelectedPhone(iphone13Pro);
      }
    }
  }, [phoneModels, selectedPhone]);

  // Auto-select Silver color when colors are loaded
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) {
      const silverColor = colors.find(color => color.name === 'silver');
      if (silverColor) {
        setSelectedColor(silverColor);
      } else if (colors[0]) {
        setSelectedColor(colors[0]);
      }
    }
  }, [colors, selectedColor]);

  const handlePhoneSelect = (phone: PhoneModel) => {
    setSelectedPhone(phone);
  };

  const handleColorSelect = (color: PhoneColor) => {
    setSelectedColor(color);
  };

  const handleCharmPlaced = (charm: Charm, position: { x: number; y: number }) => {
    const id = `${charm.id}-${Date.now()}`;
    setPlacedCharms((prev) => [...prev, { id, charm, position, rotation: 0 }]);
  };

  const handleCharmRemoved = (charmId: string) => {
    setPlacedCharms((prev) => prev.filter((item) => item.id !== charmId));
  };
  
  const handleCharmPositionUpdated = (charmId: string, newPosition: { x: number; y: number }) => {
    setPlacedCharms((prev) => 
      prev.map((item) => 
        item.id === charmId 
          ? { ...item, position: newPosition } 
          : item
      )
    );
  };
  
  const handleCharmRotationUpdated = (charmId: string, newRotation: number) => {
    setPlacedCharms((prev) => 
      prev.map((item) => 
        item.id === charmId 
          ? { ...item, rotation: newRotation } 
          : item
      )
    );
  };

  const handlePlaceOrder = () => {
    // In a real app, this would submit the order to a backend
    alert(`Order placed for ${selectedPhone?.name} in ${selectedColor?.displayName} with ${placedCharms.length} charms!`);
    console.log('Order details:', { selectedPhone, selectedColor, placedCharms });
  };

  // Calculate total price
  const basePrice = 19.99;
  const charmsPrice = placedCharms.reduce((total, item) => total + item.charm.price, 0);
  const totalPrice = basePrice + charmsPrice;

  // If no phone is selected or still loading, show loading state
  if (!selectedPhone || isLoadingPhones) {
    return (
      <div className="w-full mx-auto max-w-[1000px] p-6">
        <div className="p-6 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-center">Loading...</h2>
        </div>
      </div>
    );
  }

  // Show the full customizer once a phone is selected
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="w-full mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Case preview and phone info */}
          <div className="space-y-2">
            <div className="p-4 rounded-lg border shadow-sm">
              {/* Selected phone info */}
              <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold">{selectedPhone.name}</h2>
                {selectedColor && (
                  <p className="text-sm text-gray-500">{selectedColor.displayName}</p>
                )}
              </div>
              
              <div className="flex items-center justify-center">
                <CasePreview 
                  phoneModel={selectedPhone} 
                  phoneColor={selectedColor}
                  placedCharms={placedCharms}
                  onCharmPlaced={handleCharmPlaced}
                  onCharmRemoved={handleCharmRemoved}
                  onCharmPositionUpdated={handleCharmPositionUpdated}
                  onCharmRotationUpdated={handleCharmRotationUpdated}
                />
              </div>
            </div>

            {/* Order button and total */}
            <div className="flex justify-between items-center p-6 rounded-lg border shadow-sm">
              <div className="text-lg font-semibold">
                Total: ${totalPrice.toFixed(2)}
              </div>
              <Button 
                size="lg" 
                onClick={handlePlaceOrder}
              >
                Complete Order
              </Button>
            </div>
          </div>

          {/* Charms and change phone */}
          <div className="space-y-6">
            {/* Color selector */}
            <div className="p-6 rounded-lg border shadow-sm">
              <ColorSelector 
                colors={colors}
                selectedColor={selectedColor}
                onColorSelect={handleColorSelect}
                isLoading={isLoadingColors}
              />
            </div>

            {/* Charms section */}
            <div className="p-6 rounded-lg border shadow-sm">
              <div className="max-h-[400px] overflow-y-auto">
                <CharmSelector charms={charms} isLoading={isLoadingCharms} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
} 