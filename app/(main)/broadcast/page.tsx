'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Radio, Play, Pause, Square, AlertCircle, Bell, BellOff, Settings, Upload,
  FileText, BarChart3, Activity, TrendingUp, TrendingDown, Zap, Shield,
  Eye, EyeOff, RefreshCw, CheckCircle, XCircle, Clock, Calendar, Users,
  Video, Signal, Wifi, WifiOff, HardDrive, Server, Monitor, Tv,
  FileSpreadsheet, Filter, Search, Download, Plus,
  Edit, Trash2, X, Save, Copy, Share2, MoreVertical, ChevronDown, ChevronUp,
  AlertTriangle, Info, Check, ArrowRight, ArrowLeft, Maximize2,
  Minimize2, Volume2, VolumeX, Circle, StopCircle, Power, PowerOff, Globe,
  Link as LinkIcon, ExternalLink, FileCheck, FileX, Clock3, Timer, Gauge,
  Layers, Target, PieChart, LineChart, BarChart, Database, Cpu, MemoryStick,
  Network, DownloadCloud, UploadCloud, Archive, History, BookOpen, Bookmark,
  MessageSquare, Send, Mail, Phone, MapPin, Satellite, Cloud, CloudOff,
  Mic, MicOff, Camera, CameraOff, Image as ImageIcon, Film, Music, Headphones,
  Folder, FolderOpen, FolderPlus, Tag, Package, Grid, List, Menu,
  Clipboard, ClipboardCheck, ClipboardCopy, ClipboardList, File, FilePlus,
  FileEdit, FileSearch, Book, Star, StarOff,
  Award, Trophy, Lock, Unlock, Key, SortAsc, SortDesc, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, MoreHorizontal, Maximize, Minimize
} from 'lucide-react';
import {
  useBroadcastStore,
  BroadcastChannel,
  BlackScreenDetection,
  BroadcastError,
  SatelliteStatistic,
  DisplayBarItem,
  Notification,
  ProblemReport,
  UserRole,
} from '@/lib/broadcast-store';
import { useAppStore } from '@/lib/store';

// Map user role string to UserRole type
const mapUserRole = (role: string): UserRole => {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('admin') || roleLower.includes('administrator')) return 'admin';
  if (roleLower.includes('manager')) return 'manager';
  if (roleLower.includes('operator')) return 'operator';
  if (roleLower.includes('viewer')) return 'viewer';
  return 'guest';
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'playing': return 'bg-green-500';
    case 'paused': return 'bg-yellow-500';
    case 'stopped': return 'bg-gray-500';
    case 'error': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

export default function BroadcastPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();
  const currentRole = user ? mapUserRole(user.role) : 'guest';

  const {
    channels,
    activeChannel,
    blackScreenDetections,
    errors,
    problems,
    statistics,
    displayBarItems,
    notifications,
    excelFiles,
    feedbacks,
    blackScreenDetectionEnabled,
    blackScreenThreshold,
    autoNotificationEnabled,
    monitoringInterval,
    setActiveChannel,
    startBroadcast,
    pauseBroadcast,
    stopBroadcast,
    detectBlackScreen,
    resolveBlackScreen,
    getActiveBlackScreens,
    logError,
    resolveError,
    getActiveErrors,
    getTodayStatistics,
    getStatisticsByDateRange,
    addDisplayBarItem,
    updateDisplayBarItem,
    getActiveDisplayBarItems,
    createNotification,
    markNotificationAsRead,
    getUnreadNotifications,
    processExcelFile,
    createProblem,
    updateProblem,
    resolveProblem,
    addFeedback,
    updateSettings,
    getChannelStatistics,
    updateSignalQuality,
    addChannel,
    updateChannel,
    deleteChannel,
  } = useBroadcastStore();

  // State management
  const [selectedChannel, setSelectedChannel] = useState<string | null>(channels[0]?.id || null);
  const [showSettings, setShowSettings] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'overview' | 'channels' | 'statistics' | 'errors' | 'monitoring'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['live', 'statistics']));

  const activeChannelData = useMemo(() => 
    channels.find(c => c.id === selectedChannel) || channels[0],
    [channels, selectedChannel]
  );

  const activeBlackScreens = useMemo(() => getActiveBlackScreens(), [getActiveBlackScreens]);
  const activeErrors = useMemo(() => getActiveErrors(), [getActiveErrors]);
  const todayStats = useMemo(() => getTodayStatistics(), [getTodayStatistics]);
  const unreadNotifications = useMemo(() => getUnreadNotifications(currentRole), [currentRole, getUnreadNotifications]);
  const activeDisplayItems = useMemo(() => getActiveDisplayBarItems(), [getActiveDisplayBarItems]);

  // Auto-refresh monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate signal quality updates
      channels.forEach(channel => {
        if (channel.isLive) {
          const quality = Math.max(50, Math.min(100, channel.signalQuality + (Math.random() - 0.5) * 10));
          updateSignalQuality(channel.id, quality);
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [channels, updateSignalQuality]);

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

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processExcelFile(file);
      setShowExcelUpload(false);
    }
  };

  const handleResolveProblem = (problemId: string) => {
    const feedback = prompt('Enter resolution feedback:');
    if (feedback) {
      resolveProblem(problemId, feedback, user?.name || 'System');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Broadcast Control</h1>
          <p className="text-gray-500 mt-1">Control live broadcasts and transmission - 24/7 Monitoring</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExcelUpload(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
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
          { label: 'Active Channels', value: channels.filter(c => c.isLive).length, icon: Radio, color: 'bg-blue-500' },
          { label: 'Black Screens', value: activeBlackScreens.length, icon: Monitor, color: 'bg-red-500' },
          { label: 'Active Errors', value: activeErrors.length, icon: AlertCircle, color: 'bg-orange-500' },
          { label: 'Today Texts', value: todayStats?.textsCount || 0, icon: FileText, color: 'bg-green-500' },
          { label: 'Viewing Minutes', value: todayStats?.viewingMinutes || 0, icon: Clock, color: 'bg-purple-500' },
          { label: 'Signal Quality', value: `${activeChannelData?.signalQuality || 0}%`, icon: Signal, color: 'bg-indigo-500' },
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

      {/* Live Broadcast Control */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="w-5 h-5" />
            Live Broadcast Control
          </h2>
          <button
            onClick={() => toggleSection('live')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('live') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('live') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Channel Selector */}
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="text-sm font-medium text-gray-700">Select Channel:</label>
                  <select
                    value={selectedChannel || ''}
                    onChange={(e) => {
                      setSelectedChannel(e.target.value);
                      setActiveChannel(e.target.value);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>{channel.name}</option>
                    ))}
                  </select>
                </div>

                {/* Active Channel Control */}
                {activeChannelData && (
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(activeChannelData.status)} ${activeChannelData.isLive ? 'animate-pulse' : ''}`}></div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{activeChannelData.name}</h3>
                          <p className="text-gray-600">{activeChannelData.description}</p>
                          {activeChannelData.currentProgram && (
                            <p className="text-sm text-gray-500 mt-1">Current: {activeChannelData.currentProgram}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={activeChannelData.tvLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Live
                        </a>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-3 mb-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => startBroadcast(activeChannelData.id)}
                        disabled={activeChannelData.status === 'playing'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                          activeChannelData.status === 'playing'
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        <Play className="w-5 h-5" />
                        Start Broadcast
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => pauseBroadcast(activeChannelData.id)}
                        disabled={activeChannelData.status !== 'playing'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                          activeChannelData.status === 'paused'
                            ? 'bg-yellow-600 text-white cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => stopBroadcast(activeChannelData.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Square className="w-5 h-5" />
                        Stop
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateChannel(activeChannelData.id, { isRecording: !activeChannelData.isRecording })}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                          activeChannelData.isRecording
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                      >
                        {activeChannelData.isRecording ? <StopCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 fill-current" />}
                        {activeChannelData.isRecording ? 'Stop Recording' : 'Start Recording'}
                      </motion.button>
                    </div>

                    {/* Signal Quality & Status */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Signal Quality</span>
                          <Signal className={`w-4 h-4 ${activeChannelData.signalQuality > 80 ? 'text-green-500' : activeChannelData.signalQuality > 50 ? 'text-yellow-500' : 'text-red-500'}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                activeChannelData.signalQuality > 80 ? 'bg-green-500' :
                                activeChannelData.signalQuality > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${activeChannelData.signalQuality}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{activeChannelData.signalQuality}%</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Status</div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          activeChannelData.status === 'playing' ? 'bg-green-100 text-green-700' :
                          activeChannelData.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(activeChannelData.status)}`}></div>
                          {activeChannelData.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Live Status</div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          activeChannelData.isLive ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${activeChannelData.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                          {activeChannelData.isLive ? 'LIVE' : 'OFFLINE'}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Recording</div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          activeChannelData.isRecording ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {activeChannelData.isRecording ? <Video className="w-3 h-3" /> : <StopCircle className="w-3 h-3" />}
                          {activeChannelData.isRecording ? 'RECORDING' : 'STOPPED'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Black Screen Detection & Alerts */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Black Screen Detection
            {activeBlackScreens.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{activeBlackScreens.length}</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${blackScreenDetectionEnabled ? 'text-green-600' : 'text-gray-400'}`}>
              {blackScreenDetectionEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={() => toggleSection('blackscreen')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expandedSections.has('blackscreen') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {expandedSections.has('blackscreen') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {activeBlackScreens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No black screens detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBlackScreens.map((detection) => {
                    const channel = channels.find(c => c.id === detection.channelId);
                    return (
                      <div
                        key={detection.id}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(detection.severity)}`}></div>
                          <div>
                            <div className="font-semibold text-gray-900">{channel?.name || 'Unknown Channel'}</div>
                            <div className="text-sm text-gray-600">
                              Detected {formatDuration(detection.duration)} ago - {detection.duration}s duration
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => resolveBlackScreen(detection.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Resolve
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Today's Statistics */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Today&apos;s Satellite Statistics
          </h2>
          <button
            onClick={() => toggleSection('statistics')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('statistics') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('statistics') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {todayStats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-blue-600 mb-1">Texts Counted</div>
                    <div className="text-2xl font-bold text-blue-900">{todayStats.textsCount}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-sm text-red-600 mb-1">Errors</div>
                    <div className="text-2xl font-bold text-red-900">{todayStats.errorsCount}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-600 mb-1">Viewing Minutes</div>
                    <div className="text-2xl font-bold text-green-900">{todayStats.viewingMinutes}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-purple-600 mb-1">Programs Aired</div>
                    <div className="text-2xl font-bold text-purple-900">{todayStats.programsAired}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-sm text-orange-600 mb-1">Black Screens</div>
                    <div className="text-2xl font-bold text-orange-900">{todayStats.blackScreenDetections}</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="text-sm text-indigo-600 mb-1">Peak Viewers</div>
                    <div className="text-2xl font-bold text-indigo-900">{todayStats.peakViewers}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No statistics available for today</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Errors */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Errors
            {activeErrors.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{activeErrors.length}</span>
            )}
          </h2>
          <button
            onClick={() => toggleSection('errors')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('errors') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('errors') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {activeErrors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active errors</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeErrors.map((error) => {
                    const channel = channels.find(c => c.id === error.channelId);
                    return (
                      <div
                        key={error.id}
                        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(error.severity)}`}></div>
                            <div>
                              <div className="font-semibold text-gray-900">{error.type.replace('_', ' ').toUpperCase()}</div>
                              <div className="text-sm text-gray-600">{channel?.name || 'Unknown Channel'}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => resolveError(error.id, 'Manually resolved')}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Resolve
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 mt-2">{error.description}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Detected: {new Date(error.detectedAt).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Video Display Bar Items */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Video Display Bar Items
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{activeDisplayItems.length}</span>
          </h2>
          <button
            onClick={() => toggleSection('displaybar')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('displaybar') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('displaybar') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {activeDisplayItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No active display bar items</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activeDisplayItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-medium text-gray-900">{item.text}</div>
                          <div className="text-xs text-gray-600">
                            {item.category} • {formatDuration(item.duration)} • Priority {item.priority}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Started: {new Date(item.startTime).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Problem Detection & Quick Feedback */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Problem Detection & Quick Feedback
          </h2>
          <button
            onClick={() => setShowProblemModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Report Problem
          </button>
        </div>
        <div className="space-y-3">
          {problems.filter(p => p.status !== 'resolved').slice(0, 5).map((problem) => {
            const channel = channels.find(c => c.id === problem.channelId);
            return (
              <div
                key={problem.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">{problem.type}</div>
                    <div className="text-sm text-gray-600">{channel?.name || 'Unknown Channel'}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    problem.status === 'open' ? 'bg-red-100 text-red-700' :
                    problem.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {problem.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">{problem.description}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveProblem(problem.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => {
                      const feedback = prompt('Enter quick feedback:');
                      if (feedback) {
                        addFeedback({
                          problemId: problem.id,
                          message: feedback,
                          createdBy: user?.name || 'System',
                        });
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add Feedback
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Excel Files Processed */}
      {excelFiles.length > 0 && (
        <div className="glossy-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-5 h-5" />
            Processed Excel Files ({excelFiles.length})
          </h2>
          <div className="space-y-2">
            {excelFiles.slice(0, 5).map((file) => (
              <div key={file.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{file.fileName}</div>
                  <div className="text-xs text-gray-600">
                    {file.totalItems} items • {file.categories.length} categories • 
                    Processed: {file.processedAt ? new Date(file.processedAt).toLocaleString() : 'Pending'}
                  </div>
                </div>
                {file.processed && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Broadcast Control Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Black Screen Detection</label>
                    <p className="text-sm text-gray-600">Automatically detect black screens</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ blackScreenDetectionEnabled: !blackScreenDetectionEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      blackScreenDetectionEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      blackScreenDetectionEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Black Screen Threshold (seconds)</label>
                  <input
                    type="number"
                    value={blackScreenThreshold}
                    onChange={(e) => updateSettings({ blackScreenThreshold: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900">Auto Notifications</label>
                    <p className="text-sm text-gray-600">Send notifications automatically</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoNotificationEnabled: !autoNotificationEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      autoNotificationEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      autoNotificationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Monitoring Interval (seconds)</label>
                  <input
                    type="number"
                    value={monitoringInterval}
                    onChange={(e) => updateSettings({ monitoringInterval: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Excel Upload Modal */}
      <AnimatePresence>
        {showExcelUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExcelUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Excel File</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">Upload Excel file with texts and categories</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label
                    htmlFor="excel-upload"
                    className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowExcelUpload(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotificationPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Notifications</h3>
                <button
                  onClick={() => setShowNotificationPanel(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {unreadNotifications.length} unread
              </div>
            </div>
            <div className="p-4 space-y-3">
              {notifications.slice().reverse().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(notification.severity)}`}></div>
                      <span className="font-semibold text-gray-900">{notification.title}</span>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-Time Video Preview */}
      {activeChannelData && activeChannelData.isLive && (
        <div className="glossy-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Live Video Preview - {activeChannelData.name}
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={activeChannelData.tvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open Full Screen
              </a>
            </div>
          </div>
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">Live Stream</p>
                <p className="text-sm opacity-75 mt-2">{activeChannelData.currentProgram || 'No program info'}</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">LIVE</span>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
              Signal: {activeChannelData.signalQuality}%
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Excel Processing with Auto-Detection */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Excel File Processing & Auto-Detection
          </h2>
          <button
            onClick={() => setShowExcelUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Excel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 mb-1">Files Processed</div>
            <div className="text-2xl font-bold text-blue-900">{excelFiles.length}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 mb-1">Texts Extracted</div>
            <div className="text-2xl font-bold text-green-900">
              {excelFiles.reduce((sum, f) => sum + f.totalItems, 0)}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 mb-1">Categories Detected</div>
            <div className="text-2xl font-bold text-purple-900">
              {new Set(excelFiles.flatMap(f => f.categories)).size}
            </div>
          </div>
        </div>
        {excelFiles.length > 0 && (
          <div className="space-y-2">
            {excelFiles.slice(0, 5).map((file) => (
              <div key={file.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{file.fileName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {file.totalItems} items • {file.categories.length} categories • 
                    {file.processed ? (
                      <span className="text-green-600"> Processed: {file.processedAt ? new Date(file.processedAt).toLocaleString() : 'Recently'}</span>
                    ) : (
                      <span className="text-yellow-600"> Processing...</span>
                    )}
                  </div>
                  {file.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {file.categories.slice(0, 5).map(cat => (
                        <span key={cat} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {cat}
                        </span>
                      ))}
                      {file.categories.length > 5 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{file.categories.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {file.processed && (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Satellite Data Registration Dashboard */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Satellite className="w-5 h-5" />
            Satellite Data Registration Dashboard
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Today
            </button>
          </div>
        </div>
        {todayStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Texts Counted</div>
              <div className="text-2xl font-bold text-blue-900">{todayStats.textsCount}</div>
              <div className="text-xs text-blue-600 mt-1">Per day</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-sm text-red-600 mb-1">Errors Detected</div>
              <div className="text-2xl font-bold text-red-900">{todayStats.errorsCount}</div>
              <div className="text-xs text-red-600 mt-1">Total errors</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 mb-1">Viewing Minutes</div>
              <div className="text-2xl font-bold text-green-900">{todayStats.viewingMinutes}</div>
              <div className="text-xs text-green-600 mt-1">Total minutes</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Programs Aired</div>
              <div className="text-2xl font-bold text-purple-900">{todayStats.programsAired}</div>
              <div className="text-xs text-purple-600 mt-1">Total programs</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-sm text-orange-600 mb-1">Black Screens</div>
              <div className="text-2xl font-bold text-orange-900">{todayStats.blackScreenDetections}</div>
              <div className="text-xs text-orange-600 mt-1">Detections</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="text-sm text-indigo-600 mb-1">Peak Viewers</div>
              <div className="text-2xl font-bold text-indigo-900">{todayStats.peakViewers}</div>
              <div className="text-xs text-indigo-600 mt-1">Maximum</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Satellite className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No statistics available for selected date</p>
          </div>
        )}
      </div>

      {/* Channel Management */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tv className="w-5 h-5" />
            Channel Management ({channels.length})
          </h2>
          <button
            onClick={() => {
              const name = prompt('Enter channel name:');
              const description = prompt('Enter description:');
              const tvLink = prompt('Enter TV link:');
              if (name && tvLink) {
                addChannel({
                  name,
                  description: description || '',
                  status: 'idle',
                  tvLink,
                  signalQuality: 100,
                  isRecording: false,
                  isLive: false,
                  accessRoles: [currentRole],
                });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Channel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className={`bg-gradient-to-br rounded-xl p-4 border-2 transition-all ${
                selectedChannel === channel.id
                  ? 'border-primary-500 from-primary-50 to-blue-50'
                  : 'border-gray-200 from-white to-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{channel.description}</p>
                </div>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[150px]">
                    <button
                      onClick={() => {
                        setSelectedChannel(channel.id);
                        setActiveChannel(channel.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Select
                    </button>
                    <button
                      onClick={() => {
                        const name = prompt('Enter new name:', channel.name);
                        if (name) updateChannel(channel.id, { name });
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this channel?')) deleteChannel(channel.id);
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
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    channel.status === 'playing' ? 'bg-green-100 text-green-700' :
                    channel.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {channel.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Signal:</span>
                  <span className="font-semibold">{channel.signalQuality}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Live:</span>
                  <span className={`w-2 h-2 rounded-full ${channel.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health & Performance Monitoring */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health & Performance Monitoring
          </h2>
          <RefreshCw className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-600">CPU Usage</span>
              <Cpu className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900">45%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-600">Memory Usage</span>
              <MemoryStick className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900">62%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-600">Network Bandwidth</span>
              <Network className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900">78%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-orange-600">Storage Usage</span>
              <HardDrive className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">34%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '34%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Statistics with Charts */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Historical Statistics & Trends
          </h2>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Texts Counted Over Time</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <BarChart className="w-12 h-12" />
              <span className="ml-2">Chart visualization</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Error Trends</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <LineChart className="w-12 h-12" />
              <span className="ml-2">Chart visualization</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Supervision Tools */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Advanced Supervision Tools
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Live Monitoring</h3>
            </div>
            <p className="text-sm text-gray-600">Real-time monitoring of all active channels</p>
            <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm w-full">
              View Dashboard
            </button>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Performance Analytics</h3>
            </div>
            <p className="text-sm text-gray-600">Detailed performance metrics and analytics</p>
            <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm w-full">
              View Analytics
            </button>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Report Generator</h3>
            </div>
            <p className="text-sm text-gray-600">Generate comprehensive reports</p>
            <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm w-full">
              Generate Report
            </button>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">Alert Configuration</h3>
            </div>
            <p className="text-sm text-gray-600">Configure alert rules and notifications</p>
            <button className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm w-full">
              Configure Alerts
            </button>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Error Tracking</h3>
            </div>
            <p className="text-sm text-gray-600">Track and analyze all errors</p>
            <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm w-full">
              View Errors
            </button>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Activity Logs</h3>
            </div>
            <p className="text-sm text-gray-600">View complete activity history</p>
            <button className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm w-full">
              View Logs
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Toolbar */}
      <div className="glossy-card rounded-2xl p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh All
          </button>
          <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
          <button className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System Settings
          </button>
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Backup Data
          </button>
          <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database Status
          </button>
        </div>
      </div>
    </div>
  );
}
