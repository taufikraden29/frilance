'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMeeting, useUpdateMeeting, useDeleteMeeting } from '@/hooks/useMeetings';
import { Header } from '@/components/Header';
import { ArrowLeft, Calendar, Clock, CheckSquare, Trash2, Plus, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export default function MeetingDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: meeting, isLoading } = useMeeting(id);
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();
  const { showToast } = useToast();

  const [content, setContent] = useState('');
  const [actionItems, setActionItems] = useState<{ id: string, task: string, done: boolean }[]>([]);

  // Sync local state with fetched data
  useEffect(() => {
    if (meeting) {
      setContent(meeting.content || '');
      setActionItems(meeting.actionItems || []);
    }
  }, [meeting]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Loading...</div>;
  if (!meeting) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Meeting not found</div>;

  const handleSave = async () => {
    try {
      await updateMeeting.mutateAsync({
        id,
        data: {
          content,
          actionItems
        }
      });
      showToast('Meeting saved', 'success');
    } catch (error) {
      showToast('Failed to save', 'error');
    }
  };

  const handleAddActionItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newItem = {
        id: uuidv4(),
        task: e.currentTarget.value.trim(),
        done: false
      };
      setActionItems([...actionItems, newItem]);
      e.currentTarget.value = '';

      // Auto-save on add
      updateMeeting.mutate({
        id,
        data: { actionItems: [...actionItems, newItem] }
      });
    }
  };

  const toggleActionItem = (itemId: string) => {
    const updated = actionItems.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    setActionItems(updated);
    updateMeeting.mutate({ id, data: { actionItems: updated } });
  };

  const deleteActionItem = (itemId: string) => {
    const updated = actionItems.filter(item => item.id !== itemId);
    setActionItems(updated);
    updateMeeting.mutate({ id, data: { actionItems: updated } });
  };

  const handleDeleteMeeting = async () => {
    if (confirm('Are you sure you want to delete this meeting notes?')) {
      await deleteMeeting.mutateAsync(id);
      router.push('/meetings');
      showToast('Meeting deleted', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header
        title={meeting.title}
        subtitle={`${format(new Date(meeting.date), 'MMMM d, yyyy')} • ${meeting.time}`}
        action={{
          label: "Save Changes",
          onClick: handleSave
        }}
      />

      {/* Back Button & Actions */}
      <div className="max-w-4xl mx-auto px-6 pt-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/meetings')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <button
          onClick={handleDeleteMeeting}
          className="text-red-500 hover:text-red-400 p-2 text-sm flex items-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete Meeting
        </button>
      </div>

      <main className="p-6 md:p-8 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#151515] border border-white/5 rounded-2xl p-6 min-h-[500px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing meeting notes here..."
              className="w-full h-full min-h-[500px] bg-transparent text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Sidebar: Action Items & Meta */}
        <div className="space-y-6">
          {/* Action Items Panel */}
          <div className="bg-[#151515] border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              Action Items
            </h3>

            <div className="space-y-3 mb-4">
              {actionItems.map(item => (
                <div key={item.id} className="group flex items-start gap-3 text-sm">
                  <div
                    onClick={() => toggleActionItem(item.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${item.done
                        ? 'bg-emerald-500 border-emerald-500 text-black'
                        : 'border-gray-600 hover:border-emerald-500'
                      }`}
                  >
                    {item.done && <Plus className="w-3 h-3 rotate-45 stroke-[3px]" />}
                  </div>
                  <span className={`flex-1 transition-all ${item.done ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                    {item.task}
                  </span>
                  <button onClick={() => deleteActionItem(item.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Add action item..."
                onKeyDown={handleAddActionItem}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-[#151515] border border-white/5 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Client</label>
              <div className="text-sm text-white font-medium">{meeting.clientName || 'None'}</div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Project</label>
              <div className="text-sm text-white font-medium">{meeting.projectName || 'None'}</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
