'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Meeting } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'frilance_meetings';

// Mock storage helper
const getStoredMeetings = (): Meeting[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const setStoredMeetings = (meetings: Meeting[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
};

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getStoredMeetings().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: ['meetings', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const meetings = getStoredMeetings();
      return meetings.find(m => m.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newMeeting: Meeting = {
        ...meeting,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const meetings = getStoredMeetings();
      setStoredMeetings([newMeeting, ...meetings]);
      return newMeeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Meeting> }) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const meetings = getStoredMeetings();
      const updatedMeetings = meetings.map(m =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      );
      setStoredMeetings(updatedMeetings);
      return updatedMeetings.find(m => m.id === id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetings', variables.id] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const meetings = getStoredMeetings();
      setStoredMeetings(meetings.filter(m => m.id !== id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
  });
}
