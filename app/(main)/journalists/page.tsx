'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Mic, Users, Trophy, Plus, Edit, Trash2, Search, Filter, Eye, CheckCircle, XCircle,
  Calendar, User, Clock, Tag, Share2, Send, Save, X, RefreshCw, Settings, MoreVertical,
  ChevronDown, ChevronUp, ChevronRight, BarChart3, LineChart, PieChart, Activity,
  Target, Bell, Bookmark, Star, TrendingUp, TrendingDown, Award as AwardIconLucide, Briefcase,
  FileText, Video, Camera, Image, Phone, Mail, MapPin, Globe, Link as LinkIcon,
  ExternalLink, Copy, ThumbsUp, MessageSquare, Heart, ArrowUp, ArrowDown, Grid, List,
  Maximize2, Minimize2, FileCheck, FileX, FileEdit, FileSearch, FilePlus, Clipboard,
  History, RotateCcw, RotateCw, Play, Pause, Square, CheckSquare, Check, Minus,
  PlusCircle, MinusCircle, AlertTriangle, Info, HelpCircle, Shield, UserPlus, UserCheck,
  UserX, Folder, FolderOpen, FolderPlus, FolderX, Database, Server, Network, Wifi,
  WifiOff, Newspaper, Download, Upload, Filter as FilterIcon, SortAsc, SortDesc,
  Mail as MailIcon, Phone as PhoneIcon, Video as VideoIcon, Image as ImageIcon,
  File as FileIcon, Clock as ClockIcon, MapPin as MapPinIcon, Globe as GlobeIcon,
  Linkedin, Twitter, Facebook, Instagram, GraduationCap, Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon, MessageCircle, PhoneCall,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Zap, Target as TargetIcon,
  BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon,
} from 'lucide-react';
import {
  useJournalistStore,
  Journalist,
  JournalistType,
  JournalistStatus,
  Assignment,
  AssignmentStatus,
  Award,
  Certification,
  PerformanceReview,
  WorkHistory,
  PortfolioItem,
  CommunicationLog,
  ScheduleEntry,
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

const getStatusColor = (status: JournalistStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'inactive':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'on_leave':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'suspended':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'terminated':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getTypeColor = (type: JournalistType) => {
  switch (type) {
    case 'journalist':
      return 'bg-blue-500';
    case 'reporter':
      return 'bg-green-500';
    case 'correspondent':
      return 'bg-purple-500';
    case 'editor':
      return 'bg-orange-500';
    case 'photographer':
      return 'bg-pink-500';
    case 'videographer':
      return 'bg-red-500';
    case 'anchor':
      return 'bg-indigo-500';
    case 'producer':
      return 'bg-teal-500';
    default:
      return 'bg-gray-500';
  }
};

const getAssignmentStatusColor = (status: AssignmentStatus) => {
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

export default function JournalistsPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  const {
    journalists,
    assignments,
    awards,
    certifications,
    performanceReviews,
    workHistory,
    portfolioItems,
    communicationLogs,
    scheduleEntries,
    addJournalist,
    updateJournalist,
    deleteJournalist,
    getJournalist,
    getJournalistsByType,
    getJournalistsByStatus,
    getActiveJournalists,
    searchJournalists,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsByJournalist,
    getAssignmentsByStatus,
    getOverdueAssignments,
    addAward,
    updateAward,
    deleteAward,
    getAwardsByJournalist,
    addCertification,
    updateCertification,
    deleteCertification,
    getCertificationsByJournalist,
    addPerformanceReview,
    getPerformanceReviewsByJournalist,
    addWorkHistory,
    updateWorkHistory,
    deleteWorkHistory,
    getWorkHistoryByJournalist,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    getPortfolioByJournalist,
    addCommunicationLog,
    getCommunicationLogsByJournalist,
    addScheduleEntry,
    updateScheduleEntry,
    deleteScheduleEntry,
    getScheduleByJournalist,
    getJournalistAnalytics,
    getStatistics,
  } = useJournalistStore();

  // State management
  const [activeTab, setActiveTab] = useState<'list' | 'assignments' | 'performance' | 'awards' | 'analytics' | 'schedule'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<JournalistType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<JournalistStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedJournalist, setSelectedJournalist] = useState<Journalist | null>(null);
  const [showAddJournalist, setShowAddJournalist] = useState(false);
  const [showEditJournalist, setShowEditJournalist] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddAward, setShowAddAward] = useState(false);
  const [showAddCertification, setShowAddCertification] = useState(false);
  const [showAddPerformanceReview, setShowAddPerformanceReview] = useState(false);
  const [showAddWorkHistory, setShowAddWorkHistory] = useState(false);
  const [showAddPortfolioItem, setShowAddPortfolioItem] = useState(false);
  const [showAddCommunicationLog, setShowAddCommunicationLog] = useState(false);
  const [showAddScheduleEntry, setShowAddScheduleEntry] = useState(false);
  const [showJournalistProfile, setShowJournalistProfile] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showPressPassModal, setShowPressPassModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showEmergencyContactModal, setShowEmergencyContactModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'date' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedJournalists, setSelectedJournalists] = useState<string[]>([]);
  const [profileTab, setProfileTab] = useState<'overview' | 'assignments' | 'performance' | 'awards' | 'portfolio' | 'schedule' | 'documents' | 'contracts' | 'equipment'>('overview');

  const statistics = useMemo(() => getStatistics(), [getStatistics]);
  const overdueAssignments = useMemo(() => getOverdueAssignments(), [getOverdueAssignments]);

  const filteredJournalists = useMemo(() => {
    let filtered = journalists;
    
    if (filterType !== 'all') {
      filtered = filtered.filter((j) => j.type === filterType);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((j) => j.status === filterStatus);
    }
    if (searchQuery) {
      filtered = searchJournalists(searchQuery);
    }
    
    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'performance':
          comparison = a.performance.qualityScore - b.performance.qualityScore;
          break;
        case 'date':
          comparison = a.hireDate.getTime() - b.hireDate.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [journalists, filterType, filterStatus, searchQuery, sortBy, sortOrder, searchJournalists]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSelectJournalist = (id: string) => {
    setSelectedJournalists((prev) =>
      prev.includes(id) ? prev.filter((jid) => jid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJournalists.length === filteredJournalists.length) {
      setSelectedJournalists([]);
    } else {
      setSelectedJournalists(filteredJournalists.map((j) => j.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedJournalists.length} journalists?`)) {
      selectedJournalists.forEach((id) => deleteJournalist(id));
      setSelectedJournalists([]);
    }
  };

  const handleBulkStatusUpdate = (status: JournalistStatus) => {
    selectedJournalists.forEach((id) => {
      updateJournalist(id, { status });
    });
    setSelectedJournalists([]);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // Export functionality
    console.log(`Exporting ${filteredJournalists.length} journalists as ${format}`);
    alert(`Exporting data as ${format.toUpperCase()}...`);
  };

  const handleSendBulkEmail = (subject: string, message: string) => {
    const recipients = selectedJournalists
      .map((id) => getJournalist(id))
      .filter((j): j is Journalist => j !== null);
    console.log(`Sending email to ${recipients.length} journalists`);
    alert(`Email sent to ${recipients.length} journalists!`);
    setShowEmailModal(false);
  };

  const handleSendBulkSMS = (message: string) => {
    const recipients = selectedJournalists
      .map((id) => getJournalist(id))
      .filter((j): j is Journalist => j !== null);
    console.log(`Sending SMS to ${recipients.length} journalists`);
    alert(`SMS sent to ${recipients.length} journalists!`);
    setShowSMSModal(false);
  };

  const handleAddJournalist = (formData: FormData) => {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    addJournalist({
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      type: (formData.get('type') as JournalistType) || 'journalist',
      status: 'active',
      experienceLevel: (formData.get('experienceLevel') as any) || 'junior',
      yearsOfExperience: parseInt(formData.get('yearsOfExperience') as string) || 0,
      hireDate: new Date(formData.get('hireDate') as string),
      contractType: (formData.get('contractType') as any) || 'full_time',
      skills: [],
      languages: [],
      certifications: [],
      specialization: [],
      availability: {
        isAvailable: true,
        isOnAssignment: false,
      },
    });
    setShowAddJournalist(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journalists</h1>
          <p className="text-gray-500 mt-1">Manage journalists and reporters</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddJournalist(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Journalist
          </motion.button>
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
            onClick={() => setShowNotificationCenter(true)}
            className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {overdueAssignments.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {overdueAssignments.length}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[
          { label: 'Active Journalists', value: statistics.activeJournalists, icon: Mic, color: 'bg-blue-500' },
          { label: 'Reporters', value: statistics.reporters, icon: Users, color: 'bg-green-500' },
          { label: 'Total Awards', value: statistics.totalAwards, icon: Trophy, color: 'bg-yellow-500' },
          { label: 'Total Assignments', value: statistics.totalAssignments, icon: FileText, color: 'bg-purple-500' },
          { label: 'Pending Assignments', value: statistics.pendingAssignments, icon: Clock, color: 'bg-orange-500' },
          { label: 'Overdue', value: statistics.overdueAssignments, icon: AlertTriangle, color: 'bg-red-500', badge: statistics.overdueAssignments },
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'list', label: 'Journalists', icon: Users },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'performance', label: 'Performance', icon: BarChart3 },
          { id: 'awards', label: 'Awards & Certifications', icon: Trophy },
          { id: 'analytics', label: 'Analytics', icon: PieChart },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedJournalists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4"
          >
            <span className="font-semibold">{selectedJournalists.length} selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
              >
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </button>
              <button
                onClick={() => setShowSMSModal(true)}
                className="px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4 inline mr-1" />
                SMS
              </button>
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
                onClick={() => setSelectedJournalists([])}
                className="px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journalists List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedJournalists.length === filteredJournalists.length && filteredJournalists.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm">Select All</span>
            </label>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search journalists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="journalist">Journalist</option>
              <option value="reporter">Reporter</option>
              <option value="correspondent">Correspondent</option>
              <option value="editor">Editor</option>
              <option value="photographer">Photographer</option>
              <option value="videographer">Videographer</option>
              <option value="anchor">Anchor</option>
              <option value="producer">Producer</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="suspended">Suspended</option>
              <option value="terminated">Terminated</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="performance">Sort by Performance</option>
              <option value="date">Sort by Hire Date</option>
              <option value="type">Sort by Type</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>

          {/* Journalists Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredJournalists.map((journalist, index) => (
                <motion.div
                  key={journalist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glossy-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer ${
                    selectedJournalists.includes(journalist.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedJournalist(journalist);
                    setShowJournalistProfile(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="checkbox"
                      checked={selectedJournalists.includes(journalist.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectJournalist(journalist.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 mt-1"
                    />
                  </div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${getTypeColor(journalist.type)} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold`}>
                        {journalist.firstName[0]}{journalist.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{journalist.fullName}</h3>
                        <p className="text-sm text-gray-500">{journalist.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(journalist.status)}`}>
                      {journalist.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {journalist.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {journalist.phone}
                    </div>
                    {journalist.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {journalist.location}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div>
                      <span className="text-gray-500">Articles:</span>
                      <span className="font-semibold ml-1">{journalist.performance.publishedArticles}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <span className="font-semibold ml-1">{journalist.performance.totalViews.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quality:</span>
                      <span className="font-semibold ml-1">{journalist.performance.qualityScore}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-500">On-Time:</span>
                      <span className="font-semibold ml-1">{journalist.performance.onTimeDelivery}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJournalist(journalist);
                        setShowEditJournalist(true);
                      }}
                      className="flex-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJournalist(journalist);
                        setShowJournalistProfile(true);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this journalist?')) {
                          deleteJournalist(journalist.id);
                        }
                      }}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJournalists.map((journalist, index) => (
                <motion.div
                  key={journalist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glossy-card rounded-2xl p-6 ${
                    selectedJournalists.includes(journalist.id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedJournalists.includes(journalist.id)}
                        onChange={() => toggleSelectJournalist(journalist.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div className={`${getTypeColor(journalist.type)} w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                        {journalist.firstName[0]}{journalist.lastName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{journalist.fullName}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(journalist.status)}`}>
                            {journalist.status.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">{journalist.type}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {journalist.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {journalist.phone}
                          </span>
                          {journalist.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {journalist.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-gray-500">Articles</div>
                          <div className="font-bold text-gray-900">{journalist.performance.publishedArticles}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">Views</div>
                          <div className="font-bold text-gray-900">{journalist.performance.totalViews.toLocaleString()}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">Quality</div>
                          <div className="font-bold text-gray-900">{journalist.performance.qualityScore}/100</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">On-Time</div>
                          <div className="font-bold text-gray-900">{journalist.performance.onTimeDelivery}%</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedJournalist(journalist);
                          setShowJournalistProfile(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJournalist(journalist);
                          setShowEditJournalist(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this journalist?')) {
                            deleteJournalist(journalist.id);
                          }
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {filteredJournalists.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No journalists found. Add a new journalist to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
            <button
              onClick={() => setShowAddAssignment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Assignment
            </button>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment, index) => {
              const journalist = getJournalist(assignment.journalistId);
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glossy-card rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getAssignmentStatusColor(assignment.status)}`}>
                          {assignment.status.replace('_', ' ')}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${
                          assignment.priority === 'urgent' ? 'bg-red-500' :
                          assignment.priority === 'high' ? 'bg-orange-500' :
                          assignment.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {journalist?.fullName || assignment.journalistName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {formatDate(assignment.dueDate)}
                        </span>
                        {assignment.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {assignment.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newStatus = assignment.status === 'pending' ? 'in_progress' :
                                           assignment.status === 'in_progress' ? 'submitted' : assignment.status;
                          updateAssignment(assignment.id, { status: newStatus as AssignmentStatus });
                        }}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
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
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No assignments found. Create a new assignment to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Performance Reviews</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalists.map((journalist) => {
              const reviews = getPerformanceReviewsByJournalist(journalist.id);
              const latestReview = reviews.length > 0 ? reviews[reviews.length - 1] : null;
              
              return (
                <motion.div
                  key={journalist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glossy-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${getTypeColor(journalist.type)} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold`}>
                      {journalist.firstName[0]}{journalist.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{journalist.fullName}</h3>
                      <p className="text-sm text-gray-500">{journalist.type}</p>
                    </div>
                  </div>
                  
                  {latestReview ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Quality:</span>
                          <span className="font-semibold ml-1">{latestReview.scores.quality}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Productivity:</span>
                          <span className="font-semibold ml-1">{latestReview.scores.productivity}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Punctuality:</span>
                          <span className="font-semibold ml-1">{latestReview.scores.punctuality}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Overall:</span>
                          <span className="font-semibold ml-1">{latestReview.scores.overall}/100</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500">Last Review: {formatDate(latestReview.reviewDate)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">No performance review yet</p>
                      <button
                        onClick={() => {
                          setSelectedJournalist(journalist);
                          setShowAddPerformanceReview(true);
                        }}
                        className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                      >
                        Add Review
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Awards Tab */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Awards & Certifications</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddAward(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Award
              </button>
              <button
                onClick={() => setShowAddCertification(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Certification
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Awards</h3>
              <div className="space-y-4">
                {awards.map((award, index) => {
                  const journalist = getJournalist(award.journalistId);
                  return (
                    <motion.div
                      key={award.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glossy-card rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <h4 className="font-semibold text-gray-900">{award.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{award.organization}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{journalist?.fullName}</span>
                            <span>{formatDate(award.date)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this award?')) {
                              deleteAward(award.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
              <div className="space-y-4">
                {certifications.map((cert, index) => {
                  const journalist = getJournalist(cert.journalistId);
                  return (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glossy-card rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-5 h-5 text-blue-500" />
                            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                            {cert.verified && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{cert.issuer}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{journalist?.fullName}</span>
                            <span>Issued: {formatDate(cert.issueDate)}</span>
                            {cert.expiryDate && (
                              <span>Expires: {formatDate(cert.expiryDate)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this certification?')) {
                              deleteCertification(cert.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journalists.map((journalist) => {
              const analytics = getJournalistAnalytics(
                journalist.id,
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                new Date()
              );
              
              return (
                <motion.div
                  key={journalist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glossy-card rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${getTypeColor(journalist.type)} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold`}>
                      {journalist.firstName[0]}{journalist.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{journalist.fullName}</h3>
                      <p className="text-sm text-gray-500">Last 30 days</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Articles:</span>
                        <span className="font-semibold ml-1">{analytics.articles.published}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Views:</span>
                        <span className="font-semibold ml-1">{analytics.engagement.totalViews.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Completion:</span>
                        <span className="font-semibold ml-1">{analytics.assignments.completionRate.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Quality:</span>
                        <span className="font-semibold ml-1">{analytics.performance.qualityScore}/100</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>
            <button
              onClick={() => setShowAddScheduleEntry(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Schedule Entry
            </button>
          </div>

          <div className="space-y-4">
            {scheduleEntries.map((entry, index) => {
              const journalist = getJournalist(entry.journalistId);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glossy-card rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{entry.title}</h3>
                        <span className="text-sm text-gray-500">{entry.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{entry.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {journalist?.fullName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                        </span>
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {entry.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this schedule entry?')) {
                          deleteScheduleEntry(entry.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Journalist Modal */}
      <AnimatePresence>
        {showAddJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddJournalist(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Journalist</h2>
                <button
                  onClick={() => setShowAddJournalist(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                action={handleAddJournalist}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      name="type"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="journalist">Journalist</option>
                      <option value="reporter">Reporter</option>
                      <option value="correspondent">Correspondent</option>
                      <option value="editor">Editor</option>
                      <option value="photographer">Photographer</option>
                      <option value="videographer">Videographer</option>
                      <option value="anchor">Anchor</option>
                      <option value="producer">Producer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      name="experienceLevel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                    <input
                      type="date"
                      name="hireDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                  <select
                    name="contractType"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Journalist
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddJournalist(false)}
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

      {/* Journalist Profile Modal */}
      <AnimatePresence>
        {showJournalistProfile && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowJournalistProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJournalist.fullName}</h2>
                <button
                  onClick={() => setShowJournalistProfile(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-start gap-6">
                  <div className={`${getTypeColor(selectedJournalist.type)} w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl`}>
                    {selectedJournalist.firstName[0]}{selectedJournalist.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{selectedJournalist.fullName}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedJournalist.status)}`}>
                        {selectedJournalist.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{selectedJournalist.type} • {selectedJournalist.experienceLevel}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedJournalist.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedJournalist.phone}
                      </span>
                      {selectedJournalist.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedJournalist.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs for Profile Details */}
                <div className="border-b border-gray-200 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'assignments', label: 'Assignments', icon: FileText },
                      { id: 'performance', label: 'Performance', icon: BarChart3 },
                      { id: 'awards', label: 'Awards', icon: Trophy },
                      { id: 'portfolio', label: 'Portfolio', icon: Folder },
                      { id: 'schedule', label: 'Schedule', icon: Calendar },
                      { id: 'documents', label: 'Documents', icon: FileIcon },
                      { id: 'contracts', label: 'Contracts', icon: BriefcaseIcon },
                      { id: 'equipment', label: 'Equipment', icon: Camera },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setProfileTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                            profileTab === tab.id
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
                {profileTab === 'overview' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Articles:</span>
                          <span className="font-semibold">{selectedJournalist.performance.publishedArticles}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Views:</span>
                          <span className="font-semibold">{selectedJournalist.performance.totalViews.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quality Score:</span>
                          <span className="font-semibold">{selectedJournalist.performance.qualityScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">On-Time Delivery:</span>
                          <span className="font-semibold">{selectedJournalist.performance.onTimeDelivery}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Contract Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contract Type:</span>
                          <span className="font-semibold capitalize">{selectedJournalist.contractType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-semibold">{selectedJournalist.yearsOfExperience} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hire Date:</span>
                          <span className="font-semibold">{formatDate(selectedJournalist.hireDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience Level:</span>
                          <span className="font-semibold capitalize">{selectedJournalist.experienceLevel}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJournalist.skills.length > 0 ? (
                          selectedJournalist.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No skills added</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJournalist.languages.length > 0 ? (
                          selectedJournalist.languages.map((lang) => (
                            <span key={lang} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No languages added</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignments Tab */}
                {profileTab === 'assignments' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Assignments</h4>
                      <button
                        onClick={() => {
                          setShowJournalistProfile(false);
                          setShowAddAssignment(true);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Assignment
                      </button>
                    </div>
                    <div className="space-y-2">
                      {getAssignmentsByJournalist(selectedJournalist.id).length > 0 ? (
                        getAssignmentsByJournalist(selectedJournalist.id).map((assignment) => (
                          <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{assignment.title}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getAssignmentStatusColor(assignment.status)}`}>
                                {assignment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                assignment.priority === 'urgent' ? 'bg-red-500' :
                                assignment.priority === 'high' ? 'bg-orange-500' :
                                assignment.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                              }`} />
                              <span className="capitalize">{assignment.priority}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No assignments yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Tab */}
                {profileTab === 'performance' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Performance Reviews</h4>
                      <button
                        onClick={() => {
                          setShowJournalistProfile(false);
                          setShowAddPerformanceReview(true);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Review
                      </button>
                    </div>
                    <div className="space-y-3">
                      {getPerformanceReviewsByJournalist(selectedJournalist.id).length > 0 ? (
                        getPerformanceReviewsByJournalist(selectedJournalist.id).map((review) => (
                          <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium">Review - {formatDate(review.reviewDate)}</span>
                              <span className="text-sm text-gray-500">by {review.reviewedByName}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
                              <div>
                                <span className="text-gray-600">Quality:</span>
                                <span className="font-semibold ml-1">{review.scores.quality}/100</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Productivity:</span>
                                <span className="font-semibold ml-1">{review.scores.productivity}/100</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Overall:</span>
                                <span className="font-semibold ml-1">{review.scores.overall}/100</span>
                              </div>
                            </div>
                            {review.comments && (
                              <p className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                                &ldquo;{review.comments}&rdquo;
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No performance reviews yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Awards Tab */}
                {profileTab === 'awards' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Awards & Certifications</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setShowJournalistProfile(false);
                            setShowAddAward(true);
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Award
                        </button>
                        <button
                          onClick={() => {
                            setShowJournalistProfile(false);
                            setShowAddCertification(true);
                          }}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Certification
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Awards</h5>
                        {getAwardsByJournalist(selectedJournalist.id).length > 0 ? (
                          getAwardsByJournalist(selectedJournalist.id).map((award) => (
                            <div key={award.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                              <div className="flex items-start gap-2">
                                <Trophy className="w-4 h-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">{award.title}</p>
                                  <p className="text-xs text-gray-600">{award.organization}</p>
                                  <p className="text-xs text-gray-500">{formatDate(award.date)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No awards yet</p>
                        )}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Certifications</h5>
                        {getCertificationsByJournalist(selectedJournalist.id).length > 0 ? (
                          getCertificationsByJournalist(selectedJournalist.id).map((cert) => (
                            <div key={cert.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                              <div className="flex items-start gap-2">
                                <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">{cert.name}</p>
                                  <p className="text-xs text-gray-600">{cert.issuer}</p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(cert.issueDate)}
                                    {cert.verified && <CheckCircle className="w-3 h-3 text-green-500 inline ml-1" />}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No certifications yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio Tab */}
                {profileTab === 'portfolio' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Portfolio</h4>
                      <button
                        onClick={() => setShowAddPortfolioItem(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {getPortfolioByJournalist(selectedJournalist.id).length > 0 ? (
                        getPortfolioByJournalist(selectedJournalist.id).map((item) => (
                          <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="font-medium mb-2">{item.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{item.type}</span>
                              <span>•</span>
                              <span>{formatDate(item.publishedDate)}</span>
                            </div>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="col-span-2 text-sm text-gray-500 text-center py-8">No portfolio items yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Schedule Tab */}
                {profileTab === 'schedule' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Schedule</h4>
                      <button
                        onClick={() => {
                          setShowJournalistProfile(false);
                          setShowAddScheduleEntry(true);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </button>
                    </div>
                    <div className="space-y-2">
                      {getScheduleByJournalist(selectedJournalist.id).length > 0 ? (
                        getScheduleByJournalist(selectedJournalist.id).map((entry) => (
                          <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{entry.title}</span>
                              <span className="text-xs text-gray-500 capitalize">{entry.type}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{entry.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{formatDate(entry.startDate)}</span>
                              <span>→</span>
                              <span>{formatDate(entry.endDate)}</span>
                              {entry.location && (
                                <>
                                  <span>•</span>
                                  <span>{entry.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No schedule entries yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {profileTab === 'documents' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Documents</h4>
                      <button
                        onClick={() => setShowDocumentModal(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Upload Document
                      </button>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Resume.pdf', type: 'PDF', size: '245 KB', date: new Date() },
                        { name: 'ID_Card.jpg', type: 'Image', size: '1.2 MB', date: new Date() },
                        { name: 'Background_Check.pdf', type: 'PDF', size: '89 KB', date: new Date() },
                      ].map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Download className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-gray-200 rounded">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contracts Tab */}
                {profileTab === 'contracts' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Contracts</h4>
                      <button
                        onClick={() => setShowContractModal(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Contract
                      </button>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          type: 'Employment Contract',
                          startDate: new Date('2023-01-15'),
                          endDate: new Date('2025-01-15'),
                          status: 'active',
                          salary: '$65,000/year',
                        },
                      ].map((contract, idx) => (
                        <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{contract.type}</h5>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                              {contract.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Start Date:</span>
                              <span className="font-semibold ml-1">{formatDate(contract.startDate)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">End Date:</span>
                              <span className="font-semibold ml-1">{formatDate(contract.endDate)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Compensation:</span>
                              <span className="font-semibold ml-1">{contract.salary}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment Tab */}
                {profileTab === 'equipment' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Assigned Equipment</h4>
                      <button
                        onClick={() => setShowEquipmentModal(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Assign Equipment
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: 'Canon EOS R5', type: 'Camera', serial: 'CAM-2023-001', condition: 'Excellent' },
                        { name: 'Sony Wireless Mic', type: 'Audio', serial: 'AUD-2023-042', condition: 'Good' },
                        { name: 'MacBook Pro 16"', type: 'Computer', serial: 'COM-2023-128', condition: 'Excellent' },
                        { name: 'Tripod - Manfrotto', type: 'Accessory', serial: 'ACC-2023-091', condition: 'Good' },
                      ].map((equipment, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-2 mb-2">
                            <Camera className="w-4 h-4 text-gray-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{equipment.name}</p>
                              <p className="text-xs text-gray-500">{equipment.type}</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            <p>Serial: {equipment.serial}</p>
                            <p className="flex items-center gap-1 mt-1">
                              Condition:
                              <span className={`px-1.5 py-0.5 rounded ${
                                equipment.condition === 'Excellent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {equipment.condition}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Journalist Modal */}
      <AnimatePresence>
        {showEditJournalist && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditJournalist(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Journalist</h2>
                <button
                  onClick={() => setShowEditJournalist(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const firstName = formData.get('firstName') as string;
                  const lastName = formData.get('lastName') as string;
                  updateJournalist(selectedJournalist.id, {
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    email: formData.get('email') as string,
                    phone: formData.get('phone') as string,
                    type: (formData.get('type') as JournalistType),
                    status: (formData.get('status') as JournalistStatus),
                    experienceLevel: (formData.get('experienceLevel') as any),
                    yearsOfExperience: parseInt(formData.get('yearsOfExperience') as string),
                    contractType: (formData.get('contractType') as any),
                    location: formData.get('location') as string,
                  });
                  setShowEditJournalist(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={selectedJournalist.firstName}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={selectedJournalist.lastName}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedJournalist.email}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={selectedJournalist.phone}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={selectedJournalist.location}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      name="type"
                      defaultValue={selectedJournalist.type}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="journalist">Journalist</option>
                      <option value="reporter">Reporter</option>
                      <option value="correspondent">Correspondent</option>
                      <option value="editor">Editor</option>
                      <option value="photographer">Photographer</option>
                      <option value="videographer">Videographer</option>
                      <option value="anchor">Anchor</option>
                      <option value="producer">Producer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={selectedJournalist.status}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                      <option value="suspended">Suspended</option>
                      <option value="terminated">Terminated</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <select
                      name="experienceLevel"
                      defaultValue={selectedJournalist.experienceLevel}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      min="0"
                      defaultValue={selectedJournalist.yearsOfExperience}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                  <select
                    name="contractType"
                    defaultValue={selectedJournalist.contractType}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="intern">Intern</option>
                  </select>
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
                    onClick={() => setShowEditJournalist(false)}
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

      {/* Add Assignment Modal - Simplified for now */}
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
              className="bg-white rounded-2xl p-6 max-w-2xl w-full"
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
                      priority: (formData.get('priority') as any) || 'normal',
                      status: 'pending',
                      dueDate: new Date(formData.get('dueDate') as string),
                      tags: [],
                      attachments: [],
                    });
                    setShowAddAssignment(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Journalist</label>
                  <select
                    name="journalistId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Journalist</option>
                    {getActiveJournalists().map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
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
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
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

      {/* Add Award Modal */}
      <AnimatePresence>
        {showAddAward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddAward(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Award</h2>
                <button
                  onClick={() => setShowAddAward(false)}
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
                  addAward({
                    journalistId,
                    title: formData.get('title') as string,
                    organization: formData.get('organization') as string,
                    date: new Date(formData.get('date') as string),
                    description: formData.get('description') as string,
                    type: 'excellence',
                    isVerified: false,
                  });
                  setShowAddAward(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Journalist</label>
                  <select
                    name="journalistId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Journalist</option>
                    {journalists.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Award Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Best Investigative Journalism"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    required
                    placeholder="e.g., National Press Association"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g., Journalism, Photography"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Received</label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Brief description of the award..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Award
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAward(false)}
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

      {/* Add Certification Modal */}
      <AnimatePresence>
        {showAddCertification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCertification(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Certification</h2>
                <button
                  onClick={() => setShowAddCertification(false)}
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
                  const expiryDateStr = formData.get('expiryDate') as string;
                  addCertification({
                    journalistId,
                    name: formData.get('name') as string,
                    issuer: formData.get('issuer') as string,
                    issueDate: new Date(formData.get('issueDate') as string),
                    expiryDate: expiryDateStr ? new Date(expiryDateStr) : undefined,
                    credentialId: formData.get('credentialId') as string,
                    verified: formData.get('verified') === 'on',
                  });
                  setShowAddCertification(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Journalist</label>
                  <select
                    name="journalistId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Journalist</option>
                    {journalists.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g., Certified Broadcast Journalist"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
                  <input
                    type="text"
                    name="issuer"
                    required
                    placeholder="e.g., International Journalism Association"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Credential ID</label>
                  <input
                    type="text"
                    name="credentialId"
                    placeholder="Optional credential/license number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                    <input
                      type="date"
                      name="issueDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      name="expiryDate"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="verified"
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Verified</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Certification
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCertification(false)}
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

      {/* Add Performance Review Modal */}
      <AnimatePresence>
        {showAddPerformanceReview && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPerformanceReview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Review - {selectedJournalist.fullName}</h2>
                <button
                  onClick={() => setShowAddPerformanceReview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addPerformanceReview({
                    journalistId: selectedJournalist.id,
                    reviewedBy: user?.id || 'system',
                    reviewedByName: user?.name || 'System',
                    reviewDate: new Date(),
                    periodStart: new Date(formData.get('periodStart') as string),
                    periodEnd: new Date(formData.get('periodEnd') as string),
                    scores: {
                      quality: parseInt(formData.get('scoreQuality') as string),
                      productivity: parseInt(formData.get('scoreProductivity') as string),
                      punctuality: parseInt(formData.get('scorePunctuality') as string),
                      teamwork: parseInt(formData.get('scoreTeamwork') as string),
                      innovation: parseInt(formData.get('scoreInnovation') as string),
                      overall: parseInt(formData.get('scoreOverall') as string),
                    },
                    strengths: (formData.get('strengths') as string).split('\n').filter(s => s.trim()),
                    areasForImprovement: (formData.get('improvements') as string).split('\n').filter(s => s.trim()),
                    comments: formData.get('comments') as string,
                    goals: (formData.get('goals') as string).split('\n').filter(s => s.trim()),
                  });
                  setShowAddPerformanceReview(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period Start</label>
                    <input
                      type="date"
                      name="periodStart"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period End</label>
                    <input
                      type="date"
                      name="periodEnd"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Performance Scores (0-100)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'scoreQuality', label: 'Quality' },
                      { name: 'scoreProductivity', label: 'Productivity' },
                      { name: 'scorePunctuality', label: 'Punctuality' },
                      { name: 'scoreTeamwork', label: 'Teamwork' },
                      { name: 'scoreInnovation', label: 'Innovation' },
                      { name: 'scoreOverall', label: 'Overall' },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                        <input
                          type="number"
                          name={field.name}
                          min="0"
                          max="100"
                          required
                          defaultValue="75"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Strengths (one per line)</label>
                  <textarea
                    name="strengths"
                    rows={3}
                    placeholder="List key strengths..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement (one per line)</label>
                  <textarea
                    name="improvements"
                    rows={3}
                    placeholder="List areas for improvement..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goals (one per line)</label>
                  <textarea
                    name="goals"
                    rows={3}
                    placeholder="Set goals for next period..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    name="comments"
                    rows={4}
                    placeholder="Additional comments and feedback..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPerformanceReview(false)}
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
                <p className="text-sm text-gray-600 mb-4">{selectedJournalists.length} journalists selected</p>
                <button
                  onClick={() => {
                    handleBulkStatusUpdate('active');
                    setShowBulkActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Mark as Active</span>
                </button>
                <button
                  onClick={() => {
                    handleBulkStatusUpdate('inactive');
                    setShowBulkActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                  <span>Mark as Inactive</span>
                </button>
                <button
                  onClick={() => {
                    handleBulkStatusUpdate('on_leave');
                    setShowBulkActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Calendar className="w-5 h-5 text-yellow-600" />
                  <span>Mark as On Leave</span>
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
                <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  {selectedJournalists.length > 0
                    ? `Exporting ${selectedJournalists.length} selected journalists`
                    : `Exporting all ${filteredJournalists.length} journalists`}
                </p>
                <button
                  onClick={() => {
                    handleExport('csv');
                    setShowExportModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium">Export as CSV</div>
                    <div className="text-xs text-gray-500">Comma-separated values</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleExport('excel');
                    setShowExportModal(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <FileText className="w-5 h-5 text-green-700" />
                  <div>
                    <div className="font-medium">Export as Excel</div>
                    <div className="text-xs text-gray-500">Microsoft Excel format</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleExport('pdf');
                    setShowExportModal(false);
                  }}
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
                <h2 className="text-2xl font-bold text-gray-900">Import Journalists</h2>
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
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Importing file:', file.name);
                        alert(`Importing ${file.name}...`);
                        setShowImportModal(false);
                      }
                    }}
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Import Guidelines:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Ensure headers match: First Name, Last Name, Email, Phone, Type</li>
                        <li>Email addresses must be unique</li>
                        <li>Type must be one of: journalist, reporter, correspondent, editor, photographer, videographer, anchor, producer</li>
                        <li>Maximum 1000 records per import</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      // Download template
                      alert('Downloading CSV template...');
                    }}
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

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSendBulkEmail(
                    formData.get('subject') as string,
                    formData.get('message') as string
                  );
                }}
                className="space-y-4"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    To: {selectedJournalists.length} journalist(s)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Email subject..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={8}
                    required
                    placeholder="Type your message here..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Send Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
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

      {/* SMS Modal */}
      <AnimatePresence>
        {showSMSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSMSModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Send SMS</h2>
                <button
                  onClick={() => setShowSMSModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSendBulkSMS(formData.get('message') as string);
                }}
                className="space-y-4"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    To: {selectedJournalists.length} journalist(s)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    maxLength={160}
                    required
                    placeholder="Type your SMS message here (max 160 characters)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Character limit: 160</p>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Send SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSMSModal(false)}
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

      {/* Add Work History Modal */}
      <AnimatePresence>
        {showAddWorkHistory && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddWorkHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Work History</h2>
                <button
                  onClick={() => setShowAddWorkHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const endDateStr = formData.get('endDate') as string;
                  addWorkHistory({
                    journalistId: selectedJournalist.id,
                    organization: formData.get('organization') as string,
                    position: formData.get('position') as string,
                    startDate: new Date(formData.get('startDate') as string),
                    endDate: endDateStr ? new Date(endDateStr) : undefined,
                    description: formData.get('description') as string,
                    isCurrent: !endDateStr,
                  });
                  setShowAddWorkHistory(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    name="organization"
                    required
                    placeholder="e.g., BBC News"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="text"
                    name="position"
                    required
                    placeholder="e.g., Senior Reporter"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional if current)</label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Brief description of responsibilities..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Work History
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddWorkHistory(false)}
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

      {/* Add Portfolio Item Modal */}
      <AnimatePresence>
        {showAddPortfolioItem && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddPortfolioItem(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Portfolio Item</h2>
                <button
                  onClick={() => setShowAddPortfolioItem(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addPortfolioItem({
                    journalistId: selectedJournalist.id,
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    type: formData.get('type') as any,
                    url: formData.get('url') as string,
                    publishedDate: new Date(formData.get('publishedDate') as string),
                    featured: false,
                  });
                  setShowAddPortfolioItem(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Article or project title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="photo">Photo</option>
                    <option value="podcast">Podcast</option>
                    <option value="investigation">Investigation</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    placeholder="Brief description of the work..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publication</label>
                  <input
                    type="text"
                    name="publication"
                    placeholder="Where it was published"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                  <input
                    type="date"
                    name="publishedDate"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="politics, investigation, breaking news"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Portfolio Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPortfolioItem(false)}
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

      {/* Add Communication Log Modal */}
      <AnimatePresence>
        {showAddCommunicationLog && selectedJournalist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddCommunicationLog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Log Communication</h2>
                <button
                  onClick={() => setShowAddCommunicationLog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addCommunicationLog({
                    journalistId: selectedJournalist.id,
                    type: formData.get('type') as any,
                    subject: formData.get('subject') as string,
                    content: formData.get('content') as string,
                    initiatedBy: user?.id || 'system',
                    date: new Date(),
                    followUpRequired: false,
                  });
                  setShowAddCommunicationLog(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="sms">SMS</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Brief subject line"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    rows={5}
                    required
                    placeholder="Detailed notes about the communication..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCommunicationLog(false)}
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

      {/* Add Schedule Entry Modal */}
      <AnimatePresence>
        {showAddScheduleEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddScheduleEntry(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Schedule Entry</h2>
                <button
                  onClick={() => setShowAddScheduleEntry(false)}
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
                  addScheduleEntry({
                    journalistId,
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    type: formData.get('type') as any,
                    startDate: new Date(formData.get('startDate') as string),
                    endDate: new Date(formData.get('endDate') as string),
                    location: formData.get('location') as string,
                  });
                  setShowAddScheduleEntry(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Journalist</label>
                  <select
                    name="journalistId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Journalist</option>
                    {journalists.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Event or appointment title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="meeting">Meeting</option>
                    <option value="interview">Interview</option>
                    <option value="event">Event</option>
                    <option value="training">Training</option>
                    <option value="leave">Leave</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Event location"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAllDay"
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">All Day Event</span>
                  </label>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Schedule Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddScheduleEntry(false)}
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

      {/* Equipment Modal */}
      <AnimatePresence>
        {showEquipmentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEquipmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Assign Equipment</h2>
                <button
                  onClick={() => setShowEquipmentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Equipment assigned successfully!');
                  setShowEquipmentModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Canon EOS R5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    <option value="camera">Camera</option>
                    <option value="audio">Audio Equipment</option>
                    <option value="computer">Computer</option>
                    <option value="accessory">Accessory</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="Serial or asset number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Assign Equipment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEquipmentModal(false)}
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

      {/* Document Upload Modal */}
      <AnimatePresence>
        {showDocumentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDocumentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, images</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert(`Uploading ${file.name}...`);
                        setShowDocumentModal(false);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="resume">Resume/CV</option>
                    <option value="id">ID Document</option>
                    <option value="contract">Contract</option>
                    <option value="certificate">Certificate</option>
                    <option value="background">Background Check</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contract Modal */}
      <AnimatePresence>
        {showContractModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowContractModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add Contract</h2>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Contract added successfully!');
                  setShowContractModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="employment">Employment Contract</option>
                    <option value="freelance">Freelance Agreement</option>
                    <option value="nda">NDA</option>
                    <option value="amendment">Amendment</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compensation</label>
                  <input
                    type="text"
                    placeholder="e.g., $65,000/year"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Additional contract details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Contract
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContractModal(false)}
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

      {/* Notification Center Modal */}
      <AnimatePresence>
        {showNotificationCenter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotificationCenter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {overdueAssignments.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-2">Overdue Assignments ({overdueAssignments.length})</h3>
                        <div className="space-y-2">
                          {overdueAssignments.slice(0, 5).map((assignment) => {
                            const journalist = getJournalist(assignment.journalistId);
                            return (
                              <div key={assignment.id} className="text-sm">
                                <p className="font-medium text-red-800">{assignment.title}</p>
                                <p className="text-red-600 text-xs">
                                  {journalist?.fullName} • Due: {formatDate(assignment.dueDate)}
                                </p>
                              </div>
                            );
                          })}
                          {overdueAssignments.length > 5 && (
                            <p className="text-xs text-red-600">And {overdueAssignments.length - 5} more...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {statistics.pendingAssignments > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-900">Pending Assignments</h3>
                        <p className="text-sm text-yellow-700">{statistics.pendingAssignments} assignments waiting to be started</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900">Active Journalists</h3>
                      <p className="text-sm text-blue-700">{statistics.activeJournalists} journalists currently active</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Trophy className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Total Awards</h3>
                      <p className="text-sm text-green-700">{statistics.totalAwards} awards earned by the team</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
