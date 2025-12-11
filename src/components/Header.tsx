'use client';

import { Bell, Search, User, Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
            >
              <Plus className="w-4 h-4" />
              {action.label}
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {/* Profile */}
          <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white">Freelancer</span>
          </button>
        </div>
      </div>
    </header>
  );
}
