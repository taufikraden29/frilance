'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import {
  useTodos, useCreateTodo, useUpdateTodo, useToggleTodo, useDeleteTodo,
  useAddSubtask, useToggleSubtask, useDeleteSubtask
} from '@/hooks/useTodos';
import { useClients } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/components/Toast';
import { Todo, Subtask } from '@/lib/types';
import {
  Plus, Search, ListChecks, ArrowUpDown, Trash2, X
} from 'lucide-react';
import { TodoSidebar, TodoView } from './components/TodoSidebar';
import { TodoItem } from './components/TodoItem';
import { TodoStats } from './components/TodoStats';
import { CreateTodoDialog } from './components/CreateTodoDialog';

type SortOption = 'due_date' | 'priority' | 'created_at' | 'title';

export default function TodosPage() {
  const { data: todos = [] } = useTodos();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createMutation = useCreateTodo();
  const updateMutation = useUpdateTodo();
  const toggleMutation = useToggleTodo();
  const deleteMutation = useDeleteTodo();
  const addSubtaskMutation = useAddSubtask();
  const toggleSubtaskMutation = useToggleSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const { showToast } = useToast();

  // State
  const [currentView, setCurrentView] = useState<TodoView>({ type: 'all' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('due_date');
  const [quickAddText, setQuickAddText] = useState('');
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());
  const quickAddRef = useRef<HTMLInputElement>(null);

  // Filter Logic
  const filteredTodos = useMemo(() => {
    let result = todos.filter(todo => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!todo.title.toLowerCase().includes(query) &&
          !todo.description?.toLowerCase().includes(query) &&
          !todo.clientName?.toLowerCase().includes(query) &&
          !todo.projectName?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. View Filtering
      switch (currentView.type) {
        case 'today':
          if (!todo.dueDate) return false;
          return new Date(todo.dueDate).toDateString() === new Date().toDateString();
        case 'upcoming':
          if (!todo.dueDate) return false;
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return new Date(todo.dueDate) > today;
        case 'priority':
          return todo.priority === currentView.level;
        case 'project':
          return todo.projectId === currentView.id;
        case 'client':
          return todo.clientId === currentView.id;
        case 'label':
          return todo.labels?.includes(currentView.id);
        case 'all':
        default:
          return true; // Show all (completed handling below)
      }
    });

    // 3. Sorting
    result.sort((a, b) => {
      // Always completed last
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);

      let comparison = 0;
      switch (sortBy) {
        case 'due_date':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'created_at':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return comparison;
    });

    return result;
  }, [todos, currentView, searchQuery, sortBy]);

  // Handlers
  const handleQuickAdd = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && quickAddText.trim()) {
      try {
        const payload: any = {
          title: quickAddText.trim(),
          priority: 'medium',
          completed: false,
          recurring: 'none',
          labels: [],
        };
        // Pre-fill based on view
        if (currentView.type === 'project') payload.projectId = currentView.id;
        if (currentView.type === 'client') payload.clientId = currentView.id;
        if (currentView.type === 'today') payload.dueDate = new Date().toISOString();

        await createMutation.mutateAsync(payload);
        setQuickAddText('');
        showToast('Task added!', 'success');
      } catch (error) {
        showToast('Failed to add task', 'error');
      }
    }
  };

  const handleCreate = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleMutation.mutateAsync({ id: todo.id, completed: !todo.completed });
    } catch (error) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Task deleted', 'success');
      } catch (error) {
        showToast('Failed to delete task', 'error');
      }
    }
  };

  const handleSave = async (formData: Partial<Todo>) => {
    try {
      // Resolve IDs to Names (Backend/Hook expects names?? Or Types file says clientName?)
      // Assuming hook handles ID->Name resolution or Backend does. 
      // Existing code did manual lookup, let's replicate just in case.
      const client = clients.find(c => c.id === formData.clientId);
      const project = projects.find(p => p.id === formData.projectId);

      const dataToSave = {
        ...formData,
        clientName: client?.name,
        projectName: project?.name,
      } as any;

      if (editingTodo) {
        await updateMutation.mutateAsync({ id: editingTodo.id, data: dataToSave });
        showToast('Task updated', 'success');
      } else {
        await createMutation.mutateAsync(dataToSave);
        showToast('Task created', 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save task', 'error');
    }
  };

  // Subtasks wrappers
  const handleAddSubtask = async (todoId: string, title: string) => {
    try {
      await addSubtaskMutation.mutateAsync({ todoId, title });
    } catch {
      showToast('Error adding subtask', 'error');
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    await toggleSubtaskMutation.mutateAsync({ id: subtask.id, completed: !subtask.completed });
  };

  const handleDeleteSubtask = async (id: string) => {
    await deleteSubtaskMutation.mutateAsync(id);
  };

  // Bulk Actions
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedTodos);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTodos(newSet);
  };

  const handleSelectAll = () => {
    if (selectedTodos.size === filteredTodos.length) setSelectedTodos(new Set());
    else setSelectedTodos(new Set(filteredTodos.map(t => t.id)));
  };

  const handleBulkComplete = async () => {
    for (const id of selectedTodos) {
      await toggleMutation.mutateAsync({ id, completed: true });
    }
    setSelectedTodos(new Set());
    showToast(`${selectedTodos.size} tasks completed!`, 'success');
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedTodos.size} tasks?`)) {
      for (const id of selectedTodos) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedTodos(new Set());
    }
  };

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        e.preventDefault();
        quickAddRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#0A0A0A] hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Tasks</h1>
        </div>
        <TodoSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          className="flex-1 px-4 pb-6"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0F0F0F]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0F0F0F]/50 backdrop-blur-xl sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {currentView.type === 'all' ? 'All Tasks' :
                currentView.type === 'today' ? 'Today' :
                  currentView.type === 'upcoming' ? 'Upcoming' :
                    currentView.type === 'project' ? projects.find(p => p.id === currentView.id)?.name || 'Project' :
                      currentView.type === 'client' ? clients.find(c => c.id === currentView.id)?.name || 'Client' :
                        'Tasks'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTodos.length} tasks • {filteredTodos.filter(t => t.completed).length} completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-48 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <button title="Sort by Due Date" onClick={() => setSortBy('due_date')} className={`p-1.5 rounded-lg transition-all ${sortBy === 'due_date' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}><ArrowUpDown className="w-4 h-4" /></button>
              {/* Add more sort buttons if needed, currently using select for others */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent border-none text-xs text-gray-400 focus:ring-0 cursor-pointer"
              >
                <option value="due_date">DueDate</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            <button onClick={handleCreate} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Stats (only show on All or Today view) */}
          {(currentView.type === 'all' || currentView.type === 'today') && (
            <TodoStats todos={todos} />
          )}

          <div className="max-w-4xl mx-auto">
            {/* Quick Add */}
            <div className="mb-8 group focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl transition-all">
              <div className="relative flex items-center bg-[#151515] border border-white/10 rounded-2xl shadow-sm p-2">
                <div className="p-3 bg-white/5 rounded-xl mr-4">
                  <Plus className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  ref={quickAddRef}
                  type="text"
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onKeyDown={handleQuickAdd}
                  placeholder={`Add a task to "${currentView.type === 'project' ? projects.find(p => p.id === (currentView as any).id)?.name : 'Inbox'}"...`}
                  className="flex-1 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
                />
                <div className="flex items-center px-4 gap-2">
                  <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-500 font-mono">N</kbd>
                  <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-500 font-mono">↵</kbd>
                </div>
              </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {selectedTodos.size > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-2 pl-4 bg-[#1A1A1A] border border-white/10 rounded-full shadow-2xl animate-in slide-in-from-bottom-4 backdrop-blur-xl">
                <span className="text-sm font-medium text-white mr-2">{selectedTodos.size} selected</span>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <button
                  onClick={handleBulkComplete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition-colors"
                >
                  <ListChecks className="w-3.5 h-3.5" /> Complete
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-full transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button
                  onClick={() => setSelectedTodos(new Set())}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* List */}
            <div className="space-y-4 pb-24">
              {/* Header for Select All */}
              {filteredTodos.length > 0 && (
                <div className="flex items-end justify-between px-2 mb-2">
                  <button onClick={handleSelectAll} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                    <ListChecks className="w-3 h-3" />
                    {selectedTodos.size === filteredTodos.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              )}

              {filteredTodos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <ListChecks className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No tasks found</h3>
                  <p className="text-sm text-gray-500">Add a new task to get started.</p>
                </div>
              ) : (
                filteredTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddSubtask={handleAddSubtask}
                    onToggleSubtask={handleToggleSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    isSelected={selectedTodos.has(todo.id)}
                    onToggleSelect={toggleSelect}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <CreateTodoDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingTodo}
      />
    </div>
  );
}
