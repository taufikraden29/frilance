'use client';

import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isToday, isSameDay,
  addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, DollarSign, FolderKanban } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useCalendarEvents';
import { useState } from 'react';

interface CalendarViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const EVENT_STYLES = {
  project: 'bg-blue-500/10 text-blue-400 border-l-2 border-blue-500',
  invoice: 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500',
  todo: 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-500',
};

const EVENT_ICONS = {
  project: FolderKanban,
  invoice: DollarSign,
  todo: Clock,
};

export function CalendarView({ events, currentDate, onDateChange, onEventClick }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => onDateChange(addMonths(currentDate, 1));
  const prevMonth = () => onDateChange(subMonths(currentDate, 1));
  const goToToday = () => onDateChange(new Date());

  return (
    <div className="flex flex-col h-full bg-[#151515] rounded-xl border border-white/5 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1A1A1A]">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white capitalize">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex bg-white/5 rounded-lg border border-white/5 p-1">
            <button onClick={prevMonth} className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button onClick={goToToday} className="text-sm px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            Today
          </button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-white/5 bg-[#1A1A1A]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-[#0F0F0F] overflow-y-auto">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          const dayEvents = events.filter(e => isSameDay(e.date, day));

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border-b border-r border-white/5 p-2 flex flex-col gap-1 transition-colors
                ${!isCurrentMonth ? 'bg-[#0A0A0A] opacity-50' : 'bg-[#0F0F0F]'}
                ${isDayToday ? 'bg-white/[0.02]' : ''}
              `}
              onClick={() => setSelectedDay(day)}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${isDayToday ? 'bg-emerald-500 text-white' : 'text-gray-400'}
                `}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-gray-600 font-mono">{dayEvents.length}</span>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-1 overflow-y-auto custom-scrollbar max-h-[80px]">
                {dayEvents.map(event => {
                  const Icon = EVENT_ICONS[event.type];
                  return (
                    <button
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`text-left text-[10px] px-1.5 py-1 rounded truncate flex items-center gap-1.5 hover:opacity-80 transition-opacity ${EVENT_STYLES[event.type]}`}
                    >
                      <Icon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
