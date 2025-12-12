'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'frilance_documents';

// Mock storage helper
const getStoredDocs = (): Document[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredDocs = (docs: Document[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return getStoredDocs().sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: Omit<Document, 'id' | 'uploadedAt'>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newDoc: Document = {
        ...doc,
        id: uuidv4(),
        uploadedAt: new Date().toISOString(),
      };

      const docs = getStoredDocs();
      setStoredDocs([newDoc, ...docs]);
      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const docs = getStoredDocs();
      setStoredDocs(docs.filter(d => d.id !== id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
