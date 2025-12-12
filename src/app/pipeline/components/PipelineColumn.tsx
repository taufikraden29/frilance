'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Client, ClientStatus } from '@/lib/types';
import { PipelineCard } from './PipelineCard';

interface PipelineColumnProps {
  id: ClientStatus;
  title: string;
  clients: Client[];
  color: string;
  onClientClick: (client: Client) => void;
}

export function PipelineColumn({ id, title, clients, color, onClientClick }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-[300px] flex flex-col h-full bg-[#0F0F0F] rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r ${color}`}>
        <h3 className="font-semibold text-white tracking-wide">{title}</h3>
        <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded text-white/80">
          {clients.length}
        </span>
      </div>

      {/* Drop Area */}
      <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3 bg-[#0A0A0A]/50">
        <SortableContext items={clients.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {clients.map(client => (
            <PipelineCard
              key={client.id}
              client={client}
              onClick={onClientClick}
            />
          ))}
        </SortableContext>

        {clients.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm text-gray-700 italic opacity-50">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}
