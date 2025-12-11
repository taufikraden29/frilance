// LocalStorage utility functions

const isBrowser = typeof window !== 'undefined';

export function getItem<T>(key: string): T | null {
  if (!isBrowser) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

export function removeItem(key: string): void {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Storage keys
export const STORAGE_KEYS = {
  PROJECTS: 'freelance_projects',
  CLIENTS: 'freelance_clients',
  INVOICES: 'freelance_invoices',
  TIME_ENTRIES: 'freelance_time_entries',
  SERVICES: 'freelance_services',
  EXPENSES: 'freelance_expenses',
  QUOTATIONS: 'freelance_quotations',
  SETTINGS: 'freelance_settings',
} as const;
