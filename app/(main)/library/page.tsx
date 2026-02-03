'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Video, Image as ImageIcon, FileText, Search, Filter, Plus, Edit, Trash2, Download,
  Archive, CheckCircle, XCircle, Send, Eye, MoreVertical, Calendar, User, Tag,
  Clock, CheckSquare, Square, Upload, Share2, Copy, FileDown, FolderArchive,
  AlertCircle, Play, Pause, Settings, Grid, List, ChevronDown, ChevronUp,
  Folder, FolderPlus, FolderOpen, Star, StarOff, Heart, Link, FileCheck,
  FileX, RefreshCw, Layers, Filter as FilterIcon, X, Save, FolderTree,
  HardDrive, Server, Zap, Activity, BarChart3, TrendingUp, FileSearch,
  Shield, Users, Lock, Unlock, EyeOff, DownloadCloud, UploadCloud,
  ImagePlus, VideoIcon, Music, File, Package, MoreHorizontal, Info, Maximize2,
  Minimize2, ChevronRight, ChevronLeft, SlidersHorizontal, Bell, BellOff, Files
} from 'lucide-react';
import { useMediaLibraryStore, MediaFileType, UserRole, MediaFile, ServerFolder } from '@/lib/media-library-store';
import { useAppStore } from '@/lib/store';

// Map user role string to UserRole type
const mapUserRole = (role: string): UserRole => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('admin') || roleLower.includes('administrator')) return 'admin';
  if (roleLower.includes('manager')) return 'manager';
  if (roleLower.includes('editor')) return 'editor';
  if (roleLower.includes('viewer')) return 'viewer';
  return 'guest';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const getFileTypeIcon = (type: MediaFileType) => {
  switch (type) {
    case 'video': return Video;
    case 'image': return ImageIcon;
    case 'audio': return Music;
    case 'document': return FileText;
    case 'archive': return Package;
    default: return File;
  }
};

const getFileTypeColor = (type: MediaFileType) => {
  switch (type) {
    case 'video': return 'from-red-400 to-red-600';
    case 'image': return 'from-blue-400 to-blue-600';
    case 'audio': return 'from-purple-400 to-purple-600';
    case 'document': return 'from-green-400 to-green-600';
    case 'archive': return 'from-yellow-400 to-yellow-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

export default function LibraryPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();
  const currentRole = user ? mapUserRole(user.role) : 'guest';
  
  const {
    folders,
    files,
    collections,
    scanJobs,
    addFolder,
    updateFolder,
    deleteFolder,
    getFoldersByRole,
    addFile,
    updateFile,
    deleteFile,
    getFilesByFolder,
    getFilesByType,
    getFilesByRole,
    searchFiles,
    scanFolder,
    toggleAutoScan,
    getActiveScanJobs,
    createCollection,
    deleteCollection,
    addFileToCollection,
    markAsFavorite,
    unmarkAsFavorite,
    shareFile,
    unshareFile,
    incrementViews,
    incrementDownloads,
    bulkDelete,
    bulkTag,
    bulkCategorize,
    bulkMove,
    getStatistics,
    findDuplicates,
    verifyFileExists,
    openFileLocation,
  } = useMediaLibraryStore();

  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<MediaFileType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFileDetails, setShowFileDetails] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<ServerFolder | null>(null);
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    path: '',
    serverPath: '',
    description: '',
    isActive: true,
    autoScan: false,
    scanInterval: 60,
    accessRoles: ['admin'] as UserRole[],
  });
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyShared, setShowOnlyShared] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [showDuplicateDetection, setShowDuplicateDetection] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Get accessible folders and files based on role
  const accessibleFolders = useMemo(() => getFoldersByRole(currentRole), [currentRole, getFoldersByRole]);
  const accessibleFiles = useMemo(() => getFilesByRole(currentRole), [currentRole, getFilesByRole]);
  const stats = useMemo(() => getStatistics(), [getStatistics]);

  // Filter files
  const filteredFiles = useMemo(() => {
    let result = accessibleFiles;

    // Filter by folder
    if (selectedFolder) {
      result = result.filter(f => f.folderId === selectedFolder);
    }

    // Filter by collection
    if (selectedCollection) {
      result = result.filter(f => f.collectionIds.includes(selectedCollection));
    }

    // Search
    if (searchQuery) {
      result = searchFiles(searchQuery, {
        type: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      });
      result = result.filter(f => accessibleFiles.some(af => af.id === f.id));
    } else {
      if (selectedType !== 'all') {
        result = result.filter(f => f.type === selectedType);
      }
      if (selectedCategory !== 'all') {
        result = result.filter(f => f.category === selectedCategory);
      }
      if (dateRange.from) {
        result = result.filter(f => f.createdAt >= dateRange.from!);
      }
      if (dateRange.to) {
        result = result.filter(f => f.createdAt <= dateRange.to!);
      }
    }

    // Additional filters
    if (showOnlyFavorites) {
      result = result.filter(f => f.isFavorite);
    }
    if (showOnlyShared) {
      result = result.filter(f => f.isShared);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [accessibleFiles, selectedFolder, selectedCollection, searchQuery, selectedType, selectedCategory, dateRange, showOnlyFavorites, showOnlyShared, sortBy, sortOrder, searchFiles]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    accessibleFiles.forEach(f => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats).sort();
  }, [accessibleFiles]);

  // Active scan jobs
  const activeScans = useMemo(() => getActiveScanJobs(), [getActiveScanJobs]);

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  // Folder management
  const handleAddFolder = () => {
    if (!newFolderData.name || !newFolderData.serverPath) return;
    addFolder(newFolderData);
    setNewFolderData({
      name: '',
      path: '',
      serverPath: '',
      description: '',
      isActive: true,
      autoScan: false,
      scanInterval: 60,
      accessRoles: ['admin'],
    });
    setShowFolderModal(false);
  };

  const handleEditFolder = (folder: ServerFolder) => {
    setEditingFolder(folder);
    setNewFolderData({
      name: folder.name,
      path: folder.path,
      serverPath: folder.serverPath,
      description: folder.description || '',
      isActive: folder.isActive,
      autoScan: folder.autoScan,
      scanInterval: folder.scanInterval,
      accessRoles: folder.accessRoles,
    });
    setShowFolderModal(true);
  };

  const handleUpdateFolder = () => {
    if (!editingFolder) return;
    updateFolder(editingFolder.id, newFolderData);
    setEditingFolder(null);
    setShowFolderModal(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder? This will remove all associated files from the library.')) {
      deleteFolder(folderId);
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
    }
  };

  const handleScanFolder = (folderId: string) => {
    scanFolder(folderId);
  };

  // File operations
  const handleFileClick = (file: MediaFile) => {
    incrementViews(file.id);
    setShowFileDetails(file.id);
  };

  const handleToggleFavorite = (fileId: string) => {
    const file = accessibleFiles.find(f => f.id === fileId);
    if (file?.isFavorite) {
      unmarkAsFavorite(fileId);
    } else {
      markAsFavorite(fileId);
    }
  };

  const handleDownload = (file: MediaFile) => {
    incrementDownloads(file.id);
    // In real implementation, trigger download
    alert(`Downloading ${file.name}...`);
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
      bulkDelete(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const handleBulkTag = () => {
    const tags = prompt('Enter tags (comma-separated):');
    if (tags && selectedFiles.length > 0) {
      bulkTag(selectedFiles, tags.split(',').map(t => t.trim()));
    }
  };

  const handleBulkCategorize = () => {
    const category = prompt('Enter category:');
    if (category && selectedFiles.length > 0) {
      bulkCategorize(selectedFiles, category);
    }
  };

  // Collection management
  const handleCreateCollection = () => {
    const name = prompt('Enter collection name:');
    if (name) {
      createCollection({
        name,
        description: '',
        type: 'manual',
        fileIds: selectedFiles,
        folderIds: [],
        createdBy: user?.id || 'system',
        accessRoles: [currentRole],
        isPublic: false,
      });
      setSelectedFiles([]);
    }
  };

  // Duplicate detection
  const handleFindDuplicates = (fileId: string) => {
    const duplicates = findDuplicates(fileId);
    if (duplicates.length > 0) {
      alert(`Found ${duplicates.length} duplicate(s) of this file.`);
      setSelectedFiles([fileId, ...duplicates.map(d => d.id)]);
    } else {
      alert('No duplicates found.');
    }
  };

  const selectedFile = showFileDetails ? accessibleFiles.find(f => f.id === showFileDetails) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Media Library</h1>
          <p className="text-gray-600">Browse and manage 17 years of accumulated media files from server</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={viewMode === 'grid' ? 'List View' : 'Grid View'}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            Add Server Folder
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Files', value: stats.totalFiles, icon: File, color: 'bg-gray-500', size: formatFileSize(stats.totalSize) },
          { label: 'Videos', value: stats.byType.video, icon: Video, color: 'bg-red-500' },
          { label: 'Images', value: stats.byType.image, icon: ImageIcon, color: 'bg-blue-500' },
          { label: 'Documents', value: stats.byType.document, icon: FileText, color: 'bg-green-500' },
          { label: 'Audio', value: stats.byType.audio, icon: Music, color: 'bg-purple-500' },
          { label: 'Favorites', value: stats.favoriteFiles, icon: Star, color: 'bg-yellow-500' },
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
              <p className="text-xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              {stat.size && <p className="text-xs text-gray-500 mt-1">{stat.size}</p>}
            </motion.div>
          );
        })}
      </div>

      {/* Server Folders Section */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Server Folders ({accessibleFolders.length})
          </h2>
          <div className="flex items-center gap-2">
            {activeScans.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{activeScans.length} scanning...</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessibleFolders.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No server folders connected</p>
              <p className="text-gray-400 text-sm mt-2">Click &quot;Add Server Folder&quot; to link a folder</p>
            </div>
          ) : (
            accessibleFolders.map((folder) => {
              const folderFiles = getFilesByFolder(folder.id);
              const isActive = selectedFolder === folder.id;
              const activeScan = activeScans.find(s => s.folderId === folder.id);
              return (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glossy-card rounded-xl p-4 cursor-pointer transition-all ${
                    isActive ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFolder(isActive ? null : folder.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Folder className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{folder.serverPath}</p>
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFolder(folder);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScanFolder(folder.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Scan Now
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAutoScan(folder.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          {folder.autoScan ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          {folder.autoScan ? 'Disable Auto-Scan' : 'Enable Auto-Scan'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Files:</span>
                      <span className="font-semibold">{folder.fileCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-semibold">{formatFileSize(folder.totalSize)}</span>
                    </div>
                    {folder.autoScan && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Zap className="w-3 h-3" />
                        <span>Auto-scan every {folder.scanInterval} min</span>
                      </div>
                    )}
                    {activeScan && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Scanning... {activeScan.progress}%</span>
                      </div>
                    )}
                    {folder.lastScanned && (
                      <div className="text-xs text-gray-500">
                        Last scanned: {new Date(folder.lastScanned).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files by name, tags, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FilterIcon className="w-5 h-5" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as MediaFileType | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                    <option value="archive">Archive</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="size">Size</option>
                    <option value="type">Type</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="favorites"
                    checked={showOnlyFavorites}
                    onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="favorites" className="text-sm text-gray-700 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Favorites Only
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shared"
                    checked={showOnlyShared}
                    onChange={(e) => setShowOnlyShared(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="shared" className="text-sm text-gray-700 flex items-center gap-1">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    Shared Only
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSelectedType('all');
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setShowOnlyFavorites(false);
                      setShowOnlyShared(false);
                      setDateRange({});
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

      {/* Collections Quick Access */}
      {collections.length > 0 && (
        <div className="glossy-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Collections
            </h3>
            <button
              onClick={handleCreateCollection}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              New Collection
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCollection(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCollection === null
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Files
            </button>
            {collections.map(collection => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedCollection === collection.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {collection.name} ({collection.fileIds.length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glossy-card rounded-2xl p-4 bg-primary-50 border border-primary-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-700">
                {selectedFiles.length} file(s) selected
              </span>
              <button
                onClick={toggleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkTag}
                className="px-3 py-1.5 text-sm bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Add Tags
              </button>
              <button
                onClick={handleBulkCategorize}
                className="px-3 py-1.5 text-sm bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
              >
                <FolderTree className="w-4 h-4" />
                Categorize
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-3 py-1.5 text-sm bg-white border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                Add to Collection
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

      {/* Files Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {filteredFiles.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No files found</p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedFolder ? 'Try selecting a different folder' : 'Try adjusting your filters or add a server folder'}
            </p>
          </div>
        ) : (
          filteredFiles.map((file, index) => {
            const Icon = getFileTypeIcon(file.type);
            const colorClass = getFileTypeColor(file.type);
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`glossy-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all ${
                  viewMode === 'list' ? 'flex items-center gap-4' : ''
                } ${selectedFiles.includes(file.id) ? 'ring-2 ring-primary-500' : ''}`}
                onClick={() => handleFileClick(file)}
              >
                {/* Checkbox */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-shrink-0' : 'absolute top-2 left-2 z-10'}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFileSelection(file.id);
                    }}
                    className="w-5 h-5 rounded border-2 border-gray-300 hover:border-primary-500 transition-colors flex items-center justify-center bg-white"
                  >
                    {selectedFiles.includes(file.id) && (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                </div>

                {/* Thumbnail/Icon */}
                <div className={`${viewMode === 'grid' ? 'h-48' : 'w-32 h-32 flex-shrink-0'} bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
                  <Icon className="w-12 h-12 text-white" />
                  {file.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDuration(file.duration)}
                    </div>
                  )}
                  {file.isFavorite && (
                    <div className="absolute top-2 right-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  )}
                  {file.isShared && (
                    <div className="absolute top-2 left-2">
                      <Share2 className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{file.name}</h3>
                    <div className="relative group ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[150px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(file.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          {file.isFavorite ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                          {file.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            shareFile(file.id, []);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFindDuplicates(file.id);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                        <Files className="w-4 h-4" />
                        Find Duplicates
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openFileLocation(file.serverPath);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                        >
                          <FolderOpen className="w-4 h-4" />
                          Open Location
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this file?')) {
                              deleteFile(file.id);
                            }
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatFileSize(file.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {file.category && (
                      <div className="text-xs text-gray-500">
                        Category: {file.category}
                      </div>
                    )}
                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            #{tag}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            +{file.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      <span>{file.views} views</span>
                      <Download className="w-3 h-3" />
                      <span>{file.downloads} downloads</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(file.id);
                      }}
                      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                        file.isFavorite ? 'text-yellow-500' : 'text-gray-400'
                      }`}
                      title="Toggle Favorite"
                    >
                      <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareFile(file.id, []);
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFindDuplicates(file.id);
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-400"
                      title="Find Duplicates"
                    >
                      <Files className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add/Edit Folder Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowFolderModal(false);
              setEditingFolder(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingFolder ? 'Edit Server Folder' : 'Add Server Folder'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name *</label>
                  <input
                    type="text"
                    value={newFolderData.name}
                    onChange={(e) => setNewFolderData({ ...newFolderData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Archive 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Server Path *</label>
                  <input
                    type="text"
                    value={newFolderData.serverPath}
                    onChange={(e) => setNewFolderData({ ...newFolderData, serverPath: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., \\server\media\archive or /mnt/server/media"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Local Path (Optional)</label>
                  <input
                    type="text"
                    value={newFolderData.path}
                    onChange={(e) => setNewFolderData({ ...newFolderData, path: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., C:\Media\Archive"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newFolderData.description}
                    onChange={(e) => setNewFolderData({ ...newFolderData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoScan"
                    checked={newFolderData.autoScan}
                    onChange={(e) => setNewFolderData({ ...newFolderData, autoScan: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="autoScan" className="text-sm text-gray-700">
                    Enable Auto-Scan
                  </label>
                </div>
                {newFolderData.autoScan && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scan Interval (minutes)
                    </label>
                    <input
                      type="number"
                      value={newFolderData.scanInterval}
                      onChange={(e) => setNewFolderData({ ...newFolderData, scanInterval: parseInt(e.target.value) || 60 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {(['admin', 'manager', 'editor', 'viewer', 'guest'] as UserRole[]).map(role => (
                      <label key={role} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newFolderData.accessRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewFolderData({
                                ...newFolderData,
                                accessRoles: [...newFolderData.accessRoles, role],
                              });
                            } else {
                              setNewFolderData({
                                ...newFolderData,
                                accessRoles: newFolderData.accessRoles.filter(r => r !== role),
                              });
                            }
                          }}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowFolderModal(false);
                      setEditingFolder(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingFolder ? handleUpdateFolder : handleAddFolder}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingFolder ? 'Update' : 'Add'} Folder
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Details Modal */}
      <AnimatePresence>
        {showFileDetails && selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFileDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedFile.name}</h3>
                <button
                  onClick={() => setShowFileDetails(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">File Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedFile.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extension:</span>
                      <span className="font-medium">{selectedFile.extension}</span>
                    </div>
                    {selectedFile.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{formatDuration(selectedFile.duration)}</span>
                      </div>
                    )}
                    {selectedFile.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">{selectedFile.dimensions.width} × {selectedFile.dimensions.height}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(selectedFile.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modified:</span>
                      <span className="font-medium">{new Date(selectedFile.modifiedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discovered:</span>
                      <span className="font-medium">{new Date(selectedFile.discoveredAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{selectedFile.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium">{selectedFile.downloads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favorite:</span>
                      <span className="font-medium">{selectedFile.isFavorite ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shared:</span>
                      <span className="font-medium">{selectedFile.isShared ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  {selectedFile.category && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                      <span className="text-sm text-gray-600">{selectedFile.category}</span>
                    </div>
                  )}
                  {selectedFile.tags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFile.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selectedFile.description && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedFile.description}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-2">Server Path</h4>
                <p className="text-sm text-gray-600 font-mono break-all">{selectedFile.serverPath}</p>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => handleToggleFavorite(selectedFile.id)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    selectedFile.isFavorite
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedFile.isFavorite ? 'fill-current' : ''}`} />
                  {selectedFile.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                </button>
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Media Library Settings</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Default View</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Default Sort</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="size">Size</option>
                    <option value="type">Type</option>
                  </select>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Role-Based Access</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Current role: <span className="font-medium capitalize">{currentRole}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    You can only see files and folders that your role has access to.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
