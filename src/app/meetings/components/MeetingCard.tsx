'use client';

import { Meeting } from '@/lib/types';
import { Calendar, Clock, User, ArrowRight, Building2, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <Link href={`/meetings/${meeting.id}`}>
      <div className="group bg-[#151515] hover:bg-[#1A1A1A] border border-white/5 hover:border-emerald-500/20 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer flex flex-col h-full">
        {/* Date & Time */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(meeting.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5" />
            <span>{meeting.time}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
          {meeting.title}
        </h3>

        {/* Client / Project Context */}
        <div className="space-y-1.5 mb-4">
          {meeting.clientName && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{meeting.clientName}</span>
            </div>
          )}
          {meeting.projectName && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="truncate">{meeting.projectName}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{meeting.attendees.length} Attendees</span>
          </div>
          <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform text-emerald-500 opacity-0 group-hover:opacity-100">
            <span className="font-medium">Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
