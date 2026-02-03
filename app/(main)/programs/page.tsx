'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Tv, Calendar, Clock, Plus, Edit, Trash2, Download, Archive, CheckCircle, XCircle,
  Send, Search, Filter, MoreVertical, User, Tag, Play, Pause, Eye, Film,
  ChevronDown, ChevronUp, CheckSquare, Square, FileDown, Share2, Copy,
  Settings, Grid, List, Star, Award, Users, Video, Image as ImageIcon
} from 'lucide-react';
import { useProgramsStore, Program } from '@/lib/programs-store';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  archived: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
  'on-air': 'bg-red-500 text-white animate-pulse',
  scheduled: 'bg-blue-100 text-blue-700',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

const typeIcons = {
  series: Film,
  episode: Video,
  special: Star,
  live: Play,
  documentary: Film,
  news: Tv,
  sports: Award,
  entertainment: Users,
};

export default function ProgramsPage() {
  const { t } = useTranslation();
  const {
    programs,
    addProgram,
    updateProgram,
    deleteProgram,
    getActivePrograms,
    getScheduledPrograms,
    getOnAirPrograms,
  } = useProgramsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Program>>({
    title: '',
    description: '',
    category: '',
    type: 'series',
    status: 'draft',
    assignedTo: '',
    tags: [],
    priority: 'medium',
    duration: 0,
    episodeNumber: undefined,
    seasonNumber: undefined,
    metadata: {},
  });

  // Statistics
  const stats = {
    active: getActivePrograms().length,
    scheduled: getScheduledPrograms().length,
    onAir: getOnAirPrograms().length,
    total: programs.length,
  };

  // Filter programs
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    const matchesType = selectedType === 'all' || program.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

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
      deleteProgram(id);
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedItems.length} program(s)?`)) {
      selectedItems.forEach(id => deleteProgram(id));
      setSelectedItems([]);
    }
  };

  const handleApprove = (id: string) => {
    updateProgram(id, { status: 'approved' });
  };

  const handleReject = (id: string) => {
    updateProgram(id, { status: 'rejected' });
  };

  const handleComplete = (id: string) => {
    updateProgram(id, { status: 'completed' });
  };

  const handleArchive = (id: string) => {
    updateProgram(id, { status: 'archived' });
  };

  const handleBulkArchive = () => {
    selectedItems.forEach(id => updateProgram(id, { status: 'archived' }));
    setSelectedItems([]);
  };

  const handleExport = (id: string) => {
    const program = programs.find(p => p.id === id);
    if (program) {
      const dataStr = JSON.stringify(program, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${program.title.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleBulkExport = () => {
    const selectedPrograms = programs.filter(p => selectedItems.includes(p.id));
    const dataStr = JSON.stringify(selectedPrograms, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `programs_export_${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = (id: string) => {
    setShowAssignModal(true);
    setAssigningTo('');
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      type: 'series',
      status: 'draft',
      assignedTo: '',
      tags: [],
      priority: 'medium',
      duration: 0,
      episodeNumber: undefined,
      seasonNumber: undefined,
      metadata: {},
    });
    setShowCreateModal(true);
  };

  const handleEdit = (program: Program) => {
    setFormData({
      ...program,
      airDate: program.airDate ? new Date(program.airDate) : undefined,
    });
    setEditingProgram(program);
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.category) {
      alert('Please fill in all required fields (Title and Category)');
      return;
    }

    if (editingProgram) {
      // Update existing program
      updateProgram(editingProgram.id, {
        ...formData,
        updatedAt: new Date(),
      } as Partial<Program>);
      setShowEditModal(false);
      setEditingProgram(null);
    } else {
      // Create new program
      addProgram({
        title: formData.title!,
        description: formData.description,
        category: formData.category!,
        type: formData.type || 'series',
        status: formData.status || 'draft',
        assignedTo: formData.assignedTo || 'Unassigned',
        createdBy: 'Current User', // Replace with actual user
        tags: formData.tags || [],
        priority: formData.priority || 'medium',
        duration: formData.duration,
        episodeNumber: formData.episodeNumber,
        seasonNumber: formData.seasonNumber,
        airDate: formData.airDate,
        metadata: formData.metadata,
      });
      setShowCreateModal(false);
    }

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      type: 'series',
      status: 'draft',
      assignedTo: '',
      tags: [],
      priority: 'medium',
      duration: 0,
      episodeNumber: undefined,
      seasonNumber: undefined,
      metadata: {},
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Programs Management</h1>
          <p className="text-gray-600">Manage TV programs and shows</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Program
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Programs', value: stats.active, icon: Tv, color: 'bg-blue-500' },
          { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'bg-green-500' },
          { label: 'On Air', value: stats.onAir, icon: Clock, color: 'bg-red-500' },
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="on-air">On Air</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="series">Series</option>
                    <option value="episode">Episode</option>
                    <option value="special">Special</option>
                    <option value="live">Live</option>
                    <option value="documentary">Documentary</option>
                    <option value="news">News</option>
                    <option value="sports">Sports</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="News">News</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Talk Show">Talk Show</option>
                    <option value="Weather">Weather</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedType('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
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

      {/* Programs Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No programs found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or create a new program</p>
          </div>
        ) : (
          filteredPrograms.map((program, index) => {
            const TypeIcon = typeIcons[program.type] || Tv;
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glossy-card rounded-2xl overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
              >
                {/* Checkbox */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-shrink-0' : 'absolute top-2 left-2 z-10'}`}>
                  <button
                    onClick={() => toggleSelection(program.id)}
                    className="w-5 h-5 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors flex items-center justify-center"
                  >
                    {selectedItems.includes(program.id) && (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                </div>

                {/* Thumbnail/Icon */}
                <div className={`${viewMode === 'grid' ? 'h-48' : 'w-32 h-32 flex-shrink-0'} bg-gradient-to-br ${
                  program.type === 'live' ? 'from-red-400 to-red-600' :
                  program.type === 'news' ? 'from-blue-400 to-blue-600' :
                  program.type === 'sports' ? 'from-green-400 to-green-600' :
                  'from-purple-400 to-purple-600'
                } flex items-center justify-center relative`}>
                  <TypeIcon className="w-12 h-12 text-white" />
                  {program.status === 'on-air' && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                      LIVE
                    </div>
                  )}
                  <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${priorityColors[program.priority]}`}></div>
                  {program.episodeNumber && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      S{program.seasonNumber || 1}E{program.episodeNumber}
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{program.title}</h3>
                    <div className="relative group">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${statusColors[program.status]}`}>
                        {program.status}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {program.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {program.assignedTo}
                      </span>
                      {program.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {program.duration} min
                        </span>
                      )}
                    </div>

                    {program.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">{program.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {program.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(program)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleSend(program.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Send
                    </button>
                    {program.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(program.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(program.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </>
                    )}
                    {program.status !== 'completed' && program.status !== 'archived' && (
                      <button
                        onClick={() => handleComplete(program.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleExport(program.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                    {program.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(program.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Archive className="w-3 h-3" />
                        Archive
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(program.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

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
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {showEditModal ? 'Edit Program' : 'Create New Program'}
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

                  {/* Type, Category, Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.type || 'series'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="series">Series</option>
                        <option value="episode">Episode</option>
                        <option value="special">Special</option>
                        <option value="live">Live</option>
                        <option value="documentary">Documentary</option>
                        <option value="news">News</option>
                        <option value="sports">Sports</option>
                        <option value="entertainment">Entertainment</option>
                      </select>
                    </div>
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
                        <option value="on-air">On Air</option>
                      </select>
                    </div>
                  </div>

                  {/* Season, Episode, Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Season Number
                      </label>
                      <input
                        type="number"
                        value={formData.seasonNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, seasonNumber: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Episode Number
                      </label>
                      <input
                        type="number"
                        value={formData.episodeNumber || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, episodeNumber: e.target.value ? parseInt(e.target.value) : undefined }))}
                        placeholder="Optional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value ? parseInt(e.target.value) : 0 }))}
                        placeholder="Duration in minutes"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Assigned To, Priority, Air Date */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Air Date
                      </label>
                      <input
                        type="date"
                        value={formData.airDate ? new Date(formData.airDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, airDate: e.target.value ? new Date(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
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
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Metadata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Director
                        </label>
                        <input
                          type="text"
                          value={formData.metadata?.director || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: { ...prev.metadata, director: e.target.value }
                          }))}
                          placeholder="Director name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Producer
                        </label>
                        <input
                          type="text"
                          value={formData.metadata?.producer || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: { ...prev.metadata, producer: e.target.value }
                          }))}
                          placeholder="Producer name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <input
                          type="text"
                          value={formData.metadata?.rating || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: { ...prev.metadata, rating: e.target.value }
                          }))}
                          placeholder="e.g., PG, PG-13, R"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <input
                          type="text"
                          value={formData.metadata?.language || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metadata: { ...prev.metadata, language: e.target.value }
                          }))}
                          placeholder="e.g., English, Amharic, Arabic"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
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
                        // Handle assign logic here
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
