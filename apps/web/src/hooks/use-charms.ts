'use client';

import { useState, useEffect } from 'react';
import { Charm } from '@/types/case-customizer';

// Mock data for charms
const mockCharms: Charm[] = [
  {
    id: 'charm-sweet',
    name: 'Sweet',
    imageUrl: '/sweet.png',
    price: 1500,
    width: 200,
    height: 90,
  },
  {
    id: 'charm-almeja',
    name: 'Almeja',
    imageUrl: '/almeja.png',
    price: 1000,
    width: 100,
    height: 100,
  },
  {
    id: 'charm-corazon',
    name: 'Corazón',
    imageUrl: '/corazon.png',
    price: 250,
    width: 60,
    height: 60,
  },
  {
    id: 'charm-perlas',
    name: 'Perlas',
    imageUrl: '/perlas.png',
    price: 500,
    width: 75,
    height: 75,
  },
  {
    id: 'charm-perla',
    name: 'Perla',
    imageUrl: '/perla.png',
    price: 250,
    width: 50,
    height: 50,
  },
];

export function useCharms() {
  const [charms, setCharms] = useState<Charm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchCharms = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setCharms(mockCharms);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch charms'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharms();
  }, []);

  return { charms, isLoading, error };
} 