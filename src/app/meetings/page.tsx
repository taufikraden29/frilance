'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { MeetingCard } from './components/MeetingCard';
import { useMeetings, useCreateMeeting } from '@/hooks/useMeetings';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

export default function MeetingsPage() {
  const router = useRouter();
  const { data: meetings = [], isLoading } = useMeetings();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createMeeting = useCreateMeeting();
  const { showToast } = useToast();

  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('');

  const filteredMeetings = meetings.filter(m => {
    const matchesClient = filterClient ? m.clientId === filterClient : true;
    const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClient && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientId = formData.get('clientId') as string;
    const projectId = formData.get('projectId') as string;

    const client = clients.find(c => c.id === clientId);
    const project = projects.find(p => p.id === projectId);

    try {
      const newMeeting = await createMeeting.mutateAsync({
        title: formData.get('title') as string,
        date: formData.get('date') as string,
        time: formData.get('time') as string,
        clientId: client?.id,
        clientName: client?.name,
        projectId: project?.id,
        projectName: project?.name,
        attendees: [],
        content: '',
        actionItems: []
      });

      showToast('Meeting created', 'success');
      setIsNewMeetingOpen(false);
      router.push(`/meetings/${newMeeting.id}`);
    } catch (error) {
      showToast('Failed to create meeting', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header
        title="Meeting Notes"
        subtitle="Capture discussions, decisions, and action items."
        action={{
          label: "New Meeting",
          onClick: () => setIsNewMeetingOpen(true)
        }}
      />

      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151515] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="bg-[#151515] border border-white/5 text-gray-400 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 transition-all"
            >
              <option value="">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No meetings found. Start a new one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMeetings.map(meeting => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </main>

      {/* New Meeting Modal */}
      <Modal isOpen={isNewMeetingOpen} onClose={() => setIsNewMeetingOpen(false)} title="New Meeting">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input name="title" required placeholder="e.g. Kickoff Meeting" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
              <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
              <input type="time" name="time" required defaultValue="10:00" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
              <select name="clientId" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500">
                <option value="">None</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
              <select name="projectId" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500">
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mx-[-1.5rem] px-6 mt-6">
            <button type="button" onClick={() => setIsNewMeetingOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={createMeeting.isPending} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium">
              {createMeeting.isPending ? 'Creating...' : 'Create & Open'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
