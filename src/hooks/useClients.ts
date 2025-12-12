'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Get all clients
const FIVE_MINUTES = 5 * 60 * 1000;

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map snake_case to camelCase
      return (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        address: c.address,
        status: c.status || 'active', // Default to active if missing
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })) as Client[];
    },
  });
}

// Create client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: client.name,
          email: client.email,
          phone: client.phone,
          company: client.company,
          address: client.address,
          status: client.status || 'lead',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Update client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: clientData }: { id: string; data: Partial<Client> }) => {
      const payload: any = {
        updated_at: new Date().toISOString(),
      };

      if (clientData.name) payload.name = clientData.name;
      if (clientData.email) payload.email = clientData.email;
      if (clientData.phone) payload.phone = clientData.phone;
      if (clientData.company) payload.company = clientData.company;
      if (clientData.address) payload.address = clientData.address;
      if (clientData.status) payload.status = clientData.status;

      const { data, error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// Delete client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
