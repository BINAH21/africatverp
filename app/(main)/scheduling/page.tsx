'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Calendar, Clock, Tv, Plus, Edit, Trash2, Download, Archive, CheckCircle, XCircle,
  Send, Search, Filter, MoreVertical, User, Tag, AlertCircle, Play, Pause,
  ChevronLeft, ChevronRight, Grid, List, CheckSquare, Square, FileDown,
  FolderArchive, Share2, Copy, Settings, Eye, Calendar as CalendarIcon
} from 'lucide-react';

interface ScheduledProgram {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'completed' | 'live' | 'scheduled';
  assignedTo: string;
  createdBy: string;
  category: string;
  description?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  date: Date;
  repeat?: 'daily' | 'weekly' | 'monthly' | 'none';
}

const mockPrograms: ScheduledProgram[] = [
  {
    id: '1',
    title: 'Morning News',
    startTime: '08:00',
    endTime: '09:00',
    duration: 60,
    status: 'live',
    assignedTo: 'John Doe',
    createdBy: 'Sarah Smith',
    category: 'News',
    date: new Date(),
    tags: ['news', 'morning', 'breaking'],
    priority: 'high',
  },
  {
    id: '2',
    title: 'Talk Show',
    startTime: '10:00',
    endTime: '10:45',
    duration: 45,
    status: 'scheduled',
    assignedTo: 'Mike Johnson',
    createdBy: 'Emma Wilson',
    category: 'Entertainment',
    date: new Date(),
    tags: ['talk', 'entertainment'],
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Afternoon News',
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    status: 'scheduled',
    assignedTo: 'John Doe',
    createdBy: 'Sarah Smith',
    category: 'News',
    date: new Date(),
    tags: ['news', 'afternoon'],
    priority: 'high',
  },
  {
    id: '4',
    title: 'Evening News',
    startTime: '18:00',
    endTime: '19:00',
    duration: 60,
    status: 'scheduled',
    assignedTo: 'John Doe',
    createdBy: 'Sarah Smith',
    category: 'News',
    date: new Date(),
    tags: ['news', 'evening'],
    priority: 'high',
  },
  {
    id: '5',
    title: 'Sports Highlights',
    startTime: '20:00',
    endTime: '20:30',
    duration: 30,
    status: 'pending',
    assignedTo: 'Mike Johnson',
    createdBy: 'Emma Wilson',
    category: 'Sports',
    date: new Date(),
    tags: ['sports', 'highlights'],
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Documentary: African History',
    startTime: '21:00',
    endTime: '22:30',
    duration: 90,
    status: 'approved',
    assignedTo: 'Lisa Brown',
    createdBy: 'David Lee',
    category: 'Documentary',
    date: new Date(),
    tags: ['documentary', 'history'],
    priority: 'low',
  },
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  live: 'bg-red-500 text-white animate-pulse',
  scheduled: 'bg-blue-100 text-blue-700',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export default function SchedulingPage() {
  const { t } = useTranslation();
  const [programs, setPrograms] = useState<ScheduledProgram[]>(mockPrograms);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showFilters, setShowFilters] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ScheduledProgram | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduledProgram>>({
    title: '',
    startTime: '',
    endTime: '',
    duration: 0,
    status: 'draft',
    assignedTo: '',
    category: '',
    description: '',
    tags: [],
    priority: 'medium',
    date: new Date(),
    repeat: 'none',
  });

  // Get programs for selected date
  const getProgramsForDate = (date: Date) => {
    return programs.filter(p => {
      const programDate = new Date(p.date);
      return programDate.toDateString() === date.toDateString();
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Filter programs
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    const programDate = new Date(program.date);
    const matchesDate = programDate.toDateString() === selectedDate.toDateString();
    return matchesSearch && matchesStatus && (viewMode === 'list' || matchesDate);
  });

  // Statistics
  const stats = {
    today: getProgramsForDate(new Date()).length,
    pending: programs.filter(p => p.status === 'pending').length,
    approved: programs.filter(p => p.status === 'approved').length,
    live: programs.filter(p => p.status === 'live').length,
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredPrograms.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredPrograms.map(p => p.id));
    }
  };

  // Actions
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      setPrograms(prev => prev.filter(p => p.id !== id));
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedItems.length} program(s)?`)) {
      setPrograms(prev => prev.filter(p => !selectedItems.includes(p.id)));
      setSelectedItems([]);
    }
  };

  const handleApprove = (id: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'approved' as const } : p
    ));
  };

  const handleReject = (id: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'rejected' as const } : p
    ));
  };

  const handleComplete = (id: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'completed' as const } : p
    ));
  };

  const handleArchive = (id: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === id ? { ...p, status: 'archived' as const } : p
    ));
  };

  const handleBulkArchive = () => {
    setPrograms(prev => prev.map(p =>
      selectedItems.includes(p.id) ? { ...p, status: 'archived' as const } : p
    ));
    setSelectedItems([]);
  };

  const handleAssign = (id: string, userId: string) => {
    setPrograms(prev => prev.map(p =>
      p.id === id ? { ...p, assignedTo: userId } : p
    ));
    setShowAssignModal(false);
  };

  const handleExport = (id: string) => {
    alert(`Exporting ${programs.find(p => p.id === id)?.title}`);
  };

  const handleBulkExport = () => {
    alert(`Exporting ${selectedItems.length} program(s)`);
  };

  const handleSend = (id: string) => {
    setShowAssignModal(true);
    setAssigningTo('');
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      duration: 0,
      status: 'draft',
      assignedTo: '',
      category: '',
      description: '',
      tags: [],
      priority: 'medium',
      date: selectedDate,
      repeat: 'none',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (program: ScheduledProgram) => {
    setFormData({
      ...program,
      date: new Date(program.date),
    });
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate duration
    const start = formData.startTime.split(':').map(Number);
    const end = formData.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    const duration = endMinutes - startMinutes;

    if (editingProgram) {
      // Update existing program
      setPrograms(prev => prev.map(p =>
        p.id === editingProgram.id
          ? {
              ...p,
              ...formData,
              duration,
              updatedAt: new Date(),
            } as ScheduledProgram
          : p
      ));
      setShowEditModal(false);
      setEditingProgram(null);
    } else {
      // Create new program
      const newProgram: ScheduledProgram = {
        id: Date.now().toString(),
        title: formData.title!,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        duration,
        status: formData.status || 'draft',
        assignedTo: formData.assignedTo || 'Unassigned',
        createdBy: 'Current User', // Replace with actual user
        category: formData.category || 'General',
        description: formData.description,
        tags: formData.tags || [],
        priority: formData.priority || 'medium',
        date: formData.date || new Date(),
        repeat: formData.repeat || 'none',
      };
      setPrograms(prev => [...prev, newProgram]);
      setShowCreateModal(false);
    }

    // Reset form
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      duration: 0,
      status: 'draft',
      assignedTo: '',
      category: '',
      description: '',
      tags: [],
      priority: 'medium',
      date: selectedDate,
      repeat: 'none',
    });
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag],
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  // Calendar navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const todayPrograms = getProgramsForDate(selectedDate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Program Scheduling</h1>
          <p className="text-gray-600">Manage and schedule TV programs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {viewMode === 'calendar' ? <List className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Schedule Program
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Today's Programs", value: stats.today, icon: Calendar, color: 'bg-primary-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Live Now', value: stats.live, icon: Play, color: 'bg-red-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glossy-card rounded-2xl p-6"
            >
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Date Navigation */}
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Today
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                    <option value="live">Live</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedStatus('all');
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-4 bg-primary-50 border border-primary-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-700">
                {selectedItems.length} program(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExport}
                className="px-3 py-1.5 text-sm bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={handleBulkArchive}
                className="px-3 py-1.5 text-sm bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="glossy-card rounded-2xl p-6">
          {/* Date Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">{formatDate(selectedDate)}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          {todayPrograms.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No programs scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-l-4 border-primary-500"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelection(program.id)}
                    className="w-5 h-5 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors flex items-center justify-center flex-shrink-0"
                  >
                    {selectedItems.includes(program.id) && (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    )}
                  </button>

                  {/* Time */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 w-20">{program.startTime}</span>
                  </div>

                  {/* Program Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <Tv className="w-4 h-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{program.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[program.status]}`}>
                        {program.status}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${priorityColors[program.priority]}`}></div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-6">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {program.assignedTo}
                      </span>
                      <span>{program.duration} min</span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {program.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {program.status === 'live' && (
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold animate-pulse flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        LIVE
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setEditingProgram(program);
                        handleEdit(program);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No programs found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glossy-card rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelection(program.id)}
                    className="w-5 h-5 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors flex items-center justify-center flex-shrink-0 mt-1"
                  >
                    {selectedItems.includes(program.id) && (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    )}
                  </button>

                  {/* Time and Program Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary-600" />
                          <span className="font-bold text-lg text-gray-900">{program.startTime} - {program.endTime}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[program.status]}`}>
                          {program.status}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${priorityColors[program.priority]}`}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{program.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span>{program.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{program.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(program.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {program.description && (
                      <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {program.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setEditingProgram(program);
                          handleEdit(program);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleSend(program.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                      {program.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(program.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(program.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {program.status !== 'completed' && program.status !== 'archived' && (
                        <button
                          onClick={() => handleComplete(program.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleExport(program.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      {program.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(program.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Program Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setEditingProgram(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {showEditModal ? 'Edit Program' : 'Schedule New Program'}
                    </h3>
                    <p className="text-primary-100 text-sm">
                      {showEditModal ? 'Update program details' : 'Fill in the program information'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingProgram(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter program title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.startTime || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={formData.endTime || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Category and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select category...</option>
                        <option value="News">News</option>
                        <option value="Sports">Sports</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Documentary">Documentary</option>
                        <option value="Talk Show">Talk Show</option>
                        <option value="Weather">Weather</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status || 'draft'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>
                  </div>

                  {/* Assigned To and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign To
                      </label>
                      <select
                        value={formData.assignedTo || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select user...</option>
                        <option value="John Doe">John Doe</option>
                        <option value="Sarah Smith">Sarah Smith</option>
                        <option value="Mike Johnson">Mike Johnson</option>
                        <option value="Emma Wilson">Emma Wilson</option>
                        <option value="Lisa Brown">Lisa Brown</option>
                        <option value="David Lee">David Lee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority || 'medium'}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Repeat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat
                    </label>
                    <select
                      value={formData.repeat || 'none'}
                      onChange={(e) => setFormData(prev => ({ ...prev, repeat: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="none">No Repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter program description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm"
                        >
                          #{tag}
                          <button
                            onClick={() => handleTagRemove(tag)}
                            className="hover:text-primary-900"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add tag and press Enter"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.currentTarget;
                            if (input.value.trim()) {
                              handleTagAdd(input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingProgram(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {showEditModal ? 'Update Program' : 'Create Program'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Program</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                  <select
                    value={assigningTo}
                    onChange={(e) => setAssigningTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select user...</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Sarah Smith">Sarah Smith</option>
                    <option value="Mike Johnson">Mike Johnson</option>
                    <option value="Emma Wilson">Emma Wilson</option>
                    <option value="Lisa Brown">Lisa Brown</option>
                    <option value="David Lee">David Lee</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (assigningTo) {
                        setShowAssignModal(false);
                      }
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
