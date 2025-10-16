'use client';

import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

/**
 * Hook to fetch and cache the current (only) user using TanStack Query
 * Automatically caches and deduplicates requests
 */
export function useUser() {
  const { data: user = null, isLoading: loading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      
      return (await response.json()) as User;
    },
    staleTime: Infinity, // User data doesn't change often, cache indefinitely
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  return { 
    user, 
    loading, 
    error: error instanceof Error ? error.message : (error ? 'Unknown error' : null) 
  };
}

