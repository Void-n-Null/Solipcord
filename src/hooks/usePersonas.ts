import { useQuery } from '@tanstack/react-query';
import { Persona } from '@/types/dm';

/**
 * Hook to fetch multiple personas using TanStack Query
 * Automatically caches and deduplicates requests
 */
export function usePersonas(ids: string[]) {
  return useQuery({
    queryKey: ['personas', ids.sort()], // Sort IDs for consistent cache keys
    queryFn: async () => {
      if (ids.length === 0) return [];

      const response = await fetch('/api/personas/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch personas');
      }

      return (await response.json()) as Persona[];
    },
    enabled: ids.length > 0, // Don't fetch if no IDs provided
  });
}

/**
 * Hook to fetch a single persona by ID
 */
export function usePersona(id: string | undefined) {
  return useQuery({
    queryKey: ['persona', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');

      const response = await fetch(`/api/personas/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch persona');
      }

      return (await response.json()) as Persona;
    },
    enabled: !!id,
  });
}
