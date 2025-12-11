'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Project } from '@/lib/types';
import { Calendar, DollarSign, User } from 'lucide-react';

interface KanbanCardProps {
  project: Project;
}

export function KanbanCard({ project }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-900/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/50 cursor-grab active:cursor-grabbing group shadow-sm hover:shadow-emerald-500/5 transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
          {project.name}
        </h4>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <User className="w-3 h-3" />
          <span className="truncate">{project.clientName}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(project.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
            Rp {(project.budget / 1000000).toLocaleString('id-ID')}M
          </div>
        </div>
      </div>
    </div>
  );
}
