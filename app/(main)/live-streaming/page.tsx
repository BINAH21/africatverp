'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Radio, Play, Pause, Square, AlertCircle, Bell, Settings, Upload,
  FileText, BarChart3, Activity, TrendingUp, Zap, Shield, Eye, RefreshCw,
  CheckCircle, XCircle, Clock, Calendar, Users, Video, Signal, HardDrive,
  Server, Monitor, Tv, Filter, Search, Download, Plus, Edit, Trash2, X,
  Save, Copy, Share2, MoreVertical, ChevronDown, ChevronUp, AlertTriangle,
  Info, Check, ArrowRight, ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX,
  Circle, StopCircle, Power, PowerOff, Globe, Link as LinkIcon, ExternalLink,
  FileCheck, FileX, Clock3, Timer, Gauge, Layers, Target, PieChart, LineChart,
  BarChart, Database, Cpu, MemoryStick, Network, DownloadCloud, UploadCloud,
  Archive, History, BookOpen, Bookmark, MessageSquare, Send, Mail, Phone,
  MapPin, Satellite, Cloud, CloudOff, Mic, MicOff, Camera, CameraOff,
  Image as ImageIcon, Film, Music, Headphones, Radio as BroadcastIcon, Radio as AntennaIcon, Radio as TowerIcon,
  Radio as WavesIcon, Folder, FolderOpen, FolderPlus, Tag, Package, Grid, List, Menu,
  Clipboard, ClipboardCheck, ClipboardCopy, ClipboardList, File, FilePlus,
  FileEdit, FileSearch, Book, Star, StarOff, Award, Trophy, Lock, Unlock,
  Key, SortAsc, SortDesc, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  MoreHorizontal, Maximize, Minimize, MessageSquare as MessageCircleIcon, User, UserPlus,
  Heart, ThumbsUp, ThumbsDown, Eye as EyeIcon, EyeOff as EyeOffIcon,
} from 'lucide-react';
import {
  useLiveStreamingStore,
  LiveStreamSession,
  SocialPlatform,
  SocialPlatformConfig,
  StreamComment,
  SubscriberFollower,
} from '@/lib/live-streaming-store';
import { useBroadcastStore } from '@/lib/broadcast-store';
import { useAppStore } from '@/lib/store';

// Icon aliases for social platforms (using existing lucide-react icons)
const FacebookIcon = Globe;
const YoutubeIcon = Video;
const InstagramIcon = ImageIcon;
const TwitterIcon = MessageSquare;
const LinkedinIcon = Users;
const TwitchIcon = Radio;
const VimeoIcon = Video;

// Social media platform definitions
const SOCIAL_PLATFORMS: Array<{
  id: SocialPlatform;
  name: string;
  icon: any;
  color: string;
  requiresAuth: boolean;
  supportsComments: boolean;
  supportsViewers: boolean;
}> = [
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: 'bg-blue-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: 'bg-red-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'bg-black', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-blue-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'twitter', name: 'Twitter/X', icon: TwitterIcon, color: 'bg-black', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: 'bg-gradient-to-r from-purple-500 to-pink-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: 'bg-blue-700', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'twitch', name: 'Twitch', icon: TwitchIcon, color: 'bg-purple-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'vimeo', name: 'Vimeo', icon: VimeoIcon, color: 'bg-blue-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'dailymotion', name: 'Dailymotion', icon: Video, color: 'bg-blue-400', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'periscope', name: 'Periscope', icon: BroadcastIcon, color: 'bg-blue-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'mixer', name: 'Mixer', icon: Radio, color: 'bg-blue-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'dlive', name: 'DLive', icon: Video, color: 'bg-green-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'trovo', name: 'Trovo', icon: Video, color: 'bg-purple-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'rumble', name: 'Rumble', icon: Video, color: 'bg-orange-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'bitchute', name: 'BitChute', icon: Video, color: 'bg-red-700', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'odnoklassniki', name: 'Odnoklassniki', icon: Users, color: 'bg-orange-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'vk', name: 'VK', icon: Users, color: 'bg-blue-600', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'okru', name: 'OK.ru', icon: Users, color: 'bg-orange-500', requiresAuth: true, supportsComments: true, supportsViewers: true },
  { id: 'custom_rtmp', name: 'Custom RTMP', icon: Server, color: 'bg-gray-600', requiresAuth: false, supportsComments: false, supportsViewers: false },
];

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'live': return 'bg-red-500';
    case 'starting': return 'bg-yellow-500';
    case 'paused': return 'bg-orange-500';
    case 'stopped': return 'bg-gray-500';
    case 'archived': return 'bg-blue-500';
    case 'error': return 'bg-red-600';
    default: return 'bg-gray-400';
  }
};

export default function LiveStreamingPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();
  const { channels } = useBroadcastStore();
  
  const {
    sessions,
    activeSession,
    createSession,
    updateSession,
    deleteSession,
    getSession,
    getActiveSessions,
    getScheduledSessions,
    startStream,
    pauseStream,
    stopStream,
    goLive,
    startRecording,
    stopRecording,
    archiveSession,
    addComment,
    getComments,
    updateViewerCount,
    getTotalViewers,
    addSubscriberFollower,
    getSubscribersFollowers,
    updatePlatformConfig,
    getPlatformConfig,
    connectPlatform,
    disconnectPlatform,
    getSessionStatistics,
    getSessionsFromBroadcast,
  } = useLiveStreamingStore();

  // State management
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPlatformConfig, setShowPlatformConfig] = useState<{ sessionId: string; platform: SocialPlatform } | null>(null);
  const [newComment, setNewComment] = useState('');
  const [viewMode, setViewMode] = useState<'player' | 'stats' | 'comments' | 'platforms'>('player');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const currentSession = useMemo(() => 
    selectedSession ? getSession(selectedSession) : sessions.find(s => s.status === 'live') || sessions[0],
    [selectedSession, sessions, getSession]
  );

  const activeSessions = useMemo(() => getActiveSessions(), [sessions, getActiveSessions]);
  const scheduledSessions = useMemo(() => getScheduledSessions(), [sessions, getScheduledSessions]);
  const sessionComments = useMemo(() => 
    currentSession ? getComments(currentSession.id) : [],
    [currentSession, getComments]
  );
  const sessionStats = useMemo(() =>
    currentSession ? getSessionStatistics(currentSession.id) : null,
    [currentSession, getSessionStatistics]
  );
  const subscribersFollowers = useMemo(() =>
    currentSession ? getSubscribersFollowers(currentSession.id) : [],
    [currentSession, getSubscribersFollowers]
  );

  // Auto-scroll comments
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessionComments]);

  // Form state for new session
  const [newSessionData, setNewSessionData] = useState({
    title: '',
    description: '',
    broadcastChannelId: channels[0]?.id || '',
    platforms: [] as SocialPlatform[],
    scheduledStart: '',
    scheduledEnd: '',
    tags: [] as string[],
  });

  const handleCreateSession = () => {
    if (!newSessionData.title || !newSessionData.broadcastChannelId) return;
    
    const platformConfigs: SocialPlatformConfig[] = newSessionData.platforms.map(platform => ({
      platform,
      enabled: false,
      connectionStatus: 'pending',
    }));
    
    createSession({
      title: newSessionData.title,
      description: newSessionData.description,
      broadcastChannelId: newSessionData.broadcastChannelId,
      platforms: newSessionData.platforms,
      platformConfigs,
      scheduledStart: newSessionData.scheduledStart ? new Date(newSessionData.scheduledStart) : undefined,
      scheduledEnd: newSessionData.scheduledEnd ? new Date(newSessionData.scheduledEnd) : undefined,
      tags: newSessionData.tags,
      createdBy: user?.name || 'System',
    });
    
    setNewSessionData({
      title: '',
      description: '',
      broadcastChannelId: channels[0]?.id || '',
      platforms: [],
      scheduledStart: '',
      scheduledEnd: '',
      tags: [],
    });
    setShowCreateModal(false);
  };

  const handleGoLive = async () => {
    if (!currentSession) return;
    const channel = channels.find(c => c.id === currentSession.broadcastChannelId);
    if (channel) {
      await goLive(currentSession.id, channel.tvLink);
      await startRecording(currentSession.id);
    }
  };

  const handleSendComment = () => {
    if (!newComment.trim() || !currentSession) return;
    addComment(currentSession.id, {
      streamId: currentSession.id,
      platform: 'youtube',
      author: user?.name || 'You',
      message: newComment,
    });
    setNewComment('');
  };

  const stats = {
    active: activeSessions.length,
    scheduled: scheduledSessions.length,
    viewers: sessions.reduce((sum, s) => sum + (s.currentViewers || 0), 0),
    total: sessions.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Streaming</h1>
          <p className="text-gray-500 mt-1">Manage live streaming sessions and broadcasts - Restream.io-like Platform</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Stream
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('player')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Streams', value: stats.active, icon: Play, color: 'bg-red-500' },
          { label: 'Scheduled', value: stats.scheduled, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Viewers', value: stats.viewers, icon: Users, color: 'bg-green-500' },
          { label: 'Total Sessions', value: stats.total, icon: Video, color: 'bg-purple-500' },
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
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Area */}
      {currentSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Beautiful Video Player */}
            <div className="glossy-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentSession.title}</h2>
                  {currentSession.description && (
                    <p className="text-sm text-gray-600 mt-1">{currentSession.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentSession.status === 'live' ? 'bg-red-100 text-red-700' :
                    currentSession.status === 'starting' ? 'bg-yellow-100 text-yellow-700' :
                    currentSession.status === 'paused' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {currentSession.status === 'live' && (
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                      {currentSession.status.toUpperCase()}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className={`relative bg-black rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} style={{ aspectRatio: '16/9' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentSession.status === 'live' ? (
                    <div className="text-center text-white">
                      <Video className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-semibold">Live Stream</p>
                      <p className="text-sm opacity-75 mt-2">
                        {currentSession.satelliteSource || 'Satellite Feed'}
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm">LIVE</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <Play className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-semibold">Ready to Go Live</p>
                      <p className="text-sm opacity-75 mt-2">Click &quot;Go Live&quot; to start streaming</p>
                    </div>
                  )}
                </div>
                
                {/* Player Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentSession.status === 'live' ? (
                        <button
                          onClick={() => pauseStream(currentSession.id)}
                          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                          <Pause className="w-6 h-6 text-white" />
                        </button>
                      ) : currentSession.status === 'paused' ? (
                        <button
                          onClick={() => startStream(currentSession.id)}
                          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                          <Play className="w-6 h-6 text-white" />
                        </button>
                      ) : (
                        <button
                          onClick={handleGoLive}
                          className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                        >
                          <Play className="w-6 h-6 text-white" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (currentSession.isRecording) {
                            stopRecording(currentSession.id);
                          } else {
                            startRecording(currentSession.id);
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors ${
                          currentSession.isRecording
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <Circle className={`w-5 h-5 ${currentSession.isRecording ? 'fill-current' : ''}`} />
                      </button>
                      <div className="text-white text-sm">
                        {currentSession.isRecording && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span>Recording</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{currentSession.currentViewers.toLocaleString()}</span>
                      </div>
                      {currentSession.duration > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(currentSession.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stream Controls */}
              <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {currentSession.status === 'live' ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => pauseStream(currentSession.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => stopStream(currentSession.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Square className="w-4 h-4" />
                        Stop Stream
                      </motion.button>
                    </>
                  ) : currentSession.status === 'paused' ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startStream(currentSession.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Resume
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGoLive}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <Play className="w-5 h-5" />
                      Go Live
                    </motion.button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => archiveSession(currentSession.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                </div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="glossy-card rounded-2xl p-4">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                {[
                  { id: 'player', label: 'Player', icon: Video },
                  { id: 'stats', label: 'Statistics', icon: BarChart3 },
                  { id: 'comments', label: 'Comments', icon: MessageSquare },
                  { id: 'platforms', label: 'Platforms', icon: Globe },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setViewMode(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        viewMode === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Statistics View */}
              {viewMode === 'stats' && sessionStats && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">Total Viewers</div>
                      <div className="text-2xl font-bold text-blue-900">{sessionStats.totalViewers.toLocaleString()}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-green-600 mb-1">Peak Viewers</div>
                      <div className="text-2xl font-bold text-green-900">{sessionStats.peakViewers.toLocaleString()}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-sm text-purple-600 mb-1">Total Comments</div>
                      <div className="text-2xl font-bold text-purple-900">{sessionStats.totalComments}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-sm text-orange-600 mb-1">Duration</div>
                      <div className="text-2xl font-bold text-orange-900">{formatDuration(sessionStats.duration)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                      <div className="text-sm text-indigo-600 mb-1">Subscribers</div>
                      <div className="text-2xl font-bold text-indigo-900">{sessionStats.totalSubscribers}</div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                      <div className="text-sm text-pink-600 mb-1">Followers</div>
                      <div className="text-2xl font-bold text-pink-900">{sessionStats.totalFollowers}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments View */}
              {viewMode === 'comments' && (
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {sessionComments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No comments yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sessionComments.map((comment) => {
                          const platform = SOCIAL_PLATFORMS.find(p => p.id === comment.platform);
                          const Icon = platform?.icon || MessageSquare;
                          return (
                            <div key={comment.id} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`${platform?.color || 'bg-gray-500'} p-1.5 rounded`}>
                                    <Icon className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-semibold text-gray-900">{comment.author}</span>
                                  {comment.isSubscriber && (
                                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                      Subscriber
                                    </span>
                                  )}
                                  {comment.isFollower && (
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                      Follower
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.message}</p>
                              {comment.likes !== undefined && comment.likes > 0 && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comment.likes}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <div ref={commentsEndRef} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                      placeholder="Type a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSendComment}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Platforms View */}
              {viewMode === 'platforms' && (
                <div className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {SOCIAL_PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const config = currentSession ? getPlatformConfig(currentSession.id, platform.id) : null;
                      const isEnabled = config?.enabled || false;
                      const isConnected = config?.connectionStatus === 'connected';
                      
                      return (
                        <div
                          key={platform.id}
                          className={`bg-white rounded-lg p-4 border-2 transition-all cursor-pointer ${
                            isEnabled && isConnected
                              ? 'border-green-500 bg-green-50'
                              : isEnabled
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (currentSession) {
                              setShowPlatformConfig({ sessionId: currentSession.id, platform: platform.id });
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`${platform.color} p-2 rounded-lg`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            {isConnected && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{platform.name}</div>
                          <div className="text-xs text-gray-500">
                            {isConnected ? 'Connected' : isEnabled ? 'Pending' : 'Not configured'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Sessions List & Info */}
          <div className="space-y-6">
            {/* Active Sessions */}
            <div className="glossy-card rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Active Sessions ({activeSessions.length})
              </h3>
              <div className="space-y-2">
                {activeSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No active sessions</p>
                ) : (
                  activeSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedSession === session.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-sm">{session.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {session.currentViewers} viewers • {session.platforms.length} platforms
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subscribers & Followers */}
            {subscribersFollowers.length > 0 && (
              <div className="glossy-card rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Subscribers & Followers ({subscribersFollowers.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {subscribersFollowers.slice(0, 10).map((sub) => {
                    const platform = SOCIAL_PLATFORMS.find(p => p.id === sub.platform);
                    const Icon = platform?.icon || Users;
                    return (
                      <div key={sub.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className={`${platform?.color || 'bg-gray-500'} p-1.5 rounded`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm truncate">{sub.username}</div>
                          <div className="text-xs text-gray-500">{platform?.name}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          sub.type === 'subscriber' ? 'bg-yellow-100 text-yellow-700' :
                          sub.type === 'follower' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {sub.type === 'both' ? 'Both' : sub.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glossy-card rounded-2xl p-12 text-center">
          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No stream session selected</p>
          <p className="text-gray-400 text-sm mb-4">Create a new stream session to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create New Stream
          </button>
        </div>
      )}

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Stream Session</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newSessionData.title}
                    onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter stream title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newSessionData.description}
                    onChange={(e) => setNewSessionData({ ...newSessionData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Enter stream description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Broadcast Channel *</label>
                  <select
                    value={newSessionData.broadcastChannelId}
                    onChange={(e) => setNewSessionData({ ...newSessionData, broadcastChannelId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {channels.map(channel => (
                      <option key={channel.id} value={channel.id}>{channel.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Platforms</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {SOCIAL_PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = newSessionData.platforms.includes(platform.id);
                      return (
                        <button
                          key={platform.id}
                          onClick={() => {
                            if (isSelected) {
                              setNewSessionData({
                                ...newSessionData,
                                platforms: newSessionData.platforms.filter(p => p !== platform.id),
                              });
                            } else {
                              setNewSessionData({
                                ...newSessionData,
                                platforms: [...newSessionData.platforms, platform.id],
                              });
                            }
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`${platform.color} p-2 rounded-lg mb-2`}>
                            <Icon className="w-4 h-4 text-white mx-auto" />
                          </div>
                          <div className="text-xs font-medium text-gray-900">{platform.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Start</label>
                    <input
                      type="datetime-local"
                      value={newSessionData.scheduledStart}
                      onChange={(e) => setNewSessionData({ ...newSessionData, scheduledStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled End</label>
                    <input
                      type="datetime-local"
                      value={newSessionData.scheduledEnd}
                      onChange={(e) => setNewSessionData({ ...newSessionData, scheduledEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSession}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Session
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Configuration Modal */}
      <AnimatePresence>
        {showPlatformConfig && currentSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPlatformConfig(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Configure {SOCIAL_PLATFORMS.find(p => p.id === showPlatformConfig.platform)?.name}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-900">Enable Platform</label>
                  <button
                    onClick={() => {
                      const config = getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform);
                      updatePlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform, {
                        enabled: !config?.enabled,
                      });
                    }}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.enabled
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.enabled
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stream Key</label>
                  <input
                    type="text"
                    value={getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.streamKey || ''}
                    onChange={(e) => updatePlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform, {
                      streamKey: e.target.value,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter stream key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RTMP URL</label>
                  <input
                    type="text"
                    value={getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.rtmpUrl || ''}
                    onChange={(e) => updatePlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform, {
                      rtmpUrl: e.target.value,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="rtmp://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                  <input
                    type="password"
                    value={getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.accessToken || ''}
                    onChange={(e) => updatePlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform, {
                      accessToken: e.target.value,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter access token"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      const config = getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform);
                      if (config?.connectionStatus === 'connected') {
                        disconnectPlatform(showPlatformConfig.sessionId, showPlatformConfig.platform);
                      } else {
                        connectPlatform(showPlatformConfig.sessionId, showPlatformConfig.platform);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.connectionStatus === 'connected'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {getPlatformConfig(showPlatformConfig.sessionId, showPlatformConfig.platform)?.connectionStatus === 'connected'
                      ? 'Disconnect'
                      : 'Connect'}
                  </button>
                  <button
                    onClick={() => setShowPlatformConfig(null)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Close
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
