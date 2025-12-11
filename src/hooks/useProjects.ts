'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Get all projects
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        clientId: p.client_id,
        clientName: p.client_name,
        status: p.status,
        budget: Number(p.budget),
        spent: Number(p.spent),
        deadline: p.deadline,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })) as Project[];
    },
  });
}

// Get single project by ID
export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        clientId: data.client_id,
        clientName: data.client_name,
        status: data.status,
        budget: Number(data.budget),
        spent: Number(data.spent),
        deadline: data.deadline,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Project;
    },
    enabled: !!id,
  });
}

// Create project
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          client_id: project.clientId,
          client_name: project.clientName,
          status: project.status,
          budget: project.budget,
          spent: project.spent || 0,
          deadline: project.deadline,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: projectData }: { id: string; data: Partial<Project> }) => {
      const updatePayload: any = { updated_at: new Date().toISOString() };

      if (projectData.name !== undefined) updatePayload.name = projectData.name;
      if (projectData.description !== undefined) updatePayload.description = projectData.description;
      if (projectData.clientId !== undefined) updatePayload.client_id = projectData.clientId;
      if (projectData.clientName !== undefined) updatePayload.client_name = projectData.clientName;
      if (projectData.status !== undefined) updatePayload.status = projectData.status;
      if (projectData.budget !== undefined) updatePayload.budget = projectData.budget;
      if (projectData.spent !== undefined) updatePayload.spent = projectData.spent;
      if (projectData.deadline !== undefined) updatePayload.deadline = projectData.deadline;

      const { data, error } = await supabase
        .from('projects')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
