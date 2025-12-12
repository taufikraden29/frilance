'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  closestCorners
} from '@dnd-kit/core';
import { Client, ClientStatus } from '@/lib/types';
import { PipelineColumn } from './PipelineColumn';
import { PipelineCard } from './PipelineCard';
import { useClients, useUpdateClient } from '@/hooks/useClients';
import { createPortal } from 'react-dom';

const COLUMNS: { id: ClientStatus; title: string; color: string }[] = [
  { id: 'lead', title: 'Leads', color: 'from-blue-500/10 to-blue-500/5 border-l-4 border-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'from-purple-500/10 to-purple-500/5 border-l-4 border-purple-500' },
  { id: 'proposal', title: 'Proposal', color: 'from-yellow-500/10 to-yellow-500/5 border-l-4 border-yellow-500' },
  { id: 'negotiation', title: 'Negotiation', color: 'from-orange-500/10 to-orange-500/5 border-l-4 border-orange-500' },
  { id: 'active', title: 'Active', color: 'from-emerald-500/10 to-emerald-500/5 border-l-4 border-emerald-500' },
];

interface PipelineBoardProps {
  onClientClick: (client: Client) => void;
}

export function PipelineBoard({ onClientClick }: PipelineBoardProps) {
  const { data: clients = [] } = useClients();
  const updateClient = useUpdateClient();
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

    if (over && active.id !== over.id) {
      // Find the container (column) we dropped into
      // Note: dnd-kit can drop onto a Card OR a Column. We need to handle both.

      const activeClient = clients.find(c => c.id === active.id);
      if (!activeClient) return;

      let newStatus: ClientStatus | undefined;

      // Check if dropped on a column
      if (COLUMNS.some(col => col.id === over.id)) {
        newStatus = over.id as ClientStatus;
      }
      // Check if dropped on another card
      else {
        const overClient = clients.find(c => c.id === over.id);
        if (overClient) {
          newStatus = overClient.status;
        }
      }

      if (newStatus && newStatus !== activeClient.status) {
        updateClient.mutate({
          id: activeClient.id,
          data: { status: newStatus }
        });
      }
    }

    setActiveId(null);
  };

  const activeClient = activeId ? clients.find(c => c.id === activeId) : null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto p-1 pb-4">
        {COLUMNS.map(col => (
          <PipelineColumn
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            clients={clients.filter(c => (c.status || 'lead') === col.id)}
            onClientClick={onClientClick}
          />
        ))}
      </div>

      {mounted && createPortal(
        <DragOverlay>
          {activeClient ? (
            <PipelineCard client={activeClient} onClick={() => { }} />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
