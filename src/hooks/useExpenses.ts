'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Get all expenses
export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((e: any) => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        category: e.category,
        date: e.date,
        createdAt: e.created_at,
      })) as Expense[];
    },
  });
}

// Create expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// Delete expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
