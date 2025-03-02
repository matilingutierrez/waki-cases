'use client';

import { useState, useEffect } from 'react';
import { PhoneModel } from '@/types/case-customizer';

// Mock data for phone models
const mockPhoneModels: PhoneModel[] = [
  {
    id: 'iphone-15-pro',
    name: 'iPhone 15 Pro',
    caseImageUrl: 'https://placehold.co/300x600/e2e8f0/1e293b?text=iPhone+15+Pro',
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    caseImageUrl: 'https://placehold.co/300x600/e2e8f0/1e293b?text=iPhone+15',
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    caseImageUrl: 'https://placehold.co/300x600/e2e8f0/1e293b?text=iPhone+14+Pro',
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    caseImageUrl: 'https://placehold.co/300x600/e2e8f0/1e293b?text=iPhone+14',
  },
  {
    id: 'samsung-s23',
    name: 'Samsung Galaxy S23',
    caseImageUrl: 'https://placehold.co/300x600/e2e8f0/1e293b?text=Samsung+S23',
  },
  {
    id: 'pixel-7',
    name: 'Google Pixel 7',
    caseImageUrl: 'https://placehold.co/300x600/e2e8f0/1e293b?text=Pixel+7',
  },
];

export function usePhoneModels() {
  const [phoneModels, setPhoneModels] = useState<PhoneModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchPhoneModels = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPhoneModels(mockPhoneModels);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch phone models'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoneModels();
  }, []);

  return { phoneModels, isLoading, error };
} 