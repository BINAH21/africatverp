'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  FileText, Clock, TrendingUp, Plus, Edit, Trash2, Search, Filter,
  Eye, EyeOff, CheckCircle, XCircle, AlertCircle, Calendar, User,
  Tag, Image as ImageIcon, Video, File, Share2, Download, Upload,
  Settings, MoreVertical, ChevronDown, ChevronUp, ChevronRight,
  BarChart3, LineChart, PieChart, Activity, Target, Layers,
  Bell, Bookmark, Star, StarOff,
  Send, Save, X, RefreshCw, Archive, Lock, Unlock,
  Globe, MapPin, Link as LinkIcon,
  ExternalLink, Copy, ThumbsUp, MessageSquare, Heart,
  TrendingDown, ArrowUp, ArrowDown,
  Grid, List, Maximize2, Minimize2,
  FileCheck, FileX, FileEdit, FileSearch, FilePlus,
  Clipboard, ClipboardCheck, ClipboardCopy,
  History, RotateCcw, RotateCw,
  Play, Pause, Square,
  CheckSquare, Check, Minus,
  PlusCircle, MinusCircle,
  AlertTriangle, Info, HelpCircle, Shield,
  Users, UserPlus, UserCheck, UserX,
  Folder, FolderOpen, FolderPlus, FolderX,
  Database, Server,
  Network, Wifi, WifiOff,
  Newspaper,
} from 'lucide-react';
import {
  useNewsStore,
  NewsArticle,
  NewsStatus,
  NewsPriority,
  NewsCategory,
  NewsTag,
  NewsComment,
  NewsAssignment,
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

const getStatusColor = (status: NewsStatus) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'draft':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'pending_review':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'approved':
      return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'archived':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
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

export default function NewsPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  const {
    articles,
    categories,
    tags,
    comments,
    assignments,
    notifications,
    getPublishedArticles,
    getDraftArticles,
    getBreakingNews,
    getFeaturedArticles,
    getArticlesByStatus,
    getArticlesByCategory,
    getArticlesByAuthor,
    searchArticles,
    getStatistics,
    getUnreadNotifications,
    addArticle,
    updateArticle,
    deleteArticle,
    submitForReview,
    approveArticle,
    rejectArticle,
    publishArticle,
    unpublishArticle,
    archiveArticle,
    restoreArticle,
    markAsBreakingNews,
    unmarkBreakingNews,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    addComment,
    approveComment,
    rejectComment,
    getCommentsByArticle,
    addAssignment,
    updateAssignment,
    getPendingAssignments,
    createNotification,
    markNotificationAsRead,
  } = useNewsStore();

  // State management
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedStatus, setSelectedStatus] = useState<NewsStatus | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['articles', 'categories']));
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [showArticleDetails, setShowArticleDetails] = useState(false);

  // Computed values
  const statistics = useMemo(() => getStatistics(), [getStatistics]);
  const publishedArticles = useMemo(() => getPublishedArticles(), [getPublishedArticles]);
  const draftArticles = useMemo(() => getDraftArticles(), [getDraftArticles]);
  const breakingNews = useMemo(() => getBreakingNews(), [getBreakingNews]);
  const featuredArticles = useMemo(() => getFeaturedArticles(), [getFeaturedArticles]);
  const unreadNotifications = useMemo(() => getUnreadNotifications(user?.id), [getUnreadNotifications, user]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.categoryId === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = searchArticles(searchQuery);
    }
    
    return filtered.sort((a, b) => {
      if (a.isBreakingNews && !b.isBreakingNews) return -1;
      if (!a.isBreakingNews && b.isBreakingNews) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [articles, selectedStatus, selectedCategory, searchQuery, searchArticles]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleSubmitForReview = (articleId: string) => {
    submitForReview(articleId);
    createNotification({
      type: 'review_requested',
      articleId,
      message: 'Article submitted for review',
      targetUserId: user?.id || '',
      targetRole: 'reviewer',
    });
  };

  const handleApprove = (articleId: string) => {
    approveArticle(articleId, user?.name || 'System');
    const article = articles.find(a => a.id === articleId);
    if (article) {
      createNotification({
        type: 'article_approved',
        articleId,
        message: `Article "${article.title}" has been approved`,
        targetUserId: article.authorId,
        targetRole: 'journalist',
      });
    }
  };

  const handleReject = (articleId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      rejectArticle(articleId, user?.name || 'System', reason);
      const article = articles.find(a => a.id === articleId);
      if (article) {
        createNotification({
          type: 'article_rejected',
          articleId,
          message: `Article "${article.title}" has been rejected: ${reason}`,
          targetUserId: article.authorId,
          targetRole: 'journalist',
        });
      }
    }
  };

  const handlePublish = (articleId: string) => {
    publishArticle(articleId, user?.name || 'System');
    const article = articles.find(a => a.id === articleId);
    if (article) {
      createNotification({
        type: 'article_published',
        articleId,
        message: `Article "${article.title}" has been published`,
        targetUserId: article.authorId,
        targetRole: 'journalist',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-500 mt-1">Manage news articles and stories</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddArticle(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Article
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Published', count: statistics.publishedArticles, icon: FileText, color: 'bg-green-500' },
          { title: 'Draft', count: statistics.draftArticles, icon: Clock, color: 'bg-yellow-500' },
          { title: 'Breaking News', count: statistics.breakingNews, icon: TrendingUp, color: 'bg-red-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glossy-card rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Articles', value: statistics.totalArticles, icon: FileText, color: 'bg-blue-500' },
          { label: 'Pending Review', value: statistics.pendingReview, icon: Clock, color: 'bg-orange-500' },
          { label: 'Total Views', value: statistics.totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-500' },
          { label: 'Total Shares', value: statistics.totalShares.toLocaleString(), icon: Share2, color: 'bg-indigo-500' },
          { label: 'Total Comments', value: statistics.totalComments.toLocaleString(), icon: MessageSquare, color: 'bg-pink-500' },
          { label: 'Avg Views', value: Math.round(statistics.averageViews).toLocaleString(), icon: BarChart3, color: 'bg-teal-500' },
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
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Breaking News Banner */}
      {breakingNews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-500 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Breaking News: {breakingNews.length} active</h3>
                <p className="text-sm text-red-700">Urgent stories requiring attention</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              View All
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as NewsStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Articles List/Grid */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Articles ({filteredArticles.length})
          </h2>
          <button
            onClick={() => toggleSection('articles')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('articles') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('articles') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold">No articles found</p>
                  <p className="text-sm mt-2">Create your first article to get started</p>
                  <button
                    onClick={() => setShowAddArticle(true)}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Article
                  </button>
                </div>
              ) : viewMode === 'list' ? (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                        selectedArticle === article.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
                      }`}
                      onClick={() => {
                        setSelectedArticle(article.id);
                        setEditingArticle(article);
                        setShowArticleDetails(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {article.isBreakingNews && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Breaking
                              </span>
                            )}
                            {article.isFeatured && (
                              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Featured
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(article.status)}`}>
                              {article.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(article.priority)}`}></span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{article.title}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.summary}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {article.authorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {article.categoryName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(article.updatedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {article.comments} comments
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingArticle(article);
                              setShowAddArticle(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <div className="relative group">
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[150px]">
                              {article.status === 'draft' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubmitForReview(article.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Send className="w-4 h-4" />
                                  Submit for Review
                                </button>
                              )}
                              {article.status === 'approved' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePublish(article.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Publish
                                </button>
                              )}
                              {article.status === 'pending_review' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(article.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 text-green-700 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(article.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-700 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {!article.isBreakingNews && article.status === 'published' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsBreakingNews(article.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <TrendingUp className="w-4 h-4" />
                                  Mark as Breaking
                                </button>
                              )}
                              {article.isBreakingNews && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unmarkBreakingNews(article.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <TrendingDown className="w-4 h-4" />
                                  Unmark Breaking
                                </button>
                              )}
                              {article.status !== 'archived' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveArticle(article.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Archive className="w-4 h-4" />
                                  Archive
                                </button>
                              )}
                              {article.status === 'archived' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreArticle(article.id);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  Restore
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this article?')) {
                                    deleteArticle(article.id);
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                        selectedArticle === article.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'
                      }`}
                      onClick={() => {
                        setSelectedArticle(article.id);
                        setEditingArticle(article);
                        setShowArticleDetails(true);
                      }}
                    >
                      {article.featuredImage && (
                        <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        {article.isBreakingNews && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Breaking</span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(article.status)}`}>
                          {article.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{article.authorName}</span>
                        <span>{article.views} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categories Management */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Categories ({categories.length})
            </h2>
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
          <button
            onClick={() => toggleSection('categories')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('categories') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('categories') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{category.name}</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const name = prompt('Enter new name:', category.name);
                            if (name) updateCategory(category.id, { name });
                          }}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          <Edit className="w-3 h-3 text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this category?')) {
                              deleteCategory(category.id);
                            }
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      {getArticlesByCategory(category.id).length} articles
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pending Assignments */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Pending Assignments ({getPendingAssignments().length})
            </h2>
            <button
              onClick={() => setShowAddAssignment(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Assignment
            </button>
          </div>
          <button
            onClick={() => toggleSection('assignments')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('assignments') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('assignments') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {getPendingAssignments().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No pending assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getPendingAssignments().map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Assigned to: {assignment.assignedTo}</span>
                            {assignment.dueDate && (
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            )}
                            <span className={`px-2 py-1 rounded ${
                              assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {assignment.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            updateAssignment(assignment.id, {
                              status: assignment.status === 'pending' ? 'in_progress' : 'completed',
                            });
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                        >
                          {assignment.status === 'pending' ? 'Start' : 'Complete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Article Modal */}
      <AnimatePresence>
        {showAddArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddArticle(false);
              setEditingArticle(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingArticle ? 'Edit Article' : 'Create New Article'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddArticle(false);
                    setEditingArticle(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const articleData = {
                    title: formData.get('title') as string,
                    slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
                    summary: formData.get('summary') as string,
                    content: formData.get('content') as string,
                    status: (formData.get('status') as NewsStatus) || 'draft',
                    priority: (formData.get('priority') as NewsPriority) || 'normal',
                    isBreakingNews: formData.get('isBreakingNews') === 'on',
                    isFeatured: formData.get('isFeatured') === 'on',
                    categoryId: formData.get('categoryId') as string,
                    categoryName: categories.find(c => c.id === formData.get('categoryId'))?.name || '',
                    tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
                    keywords: [],
                    authorId: user?.id || '1',
                    authorName: user?.name || 'System',
                    accessRoles: ['admin', 'editor', 'publisher', 'viewer'],
                    isPublic: true,
                    requiresSubscription: false,
                    socialMediaPublished: {
                      facebook: false,
                      twitter: false,
                      instagram: false,
                      linkedin: false,
                      telegram: false,
                    },
                    relatedArticles: [],
                    images: [],
                    videos: [],
                    audioFiles: [],
                    documents: [],
                  };
                  
                  if (editingArticle) {
                    updateArticle(editingArticle.id, articleData);
                  } else {
                    addArticle(articleData);
                  }
                  setShowAddArticle(false);
                  setEditingArticle(null);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingArticle?.title}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="categoryId"
                      defaultValue={editingArticle?.categoryId}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Summary *</label>
                  <textarea
                    name="summary"
                    defaultValue={editingArticle?.summary}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea
                    name="content"
                    defaultValue={editingArticle?.content}
                    required
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingArticle?.status || 'draft'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      defaultValue={editingArticle?.priority || 'normal'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingArticle?.tags.join(', ')}
                      placeholder="tag1, tag2, tag3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isBreakingNews"
                      defaultChecked={editingArticle?.isBreakingNews}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Breaking News</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      defaultChecked={editingArticle?.isFeatured}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddArticle(false);
                      setEditingArticle(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingArticle ? 'Update' : 'Create'} Article
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddCategory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Category</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addCategory({
                    name: formData.get('name') as string,
                    slug: (formData.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
                    description: formData.get('description') as string || undefined,
                    isActive: true,
                  });
                  setShowAddCategory(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Category
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
