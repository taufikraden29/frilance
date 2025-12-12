'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { PipelineBoard } from './components/PipelineBoard';
import { Client } from '@/lib/types';
import { Modal } from '@/components/Modal';
import { useCreateClient } from '@/hooks/useClients';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function PipelinePage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createClient = useCreateClient();
  const { showToast } = useToast();

  const handleCreateLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createClient.mutateAsync({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        company: formData.get('company') as string,
        address: '',
        status: 'lead'
      });
      showToast('Lead created successfully', 'success');
      setIsCreateOpen(false);
    } catch (error) {
      showToast('Failed to create lead', 'error');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-none">
        <Header
          title="Pipeline"
          subtitle="Manage your leads and client acquisition process."
        >
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </Header>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        <PipelineBoard onClientClick={setSelectedClient} />
      </div>

      {/* Detail Modal (Read Only for now, acts as quick view) */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title="Lead Details"
      >
        {selectedClient && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase">Name</label>
              <p className="text-white text-lg font-medium">{selectedClient.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase">Email</label>
                <p className="text-gray-300">{selectedClient.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase">Phone</label>
                <p className="text-gray-300">{selectedClient.phone || '-'}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Company</label>
              <p className="text-gray-300">{selectedClient.company || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase">Status</label>
              <div className="mt-1">
                <span className="inline-block px-2 py-1 bg-white/10 rounded text-sm capitalize text-emerald-400 border border-emerald-500/20">
                  {selectedClient.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Lead Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Lead">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input name="name" required className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
            <input name="company" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input type="email" name="email" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
              <input type="tel" name="phone" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">Create Lead</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
