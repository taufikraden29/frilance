'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useTimeEntries, useCreateTimeEntry, useDeleteTimeEntry } from '@/hooks/useTimeEntries';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/components/Toast';
import { TimeEntry } from '@/lib/types';
import { Play, Square, Clock, Trash2 } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY } from '@/lib/styles';

export default function TimeTrackingPage() {
  const { data: entries = [] } = useTimeEntries();
  const { data: projects = [] } = useProjects();
  const createMutation = useCreateTimeEntry();
  const deleteMutation = useDeleteTimeEntry();
  const { showToast } = useToast();

  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Simple quick stats
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const thisMonthHours = entries
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((sum, e) => sum + e.hours, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      showToast('Please select a project', 'error');
      return;
    }

    try {
      const project = projects.find(p => p.id === projectId);
      await createMutation.mutateAsync({
        projectId,
        projectName: project?.name || 'Unknown',
        description,
        hours: Number(hours),
        date: new Date(date).toISOString(),
      });
      showToast('Time entry added', 'success');
      setDescription('');
      setHours('');
    } catch (error) {
      showToast('Failed to add time entry', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this time entry?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Entry deleted', 'success');
      } catch (error) {
        showToast('Failed to delete entry', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Time Tracking"
        subtitle="Log and monitor your work hours"
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Log Time
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={LABEL_STYLES}>Project</label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className={`${INPUT_STYLES} appearance-none`}
                >
                  <option value="">Select project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id} className="bg-gray-900">
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_STYLES}>Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={INPUT_STYLES}
                />
              </div>

              <div>
                <label className={LABEL_STYLES}>Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={INPUT_STYLES}
                  placeholder="e.g. 2.5"
                />
              </div>

              <div>
                <label className={LABEL_STYLES}>Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${INPUT_STYLES} min-h-[100px]`}
                  placeholder="What did you work on?"
                />
              </div>

              <button type="submit" className={`${BTN_PRIMARY} w-full`}>
                Add Entry
              </button>
            </form>
          </div>

          <div className="glass p-6 rounded-2xl">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Hours (All Time)</h3>
            <p className="text-3xl font-bold text-white">{totalHours.toFixed(1)}h</p>

            <div className="w-full h-px bg-white/10 my-4" />

            <h3 className="text-gray-400 text-sm font-medium mb-1">This Month</h3>
            <p className="text-3xl font-bold text-emerald-400">{thisMonthHours.toFixed(1)}h</p>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="divide-y divide-white/5">
              {entries.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  No time entries yet. Start logging your work!
                </div>
              ) : (
                [...entries].reverse().map(entry => (
                  <div key={entry.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group">
                    <div>
                      <h4 className="font-medium text-white">{entry.projectName}</h4>
                      <p className="text-sm text-gray-400 mt-0.5">{entry.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-emerald-400">
                        {entry.hours}h
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
