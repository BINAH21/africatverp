'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Palette, Image, Layers, Plus, Trash2, Download, Archive, XCircle,
  Send, Search, Filter, User, Tag, Clock, CheckSquare, Square, Edit,
  FileDown, FolderArchive, Share2, Copy, Settings, Grid, List,
  ChevronDown, ChevronUp, Eye, Play, Pause, AlertCircle, FileText,
  Package, Code, FileCode, Wrench, Upload, MessageSquare,
  ArrowRight, ArrowLeft, Calendar, Star, Award, Users, FileCheck,
  FileX, CheckCircle, CheckCircle2, X, Save, X as XIcon, Sparkles, Brush,
  Type, ImageIcon, Film, Zap, PenTool, BarChart3
} from 'lucide-react';
import { useGraphicsDesignStore, GraphicsProject, DesignProgram } from '@/lib/graphics-design-store';
import { useAppStore } from '@/lib/store';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  'pending-review': 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-purple-100 text-purple-700',
  archived: 'bg-blue-100 text-blue-700',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const projectTypeIcons = {
  template: Layers,
  graphic: ImageIcon,
  design: Palette,
  logo: Sparkles,
  animation: Film,
  infographic: BarChart3,
  other: FileText,
};

const programTypeIcons = {
  software: Package,
  plugin: Code,
  template: Layers,
  preset: FileCode,
  font: Type,
  asset: ImageIcon,
  other: Settings,
};

const projectTypeColors = {
  template: 'from-pink-400 to-pink-600',
  graphic: 'from-blue-400 to-blue-600',
  design: 'from-purple-400 to-purple-600',
  logo: 'from-yellow-400 to-yellow-600',
  animation: 'from-green-400 to-green-600',
  infographic: 'from-indigo-400 to-indigo-600',
  other: 'from-gray-400 to-gray-600',
};

export default function GraphicsPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();
  const {
    programs,
    projects,
    addProgram,
    updateProgram,
    deleteProgram,
    addProject,
    updateProject,
    deleteProject,
    approveProject,
    rejectProject,
    sendProject,
    assignProject,
    registerProject,
    completeProject,
    archiveProject,
    giveOrder,
    receiveOrder,
    acceptOrder,
    rejectOrder,
    completeOrder,
    exportProject,
    exportProjects,
    getActiveProjects,
    getInProgressProjects,
    getCompletedProjects,
    getProjectsByType,
  } = useGraphicsDesignStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [editingProject, setEditingProject] = useState<GraphicsProject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'programs'>('projects');
  const [editingProgram, setEditingProgram] = useState<DesignProgram | null>(null);
  const [orderType, setOrderType] = useState<'give' | 'receive'>('give');
  const [orderMessage, setOrderMessage] = useState('');
  const [orderTo, setOrderTo] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [registerNotes, setRegisterNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  const [formData, setFormData] = useState<Partial<GraphicsProject>>({
    title: '',
    description: '',
    type: 'design',
    status: 'draft',
    assignedTo: '',
    category: '',
    tags: [],
    priority: 'medium',
    programs: [],
    dueDate: undefined,
  });

  const [programFormData, setProgramFormData] = useState<Partial<DesignProgram>>({
    name: '',
    version: '',
    description: '',
    category: '',
    type: 'software',
    status: 'active',
    installed: false,
    path: '',
  });

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesType = selectedType === 'all' || project.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    templates: getProjectsByType('template').length,
    graphics: getProjectsByType('graphic').length,
    designs: getProjectsByType('design').length,
    active: getActiveProjects().length,
    inProgress: getInProgressProjects().length,
    completed: getCompletedProjects().length,
    total: projects.length,
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredProjects.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProjects.map(p => p.id));
    }
  };

  // Project Actions
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedItems.length} project(s)?`)) {
      selectedItems.forEach(id => deleteProject(id));
      setSelectedItems([]);
    }
  };

  const handleApprove = (id: string) => {
    setEditingProject(projects.find(p => p.id === id) || null);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    if (editingProject && user) {
      approveProject(editingProject.id, user.id || user.email, approveNotes);
      setShowApproveModal(false);
      setEditingProject(null);
      setApproveNotes('');
    }
  };

  const handleReject = (id: string) => {
    setEditingProject(projects.find(p => p.id === id) || null);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (editingProject && user) {
      rejectProject(editingProject.id, user.id || user.email, rejectNotes);
      setShowRejectModal(false);
      setEditingProject(null);
      setRejectNotes('');
    }
  };

  const handleSend = (id: string) => {
    setEditingProject(projects.find(p => p.id === id) || null);
    setShowSendModal(true);
  };

  const handleConfirmSend = () => {
    if (editingProject && user && sendTo) {
      sendProject(editingProject.id, sendTo, user.id || user.email, sendMessage);
      setShowSendModal(false);
      setEditingProject(null);
      setSendTo('');
      setSendMessage('');
    }
  };

  const handleAssign = (id: string) => {
    setEditingProject(projects.find(p => p.id === id) || null);
    setShowAssignModal(true);
  };

  const handleConfirmAssign = () => {
    if (editingProject && orderTo) {
      assignProject(editingProject.id, orderTo);
      setShowAssignModal(false);
      setEditingProject(null);
      setOrderTo('');
    }
  };

  const handleRegister = (id: string) => {
    setEditingProject(projects.find(p => p.id === id) || null);
    setShowRegisterModal(true);
  };

  const handleConfirmRegister = () => {
    if (editingProject && user) {
      registerProject(editingProject.id, user.id || user.email, registerNotes);
      setShowRegisterModal(false);
      setEditingProject(null);
      setRegisterNotes('');
    }
  };

  const handleComplete = (id: string) => {
    if (user) {
      completeProject(id, user.id || user.email);
    }
  };

  const handleArchive = (id: string) => {
    archiveProject(id);
  };

  const handleBulkArchive = () => {
    selectedItems.forEach(id => archiveProject(id));
    setSelectedItems([]);
  };

  const handleExport = (id: string) => {
    exportProject(id);
  };

  const handleBulkExport = () => {
    exportProjects(selectedItems);
    setSelectedItems([]);
  };

  const handleOrder = (id: string, type: 'give' | 'receive') => {
    setEditingProject(projects.find(p => p.id === id) || null);
    setOrderType(type);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = () => {
    if (editingProject && user && orderTo && orderMessage) {
      if (orderType === 'give') {
        giveOrder(editingProject.id, orderTo, user.id || user.email, orderMessage);
      } else {
        receiveOrder(editingProject.id, user.id || user.email, orderTo, orderMessage);
      }
      setShowOrderModal(false);
      setEditingProject(null);
      setOrderTo('');
      setOrderMessage('');
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      type: 'design',
      status: 'draft',
      assignedTo: '',
      category: '',
      tags: [],
      priority: 'medium',
      programs: [],
      dueDate: undefined,
    });
    setShowCreateModal(true);
  };

  const handleEdit = (project: GraphicsProject) => {
    setFormData({
      ...project,
      dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
    });
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!formData.title) {
      alert('Please fill in the project title');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        ...formData,
        dueDate: formData.dueDate,
      } as Partial<GraphicsProject>);
      setShowEditModal(false);
      setEditingProject(null);
    } else {
      addProject({
        ...formData,
        createdBy: user?.id || user?.email || 'Unknown',
        assignedTo: formData.assignedTo || 'Unassigned',
        category: formData.category || 'General',
        tags: formData.tags || [],
        programs: formData.programs || [],
        files: [],
      } as Omit<GraphicsProject, 'id' | 'createdAt' | 'updatedAt' | 'workflow' | 'orders'>);
      setShowCreateModal(false);
    }

    setFormData({
      title: '',
      description: '',
      type: 'design',
      status: 'draft',
      assignedTo: '',
      category: '',
      tags: [],
      priority: 'medium',
      programs: [],
      dueDate: undefined,
    });
  };

  // Program Actions
  const handleCreateProgram = () => {
    setProgramFormData({
      name: '',
      version: '',
      description: '',
      category: '',
      type: 'software',
      status: 'active',
      installed: false,
      path: '',
    });
    setEditingProgram(null);
    setShowProgramModal(true);
  };

  const handleEditProgram = (program: DesignProgram) => {
    setProgramFormData(program);
    setEditingProgram(program);
    setShowProgramModal(true);
  };

  const handleDeleteProgram = (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      deleteProgram(id);
    }
  };

  const handleSaveProgram = () => {
    if (!programFormData.name) {
      alert('Please fill in the program name');
      return;
    }

    if (editingProgram) {
      updateProgram(editingProgram.id, programFormData as Partial<DesignProgram>);
    } else {
      addProgram({
        ...programFormData,
        category: programFormData.category || 'General',
      } as Omit<DesignProgram, 'id' | 'createdAt' | 'updatedAt'>);
    }

    setShowProgramModal(false);
    setEditingProgram(null);
    setProgramFormData({
      name: '',
      version: '',
      description: '',
      category: '',
      type: 'software',
      status: 'active',
      installed: false,
      path: '',
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

  const handleProgramToggle = (programId: string) => {
    const currentPrograms = formData.programs || [];
    if (currentPrograms.includes(programId)) {
      setFormData(prev => ({
        ...prev,
        programs: currentPrograms.filter(id => id !== programId),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        programs: [...currentPrograms, programId],
      }));
    }
  };

  const mockUsers = [
    'John Doe',
    'Sarah Smith',
    'Mike Johnson',
    'Emma Wilson',
    'Lisa Brown',
    'David Lee',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Graphics & Design</h1>
          <p className="text-gray-600">Manage graphics, templates, and design assets</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          {activeTab === 'projects' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Project
            </motion.button>
          )}
          {activeTab === 'programs' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateProgram}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Program
            </motion.button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'projects'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'programs'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Programs ({programs.length})
        </button>
      </div>

      {/* Statistics Cards */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { label: 'Templates', value: stats.templates, icon: Layers, color: 'bg-pink-500' },
            { label: 'Graphics', value: stats.graphics, icon: Image, color: 'bg-blue-500' },
            { label: 'Designs', value: stats.designs, icon: Palette, color: 'bg-purple-500' },
            { label: 'Total Projects', value: stats.total, icon: FileText, color: 'bg-gray-500' },
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
      )}

      {/* Search and Filters */}
      {activeTab === 'projects' && (
        <div className="glossy-card rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="pending-review">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Types</option>
                      <option value="template">Template</option>
                      <option value="graphic">Graphic</option>
                      <option value="design">Design</option>
                      <option value="logo">Logo</option>
                      <option value="animation">Animation</option>
                      <option value="infographic">Infographic</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSelectedStatus('all');
                        setSelectedType('all');
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
      )}

      {/* Bulk Actions */}
      {activeTab === 'projects' && selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-4 bg-primary-50 border border-primary-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-700">
                {selectedItems.length} project(s) selected
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

      {/* Projects List/Grid */}
      {activeTab === 'projects' && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No projects found</p>
              <p className="text-gray-400 text-sm mt-2">Create a new project to get started</p>
            </div>
          ) : (
            filteredProjects.map((project, index) => {
              const Icon = projectTypeIcons[project.type] || FileText;
              const gradientClass = projectTypeColors[project.type] || 'from-gray-400 to-gray-600';
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glossy-card rounded-2xl overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
                >
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-shrink-0' : 'absolute top-2 left-2 z-10'}`}>
                    <button
                      onClick={() => toggleSelection(project.id)}
                      className="w-5 h-5 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors flex items-center justify-center"
                    >
                      {selectedItems.includes(project.id) && (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      )}
                    </button>
                  </div>

                  <div className={`${viewMode === 'grid' ? 'h-48' : 'w-32 h-32 flex-shrink-0'} bg-gradient-to-br ${gradientClass} flex items-center justify-center relative`}>
                    <Icon className="w-12 h-12 text-white" />
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${priorityColors[project.priority]}`}></div>
                  </div>

                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${statusColors[project.status]}`}>
                          {project.status}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {project.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {project.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {project.assignedTo}
                        </span>
                        {project.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(project.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {project.programs.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Package className="w-3 h-3" />
                          <span>{project.programs.length} program(s)</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(project)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleSend(project.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </button>
                      <button
                        onClick={() => handleAssign(project.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                      >
                        <User className="w-3 h-3" />
                        Assign
                      </button>
                      <button
                        onClick={() => handleRegister(project.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
                      >
                        <FileCheck className="w-3 h-3" />
                        Register
                      </button>
                      {project.status === 'pending-review' && (
                        <>
                          <button
                            onClick={() => handleApprove(project.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(project.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
                      )}
                      {project.status !== 'completed' && project.status !== 'archived' && (
                        <button
                          onClick={() => handleComplete(project.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleOrder(project.id, 'give')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                        Give Order
                      </button>
                      <button
                        onClick={() => handleOrder(project.id, 'receive')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded hover:bg-teal-100 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Receive Order
                      </button>
                      <button
                        onClick={() => handleExport(project.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                      {project.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(project.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                        >
                          <Archive className="w-3 h-3" />
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(project.id)}
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
      )}

      {/* Programs List */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No programs found</p>
              <p className="text-gray-400 text-sm mt-2">Add a program to get started</p>
            </div>
          ) : (
            programs.map((program, index) => {
              const Icon = programTypeIcons[program.type] || Settings;
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glossy-card rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${program.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      {program.installed && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          Installed
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{program.name}</h3>
                  {program.version && (
                    <p className="text-sm text-gray-500 mb-2">v{program.version}</p>
                  )}
                  {program.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.description}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {program.type}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {program.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleEditProgram(program)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(program.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Create/Edit Project Modal */}
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
              setEditingProject(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {showEditModal ? 'Edit Project' : 'Create New Project'}
                    </h3>
                    <p className="text-primary-100 text-sm">
                      {showEditModal ? 'Update project details' : 'Fill in the project information'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingProject(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter project title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={formData.type || 'design'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="template">Template</option>
                        <option value="graphic">Graphic</option>
                        <option value="design">Design</option>
                        <option value="logo">Logo</option>
                        <option value="animation">Animation</option>
                        <option value="infographic">Infographic</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={formData.category || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="Category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={formData.priority || 'medium'}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value ? new Date(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <select
                        value={formData.assignedTo || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select user...</option>
                        {mockUsers.map(user => (
                          <option key={user} value={user}>{user}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter project description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Programs</label>
                    <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                      {programs.length === 0 ? (
                        <p className="text-sm text-gray-500">No programs available. Add programs first.</p>
                      ) : (
                        <div className="space-y-2">
                          {programs.map(program => (
                            <label key={program.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.programs?.includes(program.id) || false}
                                onChange={() => handleProgramToggle(program.id)}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">{program.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
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
                            <XIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {showEditModal ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Program Modal */}
      <AnimatePresence>
        {showProgramModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProgramModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">
                      {editingProgram ? 'Edit Program' : 'Add New Program'}
                    </h3>
                    <p className="text-primary-100 text-sm">
                      {editingProgram ? 'Update program details' : 'Add a new design program or software'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProgramModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={programFormData.name || ''}
                      onChange={(e) => setProgramFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Adobe Photoshop, Illustrator, After Effects, Figma"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                      <input
                        type="text"
                        value={programFormData.version || ''}
                        onChange={(e) => setProgramFormData(prev => ({ ...prev, version: e.target.value }))}
                        placeholder="e.g., 2024, 1.0.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={programFormData.type || 'software'}
                        onChange={(e) => setProgramFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="software">Software</option>
                        <option value="plugin">Plugin</option>
                        <option value="template">Template</option>
                        <option value="preset">Preset</option>
                        <option value="font">Font</option>
                        <option value="asset">Asset</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={programFormData.category || ''}
                        onChange={(e) => setProgramFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Image Editor, Vector Graphics, Animation"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={programFormData.status || 'active'}
                        onChange={(e) => setProgramFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Installation Path</label>
                    <input
                      type="text"
                      value={programFormData.path || ''}
                      onChange={(e) => setProgramFormData(prev => ({ ...prev, path: e.target.value }))}
                      placeholder="e.g., C:\Program Files\Adobe\Photoshop"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={programFormData.description || ''}
                      onChange={(e) => setProgramFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter program description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={programFormData.installed || false}
                      onChange={(e) => setProgramFormData(prev => ({ ...prev, installed: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label className="text-sm text-gray-700">Installed</label>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgram}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingProgram ? 'Update Program' : 'Add Program'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Modal */}
      <AnimatePresence>
        {showSendModal && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Send Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
                  <select
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select user...</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                  <textarea
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    placeholder="Add a message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSend}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Modal */}
      <AnimatePresence>
        {showAssignModal && editingProject && (
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                  <select
                    value={orderTo}
                    onChange={(e) => setOrderTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select user...</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
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
                    onClick={handleConfirmAssign}
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

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Register Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={registerNotes}
                    onChange={(e) => setRegisterNotes(e.target.value)}
                    placeholder="Add registration notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowRegisterModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRegister}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Approval Notes (Optional)</label>
                  <textarea
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    placeholder="Add approval notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {orderType === 'give' ? 'Give Order' : 'Receive Order'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {orderType === 'give' ? 'To' : 'From'}
                  </label>
                  <select
                    value={orderTo}
                    onChange={(e) => setOrderTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select user...</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Message <span className="text-red-500">*</span></label>
                  <textarea
                    value={orderMessage}
                    onChange={(e) => setOrderMessage(e.target.value)}
                    placeholder="Enter order details..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {orderType === 'give' ? 'Give Order' : 'Receive Order'}
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
