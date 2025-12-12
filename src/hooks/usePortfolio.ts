'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'frilance_portfolio';

interface PortfolioState {
  publishedProjectIds: string[];
}

// Mock storage helper
const getStoredPortfolio = (): PortfolioState => {
  if (typeof window === 'undefined') return { publishedProjectIds: [] };
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : { publishedProjectIds: [] };
};

const setStoredPortfolio = (state: PortfolioState) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      return getStoredPortfolio();
    },
  });
}

export function useTogglePortfolioProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const state = getStoredPortfolio();
      const isPublished = state.publishedProjectIds.includes(projectId);

      const newState = {
        publishedProjectIds: isPublished
          ? state.publishedProjectIds.filter(id => id !== projectId)
          : [...state.publishedProjectIds, projectId]
      };

      setStoredPortfolio(newState);
      return newState;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}
