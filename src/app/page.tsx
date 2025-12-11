'use client';

import { Header } from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { DataTable } from '@/components/DataTable';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { useTimeEntries, useMonthlyTimeEntries } from '@/hooks/useTimeEntries';
import {
  FolderKanban,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  ArrowRight,
  Wallet,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { Project, Invoice } from '@/lib/types';
import { STATUS_STYLES } from '@/lib/styles';
import { useExpenses } from '@/hooks/useExpenses';

export default function Dashboard() {
  const { data: projects = [] } = useProjects();
  const { data: clients = [] } = useClients();
  const { data: invoices = [] } = useInvoices();
  const { data: monthlyEntries = [] } = useMonthlyTimeEntries();

  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const { data: expenses = [] } = useExpenses();
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;
  const monthlyHours = monthlyEntries.reduce((sum, e) => sum + e.hours, 0);

  const recentProjects = projects.slice(-5).reverse();
  const recentInvoices = invoices.slice(-5).reverse();

  const projectColumns = [
    {
      key: 'name',
      header: 'Project',
      render: (item: Project) => (
        <div>
          <p className="font-medium text-white">{item.name}</p>
          <p className="text-sm text-gray-400">{item.clientName || 'No client'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Project) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>
          {item.status.replace('-', ' ')}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (item: Project) => (
        <span className="text-emerald-400 font-medium">
          Rp {item.budget.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (item: Project) => (
        <span className="text-gray-400">
          {new Date(item.deadline).toLocaleDateString('id-ID')}
        </span>
      ),
    },
  ];

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (item: Invoice) => (
        <span className="font-medium text-white">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'clientName',
      header: 'Client',
      render: (item: Invoice) => (
        <span className="text-gray-400">{item.clientName}</span>
      ),
    },
    {
      key: 'total',
      header: 'Amount',
      render: (item: Invoice) => (
        <span className="text-emerald-400 font-medium">
          Rp {item.total.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Invoice) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[item.status]}`}>
          {item.status}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's your freelance overview."
      />

      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={FolderKanban}
            label="Total Projects"
            value={projects.length}
            change={{ value: 12, positive: true }}
            color="emerald"
          />
          <StatsCard
            icon={Users}
            label="Total Clients"
            value={clients.length}
            color="blue"
          />
          <StatsCard
            icon={DollarSign}
            label="Total Revenue"
            value={`Rp ${totalRevenue.toLocaleString('id-ID')}`}
            change={{ value: 8, positive: true }}
            color="emerald"
          />
          <StatsCard
            icon={CreditCard}
            label="Total Expenses"
            value={`Rp ${totalExpenses.toLocaleString('id-ID')}`}
            color="red"
          />
          <StatsCard
            icon={Wallet}
            label="Net Profit"
            value={`Rp ${netProfit.toLocaleString('id-ID')}`}
            change={{ value: 10, positive: true }}
            color="blue"
          />
          <StatsCard
            icon={Clock}
            label="Hours This Month"
            value={monthlyHours.toFixed(1)}
            color="orange"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Projects</h3>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold gradient-text">{activeProjects}</p>
            <p className="text-gray-400 text-sm mt-2">projects in progress</p>
          </div>

          <div className="p-6 glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Pending Invoices</h3>
              <FileText className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-4xl font-bold text-yellow-400">{pendingInvoices}</p>
            <p className="text-gray-400 text-sm mt-2">awaiting payment</p>
          </div>

          <div className="p-6 glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Avg Hourly Rate</h3>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold gradient-text">
              {monthlyHours > 0 ? `Rp ${Math.round(totalRevenue / monthlyHours).toLocaleString('id-ID')}` : 'N/A'}
            </p>
            <p className="text-gray-400 text-sm mt-2">this month</p>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
              <Link
                href="/projects"
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable
              columns={projectColumns}
              data={recentProjects}
              emptyMessage="No projects yet. Create your first project!"
            />
          </div>

          {/* Recent Invoices */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
              <Link
                href="/invoices"
                className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable
              columns={invoiceColumns}
              data={recentInvoices}
              emptyMessage="No invoices yet. Create your first invoice!"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
