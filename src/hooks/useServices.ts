'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceItem } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Get all services
const FIVE_MINUTES = 5 * 60 * 1000;

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      return (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        price: Number(s.price),
        description: s.description,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      })) as ServiceItem[];
    },
  });
}

// Create service
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          category: service.category,
          price: service.price,
          description: service.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// Update service
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: serviceData }: { id: string; data: Partial<ServiceItem> }) => {
      const updatePayload: any = { updated_at: new Date().toISOString() };

      if (serviceData.name !== undefined) updatePayload.name = serviceData.name;
      if (serviceData.category !== undefined) updatePayload.category = serviceData.category;
      if (serviceData.price !== undefined) updatePayload.price = serviceData.price;
      if (serviceData.description !== undefined) updatePayload.description = serviceData.description;

      const { data, error } = await supabase
        .from('services')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// Delete service
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}
