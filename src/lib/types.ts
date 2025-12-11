// TypeScript interfaces for all entities

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  description: string;
  hours: number;
  date: string;
  createdAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalClients: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalHoursThisMonth: number;
}

export interface Settings {
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  businessPhone: string;
  defaultTaxRate: number;
  currency: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  labels: string[];
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  todoId: string;
  title: string;
  completed: boolean;
  sortOrder: number;
  createdAt: string;
}
