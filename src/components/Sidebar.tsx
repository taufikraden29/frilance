'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  Clock,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Tag,
  CreditCard,
  FileSignature,
  LogOut,
  CheckSquare
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FolderKanban, label: 'Projects', href: '/projects' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: FileText, label: 'Invoices', href: '/invoices' },
  { icon: FileSignature, label: 'Quotations', href: '/quotations' },
  { icon: CreditCard, label: 'Expenses', href: '/expenses' },
  { icon: Tag, label: 'Services', href: '/services' },
  { icon: CheckSquare, label: 'Tasks', href: '/todos' },
  { icon: Clock, label: 'Time Tracking', href: '/time-tracking' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-white/5 transition-all duration-300 z-40 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-white tracking-tight">
            Free<span className="text-emerald-400">lance</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors`} />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* Logout Button */}
      <button
        onClick={async () => {
          if (confirm('Sign out?')) {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }
        }}
        className={`absolute bottom-20 left-4 right-4 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 ${collapsed ? 'justify-center px-0' : ''
          }`}
      >
        <LogOut className="w-5 h-5" />
        {!collapsed && <span className="font-medium">Logout</span>}
      </button>
    </aside >
  );
}
