'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Quotation } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Generate quotation number
function generateQuotationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `QT-${year}${month}-${random}`;
}

// Get all quotations
const FIVE_MINUTES = 5 * 60 * 1000;

export function useQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((q: any) => ({
        id: q.id,
        quotationNumber: q.quotation_number,
        projectId: q.project_id,
        projectName: q.project_name,
        clientId: q.client_id,
        clientName: q.client_name,
        items: q.items || [],
        subtotal: Number(q.subtotal),
        tax: Number(q.tax),
        taxRate: q.tax_rate ? Number(q.tax_rate) : undefined,
        total: Number(q.total),
        status: q.status,
        validUntil: q.valid_until,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      })) as Quotation[];
    },
  });
}

// Get single quotation
export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        quotationNumber: data.quotation_number,
        projectId: data.project_id,
        projectName: data.project_name,
        clientId: data.client_id,
        clientName: data.client_name,
        items: data.items || [],
        subtotal: Number(data.subtotal),
        tax: Number(data.tax),
        taxRate: data.tax_rate ? Number(data.tax_rate) : undefined,
        total: Number(data.total),
        status: data.status,
        validUntil: data.valid_until,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Quotation;
    },
    enabled: !!id,
  });
}

// Create quotation
export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotation: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('quotations')
        .insert({
          quotation_number: generateQuotationNumber(),
          project_id: quotation.projectId,
          project_name: quotation.projectName,
          client_id: quotation.clientId,
          client_name: quotation.clientName,
          items: quotation.items,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          tax_rate: quotation.taxRate,
          total: quotation.total,
          status: quotation.status,
          valid_until: quotation.validUntil,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

// Update quotation
export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: quotationData }: { id: string; data: Partial<Quotation> }) => {
      const updatePayload: any = { updated_at: new Date().toISOString() };

      if (quotationData.projectId !== undefined) updatePayload.project_id = quotationData.projectId;
      if (quotationData.projectName !== undefined) updatePayload.project_name = quotationData.projectName;
      if (quotationData.clientId !== undefined) updatePayload.client_id = quotationData.clientId;
      if (quotationData.clientName !== undefined) updatePayload.client_name = quotationData.clientName;
      if (quotationData.items !== undefined) updatePayload.items = quotationData.items;
      if (quotationData.subtotal !== undefined) updatePayload.subtotal = quotationData.subtotal;
      if (quotationData.tax !== undefined) updatePayload.tax = quotationData.tax;
      if (quotationData.taxRate !== undefined) updatePayload.tax_rate = quotationData.taxRate;
      if (quotationData.total !== undefined) updatePayload.total = quotationData.total;
      if (quotationData.status !== undefined) updatePayload.status = quotationData.status;
      if (quotationData.validUntil !== undefined) updatePayload.valid_until = quotationData.validUntil;

      const { data, error } = await supabase
        .from('quotations')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

// Delete quotation
export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}
