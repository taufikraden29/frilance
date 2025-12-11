'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { Project } from '@/lib/types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useState } from 'react';

interface KanbanBoardProps {
  projects: Project[];
  onUpdateStatus: (projectId: string, newStatus: Project['status']) => void;
}

const COLUMNS = [
  { id: 'pending', title: 'Pending', color: 'text-gray-400 border-gray-500/20' },
  { id: 'in-progress', title: 'In Progress', color: 'text-blue-400 border-blue-500/20' },
  { id: 'completed', title: 'Completed', color: 'text-emerald-400 border-emerald-500/20' },
  { id: 'cancelled', title: 'Cancelled', color: 'text-red-400 border-red-500/20' },
];

export function KanbanBoard({ projects, onUpdateStatus }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    // Find where it was dropped. 
    // If dropped on a column, over.id is the column id.
    // If dropped on a card, find that card's column.

    let newStatus = over.id as Project['status'];

    // Check if dropped on a card instead of column
    const overProject = projects.find(p => p.id === over.id);
    if (overProject) {
      newStatus = overProject.status;
    }

    // Only update if status changed
    const activeProject = projects.find(p => p.id === activeId);
    if (activeProject && activeProject.status !== newStatus && COLUMNS.some(c => c.id === newStatus)) {
      onUpdateStatus(activeId, newStatus);
    }

    setActiveId(null);
  };

  const activeProject = projects.find(p => p.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-[calc(100vh-250px)] overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            projects={projects.filter(p => p.status === col.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject ? <KanbanCard project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
