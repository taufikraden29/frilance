'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Project } from '@/lib/types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  projects: Project[];
  color: string;
}

export function KanbanColumn({ id, title, projects, color }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full min-w-[300px] w-[300px] bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className={`p-4 border-b border-white/5 ${color} bg-opacity-5`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-').replace('border-', 'bg-')}`}></span>
            {title}
          </h3>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <KanbanCard key={project.id} project={project} />
          ))}
        </SortableContext>

        {projects.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-xs text-gray-600">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
}
