'use client';

import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useProject } from '@/hooks/useProjects';
import { useTimeEntriesByProject } from '@/hooks/useTimeEntries';
import { useInvoicesByProject } from '@/hooks/useInvoices'; // Will create this
import { StatsCard } from '@/components/StatsCard';
import { DataTable } from '@/components/DataTable';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { STATUS_STYLES } from '@/lib/styles';
import { Invoice } from '@/lib/types';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const projectId = typeof id === 'string' ? id : '';

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: timeEntries = [] } = useTimeEntriesByProject(projectId);
  const { data: invoices = [] } = useInvoicesByProject(projectId);

  if (isLoadingProject) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-xl font-bold">Project not found</h2>
        <button onClick={() => router.back()} className="text-emerald-400 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  // Calculations
  const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const pendingAmount = totalBilled - paidInvoices;

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (i: Invoice) => <span className="text-white">{i.invoiceNumber}</span>
    },
    {
      key: 'date',
      header: 'Date',
      render: (i: Invoice) => <span className="text-gray-400">{new Date(i.createdAt).toLocaleDateString()}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (i: Invoice) => <span className="text-emerald-400">Rp {i.total.toLocaleString('id-ID')}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (i: Invoice) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_STYLES[i.status]}`}>
          {i.status.toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 pb-12">
      <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[project.status]}`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-gray-400">{project.clientName}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Deadline</p>
              <div className="flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {new Date(project.deadline).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            icon={DollarSign}
            label="Project Budget"
            value={`Rp ${project.budget.toLocaleString('id-ID')}`}
            color="emerald"
          />
          <StatsCard
            icon={Clock}
            label="Total Hours"
            value={`${totalHours}h`}
            color="blue"
          />
          <StatsCard
            icon={CheckCircle}
            label="Paid Revenue"
            value={`Rp ${paidInvoices.toLocaleString('id-ID')}`}
            color="purple"
          />
          <StatsCard
            icon={AlertCircle}
            label="Pending"
            value={`Rp ${pendingAmount.toLocaleString('id-ID')}`}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div className="glass p-6 rounded-2xl h-fit">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              About Project
            </h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Time Entries */}
          <div className="glass p-6 rounded-2xl h-fit">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {timeEntries.length === 0 ? (
                <p className="text-gray-500 text-sm">No time logged yet.</p>
              ) : (
                timeEntries.slice().reverse().map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-sm text-white font-medium">{entry.description}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-emerald-400 font-bold">{entry.hours}h</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Invoices */}
          <div className="glass p-6 rounded-2xl lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
              Project Invoices
            </h3>
            <DataTable
              columns={invoiceColumns}
              data={invoices}
              emptyMessage="No invoices generated for this project."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
