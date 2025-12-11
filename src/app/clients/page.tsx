'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients';
import { useToast } from '@/components/Toast';
import { Client } from '@/lib/types';
import { Plus, Pencil, Trash2, Users, Mail, Phone, MapPin, Building2, Search, X, MessageCircle, User } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY } from '@/lib/styles';

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const columns = [
    {
      key: 'name',
      header: 'Client Name',
      render: (client: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-white">{client.name}</div>
            <div className="text-sm text-gray-400">{client.company}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (client: Client) => {
        const getWhatsAppUrl = (phone: string) => {
          const number = phone.replace(/\D/g, '');
          const formatted = number.startsWith('0') ? '62' + number.slice(1) : number;
          return `https://wa.me/${formatted}`;
        };

        return (
          <div className="flex flex-col gap-1 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-emerald-400" />
              <div className="flex items-center gap-2">
                {client.email}
                <a
                  href={`mailto:${client.email}`}
                  className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-emerald-400" />
              <div className="flex items-center gap-2">
                {client.phone}
                <a
                  href={getWhatsAppUrl(client.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  Chat
                </a>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'address',
      header: 'Address',
      render: (client: Client) => (
        <div className="flex items-start gap-2 text-gray-400 text-sm max-w-xs truncate">
          <MapPin className="w-3 h-3 mt-0.5" />
          {client.address || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (client: Client) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(client);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(client.id);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Client deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete client', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateMutation.mutateAsync({
          id: editingClient.id,
          data: formData
        });
        showToast('Client updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(formData as any);
        showToast('Client created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save client', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Clients"
        subtitle="Manage your client database"
        action={{ label: 'New Client', onClick: handleCreate }}
      />

      <div className="p-8">
        <div className="glass rounded-2xl overflow-hidden">
          <DataTable
            columns={columns}
            data={clients}
            emptyMessage="No clients found. Add your first client!"
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Edit Client' : 'New Client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_STYLES}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${INPUT_STYLES} pl-10`}
                placeholder="e.g. John Doe"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Company</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`${INPUT_STYLES} pl-10`}
                placeholder="e.g. Tech Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLES}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`${INPUT_STYLES} pl-10`}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className={LABEL_STYLES}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`${INPUT_STYLES} pl-10`}
                  placeholder="+62..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`${INPUT_STYLES} min-h-[80px]`}
              placeholder="Office address..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={BTN_SECONDARY}
            >
              Cancel
            </button>
            <button type="submit" className={BTN_PRIMARY}>
              {editingClient ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
