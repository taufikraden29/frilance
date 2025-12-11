'use client';

import { Modal } from '@/components/Modal';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { TODO_LABELS } from '@/hooks/useTodos';
import { Todo } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Calendar, User, FolderKanban, Tag, Clock } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY } from '@/lib/styles';

interface CreateTodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Todo>) => Promise<void>;
  initialData?: Todo | null;
}

export function CreateTodoDialog({ isOpen, onClose, onSubmit, initialData }: CreateTodoDialogProps) {
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();

  const [formData, setFormData] = useState<Partial<Todo>>({
    priority: 'medium',
    completed: false,
    recurring: 'none',
    labels: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dueDate: initialData.dueDate || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        completed: false,
        recurring: 'none',
        labels: [],
        clientId: '',
        projectId: '',
      });
    }
  }, [initialData, isOpen]);

  const toggleLabel = (labelId: string) => {
    const current = formData.labels || [];
    if (current.includes(labelId)) {
      setFormData({ ...formData, labels: current.filter(l => l !== labelId) });
    } else {
      setFormData({ ...formData, labels: [...current, labelId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title & Description */}
        <div className="space-y-3">
          <input
            type="text"
            required
            autoFocus
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-transparent text-xl font-medium text-white placeholder-gray-500 border-none focus:outline-none focus:ring-0 p-0"
            placeholder="What needs to be done?"
          />
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 border-none focus:outline-none focus:ring-0 p-0 min-h-[60px] resize-none"
            placeholder="Add details, notes, or subtasks outline..."
          />
        </div>

        <div className="h-px bg-white/10" />

        {/* Properties Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">

          {/* Priority */}
          <div className="col-span-2">
            <label className={`${LABEL_STYLES} mb-2`}>Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all
                    ${formData.priority === p
                      ? p === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : p === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                      : 'border-white/5 text-gray-500 hover:bg-white/5'
                    }`}
                >
                  <span className="capitalize">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className={`${LABEL_STYLES} mb-1.5 flex items-center gap-2`}>
              <Calendar className="w-3 h-3" /> Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className={INPUT_STYLES}
            />
          </div>

          {/* Recurring */}
          <div>
            <label className={`${LABEL_STYLES} mb-1.5 flex items-center gap-2`}>
              <Clock className="w-3 h-3" /> Recurring
            </label>
            <select
              value={formData.recurring || 'none'}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.value as any })}
              className={`${INPUT_STYLES} appearance-none`}
            >
              <option value="none" className="bg-gray-900">No Repeat</option>
              <option value="daily" className="bg-gray-900">Daily</option>
              <option value="weekly" className="bg-gray-900">Weekly</option>
              <option value="monthly" className="bg-gray-900">Monthly</option>
            </select>
          </div>

          {/* Client */}
          <div>
            <label className={`${LABEL_STYLES} mb-1.5 flex items-center gap-2`}>
              <User className="w-3 h-3" /> Client
            </label>
            <select
              value={formData.clientId || ''}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className={`${INPUT_STYLES} appearance-none`}
            >
              <option value="" className="bg-gray-900">No Client</option>
              {clients.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>)}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className={`${LABEL_STYLES} mb-1.5 flex items-center gap-2`}>
              <FolderKanban className="w-3 h-3" /> Project
            </label>
            <select
              value={formData.projectId || ''}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className={`${INPUT_STYLES} appearance-none`}
            >
              <option value="" className="bg-gray-900">No Project</option>
              {projects.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>)}
            </select>
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className={`${LABEL_STYLES} mb-2 flex items-center gap-2`}>
            <Tag className="w-3 h-3" /> Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {TODO_LABELS.map(label => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                  ${formData.labels?.includes(label.id)
                    ? `${label.color.replace('bg-', 'bg-opacity-20 ')} ${label.color.replace('bg-', 'text-').replace('/20', '')} border-${label.color.replace('bg-', '').replace('/20', '')}-500/30`
                    : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                  }`}
              >
                {label.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancel</button>
          <button type="submit" className={BTN_PRIMARY}>{initialData ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </form>
    </Modal>
  );
}
