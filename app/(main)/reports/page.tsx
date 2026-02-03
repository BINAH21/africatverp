'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, Upload, Plus, Edit, Trash2, Search, Filter,
  Eye, CheckCircle, XCircle, AlertCircle, Calendar, User, Clock,
  Tag, Share2, Send, Save, X, RefreshCw,
  Settings, MoreVertical, ChevronDown, ChevronUp, ChevronRight,
  BarChart3, LineChart, PieChart, Activity, Target, Layers,
  Bell, Bookmark, Star, TrendingUp, TrendingDown,
  Globe, MapPin, Link as LinkIcon, ExternalLink, Copy,
  ThumbsUp, MessageSquare, Heart, ArrowUp, ArrowDown,
  Grid, List, Maximize2, Minimize2, FileCheck, FileX,
  FileEdit, FileSearch, FilePlus, Clipboard, ClipboardCheck,
  History, RotateCcw, RotateCw, Play, Pause, Square,
  CheckSquare, Check, Minus, PlusCircle, MinusCircle,
  AlertTriangle, Info, HelpCircle, Shield, Users, UserPlus,
  UserCheck, UserX, Folder, FolderOpen, FolderPlus, FolderX,
  Database, Server, Network, Wifi, WifiOff, Newspaper,
} from 'lucide-react';
import {
  useNewsStore,
  NewsArticle,
  NewsStatus,
  NewsPriority,
  JournalismReport,
  JournalismReportType,
  EditorialAgenda,
  SupervisorNotification,
} from '@/lib/news-store';
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

const getPriorityColor = (priority: NewsPriority) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'normal':
      return 'bg-blue-500';
    case 'low':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'postponed':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export default function ReportsPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  const {
    articles,
    reports,
    agendas,
    supervisorNotifications,
    getPublishedArticles,
    getStatistics,
    generateReport,
    addReport,
    updateReport,
    deleteReport,
    getReport,
    getReportsByType,
    getReportsByPeriod,
    exportReport,
    addAgenda,
    updateAgenda,
    deleteAgenda,
    getAgenda,
    getAgendasByDate,
    getAgendasByJournalist,
    getUpcomingAgendas,
    completeAgenda,
    createSupervisorNotification,
    markNotificationRead,
    acknowledgeNotification,
    getSupervisorNotifications,
    getUnreadSupervisorNotifications,
    notifySupervisor,
    addArticle,
    updateArticle,
    publishArticle,
    submitForReview,
  } = useNewsStore();

  // State management
  const [activeTab, setActiveTab] = useState<'reports' | 'agendas' | 'notifications' | 'publish'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<JournalismReportType | 'all'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('week');
  const [showGenerateReport, setShowGenerateReport] = useState(false);
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [showNotifySupervisor, setShowNotifySupervisor] = useState(false);
  const [showPublishArticle, setShowPublishArticle] = useState(false);
  const [selectedReport, setSelectedReport] = useState<JournalismReport | null>(null);
  const [selectedAgenda, setSelectedAgenda] = useState<EditorialAgenda | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    reports: true,
    agendas: true,
    notifications: true,
    analytics: true,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterPriority, setFilterPriority] = useState<NewsPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');

  const statistics = useMemo(() => getStatistics(), [getStatistics]);
  const publishedArticles = useMemo(() => getPublishedArticles(), [getPublishedArticles]);
  const upcomingAgendas = useMemo(() => getUpcomingAgendas(7), [getUpcomingAgendas]);
  const unreadNotifications = useMemo(() => {
    if (!user?.id) return [];
    return getUnreadSupervisorNotifications(user.id);
  }, [getUnreadSupervisorNotifications, user?.id]);

  const filteredReports = useMemo(() => {
    let filtered = reports;
    if (selectedReportType !== 'all') {
      filtered = filtered.filter((r) => r.type === selectedReportType);
    }
    if (searchQuery) {
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }, [reports, selectedReportType, searchQuery]);

  const filteredAgendas = useMemo(() => {
    let filtered = agendas;
    if (filterPriority !== 'all') {
      filtered = filtered.filter((a) => a.priority === filterPriority);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [agendas, filterPriority, filterStatus, searchQuery]);

  const filteredNotifications = useMemo(() => {
    if (!user?.id) return [];
    let filtered = getSupervisorNotifications(user.id);
    if (searchQuery) {
      filtered = filtered.filter((n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [getSupervisorNotifications, user?.id, searchQuery]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenerateReport = () => {
    if (!user?.id) return;
    const now = new Date();
    let from: Date;
    switch (selectedPeriod) {
      case 'day':
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    if (selectedReportType !== 'all') {
      generateReport(selectedReportType, { from, to: now }, user.id);
      setShowGenerateReport(false);
    }
  };

  const reportTypes: { type: JournalismReportType; label: string; icon: any; description: string }[] = [
    { type: 'daily_summary', label: 'Daily Summary', icon: Calendar, description: 'Daily news summary and statistics' },
    { type: 'weekly_summary', label: 'Weekly Summary', icon: Calendar, description: 'Weekly news summary and trends' },
    { type: 'monthly_summary', label: 'Monthly Summary', icon: Calendar, description: 'Monthly comprehensive report' },
    { type: 'quarterly_summary', label: 'Quarterly Summary', icon: Calendar, description: 'Quarterly performance analysis' },
    { type: 'annual_summary', label: 'Annual Summary', icon: Calendar, description: 'Annual comprehensive report' },
    { type: 'viewership_analysis', label: 'Viewership Analysis', icon: Eye, description: 'Article viewership and engagement metrics' },
    { type: 'performance_metrics', label: 'Performance Metrics', icon: Activity, description: 'Overall performance indicators' },
    { type: 'journalist_performance', label: 'Journalist Performance', icon: User, description: 'Individual journalist statistics' },
    { type: 'category_analysis', label: 'Category Analysis', icon: Folder, description: 'Category-wise performance breakdown' },
    { type: 'trending_topics', label: 'Trending Topics', icon: TrendingUp, description: 'Current trending news topics' },
    { type: 'sentiment_analysis', label: 'Sentiment Analysis', icon: Heart, description: 'Reader sentiment and feedback analysis' },
    { type: 'engagement_report', label: 'Engagement Report', icon: ThumbsUp, description: 'Social media and reader engagement' },
    { type: 'publishing_statistics', label: 'Publishing Statistics', icon: FileText, description: 'Publishing frequency and patterns' },
    { type: 'breaking_news_report', label: 'Breaking News Report', icon: AlertCircle, description: 'Breaking news coverage analysis' },
    { type: 'social_media_impact', label: 'Social Media Impact', icon: Share2, description: 'Social media reach and impact' },
    { type: 'readership_demographics', label: 'Readership Demographics', icon: Users, description: 'Reader demographics and segmentation' },
    { type: 'content_quality_score', label: 'Content Quality Score', icon: Star, description: 'Content quality metrics and ratings' },
    { type: 'editorial_calendar', label: 'Editorial Calendar', icon: Calendar, description: 'Editorial planning and scheduling' },
    { type: 'deadline_compliance', label: 'Deadline Compliance', icon: Clock, description: 'Deadline adherence and timeliness' },
    { type: 'source_credibility', label: 'Source Credibility', icon: Shield, description: 'Source verification and credibility scores' },
    { type: 'fact_check_report', label: 'Fact Check Report', icon: CheckCircle, description: 'Fact-checking results and accuracy' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Journalism Reports</h1>
          <p className="text-gray-500 mt-1">Comprehensive reporting, agenda management, supervisor notifications, and article publishing</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGenerateReport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Generate Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddAgenda(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Agenda
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifySupervisor(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5" />
            Notify Supervisor
          </motion.button>
          {unreadNotifications.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications.length}
              </span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </motion.button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Reports', value: reports.length, icon: FileText, color: 'bg-blue-500' },
          { label: 'Published Articles', value: statistics.publishedArticles, icon: Newspaper, color: 'bg-green-500' },
          { label: 'Upcoming Agendas', value: upcomingAgendas.length, icon: Calendar, color: 'bg-yellow-500' },
          { label: 'Unread Notifications', value: unreadNotifications.length, icon: Bell, color: 'bg-red-500', badge: unreadNotifications.length },
          { label: 'Total Views', value: statistics.totalViews.toLocaleString(), icon: Eye, color: 'bg-indigo-500' },
          { label: 'Total Shares', value: statistics.totalShares.toLocaleString(), icon: Share2, color: 'bg-purple-500' },
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
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stat.badge} new</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'agendas', label: 'Editorial Agendas', icon: Calendar },
          { id: 'notifications', label: 'Supervisor Notifications', icon: Bell },
          { id: 'publish', label: 'Publish Articles', icon: Upload },
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

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Report Types</option>
              {reportTypes.map((rt) => (
                <option key={rt.type} value={rt.type}>
                  {rt.label}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="day">Last Day</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => {
              const reportType = reportTypes.find((rt) => rt.type === report.type);
              const Icon = reportType?.icon || FileText;
              return (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glossy-card rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-primary-100 p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportReport(report.id, 'pdf');
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Export PDF"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteReport(report.id);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(report.generatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {report.generatedBy}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Articles:</span>
                      <span className="font-semibold ml-1">{report.metrics.totalArticles}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <span className="font-semibold ml-1">{report.metrics.totalViews.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Shares:</span>
                      <span className="font-semibold ml-1">{report.metrics.totalShares.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement:</span>
                      <span className="font-semibold ml-1">{report.metrics.averageEngagement.toFixed(1)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reports found. Generate a new report to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Agendas Tab */}
      {activeTab === 'agendas' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agendas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          {/* Agendas List */}
          <div className="space-y-4">
            {filteredAgendas.map((agenda, index) => (
              <motion.div
                key={agenda.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glossy-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{agenda.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(agenda.status)}`}>
                        {agenda.status.replace('_', ' ')}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(agenda.priority)}`} />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{agenda.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(agenda.date)}
                      </span>
                      {agenda.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {agenda.time}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {agenda.assignedTo.length} assigned
                      </span>
                      {agenda.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {agenda.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {agenda.status !== 'completed' && (
                      <button
                        onClick={() => completeAgenda(agenda.id)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                        title="Mark Complete"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAgenda(agenda)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteAgenda(agenda.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredAgendas.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No agendas found. Create a new agenda to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glossy-card rounded-2xl p-6 ${!notification.read ? 'border-2 border-primary-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className={`w-5 h-5 ${!notification.read ? 'text-primary-600' : 'text-gray-400'}`} />
                      <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        From: {notification.senderName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.actionRequired && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          Action Required
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    {notification.actionRequired && !notification.acknowledged && (
                      <button
                        onClick={() => acknowledgeNotification(notification.id)}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found.</p>
            </div>
          )}
        </div>
      )}

      {/* Publish Articles Tab */}
      {activeTab === 'publish' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Ready to Publish</h2>
            <button
              onClick={() => setShowPublishArticle(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Article
            </button>
          </div>

          {/* Articles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedArticles.slice(0, 12).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glossy-card rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{article.title}</h3>
                  {article.isBreakingNews && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Breaking</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.summary}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 className="w-3 h-3" />
                    {article.shares}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {article.likes}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (article.status === 'approved') {
                        publishArticle(article.id, user?.id || 'system');
                      } else if (article.status === 'draft') {
                        submitForReview(article.id);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                  >
                    {article.status === 'approved' ? 'Publish Now' : article.status === 'draft' ? 'Submit for Review' : 'View'}
                  </button>
                  <button
                    onClick={() => window.open(`/news/${article.id}`, '_blank')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      <AnimatePresence>
        {showGenerateReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGenerateReport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
                <button
                  onClick={() => setShowGenerateReport(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">Select Report Type</option>
                    {reportTypes.map((rt) => (
                      <option key={rt.type} value={rt.type}>
                        {rt.label} - {rt.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="day">Last Day</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleGenerateReport}
                    disabled={selectedReportType === 'all'}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => setShowGenerateReport(false)}
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

      {/* Add Agenda Modal */}
      <AnimatePresence>
        {showAddAgenda && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddAgenda(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">New Editorial Agenda</h2>
                <button
                  onClick={() => setShowAddAgenda(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addAgenda({
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    date: new Date(formData.get('date') as string),
                    time: formData.get('time') as string,
                    priority: (formData.get('priority') as NewsPriority) || 'normal',
                    status: 'scheduled',
                    assignedTo: [],
                    assignedBy: user?.id || 'system',
                    tags: [],
                    relatedArticles: [],
                    reminders: { enabled: false, times: [] },
                    attachments: [],
                  });
                  setShowAddAgenda(false);
                }}
                className="space-y-4"
              >
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="time"
                      name="time"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
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
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Agenda
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAgenda(false)}
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

      {/* Notify Supervisor Modal */}
      <AnimatePresence>
        {showNotifySupervisor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNotifySupervisor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notify Supervisor</h2>
                <button
                  onClick={() => setShowNotifySupervisor(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  if (user?.id) {
                    notifySupervisor(
                      formData.get('supervisorId') as string,
                      (formData.get('type') as SupervisorNotification['type']) || 'review_request',
                      formData.get('title') as string,
                      formData.get('message') as string,
                      user.id,
                      user.name || 'User',
                      (user.role as any) || 'journalist',
                      (formData.get('priority') as NewsPriority) || 'normal'
                    );
                  }
                  setShowNotifySupervisor(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor ID</label>
                  <input
                    type="text"
                    name="supervisorId"
                    required
                    placeholder="Enter supervisor user ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                  <select
                    name="type"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="review_request">Review Request</option>
                    <option value="article_submission">Article Submission</option>
                    <option value="approval_request">Approval Request</option>
                    <option value="publishing_request">Publishing Request</option>
                    <option value="breaking_news">Breaking News</option>
                    <option value="urgent_issue">Urgent Issue</option>
                    <option value="report_ready">Report Ready</option>
                    <option value="deadline_approaching">Deadline Approaching</option>
                    <option value="quality_concern">Quality Concern</option>
                    <option value="compliance_alert">Compliance Alert</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={4}
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
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Send Notification
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNotifySupervisor(false)}
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
    </div>
  );
}
