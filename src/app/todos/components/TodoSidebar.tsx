'use client';

import {
  Layout, Calendar, Star, Clock,
  FolderKanban, User, Tag,
  ChevronDown, ChevronRight, Hash
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { TODO_LABELS } from '@/hooks/useTodos';
import { useState } from 'react';

export type TodoView =
  | { type: 'all' }
  | { type: 'today' }
  | { type: 'upcoming' }
  | { type: 'priority'; level: 'high' }
  | { type: 'project'; id: string }
  | { type: 'client'; id: string }
  | { type: 'label'; id: string };

interface TodoSidebarProps {
  currentView: TodoView;
  onViewChange: (view: TodoView) => void;
  className?: string;
}

export function TodoSidebar({ currentView, onViewChange, className = '' }: TodoSidebarProps) {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const [expandedSections, setExpandedSections] = useState({
    projects: true,
    clients: true,
    labels: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (view: TodoView) => {
    if (view.type !== currentView.type) return false;
    if ('id' in view && 'id' in currentView) return view.id === currentView.id;
    if ('level' in view && 'level' in currentView) return view.level === currentView.level;
    return true;
  };

  const NavItem = ({ view, icon: Icon, label, color }: { view: TodoView; icon: any; label: string; color?: string }) => (
    <button
      onClick={() => onViewChange(view)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium
        ${isActive(view)
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
    >
      <Icon className={`w-4 h-4 ${color || (isActive(view) ? 'text-emerald-400' : 'text-gray-500')}`} />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <div className={`flex flex-col gap-6 ${className} h-full overflow-y-auto pr-2 custom-scrollbar`}>
      {/* Main Views */}
      <div className="space-y-1">
        <NavItem view={{ type: 'all' }} icon={Layout} label="All Tasks" />
        <NavItem view={{ type: 'today' }} icon={Star} label="Today" color="text-yellow-400" />
        <NavItem view={{ type: 'upcoming' }} icon={Calendar} label="Upcoming" color="text-blue-400" />
        <NavItem view={{ type: 'priority', level: 'high' }} icon={Clock} label="High Priority" color="text-red-400" />
      </div>

      {/* Projects */}
      <div className="space-y-1">
        <button
          onClick={() => toggleSection('projects')}
          className="flex items-center gap-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-full hover:text-gray-300"
        >
          {expandedSections.projects ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Projects
        </button>
        {expandedSections.projects && (
          <div className="space-y-0.5 mt-1">
            {projects.map(project => (
              <NavItem
                key={project.id}
                view={{ type: 'project', id: project.id }}
                icon={FolderKanban}
                label={project.name}
              />
            ))}
            {projects.length === 0 && (
              <div className="px-3 py-1 text-xs text-gray-600 italic">No projects</div>
            )}
          </div>
        )}
      </div>

      {/* Clients */}
      <div className="space-y-1">
        <button
          onClick={() => toggleSection('clients')}
          className="flex items-center gap-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-full hover:text-gray-300"
        >
          {expandedSections.clients ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Clients
        </button>
        {expandedSections.clients && (
          <div className="space-y-0.5 mt-1">
            {clients.map(client => (
              <NavItem
                key={client.id}
                view={{ type: 'client', id: client.id }}
                icon={User}
                label={client.name}
              />
            ))}
            {clients.length === 0 && (
              <div className="px-3 py-1 text-xs text-gray-600 italic">No clients</div>
            )}
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="space-y-1">
        <button
          onClick={() => toggleSection('labels')}
          className="flex items-center gap-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-full hover:text-gray-300"
        >
          {expandedSections.labels ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Labels
        </button>
        {expandedSections.labels && (
          <div className="space-y-0.5 mt-1">
            {TODO_LABELS.map(label => (
              <NavItem
                key={label.id}
                view={{ type: 'label', id: label.id }}
                icon={Hash}
                label={label.name}
                color={label.color.replace('bg-', 'text-').replace('/20', '')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
