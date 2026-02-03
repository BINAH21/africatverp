'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  FileText, CheckCircle, Clock, Plus, Edit, Trash2, Search, Filter, Eye, XCircle,
  Calendar, User, Tag, Share2, Send, Save, X, RefreshCw, Settings, MoreVertical,
  ChevronDown, ChevronUp, ChevronRight, BarChart3, LineChart, PieChart, Activity,
  Target, Bell, Bookmark, Star, TrendingUp, TrendingDown, AlertTriangle, Briefcase,
  Video, Camera, Image, Phone, Mail, MapPin, Globe, Link as LinkIcon,
  ExternalLink, Copy, ThumbsUp, MessageSquare, Heart, ArrowUp, ArrowDown, Grid, List as ListIcon,
  Maximize2, Minimize2, FileCheck, FileX, FileEdit, FileSearch, FilePlus, Clipboard,
  History, RotateCcw, RotateCw, Play, Pause, Square, CheckSquare, Check, Minus,
  PlusCircle, MinusCircle, Info, HelpCircle, Shield, UserPlus, UserCheck,
  UserX, Folder, FolderOpen, FolderPlus, FolderX, Database, Server, Network,
  Newspaper, Download, Upload, Filter as FilterIcon, SortAsc, SortDesc,
  Paperclip, MessageCircle, Clock as ClockIcon, Calendar as CalendarIcon,
  Flag, Archive, Inbox, Send as SendIcon, Repeat, Zap, Award, Users,
  Columns, TableIcon, Kanban, LayoutGrid, LayoutList,
} from 'lucide-react';
import {
  useJournalistStore,
  Assignment,
  AssignmentStatus,
  AssignmentPriority,
  Journalist,
} from '@/lib/journalist-store';
import { useAppStore } from '@/lib/store';

const formatDate = (date: Date | undefined): string => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: AssignmentStatus) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'submitted':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'reviewed':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'pending':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getPriorityColor = (priority: AssignmentPriority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'normal':
      return 'bg-blue-500';
    case 'low':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

const isOverdue = (dueDate: Date): boolean => {
  return new Date(dueDate) < new Date();
};

const getDaysUntilDue = (dueDate: Date): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function AssignmentsPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  const {
    assignments,
    journalists,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    getJournalist,
    getAssignmentsByStatus,
    getAssignmentsByJournalist,
    getOverdueAssignments,
    searchJournalists,
  } = useJournalistStore();

  // State management
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban' | 'calendar' | 'timeline'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AssignmentStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<AssignmentPriority | 'all'>('all');
  const [filterJournalist, setFilterJournalist] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showEditAssignment, setShowEditAssignment] = useState(false);
  const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showTimeTracking, setShowTimeTracking] = useState(false);
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'overview' | 'comments' | 'attachments' | 'history' | 'time'>('overview');

  // Computed statistics
  const statistics = useMemo(() => {
    const active = assignments.filter(a => ['pending', 'in_progress'].includes(a.status)).length;
    const completed = assignments.filter(a => a.status === 'published').length;
    const overdue = getOverdueAssignments().length;
    const urgent = assignments.filter(a => a.priority === 'urgent').length;
    const dueToday = assignments.filter(a => {
      const days = getDaysUntilDue(a.dueDate);
      return days === 0;
    }).length;
    const dueThisWeek = assignments.filter(a => {
      const days = getDaysUntilDue(a.dueDate);
      return days >= 0 && days <= 7;
    }).length;

    return {
      total: assignments.length,
      active,
      completed,
      overdue,
      urgent,
      dueToday,
      dueThisWeek,
      pending: assignments.filter(a => a.status === 'pending').length,
      inProgress: assignments.filter(a => a.status === 'in_progress').length,
      submitted: assignments.filter(a => a.status === 'submitted').length,
      reviewed: assignments.filter(a => a.status === 'reviewed').length,
    };
  }, [assignments, getOverdueAssignments]);

  // Filtered and sorted assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.journalistName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(a => a.priority === filterPriority);
    }

    // Journalist filter
    if (filterJournalist !== 'all') {
      filtered = filtered.filter(a => a.journalistId === filterJournalist);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [assignments, searchQuery, filterStatus, filterPriority, filterJournalist, sortBy, sortOrder]);

  // Bulk actions handlers
  const toggleSelectAssignment = (id: string) => {
    setSelectedAssignments(prev =>
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssignments.length === filteredAssignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(filteredAssignments.map(a => a.id));
    }
  };

  const handleBulkStatusUpdate = (status: AssignmentStatus) => {
    selectedAssignments.forEach(id => {
      updateAssignment(id, { status });
    });
    setSelectedAssignments([]);
    setShowBulkActions(false);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedAssignments.length} assignments?`)) {
      selectedAssignments.forEach(id => deleteAssignment(id));
      setSelectedAssignments([]);
    }
  };

  const handleBulkPriorityUpdate = (priority: AssignmentPriority) => {
    selectedAssignments.forEach(id => {
      updateAssignment(id, { priority });
    });
    setSelectedAssignments([]);
    setShowBulkActions(false);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    console.log(`Exporting ${filteredAssignments.length} assignments as ${format}`);
    alert(`Exporting data as ${format.toUpperCase()}...`);
    setShowExportModal(false);
  };

  const handleAddAssignment = (formData: FormData) => {
    const journalistId = formData.get('journalistId') as string;
    const journalist = getJournalist(journalistId);
    if (journalist) {
      addAssignment({
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        journalistId,
        journalistName: journalist.fullName,
        assignedBy: user?.id || 'system',
        assignedByName: user?.name || 'System',
        priority: (formData.get('priority') as AssignmentPriority) || 'normal',
        status: 'pending',
        dueDate: new Date(formData.get('dueDate') as string),
        tags: [],
        attachments: [],
      });
      setShowAddAssignment(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 mt-1">Manage journalist assignments and tasks</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddAssignment(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Assignment
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Folder className="w-5 h-5" />
            Templates
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Import
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {statistics.overdue > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {statistics.overdue}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {[
          { label: 'Total', value: statistics.total, icon: FileText, color: 'bg-blue-500' },
          { label: 'Active', value: statistics.active, icon: Clock, color: 'bg-yellow-500' },
          { label: 'Completed', value: statistics.completed, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Overdue', value: statistics.overdue, icon: AlertTriangle, color: 'bg-red-500', badge: statistics.overdue },
          { label: 'Urgent', value: statistics.urgent, icon: Flag, color: 'bg-orange-500' },
          { label: 'Due Today', value: statistics.dueToday, icon: CalendarIcon, color: 'bg-purple-500' },
          { label: 'Due This Week', value: statistics.dueThisWeek, icon: Calendar, color: 'bg-indigo-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glossy-card rounded-2xl p-4"
            >
              <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-500 text-xs mb-1">{stat.label}</h3>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                {stat.badge && stat.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stat.badge} urgent</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedAssignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4"
          >
            <span className="font-semibold">{selectedAssignments.length} selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkActions(true)}
                className="px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Actions
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
              <button
                onClick={() => setSelectedAssignments([])}
                className="px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Selector and Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* View Mode Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
            }`}
            title="List View"
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'kanban' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
            }`}
            title="Kanban Board"
          >
            <Columns className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'calendar' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
            }`}
            title="Calendar View"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'timeline' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'
            }`}
            title="Timeline View"
          >
            <Activity className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap flex-1 justify-end">
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedAssignments.length === filteredAssignments.length && filteredAssignments.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm">Select All</span>
          </label>
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterJournalist}
            onChange={(e) => setFilterJournalist(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Journalists</option>
            {journalists.map(j => (
              <option key={j.id} value={j.id}>{j.fullName}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
            <option value="title">Sort by Title</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment, index) => {
              const journalist = getJournalist(assignment.journalistId);
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const overdueAssignment = isOverdue(assignment.dueDate) && !['published', 'cancelled'].includes(assignment.status);

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`glossy-card rounded-2xl p-6 hover:shadow-lg transition-all ${
                    selectedAssignments.includes(assignment.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  } ${overdueAssignment ? 'border-l-4 border-red-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedAssignments.includes(assignment.id)}
                      onChange={() => toggleSelectAssignment(assignment.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-1"
                    />
                    <div className={`${getPriorityColor(assignment.priority)} w-1 h-full absolute left-0 top-0 rounded-l-2xl`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                              {assignment.status.replace('_', ' ')}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(assignment.priority)}`} />
                            <span className="text-xs text-gray-500 capitalize">{assignment.priority}</span>
                            {overdueAssignment && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {assignment.journalistName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {formatDate(assignment.dueDate)}
                            </span>
                            {daysUntilDue >= 0 && (
                              <span className={`flex items-center gap-1 ${daysUntilDue <= 2 ? 'text-red-600 font-semibold' : ''}`}>
                                <ClockIcon className="w-3 h-3" />
                                {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                              </span>
                            )}
                            {assignment.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {assignment.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Assigned by {assignment.assignedByName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignmentDetails(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowEditAssignment(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this assignment?')) {
                                deleteAssignment(assignment.id);
                              }
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                          <div className="relative">
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assignments found. Create a new assignment to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment, index) => {
              const journalist = getJournalist(assignment.journalistId);
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              const overdueAssignment = isOverdue(assignment.dueDate) && !['published', 'cancelled'].includes(assignment.status);

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glossy-card rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer ${
                    selectedAssignments.includes(assignment.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowAssignmentDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedAssignments.includes(assignment.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectAssignment(assignment.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div className={`${getPriorityColor(assignment.priority)} w-3 h-3 rounded-full`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{assignment.title}</h3>
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{assignment.description}</p>
                  )}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <User className="w-3 h-3" />
                      <span className="truncate">{assignment.journalistName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(assignment.dueDate)}</span>
                    </div>
                    {daysUntilDue >= 0 && (
                      <div className={`flex items-center gap-2 text-xs ${daysUntilDue <= 2 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        <ClockIcon className="w-3 h-3" />
                        <span>{daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                    {overdueAssignment && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                        Overdue
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assignments found. Create a new assignment to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {(['pending', 'in_progress', 'submitted', 'reviewed', 'published', 'rejected', 'cancelled'] as AssignmentStatus[]).map((status) => {
            const statusAssignments = filteredAssignments.filter(a => a.status === status);
            return (
              <div key={status} className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 capitalize">{status.replace('_', ' ')}</h3>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                    {statusAssignments.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusAssignments.map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      layout
                      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowAssignmentDetails(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{assignment.title}</h4>
                        <div className={`${getPriorityColor(assignment.priority)} w-2 h-2 rounded-full flex-shrink-0 ml-2`} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <User className="w-3 h-3" />
                        <span className="truncate">{assignment.journalistName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View Placeholder */}
      {viewMode === 'calendar' && (
        <div className="glossy-card rounded-2xl p-8 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-500 mb-4">Interactive calendar view showing assignments by due date</p>
          <div className="grid grid-cols-7 gap-2 mt-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-sm font-semibold text-gray-600 text-center p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-2 min-h-[80px] text-sm">
                <div className="font-semibold text-gray-700">{(i % 30) + 1}</div>
                {filteredAssignments.slice(0, 2).map((a, idx) => (
                  i === idx * 7 && (
                    <div key={a.id} className="mt-1 p-1 bg-primary-100 text-primary-700 rounded text-xs truncate">
                      {a.title}
                    </div>
                  )
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View Placeholder */}
      {viewMode === 'timeline' && (
        <div className="glossy-card rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Timeline View</h3>
          <div className="space-y-6">
            {filteredAssignments.slice(0, 10).map((assignment, idx) => (
              <div key={assignment.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`${getPriorityColor(assignment.priority)} w-4 h-4 rounded-full`} />
                  {idx < filteredAssignments.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">{formatDate(assignment.dueDate)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(assignment.status)}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">{assignment.journalistName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      <AnimatePresence>
        {showAddAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddAssignment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Assignment</h2>
                <button
                  onClick={() => setShowAddAssignment(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleAddAssignment(formData);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Enter assignment title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    placeholder="Describe the assignment in detail..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Journalist</label>
                  <select
                    name="journalistId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Journalist</option>
                    {journalists.filter(j => j.status === 'active').map(j => (
                      <option key={j.id} value={j.id}>
                        {j.fullName} - {j.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date & Time</label>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Assignment location"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAssignment(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Assignment Modal */}
      <AnimatePresence>
        {showEditAssignment && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditAssignment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Assignment</h2>
                <button
                  onClick={() => setShowEditAssignment(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const journalistId = formData.get('journalistId') as string;
                  const journalist = getJournalist(journalistId);
                  if (journalist) {
                    updateAssignment(selectedAssignment.id, {
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      journalistId,
                      journalistName: journalist.fullName,
                      priority: (formData.get('priority') as AssignmentPriority),
                      status: (formData.get('status') as AssignmentStatus),
                      dueDate: new Date(formData.get('dueDate') as string),
                      location: formData.get('location') as string,
                    });
                    setShowEditAssignment(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedAssignment.title}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    defaultValue={selectedAssignment.description}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Journalist</label>
                  <select
                    name="journalistId"
                    defaultValue={selectedAssignment.journalistId}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {journalists.map(j => (
                      <option key={j.id} value={j.id}>
                        {j.fullName} - {j.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      defaultValue={selectedAssignment.priority}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={selectedAssignment.status}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date & Time</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    defaultValue={new Date(selectedAssignment.dueDate).toISOString().slice(0, 16)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={selectedAssignment.location}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditAssignment(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment Details Modal */}
      <AnimatePresence>
        {showAssignmentDetails && selectedAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAssignmentDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowAssignmentDetails(false);
                      setShowEditAssignment(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowAssignmentDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Assignment Meta Info */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(selectedAssignment.status)}`}>
                  {selectedAssignment.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize text-white ${getPriorityColor(selectedAssignment.priority)}`}>
                  {selectedAssignment.priority} Priority
                </span>
                {isOverdue(selectedAssignment.dueDate) && !['published', 'cancelled'].includes(selectedAssignment.status) && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Overdue
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex items-center gap-4">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'comments', label: 'Comments', icon: MessageCircle },
                    { id: 'attachments', label: 'Attachments', icon: Paperclip },
                    { id: 'history', label: 'History', icon: History },
                    { id: 'time', label: 'Time Tracking', icon: ClockIcon },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setDetailsTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                          detailsTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent hover:border-primary-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Overview Tab */}
              {detailsTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedAssignment.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Assignment Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned to:</span>
                          <span className="font-medium">{selectedAssignment.journalistName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned by:</span>
                          <span className="font-medium">{selectedAssignment.assignedByName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date:</span>
                          <span className="font-medium">{formatDate(selectedAssignment.dueDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days Until Due:</span>
                          <span className={`font-medium ${getDaysUntilDue(selectedAssignment.dueDate) <= 2 ? 'text-red-600' : ''}`}>
                            {getDaysUntilDue(selectedAssignment.dueDate)} days
                          </span>
                        </div>
                        {selectedAssignment.location && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{selectedAssignment.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            updateAssignment(selectedAssignment.id, { status: 'in_progress' });
                          }}
                          className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                        >
                          <Play className="w-4 h-4 inline mr-2" />
                          Start Assignment
                        </button>
                        <button
                          onClick={() => {
                            updateAssignment(selectedAssignment.id, { status: 'submitted' });
                          }}
                          className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Mark as Submitted
                        </button>
                        <button
                          onClick={() => {
                            updateAssignment(selectedAssignment.id, { status: 'published' });
                          }}
                          className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Mark as Published
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {detailsTab === 'comments' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <textarea
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                    />
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
                      <Send className="w-4 h-4 inline mr-2" />
                      Post Comment
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                            U
                          </div>
                          <div>
                            <p className="font-medium text-sm">User Name</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">This is a sample comment on the assignment...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Tab */}
              {detailsTab === 'attachments' && (
                <div className="space-y-4">
                  <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors text-sm text-gray-600 hover:text-primary-600">
                    <Upload className="w-5 h-5 inline mr-2" />
                    Upload Attachments
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                        <FileText className="w-10 h-10 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Document_{i}.pdf</p>
                          <p className="text-xs text-gray-500">2.3 MB</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {detailsTab === 'history' && (
                <div className="space-y-3">
                  {[
                    { action: 'Assignment created', user: 'System', time: '3 days ago', color: 'bg-blue-500' },
                    { action: 'Status changed to In Progress', user: selectedAssignment.journalistName, time: '2 days ago', color: 'bg-yellow-500' },
                    { action: 'Comment added', user: 'Editor', time: '1 day ago', color: 'bg-purple-500' },
                    { action: 'Attachment uploaded', user: selectedAssignment.journalistName, time: '5 hours ago', color: 'bg-green-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`${item.color} w-3 h-3 rounded-full`} />
                        {idx < 3 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium text-sm">{item.action}</p>
                        <p className="text-xs text-gray-500">{item.user} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Time Tracking Tab */}
              {detailsTab === 'time' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Total Time Spent</h4>
                      <span className="text-2xl font-bold text-primary-600">8h 45m</span>
                    </div>
                    <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      <Play className="w-4 h-4 inline mr-2" />
                      Start Timer
                    </button>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Time Logs</h4>
                    <div className="space-y-2">
                      {[
                        { date: 'Today', time: '2h 15m', description: 'Research and interviews' },
                        { date: 'Yesterday', time: '3h 30m', description: 'Writing and editing' },
                        { date: '2 days ago', time: '3h 00m', description: 'Initial research' },
                      ].map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{log.date}</p>
                            <p className="text-xs text-gray-500">{log.description}</p>
                          </div>
                          <span className="font-semibold">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Modal */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkActions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Bulk Actions</h2>
                <button
                  onClick={() => setShowBulkActions(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">{selectedAssignments.length} assignments selected</p>
                <button
                  onClick={() => handleBulkStatusUpdate('in_progress')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Play className="w-5 h-5 text-yellow-600" />
                  <span>Mark as In Progress</span>
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('submitted')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Mark as Submitted</span>
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('published')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Mark as Published</span>
                </button>
                <button
                  onClick={() => handleBulkPriorityUpdate('urgent')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Flag className="w-5 h-5 text-red-600" />
                  <span>Set Priority to Urgent</span>
                </button>
                <button
                  onClick={() => {
                    setShowBulkActions(false);
                    setShowExportModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Download className="w-5 h-5 text-blue-600" />
                  <span>Export Selected</span>
                </button>
                <button
                  onClick={() => {
                    setShowBulkActions(false);
                    handleBulkDelete();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Export Assignments</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  {selectedAssignments.length > 0
                    ? `Exporting ${selectedAssignments.length} selected assignments`
                    : `Exporting all ${filteredAssignments.length} assignments`}
                </p>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-xs text-gray-500">Comma-separated values</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-green-700" />
                  <div>
                    <div className="font-medium">Export as Excel</div>
                    <div className="text-xs text-gray-500">Microsoft Excel format</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-medium">Export as PDF</div>
                    <div className="text-xs text-gray-500">Portable document format</div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Import Assignments</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports CSV, Excel (.xlsx)</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Import Guidelines:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Headers: Title, Description, Journalist, Priority, Due Date</li>
                        <li>Priority: urgent, high, normal, low</li>
                        <li>Date format: YYYY-MM-DD HH:MM</li>
                        <li>Maximum 500 assignments per import</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => alert('Downloading template...')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    Download Template
                  </button>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Assignment Templates</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Breaking News Coverage', icon: Newspaper, color: 'bg-red-500' },
                  { name: 'Feature Article', icon: FileText, color: 'bg-blue-500' },
                  { name: 'Interview', icon: User, color: 'bg-green-500' },
                  { name: 'Investigation', icon: Search, color: 'bg-purple-500' },
                  { name: 'Photo Story', icon: Camera, color: 'bg-pink-500' },
                  { name: 'Video Report', icon: Video, color: 'bg-orange-500' },
                ].map((template) => {
                  const Icon = template.icon;
                  return (
                    <motion.div
                      key={template.name}
                      whileHover={{ scale: 1.02 }}
                      className="glossy-card rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => {
                        setShowTemplates(false);
                        setShowAddAssignment(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${template.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-xs text-gray-500">Click to use template</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
