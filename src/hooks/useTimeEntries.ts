'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeEntry } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Get all time entries
const FIVE_MINUTES = 5 * 60 * 1000;

export function useTimeEntries() {
  return useQuery({
    queryKey: ['time-entries'],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        projectName: t.project_name,
        description: t.description,
        hours: Number(t.hours),
        date: t.date,
        createdAt: t.created_at,
      })) as TimeEntry[];
    },
  });
}

// Get time entries for current month
export function useMonthlyTimeEntries() {
  return useQuery({
    queryKey: ['time-entries', 'monthly'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .gte('date', startOfMonth.split('T')[0])
        .lte('date', endOfMonth.split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        projectName: t.project_name,
        description: t.description,
        hours: Number(t.hours),
        date: t.date,
        createdAt: t.created_at,
      })) as TimeEntry[];
    },
  });
}

// Get time entries by project
export function useTimeEntriesByProject(projectId: string) {
  return useQuery({
    queryKey: ['time-entries', 'project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        projectName: t.project_name,
        description: t.description,
        hours: Number(t.hours),
        date: t.date,
        createdAt: t.created_at,
      })) as TimeEntry[];
    },
    enabled: !!projectId,
  });
}

// Create time entry
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          project_id: entry.projectId,
          project_name: entry.projectName,
          description: entry.description,
          hours: entry.hours,
          date: entry.date,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}

// Update time entry
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: entryData }: { id: string; data: Partial<TimeEntry> }) => {
      const updatePayload: any = {};

      if (entryData.projectId !== undefined) updatePayload.project_id = entryData.projectId;
      if (entryData.projectName !== undefined) updatePayload.project_name = entryData.projectName;
      if (entryData.description !== undefined) updatePayload.description = entryData.description;
      if (entryData.hours !== undefined) updatePayload.hours = entryData.hours;
      if (entryData.date !== undefined) updatePayload.date = entryData.date;

      const { data, error } = await supabase
        .from('time_entries')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}

// Delete time entry
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });
}
