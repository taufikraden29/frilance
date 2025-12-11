'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Todo, Subtask } from '@/lib/types';
import { supabase } from '@/lib/supabase';

const FIVE_MINUTES = 5 * 60 * 1000;

// Available labels
export const TODO_LABELS = [
  { id: 'urgent', name: 'Urgent', color: 'bg-red-500' },
  { id: 'important', name: 'Important', color: 'bg-orange-500' },
  { id: 'review', name: 'Review', color: 'bg-purple-500' },
  { id: 'meeting', name: 'Meeting', color: 'bg-blue-500' },
  { id: 'design', name: 'Design', color: 'bg-pink-500' },
  { id: 'development', name: 'Development', color: 'bg-emerald-500' },
  { id: 'bug', name: 'Bug', color: 'bg-red-600' },
  { id: 'feature', name: 'Feature', color: 'bg-cyan-500' },
];

// Get all todos with subtasks
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      // Get todos
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select('*')
        .order('completed', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (todosError) throw todosError;

      // Get all subtasks
      const { data: subtasksData, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .order('sort_order', { ascending: true });

      // Map subtasks to todos (ignore error if table doesn't exist)
      const subtasksByTodo: Record<string, Subtask[]> = {};
      if (!subtasksError && subtasksData) {
        subtasksData.forEach((s: any) => {
          const subtask: Subtask = {
            id: s.id,
            todoId: s.todo_id,
            title: s.title,
            completed: s.completed,
            sortOrder: s.sort_order,
            createdAt: s.created_at,
          };
          if (!subtasksByTodo[s.todo_id]) subtasksByTodo[s.todo_id] = [];
          subtasksByTodo[s.todo_id].push(subtask);
        });
      }

      return (todosData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        clientId: t.client_id,
        clientName: t.client_name,
        projectId: t.project_id,
        projectName: t.project_name,
        priority: t.priority,
        dueDate: t.due_date,
        completed: t.completed,
        recurring: t.recurring || 'none',
        labels: t.labels || [],
        subtasks: subtasksByTodo[t.id] || [],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })) as Todo[];
    },
  });
}

// Get todos by client
export function useTodosByClient(clientId: string) {
  return useQuery({
    queryKey: ['todos', 'client', clientId],
    staleTime: FIVE_MINUTES,
    gcTime: FIVE_MINUTES * 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('client_id', clientId)
        .order('completed', { ascending: true })
        .order('due_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        clientId: t.client_id,
        clientName: t.client_name,
        projectId: t.project_id,
        projectName: t.project_name,
        priority: t.priority,
        dueDate: t.due_date,
        completed: t.completed,
        recurring: t.recurring || 'none',
        labels: t.labels || [],
        subtasks: [],
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })) as Todo[];
    },
    enabled: !!clientId,
  });
}

// Create todo
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          title: todo.title,
          description: todo.description,
          client_id: todo.clientId,
          client_name: todo.clientName,
          project_id: todo.projectId,
          project_name: todo.projectName,
          priority: todo.priority,
          due_date: todo.dueDate,
          completed: todo.completed || false,
          recurring: todo.recurring || 'none',
          labels: todo.labels || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Update todo
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: todoData }: { id: string; data: Partial<Todo> }) => {
      const updatePayload: any = { updated_at: new Date().toISOString() };

      if (todoData.title !== undefined) updatePayload.title = todoData.title;
      if (todoData.description !== undefined) updatePayload.description = todoData.description;
      if (todoData.clientId !== undefined) updatePayload.client_id = todoData.clientId;
      if (todoData.clientName !== undefined) updatePayload.client_name = todoData.clientName;
      if (todoData.projectId !== undefined) updatePayload.project_id = todoData.projectId;
      if (todoData.projectName !== undefined) updatePayload.project_name = todoData.projectName;
      if (todoData.priority !== undefined) updatePayload.priority = todoData.priority;
      if (todoData.dueDate !== undefined) updatePayload.due_date = todoData.dueDate;
      if (todoData.completed !== undefined) updatePayload.completed = todoData.completed;
      if (todoData.recurring !== undefined) updatePayload.recurring = todoData.recurring;
      if (todoData.labels !== undefined) updatePayload.labels = todoData.labels;

      const { data, error } = await supabase
        .from('todos')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Toggle todo completion (handles recurring)
export function useToggleTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If completing a recurring task, create next occurrence
      if (completed && data.recurring && data.recurring !== 'none' && data.due_date) {
        const currentDate = new Date(data.due_date);
        let nextDate = new Date(currentDate);

        switch (data.recurring) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }

        // Create new task
        await supabase.from('todos').insert({
          title: data.title,
          description: data.description,
          client_id: data.client_id,
          client_name: data.client_name,
          project_id: data.project_id,
          project_name: data.project_name,
          priority: data.priority,
          due_date: nextDate.toISOString().split('T')[0],
          completed: false,
          recurring: data.recurring,
          labels: data.labels,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Delete todo
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// ============ SUBTASKS ============

// Add subtask
export function useAddSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ todoId, title }: { todoId: string; title: string }) => {
      // Get max sort order
      const { data: existing } = await supabase
        .from('subtasks')
        .select('sort_order')
        .eq('todo_id', todoId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          todo_id: todoId,
          title,
          completed: false,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Toggle subtask
export function useToggleSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

// Delete subtask
export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
