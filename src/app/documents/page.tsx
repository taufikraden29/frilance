'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { UploadModal } from './components/UploadModal';
import { DocumentList } from './components/DocumentList';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { Plus, Search, Filter } from 'lucide-react';

export default function DocumentsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [filterClient, setFilterClient] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: documents = [], isLoading } = useDocuments();
  const { data: clients = [] } = useClients();

  const filteredDocs = documents.filter(doc => {
    const matchesClient = filterClient ? doc.clientId === filterClient : true;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClient && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      <Header
        title="Document Vault"
        subtitle="Securely store contracts, briefs, and deliverables."
        action={{
          label: "Add Document",
          onClick: () => setIsUploadOpen(true)
        }}
      />

      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151515] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
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
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-white/5 rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : (
          <DocumentList documents={filteredDocs} />
        )}
      </main>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
