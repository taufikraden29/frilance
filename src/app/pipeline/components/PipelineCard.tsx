'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Client } from '@/lib/types';
import { Building2, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PipelineCardProps {
  client: Client;
  onClick: (client: Client) => void;
}

export function PipelineCard({ client, onClick }: PipelineCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(client)}
      className="p-4 bg-[#151515] hover:bg-[#1A1A1A] border border-white/5 rounded-xl cursor-grab active:cursor-grabbing group transition-all hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {client.name}
        </h4>
        <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
          {format(new Date(client.updatedAt), 'MMM d')}
        </span>
      </div>

      {client.company && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Building2 className="w-3 h-3" />
          <span className="truncate">{client.company}</span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
        {client.email && (
          <a href={`mailto:${client.email}`} className="text-gray-500 hover:text-white transition-colors" title={client.email} onClick={(e) => e.stopPropagation()}>
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {client.phone && (
          <a href={`https://wa.me/${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-emerald-400 transition-colors" title={client.phone} onClick={(e) => e.stopPropagation()}>
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
