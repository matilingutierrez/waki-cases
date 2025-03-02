'use client';

import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { CasePreview } from './case-preview';
import { PhoneSelector } from './phone-selector';
import { CharmSelector } from './charm-selector';
import { useCharms } from '@/hooks/use-charms';
import { usePhoneModels } from '@/hooks/use-phone-models';
import { Charm, PhoneModel } from '@/types/case-customizer';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';

export function CaseCustomizer() {
  const { phoneModels, isLoading: isLoadingPhones } = usePhoneModels();
  const { charms, isLoading: isLoadingCharms } = useCharms();
  const [selectedPhone, setSelectedPhone] = useState<PhoneModel | null>(null);
  const [placedCharms, setPlacedCharms] = useState<Array<{ id: string; charm: Charm; position: { x: number; y: number } }>>([]);

  const handlePhoneSelect = (phone: PhoneModel) => {
    setSelectedPhone(phone);
  };

  const handleCharmPlaced = (charm: Charm, position: { x: number; y: number }) => {
    const id = `${charm.id}-${Date.now()}`;
    setPlacedCharms((prev) => [...prev, { id, charm, position }]);
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

  const handlePlaceOrder = () => {
    // In a real app, this would submit the order to a backend
    alert(`Order placed for ${selectedPhone?.name} with ${placedCharms.length} charms!`);
    console.log('Order details:', { selectedPhone, placedCharms });
  };

  // Calculate total price
  const basePrice = 19.99;
  const charmsPrice = placedCharms.reduce((total, item) => total + item.charm.price, 0);
  const totalPrice = basePrice + charmsPrice;

  // If no phone is selected, show only the phone selector
  if (!selectedPhone) {
    return (
      <div className="w-full mx-auto max-w-[1000px] p-6">
        <div className="p-6 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-center">Select Your Phone Model</h2>
          <PhoneSelector 
            phoneModels={phoneModels} 
            selectedPhone={selectedPhone} 
            onSelect={handlePhoneSelect}
            isLoading={isLoadingPhones}
          />
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
              </div>
              
              <div className="flex items-center justify-center">
                <CasePreview 
                  phoneModel={selectedPhone} 
                  placedCharms={placedCharms}
                  onCharmPlaced={handleCharmPlaced}
                  onCharmRemoved={handleCharmRemoved}
                  onCharmPositionUpdated={handleCharmPositionUpdated}
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
            {/* Charms section with accordion */}
            <div className="p-6 rounded-lg border shadow-sm">
              <Accordion type="single" collapsible defaultValue="charms">
                <AccordionItem value="charms">
                  <AccordionTrigger className="text-xl font-semibold">
                    Available Charms
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-4 max-h-[400px] overflow-y-auto">
                      <CharmSelector charms={charms} isLoading={isLoadingCharms} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Change phone button */}
            <div className="p-6 rounded-lg border shadow-sm">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => setSelectedPhone(null)}
              >
                Change Phone
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
} 