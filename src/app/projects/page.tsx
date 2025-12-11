'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/components/Toast';
import { Project } from '@/lib/types';
import { Plus, Pencil, Trash2, Calendar, DollarSign, User, FileText, LayoutGrid, List } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY, STATUS_STYLES } from '@/lib/styles';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    status: 'pending',
  });

  const handleUpdateStatus = async (projectId: string, newStatus: Project['status']) => {
    try {
      await updateMutation.mutateAsync({
        id: projectId,
        data: { status: newStatus }
      });
      showToast('Project status updated', 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Project Name',
      render: (project: Project) => (
        <div>
          <div className="font-medium text-white">{project.name}</div>
          <div className="text-sm text-gray-400 truncate max-w-xs">{project.description}</div>
        </div>
      ),
    },
    {
      key: 'clientName',
      header: 'Client',
      render: (project: Project) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
            {project.clientName?.charAt(0) || '?'}
          </div>
          <span className="text-gray-300">{project.clientName || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (project: Project) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[project.status]}`}>
          {project.status.replace('-', ' ')}
        </span>
      ),
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (project: Project) => (
        <span className="font-medium text-emerald-400">
          Rp {project.budget?.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (project: Project) => (
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(project.deadline).toLocaleDateString('id-ID')}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (project: Project) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(project);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <a
            href={`/projects/${project.id}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            title="View Details"
          >
            <FileText className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(project.id);
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
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      clientId: '',
      clientName: '',
      status: 'pending',
      budget: 0,
      deadline: new Date().toISOString().split('T')[0],
      spent: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      deadline: project.deadline.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Project deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete project', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find client name if clientId changed
      const selectedClient = clients.find(c => c.id === formData.clientId);
      const dataToSave = {
        ...formData,
        clientName: selectedClient?.name || formData.clientName || 'Unknown',
        // Ensure numbers
        budget: Number(formData.budget),
        // Ensure proper types for required fields
        name: formData.name!,
        description: formData.description!,
        clientId: formData.clientId!,
        status: formData.status as Project['status'],
        deadline: new Date(formData.deadline!).toISOString(),
        spent: 0,
      } as Project;

      if (editingProject) {
        await updateMutation.mutateAsync({ id: editingProject.id, data: dataToSave });
        showToast('Project updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(dataToSave);
        showToast('Project created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save project', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Projects"
        subtitle="Manage your ongoing and completed projects"
        action={{ label: 'New Project', onClick: handleCreate }}
      />

      <div className="px-8 pt-6 flex justify-end">
        <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            title="Board View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-8">
        {viewMode === 'list' ? (
          <div className="glass rounded-2xl overflow-hidden">
            <DataTable
              columns={columns}
              data={projects}
              emptyMessage="No projects found. Start by creating one!"
            />
          </div>
        ) : (
          <KanbanBoard
            projects={projects}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_STYLES}>Project Name</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`${INPUT_STYLES} pl-10`}
                placeholder="e.g. Website Redesign"
              />
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Client</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                required
                value={formData.clientId || ''}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className={`${INPUT_STYLES} pl-10 appearance-none`}
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id} className="bg-gray-900">
                    {client.name} - {client.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLES}>Budget (Rp)</label>
              <div className="relative">
                <CurrencyInput
                  value={formData.budget || 0}
                  onChange={(val) => setFormData({ ...formData, budget: val })}
                  placeholder="Rp 0"
                  className="pl-3"
                  required
                />
              </div>
            </div>

            <div>
              <label className={LABEL_STYLES}>Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  required
                  value={formData.deadline ? String(formData.deadline).split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className={`${INPUT_STYLES} pl-10`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Status</label>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {['pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: status as any })}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${formData.status === status
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {status.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${INPUT_STYLES} min-h-[100px]`}
              placeholder="Project details..."
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
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
