'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Play, Pause, Square, Download, Settings, Camera, Video, HardDrive,
  Plus, Edit, Trash2, Search, Filter, Eye, X, RefreshCw, MoreVertical,
  Bell, AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff, Activity,
  Clock, Calendar, MapPin, Users, User, Shield, Lock, Unlock, Key, UserCheck,
  Database, Server, CloudDownload, CloudUpload, Archive, Folder, FolderOpen,
  Maximize2, Minimize2, Grid, List, Zap, Target, Crosshair, Film,
  Image, Monitor, Disc, HardDriveDownload, Save, Share2, Send, Copy,
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown, DollarSign,
  Thermometer, Droplets, Wind, Sun, Moon, Sunrise, Sunset, Loader,
  Power, PowerOff, RotateCw, RotateCcw, ZoomIn, ZoomOut, Move,
  Maximize, ScanLine, Radar, Radio, Layers, Layout, Box, Package,
  FileText, Clipboard, BookOpen, ScrollText, MessageSquare, Mail,
  Phone, PhoneCall, Megaphone, Volume2, VolumeX, Mic, MicOff,
  Info, HelpCircle, ExternalLink, Link, Flag, Bookmark, Star, Heart,
  ThumbsUp, Award, Trophy, Medal, Target as TargetIcon, Crosshair as CrosshairIcon,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, History,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

// Enhanced Camera Interface
interface CameraSystem {
  id: number;
  name: string;
  location: string;
  zone: 'entrance' | 'office' | 'studio' | 'parking' | 'warehouse' | 'server_room' | 'reception' | 'corridor';
  status: 'online' | 'offline' | 'error' | 'maintenance';
  streamStatus: 'live' | 'recording' | 'stopped' | 'buffering';
  isPlaying: boolean;
  isRecording: boolean;
  motionDetectionEnabled: boolean;
  motionDetected: boolean;
  lastMotionTime?: Date;
  resolution: '4K' | '1080p' | '720p' | '480p';
  fps: 30 | 60 | 120;
  recordingQuality: 'ultra' | 'high' | 'medium' | 'low';
  storageUsed: number; // in GB
  recordingDuration: number; // in minutes
  lastBackup?: Date;
  temperature: number;
  uptime: number; // in hours
  alerts: CameraAlert[];
  permissions: string[];
  infraredEnabled: boolean;
  audioEnabled: boolean;
  ptzCapable: boolean; // Pan-Tilt-Zoom
  analytics: {
    peopleCount: number;
    faceDetection: boolean;
    licensePlateRecognition: boolean;
    objectDetection: boolean;
  };
}

interface CameraAlert {
  id: string;
  type: 'motion' | 'disconnection' | 'error' | 'storage' | 'tampering' | 'high_temp' | 'low_quality';
  message: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  acknowledged: boolean;
}

interface RecordingEntry {
  id: string;
  cameraId: number;
  cameraName: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  size: number;
  quality: string;
  motionEvents: number;
  downloadUrl: string;
  accessedBy: AccessLog[];
}

interface AccessLog {
  userId: string;
  userName: string;
  userRole: string;
  action: 'view' | 'download' | 'export' | 'delete' | 'configure' | 'playback';
  timestamp: Date;
  ipAddress: string;
  deviceInfo: string;
}

interface SystemSettings {
  autoRecording: boolean;
  motionDetection: boolean;
  continuousRecording: boolean;
  recordingRetention: number; // days
  alertsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  storageLimit: number; // GB
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  videoQuality: 'ultra' | 'high' | 'medium' | 'low';
  streamBitrate: number;
  enableAI: boolean;
  faceRecognition: boolean;
  licensePlateRecognition: boolean;
  objectTracking: boolean;
  heatmapAnalytics: boolean;
  crowdDetection: boolean;
}

// Initial camera data with 16 cameras
const initialCameras: CameraSystem[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  name: `Camera ${i + 1}`,
  location: [
    'Main Entrance', 'Reception Area', 'Studio A', 'Studio B', 'Control Room',
    'Parking Lot North', 'Parking Lot South', 'Server Room', 'Office Floor 1',
    'Office Floor 2', 'Storage Area', 'Corridor A', 'Corridor B', 'Loading Dock',
    'Emergency Exit', 'Rooftop'
  ][i],
  zone: ['entrance', 'reception', 'studio', 'studio', 'office', 'parking', 'parking',
    'server_room', 'office', 'office', 'warehouse', 'corridor', 'corridor',
    'warehouse', 'entrance', 'office'][i] as any,
  status: i === 14 ? 'offline' : i === 15 ? 'error' : 'online',
  streamStatus: i < 4 ? 'live' : i < 10 ? 'recording' : 'stopped',
  isPlaying: i < 4,
  isRecording: i >= 4 && i < 10,
  motionDetectionEnabled: true,
  motionDetected: i === 2 || i === 5 || i === 7,
  lastMotionTime: i === 2 || i === 5 || i === 7 ? new Date(Date.now() - Math.random() * 3600000) : undefined,
  resolution: i < 4 ? '4K' : i < 12 ? '1080p' : '720p',
  fps: i < 6 ? 60 : 30,
  recordingQuality: i < 4 ? 'ultra' : i < 8 ? 'high' : 'medium',
  storageUsed: Math.random() * 100,
  recordingDuration: Math.random() * 480,
  lastBackup: new Date(Date.now() - Math.random() * 86400000),
  temperature: 35 + Math.random() * 15,
  uptime: Math.random() * 720,
  alerts: [],
  permissions: ['view', 'record', 'download', 'configure'],
  infraredEnabled: i % 2 === 0,
  audioEnabled: i < 8,
  ptzCapable: i < 6,
  analytics: {
    peopleCount: Math.floor(Math.random() * 20),
    faceDetection: i < 8,
    licensePlateRecognition: i === 5 || i === 6,
    objectDetection: true,
  },
}));

// Generate alerts for cameras with issues
initialCameras.forEach(camera => {
  if (camera.status === 'offline') {
    camera.alerts.push({
      id: `alert-${camera.id}-1`,
      type: 'disconnection',
      message: `${camera.name} is offline`,
      timestamp: new Date(),
      severity: 'critical',
      acknowledged: false,
    });
  }
  if (camera.status === 'error') {
    camera.alerts.push({
      id: `alert-${camera.id}-2`,
      type: 'error',
      message: `${camera.name} has encountered an error`,
      timestamp: new Date(),
      severity: 'critical',
      acknowledged: false,
    });
  }
  if (camera.motionDetected) {
    camera.alerts.push({
      id: `alert-${camera.id}-3`,
      type: 'motion',
      message: `Motion detected at ${camera.location}`,
      timestamp: camera.lastMotionTime || new Date(),
      severity: 'warning',
      acknowledged: false,
    });
  }
  if (camera.temperature > 45) {
    camera.alerts.push({
      id: `alert-${camera.id}-4`,
      type: 'high_temp',
      message: `High temperature detected: ${camera.temperature.toFixed(1)}°C`,
      timestamp: new Date(),
      severity: 'warning',
      acknowledged: false,
    });
  }
  if (camera.storageUsed > 80) {
    camera.alerts.push({
      id: `alert-${camera.id}-5`,
      type: 'storage',
      message: `Storage usage critical: ${camera.storageUsed.toFixed(1)}%`,
      timestamp: new Date(),
      severity: 'warning',
      acknowledged: false,
    });
  }
});

export default function CCTVPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  // State management
  const [cameras, setCameras] = useState<CameraSystem[]>(initialCameras);
  const [selectedCamera, setSelectedCamera] = useState<CameraSystem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'fullscreen' | 'split'>('grid');
  const [gridLayout, setGridLayout] = useState<4 | 6 | 9 | 16>(16);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showBackupSettings, setShowBackupSettings] = useState(false);
  const [showCameraDetails, setShowCameraDetails] = useState(false);
  const [showRecordings, setShowRecordings] = useState(false);
  const [showAccessLogs, setShowAccessLogs] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showStorageManager, setShowStorageManager] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'recordings' | 'alerts' | 'analytics' | 'logs'>('overview');
  const [detailsTab, setDetailsTab] = useState<'info' | 'settings' | 'recordings' | 'analytics' | 'history'>('info');

  // System settings
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoRecording: true,
    motionDetection: true,
    continuousRecording: false,
    recordingRetention: 30,
    alertsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    storageLimit: 1000,
    backupFrequency: 'daily',
    videoQuality: 'high',
    streamBitrate: 4000,
    enableAI: true,
    faceRecognition: true,
    licensePlateRecognition: true,
    objectTracking: true,
    heatmapAnalytics: false,
    crowdDetection: true,
  });

  // Mock recordings data
  const recordings: RecordingEntry[] = Array.from({ length: 50 }, (_, i) => ({
    id: `rec-${i + 1}`,
    cameraId: (i % 16) + 1,
    cameraName: `Camera ${(i % 16) + 1}`,
    startTime: new Date(Date.now() - Math.random() * 86400000 * 7),
    endTime: new Date(Date.now() - Math.random() * 86400000 * 7 + 3600000),
    duration: Math.floor(Math.random() * 120) + 10,
    size: Math.random() * 5,
    quality: ['ultra', 'high', 'medium'][Math.floor(Math.random() * 3)],
    motionEvents: Math.floor(Math.random() * 20),
    downloadUrl: '#',
    accessedBy: [
      {
        userId: user?.id || 'user1',
        userName: user?.name || 'Admin User',
        userRole: 'Administrator',
        action: 'view',
        timestamp: new Date(),
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        deviceInfo: 'Windows PC - Chrome',
      },
    ],
  }));

  // Statistics
  const statistics = useMemo(() => {
    const online = cameras.filter(c => c.status === 'online').length;
    const offline = cameras.filter(c => c.status === 'offline').length;
    const recording = cameras.filter(c => c.isRecording).length;
    const motionDetected = cameras.filter(c => c.motionDetected).length;
    const totalAlerts = cameras.reduce((acc, cam) => acc + cam.alerts.filter(a => !a.acknowledged).length, 0);
    const criticalAlerts = cameras.reduce((acc, cam) => acc + cam.alerts.filter(a => !a.acknowledged && a.severity === 'critical').length, 0);
    const totalStorage = cameras.reduce((acc, cam) => acc + cam.storageUsed, 0);
    const avgUptime = cameras.reduce((acc, cam) => acc + cam.uptime, 0) / cameras.length;

    return {
      total: cameras.length,
      online,
      offline,
      recording,
      motionDetected,
      totalAlerts,
      criticalAlerts,
      totalStorage: totalStorage.toFixed(2),
      avgUptime: avgUptime.toFixed(1),
      storageUsedPercent: ((totalStorage / (cameras.length * 100)) * 100).toFixed(1),
    };
  }, [cameras]);

  // Filtered cameras
  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           cam.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesZone = filterZone === 'all' || cam.zone === filterZone;
      const matchesStatus = filterStatus === 'all' || cam.status === filterStatus;
      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [cameras, searchQuery, filterZone, filterStatus]);

  // Camera control handlers
  const handlePlay = (id: number) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === id ? { ...cam, isPlaying: true, streamStatus: 'live' } : cam
      )
    );
    logAccess(id, 'view');
  };

  const handlePause = (id: number) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === id ? { ...cam, isPlaying: false } : cam
      )
    );
  };

  const handleRecord = (id: number) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === id
          ? { ...cam, isRecording: !cam.isRecording, streamStatus: cam.isRecording ? 'stopped' : 'recording' }
          : cam
      )
    );
    logAccess(id, 'record');
  };

  const handleStop = (id: number) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === id
          ? { ...cam, isPlaying: false, isRecording: false, streamStatus: 'stopped' }
          : cam
      )
    );
  };

  const handleDownload = (id: number) => {
    alert(`Downloading recordings from Camera ${id}...`);
    logAccess(id, 'download');
  };

  const toggleMotionDetection = (id: number) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === id
          ? { ...cam, motionDetectionEnabled: !cam.motionDetectionEnabled }
          : cam
      )
    );
    logAccess(id, 'configure');
  };

  const acknowledgeAlert = (cameraId: number, alertId: string) => {
    setCameras(prev =>
      prev.map(cam =>
        cam.id === cameraId
          ? {
              ...cam,
              alerts: cam.alerts.map(alert =>
                alert.id === alertId ? { ...alert, acknowledged: true } : alert
              ),
            }
          : cam
      )
    );
  };

  const logAccess = (cameraId: number, action: AccessLog['action']) => {
    const camera = cameras.find(c => c.id === cameraId);
    console.log(`Access Log: User ${user?.name} performed ${action} on ${camera?.name} at ${new Date().toISOString()}`);
    // In a real application, this would send to the backend
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCameras(prev =>
        prev.map(cam => ({
          ...cam,
          uptime: cam.status === 'online' ? cam.uptime + 0.01 : cam.uptime,
          temperature: cam.status === 'online'
            ? Math.max(30, Math.min(50, cam.temperature + (Math.random() - 0.5) * 0.5))
            : cam.temperature,
          analytics: {
            ...cam.analytics,
            peopleCount: cam.status === 'online' && cam.isPlaying
              ? Math.max(0, cam.analytics.peopleCount + Math.floor(Math.random() * 3 - 1))
              : cam.analytics.peopleCount,
          },
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CCTV Monitoring System</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all CCTV cameras</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            <Settings className="w-5 h-5" />
            Camera Settings
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowBackupSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
          >
            <HardDrive className="w-5 h-5" />
            Backup Settings
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAlerts(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Bell className="w-5 h-5" />
            Alerts
            {statistics.criticalAlerts > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
                {statistics.criticalAlerts}
              </span>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAccessLogs(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-lg"
          >
            <Shield className="w-5 h-5" />
            Access Logs
          </motion.button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {[
          { label: 'Total Cameras', value: statistics.total, icon: Camera, color: 'bg-blue-500', trend: null },
          { label: 'Online', value: statistics.online, icon: CheckCircle, color: 'bg-green-500', trend: 'up' },
          { label: 'Offline', value: statistics.offline, icon: XCircle, color: 'bg-red-500', trend: 'down', alert: statistics.offline > 0 },
          { label: 'Recording', value: statistics.recording, icon: Video, color: 'bg-purple-500', trend: 'stable' },
          { label: 'Motion Detected', value: statistics.motionDetected, icon: Activity, color: 'bg-yellow-500', trend: null },
          { label: 'Total Alerts', value: statistics.totalAlerts, icon: AlertTriangle, color: 'bg-orange-500', trend: null, alert: statistics.totalAlerts > 0 },
          { label: 'Storage Used', value: `${statistics.storageUsedPercent}%`, icon: Database, color: 'bg-indigo-500', trend: 'up' },
          { label: 'Avg Uptime', value: `${statistics.avgUptime}h`, icon: Clock, color: 'bg-teal-500', trend: 'up' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glossy-card rounded-2xl p-4 ${stat.alert ? 'ring-2 ring-red-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {stat.trend && (
                  <div className={`text-xs font-semibold ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
                  </div>
                )}
              </div>
              <h3 className="text-gray-500 text-xs mb-1">{stat.label}</h3>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: Monitor },
            { id: 'recordings', label: 'Recordings', icon: Film },
            { id: 'alerts', label: 'Alerts', icon: Bell, badge: statistics.totalAlerts },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'logs', label: 'Access Logs', icon: ScrollText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
            title="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-2 rounded-lg ${viewMode === 'split' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
            title="Split View"
          >
            <Layout className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Zones</option>
              <option value="entrance">Entrance</option>
              <option value="office">Office</option>
              <option value="studio">Studio</option>
              <option value="parking">Parking</option>
              <option value="warehouse">Warehouse</option>
              <option value="server_room">Server Room</option>
              <option value="reception">Reception</option>
              <option value="corridor">Corridor</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="error">Error</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={gridLayout}
              onChange={(e) => setGridLayout(Number(e.target.value) as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="4">2x2 Grid</option>
              <option value="6">2x3 Grid</option>
              <option value="9">3x3 Grid</option>
              <option value="16">4x4 Grid</option>
            </select>
            <button
              onClick={() => {
                setCameras(initialCameras);
                alert('System refreshed');
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Camera Grid */}
          <div className={`grid gap-6 ${
            gridLayout === 4 ? 'grid-cols-1 md:grid-cols-2' :
            gridLayout === 6 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            gridLayout === 9 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredCameras.slice(0, gridLayout).map((camera, index) => (
              <motion.div
                key={camera.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl ${
                  selectedCamera?.id === camera.id ? 'ring-4 ring-primary-500' : ''
                } ${camera.status === 'offline' || camera.status === 'error' ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => setSelectedCamera(camera)}
              >
                {/* Camera Feed */}
                <div className="relative aspect-video bg-black flex items-center justify-center">
                  {camera.isPlaying && camera.status === 'online' ? (
                    <>
                      <motion.div
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                  ) : null}
                  
                  {camera.status === 'offline' ? (
                    <div className="text-center">
                      <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-2" />
                      <p className="text-white font-semibold">Camera Offline</p>
                    </div>
                  ) : camera.status === 'error' ? (
                    <div className="text-center">
                      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-2" />
                      <p className="text-white font-semibold">Camera Error</p>
                    </div>
                  ) : (
                    <Camera className="w-16 h-16 text-gray-600" />
                  )}
                  
                  {/* Status Indicators */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm ${
                        camera.streamStatus === 'live'
                          ? 'bg-red-500/90 text-white animate-pulse'
                          : camera.streamStatus === 'recording'
                          ? 'bg-yellow-500/90 text-white'
                          : 'bg-gray-600/90 text-white'
                      }`}
                    >
                      {camera.streamStatus.toUpperCase()}
                    </span>
                    {camera.motionDetected && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="px-2 py-1 rounded text-xs font-semibold bg-red-500/90 text-white backdrop-blur-sm flex items-center gap-1"
                      >
                        <Activity className="w-3 h-3" />
                        MOTION
                      </motion.span>
                    )}
                  </div>

                  {/* Top Right Indicators */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {camera.resolution === '4K' && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-500/90 text-white backdrop-blur-sm">
                        4K
                      </span>
                    )}
                    {camera.infraredEnabled && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/90 text-white backdrop-blur-sm">
                        IR
                      </span>
                    )}
                    {camera.audioEnabled && (
                      <Volume2 className="w-5 h-5 text-white drop-shadow-lg" />
                    )}
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-white font-semibold drop-shadow-lg text-sm">{camera.name}</div>
                    <div className="text-gray-300 text-xs">{camera.location}</div>
                    {camera.analytics.peopleCount > 0 && camera.isPlaying && (
                      <div className="text-white text-xs mt-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {camera.analytics.peopleCount} people detected
                      </div>
                    )}
                  </div>

                  {/* PTZ Control Overlay */}
                  {camera.ptzCapable && camera.isPlaying && (
                    <div className="absolute bottom-14 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                      <div className="grid grid-cols-3 gap-1">
                        <button className="p-1 hover:bg-white/20 rounded"><ChevronUp className="w-3 h-3 text-white" /></button>
                        <div></div>
                        <div></div>
                        <button className="p-1 hover:bg-white/20 rounded"><ChevronLeft className="w-3 h-3 text-white" /></button>
                        <button className="p-1 hover:bg-white/20 rounded"><Target className="w-3 h-3 text-white" /></button>
                        <button className="p-1 hover:bg-white/20 rounded"><ChevronRight className="w-3 h-3 text-white" /></button>
                        <div></div>
                        <button className="p-1 hover:bg-white/20 rounded"><ChevronDown className="w-3 h-3 text-white" /></button>
                        <div></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="p-3 bg-gray-800/90 backdrop-blur-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {!camera.isPlaying ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(camera.id);
                        }}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-lg"
                        disabled={camera.status !== 'online'}
                      >
                        <Play className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePause(camera.id);
                        }}
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-lg"
                      >
                        <Pause className="w-4 h-4" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecord(camera.id);
                      }}
                      className={`p-2 rounded-lg ${
                        camera.isRecording
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-gray-600 hover:bg-gray-700'
                      } text-white shadow-lg`}
                      disabled={camera.status !== 'online'}
                    >
                      <Video className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStop(camera.id);
                      }}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg"
                    >
                      <Square className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(camera.id);
                      }}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMotionDetection(camera.id);
                      }}
                      className={`p-2 rounded-lg ${
                        camera.motionDetectionEnabled
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-600 text-white'
                      } shadow-lg`}
                      title="Motion Detection"
                    >
                      <Radar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCamera(camera);
                        setShowCameraDetails(true);
                      }}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg"
                      title="Camera Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    {camera.alerts.filter(a => !a.acknowledged).length > 0 && (
                      <button
                        className="relative p-2 bg-red-500 text-white rounded-lg animate-pulse"
                        title={`${camera.alerts.filter(a => !a.acknowledged).length} alerts`}
                      >
                        <Bell className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 bg-white text-red-500 text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {camera.alerts.filter(a => !a.acknowledged).length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Storage & Temperature Bar */}
                <div className="px-3 pb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      {camera.storageUsed.toFixed(1)} GB
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {camera.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        camera.storageUsed > 80 ? 'bg-red-500' :
                        camera.storageUsed > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(camera.storageUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Recordings Tab */}
      {activeTab === 'recordings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recorded Footage</h2>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>All Cameras</option>
                {cameras.map(cam => (
                  <option key={cam.id} value={cam.id}>{cam.name}</option>
                ))}
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.slice(0, 12).map((recording) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glossy-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{recording.cameraName}</h3>
                    <p className="text-sm text-gray-500">{formatDate(recording.startTime)}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold">
                    {recording.quality}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-semibold ml-1">{formatDuration(recording.duration)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <span className="font-semibold ml-1">{recording.size.toFixed(2)} GB</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Motion Events:</span>
                    <span className="font-semibold ml-1">{recording.motionEvents}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm">
                    <Play className="w-4 h-4 inline mr-1" />
                    Play
                  </button>
                  <button
                    onClick={() => logAccess(recording.cameraId, 'download')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Accessed by {recording.accessedBy.length} user(s)
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {cameras.flatMap(cam =>
            cam.alerts.filter(a => !a.acknowledged).map(alert => ({
              ...alert,
              camera: cam,
            }))
          ).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glossy-card rounded-xl p-4 border-l-4 ${
                alert.severity === 'critical' ? 'border-red-500' :
                alert.severity === 'warning' ? 'border-yellow-500' : 'border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {alert.type === 'disconnection' ? <WifiOff className="w-5 h-5 text-red-500 mt-0.5" /> :
                   alert.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" /> :
                   alert.type === 'motion' ? <Activity className="w-5 h-5 text-yellow-500 mt-0.5" /> :
                   alert.type === 'high_temp' ? <Thermometer className="w-5 h-5 text-orange-500 mt-0.5" /> :
                   <Bell className="w-5 h-5 text-blue-500 mt-0.5" />}
                  <div className="flex-1">
                    <h3 className="font-semibold">{alert.message}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.camera.name} - {alert.camera.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(alert.timestamp)}</p>
                  </div>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.camera.id, alert.id)}
                  className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glossy-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Camera Uptime</h3>
              <div className="space-y-3">
                {cameras.slice(0, 5).map(cam => (
                  <div key={cam.id}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{cam.name}</span>
                      <span className="font-semibold">{cam.uptime.toFixed(0)}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min((cam.uptime / 720) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glossy-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Motion Detection Events</h3>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {recordings.reduce((acc, rec) => acc + rec.motionEvents, 0)}
                </div>
                <div className="text-gray-500">Total Events (7 days)</div>
              </div>
            </div>

            <div className="glossy-card rounded-xl p-6">
              <h3 className="font-semibold mb-4">Storage Usage</h3>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {statistics.totalStorage} GB
                </div>
                <div className="text-gray-500">of {systemSettings.storageLimit} GB</div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                  <div
                    className={`h-3 rounded-full ${
                      Number(statistics.storageUsedPercent) > 80 ? 'bg-red-500' :
                      Number(statistics.storageUsedPercent) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${statistics.storageUsedPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* People Count Heatmap */}
          <div className="glossy-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Live People Detection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {cameras.filter(c => c.analytics.peopleCount > 0).map(cam => (
                <div key={cam.id} className="text-center p-3 bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{cam.analytics.peopleCount}</div>
                  <div className="text-xs text-gray-600 mt-1">{cam.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Access Logs Tab */}
      {activeTab === 'logs' && (
        <div className="glossy-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Access Logs</h2>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 font-semibold">Timestamp</th>
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Action</th>
                  <th className="p-3 font-semibold">Camera</th>
                  <th className="p-3 font-semibold">IP Address</th>
                  <th className="p-3 font-semibold">Device</th>
                </tr>
              </thead>
              <tbody>
                {recordings.flatMap(rec =>
                  rec.accessedBy.map((access, idx) => (
                    <tr key={`${rec.id}-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{formatDate(access.timestamp)}</td>
                      <td className="p-3 font-medium">{access.userName}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {access.userRole}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          access.action === 'view' ? 'bg-green-100 text-green-700' :
                          access.action === 'download' ? 'bg-blue-100 text-blue-700' :
                          access.action === 'delete' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {access.action}
                        </span>
                      </td>
                      <td className="p-3">{rec.cameraName}</td>
                      <td className="p-3 text-sm text-gray-600">{access.ipAddress}</td>
                      <td className="p-3 text-sm text-gray-600">{access.deviceInfo}</td>
                    </tr>
                  ))
                ).slice(0, 20)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Camera Details Modal */}
      <AnimatePresence>
        {showCameraDetails && selectedCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCameraDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedCamera.name}</h2>
                <button
                  onClick={() => setShowCameraDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-b border-gray-200 mb-6">
                <div className="flex items-center gap-4">
                  {['info', 'settings', 'recordings', 'analytics', 'history'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailsTab(tab as any)}
                      className={`px-4 py-2 border-b-2 capitalize ${
                        detailsTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {detailsTab === 'info' && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Camera Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedCamera.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium capitalize">{selectedCamera.zone.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${
                          selectedCamera.status === 'online' ? 'text-green-600' :
                          selectedCamera.status === 'offline' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {selectedCamera.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolution:</span>
                        <span className="font-medium">{selectedCamera.resolution}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">FPS:</span>
                        <span className="font-medium">{selectedCamera.fps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PTZ Capable:</span>
                        <span className="font-medium">{selectedCamera.ptzCapable ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Features</h3>
                    <div className="space-y-2">
                      {[
                        { label: 'Motion Detection', enabled: selectedCamera.motionDetectionEnabled },
                        { label: 'Infrared Night Vision', enabled: selectedCamera.infraredEnabled },
                        { label: 'Audio Recording', enabled: selectedCamera.audioEnabled },
                        { label: 'Face Detection', enabled: selectedCamera.analytics.faceDetection },
                        { label: 'License Plate Recognition', enabled: selectedCamera.analytics.licensePlateRecognition },
                        { label: 'Object Detection', enabled: selectedCamera.analytics.objectDetection },
                      ].map((feature) => (
                        <div key={feature.label} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{feature.label}</span>
                          {feature.enabled ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <h3 className="font-semibold mb-3">System Health</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Storage Used</div>
                        <div className="text-2xl font-bold text-blue-600">{selectedCamera.storageUsed.toFixed(1)} GB</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Uptime</div>
                        <div className="text-2xl font-bold text-green-600">{selectedCamera.uptime.toFixed(0)}h</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Temperature</div>
                        <div className="text-2xl font-bold text-orange-600">{selectedCamera.temperature.toFixed(1)}°C</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailsTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Camera Settings</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Enable Motion Detection', checked: selectedCamera.motionDetectionEnabled },
                      { label: 'Enable Audio Recording', checked: selectedCamera.audioEnabled },
                      { label: 'Enable Infrared Night Vision', checked: selectedCamera.infraredEnabled },
                      { label: 'Enable Face Detection', checked: selectedCamera.analytics.faceDetection },
                      { label: 'Enable Object Tracking', checked: selectedCamera.analytics.objectDetection },
                    ].map((setting, idx) => (
                      <label key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <span>{setting.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={setting.checked}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="pt-4">
                    <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Save Settings
                    </button>
                  </div>
                </div>
              )}

              {detailsTab === 'recordings' && (
                <div>
                  <h3 className="font-semibold mb-4">Recent Recordings</h3>
                  <div className="space-y-3">
                    {recordings.filter(r => r.cameraId === selectedCamera.id).slice(0, 5).map(rec => (
                      <div key={rec.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium">{formatDate(rec.startTime)}</div>
                          <div className="text-sm text-gray-500">Duration: {formatDuration(rec.duration)} • Size: {rec.size.toFixed(2)} GB</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Play className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">System Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Recording Settings</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Auto Recording', key: 'autoRecording' },
                      { label: 'Continuous Recording', key: 'continuousRecording' },
                      { label: 'Motion Detection', key: 'motionDetection' },
                    ].map((setting) => (
                      <label key={setting.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <span>{setting.label}</span>
                        <input
                          type="checkbox"
                          checked={systemSettings[setting.key as keyof SystemSettings] as boolean}
                          onChange={(e) =>
                            setSystemSettings(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">AI Features</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Enable AI Analytics', key: 'enableAI' },
                      { label: 'Face Recognition', key: 'faceRecognition' },
                      { label: 'License Plate Recognition', key: 'licensePlateRecognition' },
                      { label: 'Object Tracking', key: 'objectTracking' },
                      { label: 'Crowd Detection', key: 'crowdDetection' },
                      { label: 'Heatmap Analytics', key: 'heatmapAnalytics' },
                    ].map((setting) => (
                      <label key={setting.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <span>{setting.label}</span>
                        <input
                          type="checkbox"
                          checked={systemSettings[setting.key as keyof SystemSettings] as boolean}
                          onChange={(e) =>
                            setSystemSettings(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Enable Alerts', key: 'alertsEnabled' },
                      { label: 'Email Notifications', key: 'emailNotifications' },
                      { label: 'SMS Notifications', key: 'smsNotifications' },
                      { label: 'Push Notifications', key: 'pushNotifications' },
                    ].map((setting) => (
                      <label key={setting.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <span>{setting.label}</span>
                        <input
                          type="checkbox"
                          checked={systemSettings[setting.key as keyof SystemSettings] as boolean}
                          onChange={(e) =>
                            setSystemSettings(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked,
                            }))
                          }
                          className="w-5 h-5 text-primary-600 rounded-lg focus:ring-primary-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      alert('Settings saved successfully!');
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Save All Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup Settings Modal */}
      <AnimatePresence>
        {showBackupSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBackupSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Backup & Storage Settings</h2>
                <button
                  onClick={() => setShowBackupSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Backup Schedule */}
                <div className="glossy-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-600" />
                    Backup Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        value={systemSettings.backupFrequency}
                        onChange={(e) =>
                          setSystemSettings(prev => ({
                            ...prev,
                            backupFrequency: e.target.value as any,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period</label>
                      <select
                        value={systemSettings.recordingRetention}
                        onChange={(e) =>
                          setSystemSettings(prev => ({
                            ...prev,
                            recordingRetention: Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="7">7 Days</option>
                        <option value="14">14 Days</option>
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                        <option value="365">1 Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm">Auto-delete recordings after retention period</span>
                    </label>
                  </div>
                </div>

                {/* Storage Configuration */}
                <div className="glossy-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary-600" />
                    Storage Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Storage Limit (GB)</label>
                      <input
                        type="number"
                        value={systemSettings.storageLimit}
                        onChange={(e) =>
                          setSystemSettings(prev => ({
                            ...prev,
                            storageLimit: Number(e.target.value),
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Used Storage</div>
                        <div className="text-2xl font-bold text-blue-600">{statistics.totalStorage} GB</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Available</div>
                        <div className="text-2xl font-bold text-green-600">
                          {(systemSettings.storageLimit - Number(statistics.totalStorage)).toFixed(2)} GB
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Usage</div>
                        <div className="text-2xl font-bold text-purple-600">{statistics.storageUsedPercent}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Backup Locations */}
                <div className="glossy-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary-600" />
                    Backup Locations
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Primary Server', path: '/mnt/cctv-storage-01', status: 'active', size: '245 GB' },
                      { name: 'Secondary Server', path: '/mnt/cctv-storage-02', status: 'active', size: '178 GB' },
                      { name: 'Cloud Backup', path: 'AWS S3 Bucket', status: 'syncing', size: '423 GB' },
                      { name: 'Local NAS', path: '//192.168.1.100/cctv-backup', status: 'active', size: '312 GB' },
                    ].map((location, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <HardDrive className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium">{location.name}</div>
                            <div className="text-xs text-gray-500">{location.path}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">{location.size}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            location.status === 'active' ? 'bg-green-100 text-green-700' :
                            location.status === 'syncing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {location.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Backup Location
                  </button>
                </div>

                {/* Backup History */}
                <div className="glossy-card rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary-600" />
                    Recent Backups
                  </h3>
                  <div className="space-y-2">
                    {[
                      { time: new Date(Date.now() - 3600000), status: 'success', size: '45.2 GB', duration: '12m 34s' },
                      { time: new Date(Date.now() - 86400000), status: 'success', size: '43.8 GB', duration: '11m 52s' },
                      { time: new Date(Date.now() - 172800000), status: 'success', size: '44.1 GB', duration: '12m 18s' },
                      { time: new Date(Date.now() - 259200000), status: 'partial', size: '38.9 GB', duration: '10m 45s' },
                    ].map((backup, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {backup.status === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <div>
                            <div className="text-sm font-medium">{formatDate(backup.time)}</div>
                            <div className="text-xs text-gray-500">
                              {backup.size} • Duration: {backup.duration}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => alert('Starting manual backup...')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <CloudUpload className="w-5 h-5" />
                    Backup Now
                  </button>
                  <button
                    onClick={() => alert('Opening restore wizard...')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <CloudDownload className="w-5 h-5" />
                    Restore
                  </button>
                  <button
                    onClick={() => alert('Verifying backup integrity...')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify Backups
                  </button>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      alert('Backup settings saved successfully!');
                      setShowBackupSettings(false);
                    }}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alerts Modal */}
      <AnimatePresence>
        {showAlerts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAlerts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">System Alerts</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {statistics.totalAlerts} unacknowledged alert(s) • {statistics.criticalAlerts} critical
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      cameras.forEach(cam => {
                        cam.alerts.forEach(alert => {
                          acknowledgeAlert(cam.id, alert.id);
                        });
                      });
                      alert('All alerts acknowledged');
                    }}
                    className="px-3 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                  >
                    Acknowledge All
                  </button>
                  <button
                    onClick={() => setShowAlerts(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Alert Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Critical', count: statistics.criticalAlerts, color: 'bg-red-500', icon: AlertTriangle },
                  { label: 'Warnings', count: statistics.totalAlerts - statistics.criticalAlerts, color: 'bg-yellow-500', icon: Bell },
                  { label: 'Motion Events', count: statistics.motionDetected, color: 'bg-blue-500', icon: Activity },
                  { label: 'Offline Cameras', count: statistics.offline, color: 'bg-gray-500', icon: WifiOff },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="glossy-card rounded-xl p-4">
                      <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                      <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 mb-4">
                <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">
                  All Alerts
                </button>
                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Critical Only
                </button>
                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Motion Detected
                </button>
                <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  System Errors
                </button>
              </div>

              {/* Alerts List */}
              <div className="space-y-3">
                {cameras.flatMap(cam =>
                  cam.alerts.filter(a => !a.acknowledged).map(alert => ({
                    ...alert,
                    camera: cam,
                  }))
                ).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glossy-card rounded-xl p-4 border-l-4 ${
                      alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {alert.type === 'disconnection' ? <WifiOff className="w-6 h-6 text-red-500 mt-0.5" /> :
                         alert.type === 'error' ? <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5" /> :
                         alert.type === 'motion' ? <Activity className="w-6 h-6 text-yellow-500 mt-0.5" /> :
                         alert.type === 'high_temp' ? <Thermometer className="w-6 h-6 text-orange-500 mt-0.5" /> :
                         alert.type === 'storage' ? <Database className="w-6 h-6 text-purple-500 mt-0.5" /> :
                         alert.type === 'tampering' ? <Shield className="w-6 h-6 text-red-500 mt-0.5" /> :
                         <Bell className="w-6 h-6 text-blue-500 mt-0.5" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{alert.message}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                              alert.severity === 'critical' ? 'bg-red-500 text-white' :
                              alert.severity === 'warning' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Camera className="w-4 h-4" />
                              {alert.camera.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {alert.camera.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDate(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCamera(alert.camera);
                            setShowAlerts(false);
                            setShowCameraDetails(true);
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Eye className="w-4 h-4 inline mr-1" />
                          View Camera
                        </button>
                        <button
                          onClick={() => acknowledgeAlert(alert.camera.id, alert.id)}
                          className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {cameras.flatMap(cam => cam.alerts.filter(a => !a.acknowledged)).length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">No active alerts. System running smoothly!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Access Logs Modal */}
      <AnimatePresence>
        {showAccessLogs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAccessLogs(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Access Logs & Audit Trail</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete history of all user actions and system access
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Exporting access logs...')}
                    className="flex items-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export Logs
                  </button>
                  <button
                    onClick={() => setShowAccessLogs(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-[300px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>All Actions</option>
                  <option>View</option>
                  <option>Download</option>
                  <option>Export</option>
                  <option>Delete</option>
                  <option>Configure</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>All Users</option>
                  <option>Administrators</option>
                  <option>Security Team</option>
                  <option>Operators</option>
                  <option>Viewers</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {[
                  { label: 'Total Access', count: recordings.flatMap(r => r.accessedBy).length, icon: Eye, color: 'bg-blue-500' },
                  { label: 'View Actions', count: recordings.flatMap(r => r.accessedBy.filter(a => a.action === 'view')).length, icon: Eye, color: 'bg-green-500' },
                  { label: 'Downloads', count: recordings.flatMap(r => r.accessedBy.filter(a => a.action === 'download')).length, icon: Download, color: 'bg-purple-500' },
                  { label: 'Configurations', count: Math.floor(Math.random() * 50), icon: Settings, color: 'bg-orange-500' },
                  { label: 'Unique Users', count: new Set(recordings.flatMap(r => r.accessedBy.map(a => a.userId))).size, icon: Users, color: 'bg-indigo-500' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="glossy-card rounded-xl p-4">
                      <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                      <div className="text-xl font-bold text-gray-900">{stat.count}</div>
                    </div>
                  );
                })}
              </div>

              {/* Logs Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-sm">Timestamp</th>
                        <th className="text-left p-3 font-semibold text-sm">User</th>
                        <th className="text-left p-3 font-semibold text-sm">Role</th>
                        <th className="text-left p-3 font-semibold text-sm">Action</th>
                        <th className="text-left p-3 font-semibold text-sm">Resource</th>
                        <th className="text-left p-3 font-semibold text-sm">IP Address</th>
                        <th className="text-left p-3 font-semibold text-sm">Device</th>
                        <th className="text-left p-3 font-semibold text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recordings.flatMap(rec =>
                        rec.accessedBy.map((access, idx) => (
                          <tr key={`${rec.id}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 text-sm whitespace-nowrap">{formatDate(access.timestamp)}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary-600" />
                                </div>
                                <span className="font-medium text-sm">{access.userName}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-semibold">
                                {access.userRole}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 text-xs rounded font-semibold ${
                                access.action === 'view' ? 'bg-green-100 text-green-700' :
                                access.action === 'download' ? 'bg-blue-100 text-blue-700' :
                                access.action === 'delete' ? 'bg-red-100 text-red-700' :
                                access.action === 'configure' ? 'bg-purple-100 text-purple-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {access.action}
                              </span>
                            </td>
                            <td className="p-3 text-sm">{rec.cameraName}</td>
                            <td className="p-3 text-sm text-gray-600 font-mono">{access.ipAddress}</td>
                            <td className="p-3 text-sm text-gray-600">{access.deviceInfo}</td>
                            <td className="p-3">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </td>
                          </tr>
                        ))
                      ).slice(0, 50)}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Showing 1-50 of {recordings.flatMap(r => r.accessedBy).length} entries
                </p>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm">1</button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">2</button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">3</button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    Next
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
