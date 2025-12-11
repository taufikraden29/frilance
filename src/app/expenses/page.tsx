'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useExpenses, useCreateExpense, useDeleteExpense } from '@/hooks/useExpenses';
import { useToast } from '@/components/Toast';
import { Expense } from '@/lib/types';
import { Plus, Trash2, Calendar, Tag, CreditCard } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY } from '@/lib/styles';
import { CurrencyInput } from '@/components/CurrencyInput';
import { StatsCard } from '@/components/StatsCard';

export default function ExpensesPage() {
  const { data: expenses = [] } = useExpenses();
  const createMutation = useCreateExpense();
  const deleteMutation = useDeleteExpense();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    description: '',
    amount: 0,
    category: 'Operational',
    date: new Date().toISOString().split('T')[0],
  });

  const columns = [
    {
      key: 'description',
      header: 'Description',
      render: (expense: Expense) => (
        <span className="font-medium text-white">{expense.description}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (expense: Expense) => (
        <span className="px-3 py-1 bg-white/5 rounded-lg text-sm text-gray-300 border border-white/5">
          {expense.category}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (expense: Expense) => (
        <span className="text-gray-400">{new Date(expense.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (expense: Expense) => (
        <span className="font-medium text-red-400">
          - Rp {expense.amount.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (expense: Expense) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(expense.id);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Expense deleted successfully', 'success');
      } catch {
        showToast('Failed to delete expense', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData as any);
      showToast('Expense added successfully', 'success');
      setIsModalOpen(false);
      setFormData({
        description: '',
        amount: 0,
        category: 'Operational',
        date: new Date().toISOString().split('T')[0],
      });
    } catch {
      showToast('Failed to add expense', 'error');
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Expenses"
        subtitle="Track your business costs"
        action={{ label: 'Add Expense', onClick: () => setIsModalOpen(true) }}
      />

      <div className="px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            icon={CreditCard}
            label="Total Expenses"
            value={`Rp ${totalExpenses.toLocaleString('id-ID')}`}
            color="red"
          />
        </div>
      </div>

      <div className="px-8">
        <div className="glass rounded-2xl overflow-hidden">
          <DataTable
            columns={columns}
            data={expenses}
            emptyMessage="No expenses recorded. Good job keeping costs low!"
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={LABEL_STYLES}>Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={INPUT_STYLES}
              placeholder="e.g. Internet Bill"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLES}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={INPUT_STYLES}
              >
                <option value="Operational">Operational</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Utilities">Utilities</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={LABEL_STYLES}>Amount (Rp)</label>
              <CurrencyInput
                value={formData.amount || 0}
                onChange={(val) => setFormData({ ...formData, amount: val })}
                required
              />
            </div>
          </div>

          <div>
            <label className={LABEL_STYLES}>Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`${INPUT_STYLES} pl-10`}
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
              Add Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
