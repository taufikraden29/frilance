'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { useCreateDocument } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { DocumentType } from '@/lib/types';
import { Upload, Link as LinkIcon, FileType } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const createDocument = useCreateDocument();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'link' | 'file'>('link');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const clientId = formData.get('clientId') as string;
      const projectId = formData.get('projectId') as string;

      const client = clients.find(c => c.id === clientId);
      const project = projects.find(p => p.id === projectId);

      await createDocument.mutateAsync({
        name: formData.get('name') as string,
        type: formData.get('type') as DocumentType,
        url: formData.get('url') as string,
        clientId: client?.id,
        clientName: client?.name,
        projectId: project?.id,
        projectName: project?.name,
      });

      showToast('Document added successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to add document', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Document">
      <div className="flex gap-4 mb-6 border-b border-white/5">
        <button
          onClick={() => setActiveTab('link')}
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'link'
              ? 'text-emerald-400 border-emerald-400'
              : 'text-gray-400 border-transparent hover:text-white'
            }`}
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Link URL
          </div>
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 cursor-not-allowed opacity-50 ${activeTab === 'file'
              ? 'text-emerald-400 border-emerald-400'
              : 'text-gray-400 border-transparent'
            }`}
          title="File upload coming soon"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload File
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Document Name</label>
          <input
            name="name"
            required
            placeholder="e.g. Website Contract"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Document URL</label>
          <input
            name="url"
            required
            type="url"
            placeholder="https://docs.google.com/..."
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <div className="relative">
              <select
                name="type"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
              >
                <option value="contract">Contract</option>
                <option value="brief">Brief</option>
                <option value="invoice">Invoice</option>
                <option value="design">Design Asset</option>
                <option value="other">Other</option>
              </select>
              <FileType className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Client (Optional)</label>
            <select
              name="clientId"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="">Select Client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Project (Optional)</label>
          <select
            name="projectId"
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          >
            <option value="">Select Project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20">Add Document</button>
        </div>
      </form>
    </Modal>
  );
}
