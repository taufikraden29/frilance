'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export const DEFAULT_SETTINGS: Settings = {
  businessName: '',
  businessEmail: '',
  businessAddress: '',
  businessPhone: '',
  defaultTaxRate: 11,
  currency: 'IDR',
};

// Get settings
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Settings fetch error:', error);
        return DEFAULT_SETTINGS;
      }

      if (!data) return DEFAULT_SETTINGS;

      return {
        businessName: data.business_name || '',
        businessEmail: data.business_email || '',
        businessAddress: data.business_address || '',
        businessPhone: data.business_phone || '',
        defaultTaxRate: Number(data.default_tax_rate) || 11,
        currency: data.currency || 'IDR',
      } as Settings;
    },
  });
}

// Update settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const updatePayload: any = {};

      if (settings.businessName !== undefined) updatePayload.business_name = settings.businessName;
      if (settings.businessEmail !== undefined) updatePayload.business_email = settings.businessEmail;
      if (settings.businessAddress !== undefined) updatePayload.business_address = settings.businessAddress;
      if (settings.businessPhone !== undefined) updatePayload.business_phone = settings.businessPhone;
      if (settings.defaultTaxRate !== undefined) updatePayload.default_tax_rate = settings.defaultTaxRate;
      if (settings.currency !== undefined) updatePayload.currency = settings.currency;

      const { data, error } = await supabase
        .from('settings')
        .upsert({ id: 1, ...updatePayload })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
