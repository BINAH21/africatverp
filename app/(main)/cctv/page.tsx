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
  ThumbsUp, Award, Trophy, Medal, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, History,
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
... (file continues unchanged)