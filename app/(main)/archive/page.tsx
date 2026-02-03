'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Archive, Folder, Clock, Search, Filter, Download, Eye, ExternalLink,
  CheckCircle, XCircle, AlertCircle, FileText, Video, Camera, Users,
  Settings, Calendar, Tag, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  BarChart3, PieChart, FileDown, Share2, Copy, Grid, List, Plus,
  FolderOpen, HardDrive, Server, Link as LinkIcon, Unlink, CheckCircle2,
  XCircle as XCircleIcon, Clock as ClockIcon, User, Activity, TrendingUp,
  TrendingDown, RefreshCw, Filter as FilterIcon, X, Save, FileCheck,
  FileX, AlertTriangle, Info, Star, Award, Target, Zap, Shield, Lock,
  Unlock, EyeOff, Eye as EyeIcon, Download as DownloadIcon, Upload,
  FolderTree, Network, Database, Cloud, HardDrive as HardDriveIcon
} from 'lucide-react';
import { useArchiveStore, ArchiveCategory, UserRole, RecordingArchive, SystemActivityLog, OrderArchive, FailedTaskArchive, ArchiveItem } from '@/lib/archive-store';
import { useAppStore } from '@/lib/store';

const categoryColors: Record<ArchiveCategory, string> = {
  recording: 'bg-red-100 text-red-700',
  content: 'bg-blue-100 text-blue-700',
  report: 'bg-green-100 text-green-700',
  'system-log': 'bg-purple-100 text-purple-700',
  order: 'bg-orange-100 text-orange-700',
  task: 'bg-yellow-100 text-yellow-700',
  'camera-report': 'bg-pink-100 text-pink-700',
  'failed-task': 'bg-red-100 text-red-700',
  'user-action': 'bg-indigo-100 text-indigo-700',
  financial: 'bg-emerald-100 text-emerald-700',
  personnel: 'bg-cyan-100 text-cyan-700',
  inventory: 'bg-amber-100 text-amber-700',
  broadcast: 'bg-violet-100 text-violet-700',
  scheduling: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  archived: 'bg-blue-100 text-blue-700',
  deleted: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  manager: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  viewer: 'bg-yellow-100 text-yellow-700',
  guest: 'bg-gray-100 text-gray-700',
};

export default function ArchivePage() {
  const { t } = useTranslation();
  const { user } = useAppStore();
  const userRole: UserRole = (user?.role?.toLowerCase() as UserRole) || 'viewer';
  
  const {
    recordings,
    systemLogs,
    orders,
    failedTasks,
    items,
    collections,
    getRecordingsByCamera,
    getRecordingsByDate,
    checkRecordingStatus,
    linkToServer,
    getActivityLogs,
    getActivityLogsByUser,
    getActivityLogsByModule,
    getOrdersByUser,
    getOrdersByStatus,
    getFailedTasksByModule,
    getUnresolvedFailedTasks,
    markTaskResolved,
    getItemsByCategory,
    getItemsByYear,
    getItemsByMonth,
    searchItems,
    generateMonthlyReport,
    filterByRole,
    openServerFolder,
    verifyFileExists,
  } = useArchiveStore();

  const [activeTab, setActiveTab] = useState<'recordings' | 'logs' | 'orders' | 'failed-tasks' | 'items' | 'collections' | 'reports'>('recordings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArchiveCategory | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  // Filter items based on role
  const filteredRecordings = filterByRole(recordings, userRole);
  const filteredLogs = filterByRole(systemLogs, userRole);
  const filteredOrders = filterByRole(orders, userRole);
  const filteredFailedTasks = filterByRole(failedTasks, userRole);
  const filteredItems = filterByRole(items, userRole);

  // Statistics
  const stats = {
    totalItems: filteredItems.length + filteredRecordings.length + filteredLogs.length + filteredOrders.length + filteredFailedTasks.length,
    recordings: filteredRecordings.length,
    collections: collections.length,
    years: new Set([...filteredItems.map(i => i.year), ...filteredRecordings.map(r => new Date(r.recordingDate).getFullYear())]).size,
    copiedRecordings: filteredRecordings.filter(r => r.isCopied).length,
    notCopiedRecordings: filteredRecordings.filter(r => !r.isCopied).length,
    linkedRecordings: filteredRecordings.filter(r => r.isLinked).length,
    fileExistsRecordings: filteredRecordings.filter(r => r.fileExists).length,
    fileMissingRecordings: filteredRecordings.filter(r => !r.fileExists).length,
    unresolvedTasks: filteredFailedTasks.filter(t => !t.isResolved).length,
  };

  // Get available years
  const availableYears = Array.from(new Set([
    ...filteredItems.map(i => i.year),
    ...filteredRecordings.map(r => new Date(r.recordingDate).getFullYear()),
    ...filteredLogs.map(l => new Date(l.timestamp).getFullYear()),
  ])).sort((a, b) => b - a);

  // Filter current view
  const getFilteredData = () => {
    let data: any[] = [];
    
    switch (activeTab) {
      case 'recordings':
        data = filteredRecordings;
        if (selectedCategory !== 'all') data = data.filter(r => r.category === selectedCategory);
        if (selectedYear) {
          data = data.filter(r => new Date(r.recordingDate).getFullYear() === selectedYear);
        }
        if (selectedMonth !== 'all') {
          data = data.filter(r => new Date(r.recordingDate).getMonth() + 1 === selectedMonth);
        }
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'copied') data = data.filter(r => r.isCopied);
          else if (selectedStatus === 'not-copied') data = data.filter(r => !r.isCopied);
          else if (selectedStatus === 'linked') data = data.filter(r => r.isLinked);
          else if (selectedStatus === 'not-linked') data = data.filter(r => !r.isLinked);
          else if (selectedStatus === 'file-exists') data = data.filter(r => r.fileExists);
          else if (selectedStatus === 'file-missing') data = data.filter(r => !r.fileExists);
        }
        break;
      case 'logs':
        data = filteredLogs;
        if (selectedCategory !== 'all') data = data.filter(l => l.category === selectedCategory);
        if (selectedYear) {
          data = data.filter(l => new Date(l.timestamp).getFullYear() === selectedYear);
        }
        if (selectedMonth !== 'all') {
          data = data.filter(l => new Date(l.timestamp).getMonth() + 1 === selectedMonth);
        }
        if (selectedStatus !== 'all') {
          data = data.filter(l => l.status === selectedStatus);
        }
        break;
      case 'orders':
        data = filteredOrders;
        if (selectedCategory !== 'all') data = data.filter(o => o.category === selectedCategory);
        if (selectedYear) {
          data = data.filter(o => new Date(o.createdAt).getFullYear() === selectedYear);
        }
        if (selectedMonth !== 'all') {
          data = data.filter(o => new Date(o.createdAt).getMonth() + 1 === selectedMonth);
        }
        if (selectedStatus !== 'all') {
          data = data.filter(o => o.status === selectedStatus);
        }
        break;
      case 'failed-tasks':
        data = filteredFailedTasks;
        if (selectedCategory !== 'all') data = data.filter(t => t.category === selectedCategory);
        if (selectedYear) {
          data = data.filter(t => new Date(t.failedAt).getFullYear() === selectedYear);
        }
        if (selectedMonth !== 'all') {
          data = data.filter(t => new Date(t.failedAt).getMonth() + 1 === selectedMonth);
        }
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'resolved') data = data.filter(t => t.isResolved);
          else if (selectedStatus === 'unresolved') data = data.filter(t => !t.isResolved);
        }
        break;
      case 'items':
        data = filteredItems;
        if (selectedCategory !== 'all') data = data.filter(i => i.category === selectedCategory);
        if (selectedYear) data = data.filter(i => i.year === selectedYear);
        if (selectedMonth !== 'all') data = data.filter(i => i.month === selectedMonth);
        if (selectedStatus !== 'all') data = data.filter(i => i.status === selectedStatus);
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter((item: any) => {
        if (item.title) return item.title.toLowerCase().includes(query);
        if (item.cameraName) return item.cameraName.toLowerCase().includes(query);
        if (item.taskName) return item.taskName.toLowerCase().includes(query);
        if (item.userName) return item.userName.toLowerCase().includes(query);
        if (item.message) return item.message.toLowerCase().includes(query);
        if (item.description) return item.description.toLowerCase().includes(query);
        return false;
      });
    }

    return data;
  };

  const filteredData = getFilteredData();

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleOpenServerFolder = (serverPath: string) => {
    openServerFolder(serverPath);
  };

  const handleLinkToServer = (id: string, serverPath: string) => {
    linkToServer(id, serverPath);
    alert('Linked to server successfully!');
  };

  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const handleGenerateReport = () => {
    setShowGenerateModal(true);
  };

  const handleConfirmGenerateReport = () => {
    const report = generateMonthlyReport(reportYear, reportMonth);
    setMonthlyReport(report);
    setShowGenerateModal(false);
    setShowReportModal(true);
  };

  const handleExportReport = () => {
    if (!monthlyReport) return;
    const dataStr = JSON.stringify(monthlyReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `archive-report-${reportYear}-${reportMonth}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMarkResolved = (id: string) => {
    markTaskResolved(id);
    alert('Task marked as resolved');
  };

  const handleVerifyFile = (recording: RecordingArchive) => {
    const exists = verifyFileExists(recording.filePath);
    if (exists) {
      alert('File exists on server');
    } else {
      alert('File not found on server');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Archive</h1>
          <p className="text-gray-600">Access archived content and historical records</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : viewMode === 'grid' ? 'list' : 'table')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {viewMode === 'table' ? <Grid className="w-5 h-5" /> : viewMode === 'grid' ? <List className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Generate Report
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Archived Items', value: stats.totalItems.toLocaleString(), icon: Archive, color: 'bg-gray-500' },
          { label: 'Collections', value: stats.collections, icon: Folder, color: 'bg-blue-500' },
          { label: 'Years', value: stats.years, icon: Clock, color: 'bg-green-500' },
          { label: 'Recordings', value: stats.recordings, icon: Video, color: 'bg-red-500' },
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

      {/* Recording Status Cards */}
      {activeTab === 'recordings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Copied', value: stats.copiedRecordings, icon: CheckCircle, color: 'bg-green-500' },
            { label: 'Not Copied', value: stats.notCopiedRecordings, icon: XCircle, color: 'bg-red-500' },
            { label: 'Linked', value: stats.linkedRecordings, icon: LinkIcon, color: 'bg-blue-500' },
            { label: 'File Exists', value: stats.fileExistsRecordings, icon: FileCheck, color: 'bg-purple-500' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glossy-card rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'recordings', label: 'Recordings', count: filteredRecordings.length },
          { id: 'logs', label: 'System Logs', count: filteredLogs.length },
          { id: 'orders', label: 'Orders', count: filteredOrders.length },
          { id: 'failed-tasks', label: 'Failed Tasks', count: filteredFailedTasks.length },
          { id: 'items', label: 'Items', count: filteredItems.length },
          { id: 'collections', label: 'Collections', count: collections.length },
          { id: 'reports', label: 'Reports', count: 0 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search archive..."
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ArchiveCategory | 'all')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.keys(categoryColors).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    {activeTab === 'recordings' && (
                      <>
                        <option value="copied">Copied</option>
                        <option value="not-copied">Not Copied</option>
                        <option value="linked">Linked</option>
                        <option value="not-linked">Not Linked</option>
                        <option value="file-exists">File Exists</option>
                        <option value="file-missing">File Missing</option>
                      </>
                    )}
                    {activeTab === 'failed-tasks' && (
                      <>
                        <option value="resolved">Resolved</option>
                        <option value="unresolved">Unresolved</option>
                      </>
                    )}
                    {(activeTab === 'logs' || activeTab === 'orders') && (
                      <>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recordings Table */}
      {activeTab === 'recordings' && (
        <div className="glossy-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camera</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recording Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Server Path</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No recordings found
                    </td>
                  </tr>
                ) : (
                  (filteredData as RecordingArchive[]).map((recording) => (
                    <tr key={recording.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{recording.cameraName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(recording.recordingDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {recording.duration} min
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {recording.isCopied ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Copied</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Not Copied</span>
                          )}
                          {recording.isLinked ? (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Linked</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Not Linked</span>
                          )}
                          {recording.fileExists ? (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">File Exists</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">File Missing</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 truncate max-w-xs">{recording.serverPath || 'Not linked'}</span>
                          {recording.serverPath && (
                            <button
                              onClick={() => handleOpenServerFolder(recording.serverPath)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Open server folder"
                            >
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(recording)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleVerifyFile(recording)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Verify file"
                          >
                            <FileCheck className="w-4 h-4 text-green-600" />
                          </button>
                          {!recording.isLinked && (
                            <button
                              onClick={() => {
                                const path = prompt('Enter server path:');
                                if (path) handleLinkToServer(recording.id, path);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Link to server"
                            >
                              <LinkIcon className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Logs Table */}
      {activeTab === 'logs' && (
        <div className="glossy-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  (filteredData as SystemActivityLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{log.userName}</span>
                          <span className={`px-2 py-1 text-xs rounded ${roleColors[log.userRole]}`}>
                            {log.userRole}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${categoryColors[log.category]}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{log.action}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(log)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {activeTab === 'orders' && (
        <div className="glossy-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  (filteredData as OrderArchive[]).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{order.fromUserName}</td>
                      <td className="px-4 py-3 font-medium">{order.toUserName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          order.orderType === 'given' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'failed' ? 'bg-red-100 text-red-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Failed Tasks Table */}
      {activeTab === 'failed-tasks' && (
        <div className="glossy-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed At</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No failed tasks found
                    </td>
                  </tr>
                ) : (
                  (filteredData as FailedTaskArchive[]).map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{task.taskName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${categoryColors[task.category]}`}>
                          {task.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(task.failedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate">
                        {task.errorMessage}
                      </td>
                      <td className="px-4 py-3">
                        {task.isResolved ? (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Resolved</span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Unresolved</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(task)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {!task.isResolved && (
                            <button
                              onClick={() => handleMarkResolved(task.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Mark as resolved"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Items Table */}
      {activeTab === 'items' && (
        <div className="glossy-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                ) : (
                  (filteredData as ArchiveItem[]).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${categoryColors[item.category]}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(item.archivedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collections */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No collections found</p>
            </div>
          ) : (
            collections.map((collection) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glossy-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{collection.name}</h3>
                {collection.description && (
                  <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded ${categoryColors[collection.category]}`}>
                    {collection.category}
                  </span>
                  <span className="text-xs text-gray-500">{collection.year}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">{collection.itemCount} items</span>
                  <button
                    onClick={() => handleViewDetails(collection)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Generate Monthly Report</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={reportMonth}
                    onChange={(e) => setReportMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmGenerateReport}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Report Modal */}
      <AnimatePresence>
        {showReportModal && monthlyReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Monthly Archive Report</h3>
                    <p className="text-primary-100 text-sm">
                      {new Date(reportYear, reportMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlyReport.summary.totalItems}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Recordings</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlyReport.summary.recordings.total}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">System Logs</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlyReport.summary.systemLogs}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Failed Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{monthlyReport.summary.failedTasks}</p>
                      </div>
                    </div>
                  </div>

                  {/* Recording Status */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Recording Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Copied</p>
                        <p className="text-xl font-bold text-green-700">{monthlyReport.summary.recordings.copied}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Not Copied</p>
                        <p className="text-xl font-bold text-red-700">{monthlyReport.summary.recordings.notCopied}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">Linked</p>
                        <p className="text-xl font-bold text-blue-700">{monthlyReport.summary.recordings.linked}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">File Exists</p>
                        <p className="text-xl font-bold text-purple-700">{monthlyReport.summary.recordings.fileExists}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">File Missing</p>
                        <p className="text-xl font-bold text-orange-700">{monthlyReport.summary.recordings.fileMissing}</p>
                      </div>
                    </div>
                  </div>

                  {/* By Category */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">By Category</h4>
                    <div className="space-y-2">
                      {Object.entries(monthlyReport.summary.byCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-700">{category}</span>
                          <span className="text-gray-900 font-bold">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
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
                    <h3 className="text-2xl font-bold mb-1">Archive Details</h3>
                    <p className="text-primary-100 text-sm">View detailed information</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {Object.entries(selectedItem).map(([key, value]) => {
                    if (key === 'id' || key === 'metadata' || key === 'details' || key === 'errorDetails') return null;
                    if (value instanceof Date) {
                      value = value.toLocaleString();
                    }
                    if (typeof value === 'object' && value !== null) {
                      value = JSON.stringify(value, null, 2);
                    }
                    return (
                      <div key={key} className="border-b border-gray-200 pb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="text-sm text-gray-900">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
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
