'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Video, Image as ImageIcon, FileText, Search, Filter, Plus, Edit, Trash2, Download,
  Archive, CheckCircle, XCircle, Send, Eye, MoreVertical, Calendar, User, Tag,
  Clock, CheckSquare, Square, Upload, Share2, Copy, FileDown, FolderArchive,
  AlertCircle, Play, Pause, Settings, Grid, List, ChevronDown, ChevronUp
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'image' | 'document' | 'audio';
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'completed';
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  duration?: string;
  size: string;
  thumbnail?: string;
  description?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Morning News Segment - December 13',
    type: 'video',
    category: 'News',
    status: 'approved',
    assignedTo: 'John Doe',
    createdBy: 'Sarah Smith',
    createdAt: new Date(2024, 11, 10),
    updatedAt: new Date(2024, 11, 12),
    duration: '15:30',
    size: '245 MB',
    tags: ['news', 'morning', 'breaking'],
    priority: 'high',
  },
  {
    id: '2',
    title: 'Sports Highlights Package',
    type: 'video',
    category: 'Sports',
    status: 'pending',
    assignedTo: 'Mike Johnson',
    createdBy: 'Emma Wilson',
    createdAt: new Date(2024, 11, 11),
    updatedAt: new Date(2024, 11, 12),
    duration: '8:45',
    size: '156 MB',
    tags: ['sports', 'highlights'],
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Weather Forecast Graphics',
    type: 'image',
    category: 'Graphics',
    status: 'draft',
    assignedTo: 'Lisa Brown',
    createdBy: 'David Lee',
    createdAt: new Date(2024, 11, 12),
    updatedAt: new Date(2024, 11, 13),
    size: '12 MB',
    tags: ['weather', 'graphics'],
    priority: 'low',
  },
  {
    id: '4',
    title: 'Editorial Guidelines Document',
    type: 'document',
    category: 'Documents',
    status: 'completed',
    assignedTo: 'Admin',
    createdBy: 'Admin',
    createdAt: new Date(2024, 11, 1),
    updatedAt: new Date(2024, 11, 5),
    size: '2.5 MB',
    tags: ['guidelines', 'editorial'],
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Interview with CEO',
    type: 'video',
    category: 'Interview',
    status: 'rejected',
    assignedTo: 'John Doe',
    createdBy: 'Sarah Smith',
    createdAt: new Date(2024, 11, 8),
    updatedAt: new Date(2024, 11, 9),
    duration: '22:15',
    size: '389 MB',
    tags: ['interview', 'ceo'],
    priority: 'high',
  },
  {
    id: '6',
    title: 'Station Logo Variations',
    type: 'image',
    category: 'Graphics',
    status: 'archived',
    assignedTo: 'Lisa Brown',
    createdBy: 'David Lee',
    createdAt: new Date(2024, 10, 15),
    updatedAt: new Date(2024, 10, 20),
    size: '8 MB',
    tags: ['logo', 'branding'],
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
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export default function ContentPage() {
  const { t } = useTranslation();
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningTo, setAssigningTo] = useState<string>('');

  // Filter content
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const stats = {
    videos: content.filter(c => c.type === 'video').length,
    images: content.filter(c => c.type === 'image').length,
    documents: content.filter(c => c.type === 'document').length,
    total: content.length,
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredContent.map(item => item.id));
    }
  };

  // Actions
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setContent(prev => prev.filter(item => item.id !== id));
      setSelectedItems(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      setContent(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handleApprove = (id: string) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'approved' as const } : item
    ));
  };

  const handleReject = (id: string) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'rejected' as const } : item
    ));
  };

  const handleComplete = (id: string) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'completed' as const } : item
    ));
  };

  const handleArchive = (id: string) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'archived' as const } : item
    ));
  };

  const handleBulkArchive = () => {
    setContent(prev => prev.map(item =>
      selectedItems.includes(item.id) ? { ...item, status: 'archived' as const } : item
    ));
    setSelectedItems([]);
  };

  const handleAssign = (id: string, userId: string) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, assignedTo: userId } : item
    ));
    setShowAssignModal(false);
  };

  const handleExport = (id: string) => {
    // Simulate export
    alert(`Exporting ${content.find(c => c.id === id)?.title}`);
  };

  const handleBulkExport = () => {
    alert(`Exporting ${selectedItems.length} item(s)`);
  };

  const handleSend = (id: string) => {
    setShowAssignModal(true);
    setAssigningTo('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage all your TV content, videos, and media</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Content
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Videos', value: stats.videos, icon: Video, color: 'bg-red-500' },
          { label: 'Images', value: stats.images, icon: ImageIcon, color: 'bg-blue-500' },
          { label: 'Documents', value: stats.documents, icon: FileText, color: 'bg-green-500' },
          { label: 'Total', value: stats.total, icon: FileText, color: 'bg-purple-500' },
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
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
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
              placeholder="Search content..."
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
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>

                {/* Clear Filters */}
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
                {selectedItems.length} item(s) selected
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

      {/* Content Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredContent.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No content found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          filteredContent.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glossy-card rounded-2xl overflow-hidden ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
            >
              {/* Checkbox */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-shrink-0' : 'absolute top-2 left-2 z-10'}`}>
                <button
                  onClick={() => toggleSelection(item.id)}
                  className="w-5 h-5 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors flex items-center justify-center"
                >
                  {selectedItems.includes(item.id) && (
                    <CheckSquare className="w-5 h-5 text-primary-600" />
                  )}
                </button>
              </div>

              {/* Thumbnail/Icon */}
              <div className={`${viewMode === 'grid' ? 'h-48' : 'w-32 h-32 flex-shrink-0'} bg-gradient-to-br ${
                item.type === 'video' ? 'from-red-400 to-red-600' :
                item.type === 'image' ? 'from-blue-400 to-blue-600' :
                'from-green-400 to-green-600'
              } flex items-center justify-center relative`}>
                {item.type === 'video' ? (
                  <Play className="w-12 h-12 text-white" />
                ) : item.type === 'image' ? (
                  <ImageIcon className="w-12 h-12 text-white" />
                ) : (
                  <FileText className="w-12 h-12 text-white" />
                )}
                {item.duration && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {item.duration}
                  </div>
                )}
                <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${priorityColors[item.priority]}`}></div>
              </div>

              {/* Content Info */}
              <div className="p-4 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                  <div className="relative group">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.assignedTo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.size}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleSend(item.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Send
                  </button>
                  {item.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </>
                  )}
                  {item.status !== 'completed' && item.status !== 'archived' && (
                    <button
                      onClick={() => handleComplete(item.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleExport(item.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                  {item.status !== 'archived' && (
                    <button
                      onClick={() => handleArchive(item.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

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
              <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Content</h3>
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
