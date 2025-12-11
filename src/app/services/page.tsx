'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices';
import { useToast } from '@/components/Toast';
import { ServiceItem } from '@/lib/types';
import { Plus, Pencil, Trash2, Tag, DollarSign, FileText } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY } from '@/lib/styles';
import { CurrencyInput } from '@/components/CurrencyInput';

export default function ServicesPage() {
  const { data: services = [] } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<Partial<ServiceItem>>({
    name: '',
    category: '',
    price: 0,
    description: '',
  });

  const columns = [
    {
      key: 'name',
      header: 'Service Name',
      render: (service: ServiceItem) => (
        <div>
          <div className="font-medium text-white">{service.name}</div>
          <div className="text-sm text-gray-400 truncate max-w-[200px]">{service.description}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (service: ServiceItem) => (
        <span className="px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300 border border-white/5">
          {service.category}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (service: ServiceItem) => (
        <span className="font-medium text-emerald-400">
          Rp {service.price.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (service: ServiceItem) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(service);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(service.id);
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
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Design',
      price: 0,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service);
    setFormData(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Service deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete service', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingService) {
        await updateMutation.mutateAsync({ id: editingService.id, data: formData });
        showToast('Service updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(formData as any);
        showToast('Service created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch {
      showToast('Failed to save service', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Service Pricelist"
        subtitle="Manage your standard rates and services"
        action={{ label: 'Add Service', onClick: handleCreate }}
      />

      <div className="p-8">
        <div className="glass rounded-2xl overflow-hidden">
          <DataTable
            columns={columns}
            data={services}
            emptyMessage="No services found. Add your first service!"
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={LABEL_STYLES}>Service Name</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${INPUT_STYLES} pl-10`}
                placeholder="e.g. Logo Design"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLES}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={INPUT_STYLES}
              >
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Marketing">Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={LABEL_STYLES}>Price (Rp)</label>
              <div className="relative">
                <CurrencyInput
                  value={formData.price || 0}
                  onChange={(val) => setFormData({ ...formData, price: val })}
                  placeholder="Rp 0"
                  className="pl-3"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`${INPUT_STYLES} pl-10 min-h-[100px]`}
                placeholder="What's included in this service..."
              />
            </div>
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
              {editingService ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
