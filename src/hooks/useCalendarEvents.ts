import { useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useInvoices } from '@/hooks/useInvoices';
import { useTodos } from '@/hooks/useTodos';
import { isSameDay, parseISO } from 'date-fns';

export type EventType = 'project' | 'invoice' | 'todo';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  status: string;
  description?: string;
  amount?: number;
  priority?: string;
  metadata?: any;
}

export function useCalendarEvents() {
  const { data: projects = [] } = useProjects();
  const { data: invoices = [] } = useInvoices();
  const { data: todos = [] } = useTodos();

  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    // 1. Projects (Deadlines)
    projects.forEach(project => {
      if (project.deadline) {
        allEvents.push({
          id: project.id,
          title: `Deadline: ${project.name}`,
          date: new Date(project.deadline),
          type: 'project',
          status: project.status,
          description: project.clientName,
          metadata: project
        });
      }
    });

    // 2. Invoices (Due Dates)
    invoices.forEach(invoice => {
      if (invoice.dueDate) {
        allEvents.push({
          id: invoice.id,
          title: `Invoice #${invoice.invoiceNumber}`,
          date: new Date(invoice.dueDate),
          type: 'invoice',
          status: invoice.status,
          amount: invoice.total,
          description: invoice.clientName,
          metadata: invoice
        });
      }
    });

    // 3. Todos (Due Dates)
    todos.forEach(todo => {
      if (todo.dueDate) {
        allEvents.push({
          id: todo.id,
          title: todo.title,
          date: new Date(todo.dueDate),
          type: 'todo',
          status: todo.completed ? 'completed' : 'pending',
          priority: todo.priority,
          description: todo.description,
          metadata: todo
        });
      }
    });

    // Sort by date
    return allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [projects, invoices, todos]);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  return {
    events,
    getEventsForDate
  };
}
