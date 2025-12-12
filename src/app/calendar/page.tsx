'use client';

import { useState } from 'react';
import { useCalendarEvents, CalendarEvent } from '@/hooks/useCalendarEvents';
import { CalendarView } from './components/CalendarView';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { format } from 'date-fns';
import { Clock, DollarSign, FolderKanban, CheckCircle, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { events } = useCalendarEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const getLink = (event: CalendarEvent) => {
    switch (event.type) {
      case 'project': return `/projects`; // Ideally direct link to ID if supported
      case 'invoice': return `/invoices`;
      case 'todo': return `/todos`;
      default: return '#';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-none">
        <Header
          title="Calendar"
          subtitle="Unified view of your deadlines, invoices, and tasks."
        />
      </div>

      <div className="flex-1 p-6 min-h-0 overflow-hidden">
        <CalendarView
          events={events}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={setSelectedEvent}
        />
      </div>

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.type.toUpperCase() || 'Event'}
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10`}>
                {selectedEvent.type === 'project' && <FolderKanban className="w-6 h-6 text-blue-400" />}
                {selectedEvent.type === 'invoice' && <DollarSign className="w-6 h-6 text-emerald-400" />}
                {selectedEvent.type === 'todo' && <Clock className="w-6 h-6 text-purple-400" />}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedEvent.title}</h3>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  {format(selectedEvent.date, 'PPP')}
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-4">
              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Context</label>
                  <p className="text-gray-300 mt-1">{selectedEvent.description}</p>
                </div>
              )}

              {/* Amount (Invoice) */}
              {selectedEvent.amount !== undefined && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
                  <p className="text-xl font-mono text-emerald-400 mt-1">
                    Rp {selectedEvent.amount.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 capitalize">
                    {selectedEvent.status === 'completed' || selectedEvent.status === 'paid' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                    {selectedEvent.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <Link
                href={getLink(selectedEvent)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors"
                onClick={() => setSelectedEvent(null)}
              >
                Open {selectedEvent.type} <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
