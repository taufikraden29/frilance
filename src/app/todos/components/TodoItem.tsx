'use client';

import { useState, useRef } from 'react';
import {
  CheckCircle, Circle, Repeat, User,
  FolderKanban, Calendar, ChevronDown, Plus,
  Pencil, Trash2, X, Clock, Zap, AlertTriangle
} from 'lucide-react';
import { Todo, Subtask } from '@/lib/types';
import { TODO_LABELS } from '@/hooks/useTodos';

const PRIORITY_STYLES = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

const PRIORITY_ICONS = {
  low: Clock,
  medium: Zap,
  high: AlertTriangle,
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onAddSubtask: (todoId: string, title: string) => Promise<void>;
  onToggleSubtask: (subtask: Subtask) => void;
  onDeleteSubtask: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  isSelected,
  onToggleSelect
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const PriorityIcon = PRIORITY_ICONS[todo.priority];
  const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
  const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;

  // Countdown logic
  let countdownText = '';
  let countdownColor = 'text-gray-500';
  if (todo.dueDate) {
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      countdownText = `${Math.abs(diffDays)}d late`;
      countdownColor = 'text-red-400';
    } else if (diffDays === 0) {
      countdownText = 'Today';
      countdownColor = 'text-blue-400 font-medium';
    } else if (diffDays === 1) {
      countdownText = 'Tomorrow';
      countdownColor = 'text-orange-400';
    } else {
      countdownText = `${diffDays}d left`;
    }
  }

  const handleSubtaskSubmit = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      await onAddSubtask(todo.id, newSubtask);
      setNewSubtask('');
    }
  };

  const handleAddSubtaskClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    setTimeout(() => subtaskInputRef.current?.focus(), 100);
  };

  return (
    <div className={`group rounded-2xl border transition-all duration-200 
      ${todo.completed
        ? 'bg-white/2 border-white/5 opacity-50 hover:opacity-80'
        : isSelected
          ? 'bg-emerald-500/5 border-emerald-500/30'
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/20'
      }`}>

      {/* Main Row */}
      <div className="flex items-start gap-4 p-4 pl-3">

        {/* Selection Checkbox - Visible on hover or when selected */}
        <div className={`flex items-center justify-center pt-1 transition-all duration-200 
          ${isSelected ? 'w-5 opacity-100' : 'w-0 opacity-0 group-hover:w-5 group-hover:opacity-100 overflow-hidden'}
        `}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(todo.id)}
            className="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500/20 bg-white/5 cursor-pointer transition-colors hover:border-emerald-500/50"
          />
        </div>

        {/* Complete Button */}
        <button
          onClick={() => onToggle(todo)}
          className="relative z-10 pt-0.5 transition-transform active:scale-90"
        >
          {todo.completed
            ? <CheckCircle className="w-6 h-6 text-emerald-500" />
            : <Circle className={`w-6 h-6 ${PRIORITY_STYLES[todo.priority]} opacity-60 hover:opacity-100 hover:fill-current/10`} />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3
                onClick={() => setIsExpanded(!isExpanded)}
                className={`font-medium text-lg leading-tight cursor-pointer select-none transition-colors
                  ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-200 group-hover:text-white'}
                `}
              >
                {todo.title}
              </h3>
              {todo.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{todo.description}</p>
              )}
            </div>

            {/* Hover Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handleAddSubtaskClick} className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Add Subtask">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => onEdit(todo)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Edit">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(todo.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta Data Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
            {/* Due Date & Countdown */}
            {todo.dueDate && (
              <div className={`flex items-center gap-1.5 ${countdownColor}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span className="opacity-60">• {countdownText}</span>
              </div>
            )}

            {/* Labels */}
            {todo.labels && todo.labels.length > 0 && (
              <div className="flex gap-1.5">
                {todo.labels.map(labelId => {
                  const label = TODO_LABELS.find(l => l.id === labelId);
                  if (!label) return null;
                  return (
                    <span key={labelId} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 ${label.color.replace('bg-', 'text-').replace('/20', '')}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${label.color.replace('/20', '')}`} />
                      {label.name}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Context (Project/Client) */}
            {(todo.clientName || todo.projectName) && (
              <div className="flex items-center gap-3 border-l border-white/10 pl-3">
                {todo.clientName && (
                  <span className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                    <User className="w-3.5 h-3.5" />
                    {todo.clientName}
                  </span>
                )}
                {todo.projectName && (
                  <span className="flex items-center gap-1 hover:text-gray-300 transition-colors">
                    <FolderKanban className="w-3.5 h-3.5" />
                    {todo.projectName}
                  </span>
                )}
              </div>
            )}

            {/* Subtask Indicator */}
            {hasSubtasks && (
              <div className={`flex items-center gap-1.5 ${completedSubtasks === todo.subtasks!.length ? 'text-emerald-400' : 'text-gray-500'}`}>
                {completedSubtasks}/{todo.subtasks!.length} subtasks
              </div>
            )}

            {/* Recurring */}
            {todo.recurring !== 'none' && (
              <span className="flex items-center gap-1 text-purple-400">
                <Repeat className="w-3.5 h-3.5" />
                {todo.recurring}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subtasks / Expansion Area */}
      {(isExpanded || hasSubtasks) && (
        <div className={`
          border-t border-white/5 bg-black/20 overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[500px] opacity-100 py-3 rounded-b-2xl' : 'max-h-0 opacity-0 py-0'}
        `}>
          <div className="px-4 pl-14 space-y-2">
            {/* Existing Subtasks */}
            {todo.subtasks?.map(sub => (
              <div key={sub.id} className="flex items-center gap-3 group/sub">
                <button
                  onClick={() => onToggleSubtask(sub)}
                  className="text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  {sub.completed
                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : <Circle className="w-4 h-4" />
                  }
                </button>
                <span className={`flex-1 text-sm ${sub.completed ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                  {sub.title}
                </span>
                <button
                  onClick={() => onDeleteSubtask(sub.id)}
                  className="opacity-0 group-hover/sub:opacity-100 text-gray-600 hover:text-red-400 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Quick Add Subtask */}
            <div className="flex items-center gap-3 mt-2">
              <Plus className="w-4 h-4 text-emerald-500/50" />
              <input
                ref={subtaskInputRef}
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={handleSubtaskSubmit}
                placeholder="Add subtask..."
                className="flex-1 bg-transparent text-sm text-gray-400 placeholder-gray-600 focus:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Expand Toggle (Always visible if expanded or hover) */}
      <div className="absolute bottom-0 left-0 w-full flex justify-center pb-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="pointer-events-auto p-1 rounded-full bg-gray-800/50 text-gray-400 hover:text-white backdrop-blur-sm"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}
