'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useSettings, useUpdateSettings, DEFAULT_SETTINGS } from '@/hooks/useSettings';
import { useToast } from '@/components/Toast';
import { Save, Download, Upload, Building2, User, Mail, Phone, MapPin, DollarSign, Database } from 'lucide-react';
import { INPUT_STYLES, LABEL_STYLES, BTN_PRIMARY, BTN_SECONDARY } from '@/lib/styles';
import { STORAGE_KEYS } from '@/lib/storage';

export default function SettingsPage() {
  const { data: settings = DEFAULT_SETTINGS } = useSettings();
  const updateMutation = useUpdateSettings();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(settings);
  // Sync state when data loads
  useState(() => {
    if (settings) setFormData(settings);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(formData);
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleExport = () => {
    try {
      const data = {
        projects: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]'),
        clients: JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]'),
        invoices: JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]'),
        timeEntries: JSON.parse(localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES) || '[]'),
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}'),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `frilance-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Backup exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('This will overwrite all current data. Are you sure?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (data.projects) localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
        if (data.clients) localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data.clients));
        if (data.invoices) localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data.invoices));
        if (data.timeEntries) localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(data.timeEntries));
        if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));

        showToast('Data imported successfully. Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen pb-12">
      <Header
        title="Settings"
        subtitle="Manage your profile and data"
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Profile */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              Business Profile
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL_STYLES}>Business Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className={`${INPUT_STYLES} pl-10`}
                      placeholder="e.g. Acme Design Studio"
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL_STYLES}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                      className={`${INPUT_STYLES} pl-10`}
                      placeholder="contact@acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL_STYLES}>Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={formData.businessPhone}
                      onChange={(e) => setFormData({ ...formData, businessPhone: e.target.value })}
                      className={`${INPUT_STYLES} pl-10`}
                      placeholder="+62..."
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL_STYLES}>Default Tax Rate (%)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.defaultTaxRate}
                      onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                      className={`${INPUT_STYLES} pl-10`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={LABEL_STYLES}>Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <textarea
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    className={`${INPUT_STYLES} pl-10 min-h-[100px]`}
                    placeholder="Full business address..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className={`${BTN_PRIMARY} flex items-center gap-2`}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Data Management */}
        <div className="lg:col-span-1 space-y-8">
          <div className="glass p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Data Management
            </h2>

            <p className="text-gray-400 text-sm mb-6">
              Your data is stored locally in your browser. Create a backup to keep it safe or transfer to another device.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all"
              >
                <Download className="w-4 h-4" />
                Export Backup
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 text-gray-300 rounded-xl transition-all border-dashed"
                >
                  <Upload className="w-4 h-4" />
                  Import Backup
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-xs text-yellow-200">
                <strong>Note:</strong> Importing a backup will replace all current projects, clients, and invoices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
