'use client';

import { useState, useEffect } from 'react';
import { PhoneModel } from '@/types/case-customizer';

// Mock data for phone models
const mockPhoneModels: PhoneModel[] = [
  {
    id: 'iphone-13-pro',
    name: 'iPhone 13 Pro',
    caseImageUrl: 'https://placehold.co/300x600/ffffff/00000000',
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
        await new Promise(resolve => setTimeout(resolve, 600));
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