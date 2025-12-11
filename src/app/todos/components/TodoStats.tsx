'use client';

import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Todo } from '@/lib/types';

interface TodoStatsProps {
  todos: Todo[];
}

export function TodoStats({ todos }: TodoStatsProps) {
  const pendingCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;
  const overdueCount = todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const todayCount = todos.filter(t => {
    if (!t.dueDate || t.completed) return false;
    return new Date(t.dueDate).toDateString() === new Date().toDateString();
  }).length;

  const StatCard = ({ label, value, icon: Icon, color, bg }: any) => (
    <div className={`relative overflow-hidden rounded-2xl border ${bg} p-4 transition-transform hover:scale-[1.02]`}>
      <div className="relative z-10 flex flex-col">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</span>
        <div className="flex items-end justify-between">
          <span className={`text-3xl font-bold ${color}`}>{value}</span>
          <Icon className={`w-6 h-6 ${color} opacity-80`} />
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-xl ${color.replace('text-', 'bg-')}`} />
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Pending"
        value={pendingCount}
        icon={Clock}
        color="text-white"
        bg="bg-white/5 border-white/10"
      />
      <StatCard
        label="Due Today"
        value={todayCount}
        icon={Calendar}
        color="text-blue-400"
        bg="bg-blue-500/10 border-blue-500/20"
      />
      <StatCard
        label="Overdue"
        value={overdueCount}
        icon={AlertTriangle}
        color="text-red-400"
        bg="bg-red-500/10 border-red-500/20"
      />
      <StatCard
        label="Completed"
        value={completedCount}
        icon={CheckCircle}
        color="text-emerald-400"
        bg="bg-emerald-500/10 border-emerald-500/20"
      />
    </div>
  );
}
