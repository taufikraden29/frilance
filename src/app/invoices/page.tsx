'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DataTable } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useMarkInvoicePaid } from '@/hooks/useInvoices';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/components/Toast';
import { Invoice, InvoiceItem } from '@/lib/types';
import { Plus, Pencil, Trash2, FileText, Calendar, CheckCircle, Download, X, Tag, Copy } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY, STATUS_STYLES } from '@/lib/styles';
import { useSettings, DEFAULT_SETTINGS } from '@/hooks/useSettings';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { CurrencyInput } from '@/components/CurrencyInput';

export default function InvoicesPage() {
  const { data: invoices = [] } = useInvoices();
  const { data: projects = [] } = useProjects();
  const { data: services = [] } = useServices();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();
  const markPaidMutation = useMarkInvoicePaid();
  const { showToast } = useToast();
  const { data: settings = DEFAULT_SETTINGS } = useSettings();
  const { data: clients = [] } = useClients();

  const [showPricelist, setShowPricelist] = useState(false);

  const handleDownloadPDF = (invoice: Invoice) => {
    try {
      const doc = new jsPDF();
      const client = clients.find(c => c.id === invoice.clientId);

      // Add logo/branding if available (placeholder for now)
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text(settings.businessName || 'Freelancer', 14, 22);

      // Invoice Details (Right Aligned)
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice #: ${invoice.invoiceNumber}`, 200, 20, { align: 'right' });
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 200, 25, { align: 'right' });
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 200, 30, { align: 'right' });

      // Status Badge
      doc.setFillColor(invoice.status === 'paid' ? '#10b981' : '#f59e0b');
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(170, 35, 25, 6, 2, 2, 'F');
      doc.text(invoice.status.toUpperCase(), 182.5, 39.5, { align: 'center' });

      // Business Info (From Settings)
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text('From:', 14, 40);
      doc.setFontSize(9);
      doc.setTextColor(80);

      let yPos = 45;
      const businessLines = [
        settings.businessAddress,
        settings.businessEmail,
        settings.businessPhone
      ].filter(Boolean);

      businessLines.forEach(line => {
        doc.text(line!, 14, yPos);
        yPos += 5;
      });

      // Client Info
      doc.setTextColor(0);
      doc.setFontSize(10);
      // Ensure 'Bill To' starts with enough spacing
      let clientYPos = Math.max(yPos + 10, 70);
      doc.text('Bill To:', 14, clientYPos);

      clientYPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(80);

      const clientLines = [
        client?.company || invoice.clientName,
        client?.address,
        client?.email,
        client?.phone
      ].filter(Boolean);

      if (clientLines.length === 0) {
        doc.text('Client Name', 14, clientYPos);
      } else {
        clientLines.forEach(line => {
          doc.text(line!, 14, clientYPos);
          clientYPos += 5;
        });
      }

      // Items Table
      const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
      const tableRows = invoice.items.map(item => [
        item.description,
        item.quantity,
        `Rp ${item.rate.toLocaleString('id-ID')}`,
        `Rp ${item.amount.toLocaleString('id-ID')}`
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 100,
        headStyles: { fillColor: [16, 185, 129] }, // Emerald header
        theme: 'grid',
        styles: { fontSize: 9 },
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.text(`Subtotal:`, 160, finalY, { align: 'right' });
      doc.text(`Rp ${invoice.subtotal.toLocaleString('id-ID')}`, 195, finalY, { align: 'right' });

      doc.text(`Tax:`, 160, finalY + 5, { align: 'right' });
      doc.text(`Rp ${invoice.tax.toLocaleString('id-ID')}`, 195, finalY + 5, { align: 'right' });

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Total:`, 160, finalY + 12, { align: 'right' });
      doc.text(`Rp ${invoice.total.toLocaleString('id-ID')}`, 195, finalY + 12, { align: 'right' });

      doc.save(`${invoice.invoiceNumber}.pdf`);
      showToast('Invoice downloaded successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate PDF', 'error');
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    items: [],
    status: 'draft',
    tax: 0,
  });

  const calculateTotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (invoice: Invoice) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="font-medium text-white">{invoice.invoiceNumber}</span>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client / Project',
      render: (invoice: Invoice) => (
        <div>
          <div className="font-medium text-white">{invoice.clientName}</div>
          <div className="text-sm text-gray-400">{invoice.projectName}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (invoice: Invoice) => (
        <span className="font-medium text-emerald-400">
          Rp {invoice.total.toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (invoice: Invoice) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[invoice.status]}`}>
          {invoice.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (invoice: Invoice) => (
        <span className="text-gray-400">
          {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (invoice: Invoice) => (
        <div className="flex items-center justify-end gap-2">
          {invoice.status !== 'paid' && (
            <button
              title="Mark as Paid"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkPaid(invoice.id);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            title="Download PDF"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadPDF(invoice);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(invoice);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(invoice.id);
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
    setEditingInvoice(null);
    setFormData({
      projectId: '',
      clientId: '',
      clientName: '',
      items: [{ id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }],
      status: 'draft',
      dueDate: new Date().toISOString().split('T')[0],
      tax: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      ...invoice,
      dueDate: invoice.dueDate.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Invoice deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete invoice', 'error');
      }
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await markPaidMutation.mutateAsync(id);
      showToast('Invoice marked as paid', 'success');
    } catch (error) {
      showToast('Failed to update invoice', 'error');
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        { id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 },
      ],
    });
  };

  const handleRemoveItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items?.filter(item => item.id !== id),
    });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = formData.items?.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      }
      return item;
    });

    // Recalculate tax if rate is set
    let newTax = formData.tax;
    if (formData.taxRate) {
      const subtotal = newItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
      newTax = Math.round(subtotal * (formData.taxRate / 100));
    }

    setFormData({ ...formData, items: newItems, tax: newTax });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find extra details
      const project = projects.find(p => p.id === formData.projectId);
      const subtotal = calculateTotal(formData.items || []);
      const total = subtotal + (formData.tax || 0);

      const dataToSave = {
        ...formData,
        projectName: project?.name || 'Unknown',
        clientId: project?.clientId,
        clientName: project?.clientName,
        subtotal,
        total,
        // Ensure proper types
        dueDate: new Date(formData.dueDate!).toISOString(),
      } as any;

      if (editingInvoice) {
        await updateMutation.mutateAsync({ id: editingInvoice.id, data: dataToSave });
        showToast('Invoice updated successfully', 'success');
      } else {
        await createMutation.mutateAsync(dataToSave);
        showToast('Invoice created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save invoice', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Invoices"
        subtitle="Track your payments and revenue"
        action={{ label: 'New Invoice', onClick: handleCreate }}
      />

      <div className="p-8">
        <div className="glass rounded-2xl overflow-hidden">
          <DataTable
            columns={columns}
            data={invoices}
            emptyMessage="No invoices found. Create your first invoice!"
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInvoice ? 'Edit Invoice' : 'New Invoice'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLES}>Project</label>
              <select
                required
                value={formData.projectId || ''}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className={`${INPUT_STYLES} appearance-none`}
              >
                <option value="">Select project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id} className="bg-gray-900">
                    {project.name} ({project.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_STYLES}>Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  required
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`${INPUT_STYLES} pl-10`}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <label className={`${LABEL_STYLES} mb-0`}>Invoice Items</label>
                <button
                  type="button"
                  onClick={() => setShowPricelist(!showPricelist)}
                  className="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-emerald-500/20"
                >
                  <Tag className="w-3 h-3" />
                  {showPricelist ? 'Hide Pricelist' : 'Show Pricelist'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Pricelist Reference */}
            {/* Pricelist Reference */}
            {showPricelist && (
              <div className="mb-4 bg-gray-900/50 rounded-xl p-4 border border-white/5 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Service Pricelist Reference</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {services.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No services found.</p>
                  ) : (
                    services.map(service => (
                      <div key={service.id} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg text-xs group">
                        <span className="text-gray-300 font-medium">{service.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400">Rp {service.price.toLocaleString('id-ID')}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newItem = {
                                id: Date.now().toString(),
                                description: service.name,
                                quantity: 1,
                                rate: service.price,
                                amount: service.price
                              };
                              setFormData({
                                ...formData,
                                items: [...(formData.items || []), newItem]
                              });
                              showToast('Service added to invoice!', 'success');
                            }}
                            className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2 py-1 rounded flex items-center gap-1 transition-all"
                            title="Add to Invoice"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {formData.items?.map((item, index) => (
                <div key={item.id} className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500 p-0"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full bg-transparent border-b border-white/10 focus:border-emerald-500 text-sm text-center text-white p-1"
                    />
                  </div>
                  <div className="w-32">
                    <CurrencyInput
                      value={item.rate}
                      onChange={(val) => updateItem(item.id, 'rate', val)}
                      placeholder="Rp 0"
                      className="bg-transparent border-b border-white/10 focus:border-emerald-500 text-sm text-right text-white p-1 rounded-none px-0"
                    />
                  </div>
                  <div className="w-32 flex items-center justify-end text-sm text-emerald-400 font-medium">
                    Rp {item.amount.toLocaleString('id-ID')}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 pt-4 border-t border-white/10">
            <div className="flex items-center gap-8 text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white font-medium">
                Rp {calculateTotal(formData.items || []).toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Tax</span>
                <div className="relative w-16">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate || ''}
                    placeholder="%"
                    onChange={(e) => {
                      const rate = Number(e.target.value);
                      const subtotal = calculateTotal(formData.items || []);
                      setFormData({
                        ...formData,
                        taxRate: rate,
                        tax: Math.round(subtotal * (rate / 100))
                      });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-white text-xs"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                </div>
              </div>
              <CurrencyInput
                value={formData.tax || 0}
                onChange={(val) => setFormData({ ...formData, tax: val, taxRate: 0 })} // Reset rate if manual amount
                className="w-32 bg-white/5 border border-white/10 rounded px-2 py-1 text-right text-white"
              />
            </div>

            <div className="flex items-center gap-8 text-lg font-bold mt-2">
              <span className="text-gray-300">Total</span>
              <span className="text-emerald-400">
                Rp {(calculateTotal(formData.items || []) + (formData.tax || 0)).toLocaleString('id-ID')}
              </span>
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
              {editingInvoice ? 'Save Changes' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
