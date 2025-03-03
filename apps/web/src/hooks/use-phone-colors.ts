'use client';

import { useState, useEffect } from 'react';
import { PhoneColor } from '@/types/case-customizer';

// Mock iPhone colors
const mockPhoneColors: PhoneColor[] = [
  {
    id: 'graphite',
    name: 'graphite',
    colorCode: '#54514D',
    displayName: 'Graphite'
  },
  {
    id: 'silver',
    name: 'silver',
    colorCode: '#E2E2E7',
    displayName: 'Silver'
  },
  {
    id: 'gold',
    name: 'gold',
    colorCode: '#F9E5C9',
    displayName: 'Gold'
  },
  {
    id: 'sierra-blue',
    name: 'sierra-blue',
    colorCode: '#A7C1D9',
    displayName: 'Sierra Blue'
  },
  {
    id: 'midnight',
    name: 'midnight',
    colorCode: '#1F2937',
    displayName: 'Midnight'
  },
  {
    id: 'starlight',
    name: 'starlight',
    colorCode: '#F5F5F0',
    displayName: 'Starlight'
  },
  {
    id: 'pink',
    name: 'pink',
    colorCode: '#FBE2DD',
    displayName: 'Pink'
  },
  {
    id: 'blue',
    name: 'blue',
    colorCode: '#215E7C',
    displayName: 'Blue'
  },
  {
    id: 'purple',
    name: 'purple',
    colorCode: '#E5DDEA',
    displayName: 'Purple'
  },
  {
    id: 'red',
    name: 'red',
    colorCode: '#A50011',
    displayName: 'Product Red'
  }
];

export function usePhoneColors() {
  const [colors, setColors] = useState<PhoneColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchColors = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setColors(mockPhoneColors);
      } catch (error) {
        console.error('Error fetching phone colors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColors();
  }, []);

  return { colors, isLoading };
} 