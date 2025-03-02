'use client';

import { useState, useEffect } from 'react';
import { Charm } from '@/types/case-customizer';

// Mock data for charms
const mockCharms: Charm[] = [
  {
    id: 'charm-1',
    name: 'Star Charm',
    imageUrl: 'https://placehold.co/100/f59e0b/ffffff?text=★',
    price: 4.99,
  },
  {
    id: 'charm-2',
    name: 'Heart Charm',
    imageUrl: 'https://placehold.co/100/ef4444/ffffff?text=♥',
    price: 4.99,
  },
  {
    id: 'charm-3',
    name: 'Moon Charm',
    imageUrl: 'https://placehold.co/100/6366f1/ffffff?text=☾',
    price: 5.99,
  },
  {
    id: 'charm-4',
    name: 'Sun Charm',
    imageUrl: 'https://placehold.co/100/f59e0b/ffffff?text=☀',
    price: 5.99,
  },
  {
    id: 'charm-5',
    name: 'Cloud Charm',
    imageUrl: 'https://placehold.co/100/3b82f6/ffffff?text=☁',
    price: 3.99,
  },
  {
    id: 'charm-6',
    name: 'Flower Charm',
    imageUrl: 'https://placehold.co/100/ec4899/ffffff?text=✿',
    price: 6.99,
  },
  {
    id: 'charm-7',
    name: 'Music Charm',
    imageUrl: 'https://placehold.co/100/8b5cf6/ffffff?text=♪',
    price: 4.99,
  },
  {
    id: 'charm-8',
    name: 'Peace Charm',
    imageUrl: 'https://placehold.co/100/10b981/ffffff?text=☮',
    price: 4.99,
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