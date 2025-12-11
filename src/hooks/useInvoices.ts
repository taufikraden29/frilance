'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Invoice } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
}

// Get all invoices
const FIVE_MINUTES = 5 * 60 * 1000;

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((i: any) => ({
        id: i.id,
        invoiceNumber: i.invoice_number,
        projectId: i.project_id,
        projectName: i.project_name,
        clientId: i.client_id,
        clientName: i.client_name,
        items: i.items || [],
        subtotal: Number(i.subtotal),
        tax: Number(i.tax),
        taxRate: i.tax_rate ? Number(i.tax_rate) : undefined,
        total: Number(i.total),
        status: i.status,
        dueDate: i.due_date,
        paidAt: i.paid_at,
        createdAt: i.created_at,
      })) as Invoice[];
    },
  });
}

// Get invoices by project
export function useInvoicesByProject(projectId: string) {
  return useQuery({
    queryKey: ['invoices', 'project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((i: any) => ({
        id: i.id,
        invoiceNumber: i.invoice_number,
        projectId: i.project_id,
        projectName: i.project_name,
        clientId: i.client_id,
        clientName: i.client_name,
        items: i.items || [],
        subtotal: Number(i.subtotal),
        tax: Number(i.tax),
        taxRate: i.tax_rate ? Number(i.tax_rate) : undefined,
        total: Number(i.total),
        status: i.status,
        dueDate: i.due_date,
        paidAt: i.paid_at,
        createdAt: i.created_at,
      })) as Invoice[];
    },
    enabled: !!projectId,
  });
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: generateInvoiceNumber(),
          project_id: invoice.projectId,
          project_name: invoice.projectName,
          client_id: invoice.clientId,
          client_name: invoice.clientName,
          items: invoice.items,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          tax_rate: invoice.taxRate,
          total: invoice.total,
          status: invoice.status,
          due_date: invoice.dueDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: invoiceData }: { id: string; data: Partial<Invoice> }) => {
      const updatePayload: any = {};

      if (invoiceData.projectId !== undefined) updatePayload.project_id = invoiceData.projectId;
      if (invoiceData.projectName !== undefined) updatePayload.project_name = invoiceData.projectName;
      if (invoiceData.clientId !== undefined) updatePayload.client_id = invoiceData.clientId;
      if (invoiceData.clientName !== undefined) updatePayload.client_name = invoiceData.clientName;
      if (invoiceData.items !== undefined) updatePayload.items = invoiceData.items;
      if (invoiceData.subtotal !== undefined) updatePayload.subtotal = invoiceData.subtotal;
      if (invoiceData.tax !== undefined) updatePayload.tax = invoiceData.tax;
      if (invoiceData.taxRate !== undefined) updatePayload.tax_rate = invoiceData.taxRate;
      if (invoiceData.total !== undefined) updatePayload.total = invoiceData.total;
      if (invoiceData.status !== undefined) updatePayload.status = invoiceData.status;
      if (invoiceData.dueDate !== undefined) updatePayload.due_date = invoiceData.dueDate;
      if (invoiceData.paidAt !== undefined) updatePayload.paid_at = invoiceData.paidAt;

      const { data, error } = await supabase
        .from('invoices')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Delete invoice
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

// Mark invoice as paid
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
