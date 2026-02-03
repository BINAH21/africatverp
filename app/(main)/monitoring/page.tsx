'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Monitor, Eye, AlertCircle, CheckCircle,
  Activity, Cpu, MemoryStick, HardDrive,
  Network, Server, Zap, Radio, Signal,
  Settings, RefreshCw, Search,
  BarChart3, Power,
  ChevronDown, ChevronUp,
  History,
  Video,
} from 'lucide-react';
import {
  useTransmissionStore,
  TransmissionAlert,
  AlertSeverity,
} from '@/lib/transmission-store';
import {
  useBroadcastStore,
  BroadcastError,
  BlackScreenDetection,
  Notification as BroadcastNotification,
} from '@/lib/broadcast-store';
import {
  useLiveStreamingStore,
  LiveStreamSession,
  StreamStatus,
} from '@/lib/live-streaming-store';
import { useAppStore } from '@/lib/store';

const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const getSeverityColor = (severity: AlertSeverity | string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
    case 'live':
    case 'active':
    case 'connected':
    case 'healthy':
      return 'bg-green-500';
    case 'offline':
    case 'stopped':
    case 'inactive':
    case 'disconnected':
    case 'unhealthy':
      return 'bg-gray-500';
    case 'standby':
    case 'paused':
    case 'warning':
      return 'bg-yellow-500';
    case 'error':
    case 'failed':
    case 'critical':
      return 'bg-red-500';
    case 'maintenance':
      return 'bg-blue-500';
    default:
      return 'bg-gray-400';
  }
};

export default function MonitoringPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();

  // Transmission store
  const {
    transmitters,
    channels: transmissionChannels,
    antennas,
    alerts: transmissionAlerts,
    getActiveTransmitters,
    getActiveChannels,
    getActiveAlerts,
  } = useTransmissionStore();

  // Broadcast store
  const {
    channels: broadcastChannels,
    blackScreenDetections,
    errors: broadcastErrors,
    notifications: broadcastNotifications,
    getActiveBlackScreens,
    getActiveErrors,
    getUnreadNotifications,
  } = useBroadcastStore();

  // Live streaming store
  const {
    sessions: liveStreamSessions,
    activeSession,
    getActiveSessions,
  } = useLiveStreamingStore();

  // State management
  const [viewMode, setViewMode] = useState<'overview' | 'alerts' | 'systems' | 'performance' | 'logs'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'alerts', 'systems']));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterSystem, setFilterSystem] = useState<'all' | 'transmission' | 'broadcast' | 'streaming' | 'system'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  // Computed values
  const activeTransmitters = useMemo(() => getActiveTransmitters(), [getActiveTransmitters]);
  const activeTransmissionChannels = useMemo(() => getActiveChannels(), [getActiveChannels]);
  const activeTransmissionAlerts = useMemo(() => getActiveAlerts(), [getActiveAlerts]);
  const activeBlackScreens = useMemo(() => getActiveBlackScreens(), [getActiveBlackScreens]);
  const activeBroadcastErrors = useMemo(() => getActiveErrors(), [getActiveErrors]);
  const activeLiveStreams = useMemo(() => getActiveSessions(), [getActiveSessions]);
  const unreadBroadcastNotifications = useMemo(() => getUnreadNotifications('admin'), [getUnreadNotifications]);

  // Aggregate all alerts
  const allAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      type: string;
      severity: AlertSeverity;
      message: string;
      system: 'transmission' | 'broadcast' | 'streaming' | 'system';
      timestamp: Date;
      resolved: boolean;
      sourceId?: string;
    }> = [];

    // Transmission alerts
    transmissionAlerts.forEach(alert => {
      if (!alert.resolved) {
        alerts.push({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          system: 'transmission',
          timestamp: alert.detectedAt,
          resolved: alert.resolved,
          sourceId: alert.transmitterId || alert.channelId || alert.antennaId,
        });
      }
    });

    // Broadcast errors
    broadcastErrors.forEach(error => {
      if (!error.resolvedAt) {
        alerts.push({
          id: error.id,
          type: error.type,
          severity: error.severity,
          message: error.description,
          system: 'broadcast',
          timestamp: error.detectedAt,
          resolved: !!error.resolvedAt,
          sourceId: error.channelId,
        });
      }
    });

    // Black screen detections
    blackScreenDetections.forEach(detection => {
      if (!detection.resolved) {
        alerts.push({
          id: detection.id,
          type: 'black_screen',
          severity: detection.severity,
          message: `Black screen detected on channel for ${detection.duration}s`,
          system: 'broadcast',
          timestamp: detection.detectedAt,
          resolved: detection.resolved,
          sourceId: detection.channelId,
        });
      }
    });

    // System health alerts (simulated)
    // Add system-level alerts here

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
    });
  }, [transmissionAlerts, broadcastErrors, blackScreenDetections]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    let filtered = allAlerts;
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(a => a.severity === filterSeverity);
    }
    if (filterSystem !== 'all') {
      filtered = filtered.filter(a => a.system === filterSystem);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.message.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [allAlerts, filterSeverity, filterSystem, searchQuery]);

  // System health metrics (simulated)
  const systemHealth = useMemo(() => {
    const totalSystems = transmitters.length + broadcastChannels.length + liveStreamSessions.length;
    const onlineSystems = activeTransmitters.length + broadcastChannels.filter(c => c.isLive).length + activeLiveStreams.length;
    const offlineSystems = totalSystems - onlineSystems;
    const healthScore = totalSystems > 0 ? (onlineSystems / totalSystems) * 100 : 100;

    return {
      totalSystems,
      onlineSystems,
      offlineSystems,
      healthScore,
      cpuUsage: 45 + Math.random() * 10,
      memoryUsage: 62 + Math.random() * 10,
      diskUsage: 34 + Math.random() * 5,
      networkUsage: 78 + Math.random() * 10,
    };
  }, [transmitters, broadcastChannels, liveStreamSessions, activeTransmitters, activeLiveStreams]);

  // Statistics
  const statistics = useMemo(() => {
    const criticalAlerts = allAlerts.filter(a => a.severity === 'critical').length;
    const highAlerts = allAlerts.filter(a => a.severity === 'high').length;
    const totalViewers = activeLiveStreams.reduce((sum, s) => sum + s.currentViewers, 0);
    const totalPowerOutput = activeTransmitters.reduce((sum, t) => sum + t.powerOutput, 0);
    const avgSignalQuality = activeTransmitters.length > 0
      ? activeTransmitters.reduce((sum, t) => sum + t.signalQuality, 0) / activeTransmitters.length
      : 0;

    return {
      criticalAlerts,
      highAlerts,
      totalAlerts: allAlerts.length,
      totalViewers,
      totalPowerOutput,
      avgSignalQuality,
      activeStreams: activeLiveStreams.length,
      activeChannels: broadcastChannels.filter(c => c.isLive).length,
    };
  }, [allAlerts, activeLiveStreams, activeTransmitters, broadcastChannels]);

  // Monitor count (all monitored entities)
  const monitorCount = useMemo(() => {
    return transmitters.length + transmissionChannels.length + antennas.length +
           broadcastChannels.length + liveStreamSessions.length;
  }, [transmitters, transmissionChannels, antennas, broadcastChannels, liveStreamSessions]);

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

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Force re-render by updating a dummy state
      // The stores will handle their own updates
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
          <p className="text-gray-500 mt-1">Real-time system monitoring and alerts</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span>Auto-refresh</span>
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
              </select>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>
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
          { label: 'Monitors', value: monitorCount, icon: Monitor, color: 'bg-blue-500' },
          { label: 'Active Alerts', value: allAlerts.length, icon: AlertCircle, color: 'bg-red-500', badge: statistics.criticalAlerts },
          { label: 'Systems Online', value: systemHealth.onlineSystems, icon: Eye, color: 'bg-green-500', total: systemHealth.totalSystems },
          { label: 'System Health', value: `${systemHealth.healthScore.toFixed(1)}%`, icon: Activity, color: 'bg-indigo-500' },
          { label: 'CPU Usage', value: `${systemHealth.cpuUsage.toFixed(1)}%`, icon: Cpu, color: 'bg-purple-500' },
          { label: 'Memory Usage', value: `${systemHealth.memoryUsage.toFixed(1)}%`, icon: MemoryStick, color: 'bg-orange-500' },
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
                {stat.total && (
                  <span className="text-xs text-gray-500">/ {stat.total}</span>
                )}
                {stat.badge && stat.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stat.badge} critical</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Critical Alerts Banner */}
      {statistics.criticalAlerts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-500 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Critical Alerts: {statistics.criticalAlerts}</h3>
                <p className="text-sm text-red-700">Immediate attention required</p>
              </div>
            </div>
            <button
              onClick={() => {
                setViewMode('alerts');
                setFilterSeverity('critical');
                toggleSection('alerts');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              View All
            </button>
          </div>
        </motion.div>
      )}

      {/* System Health Overview */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Overview
          </h2>
          <button
            onClick={() => toggleSection('health')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('health') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('health') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'CPU Usage', value: systemHealth.cpuUsage, icon: Cpu, color: 'bg-purple-500' },
                  { label: 'Memory Usage', value: systemHealth.memoryUsage, icon: MemoryStick, color: 'bg-blue-500' },
                  { label: 'Disk Usage', value: systemHealth.diskUsage, icon: HardDrive, color: 'bg-green-500' },
                  { label: 'Network Usage', value: systemHealth.networkUsage, icon: Network, color: 'bg-orange-500' },
                ].map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{metric.label}</span>
                        <Icon className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${metric.color} h-2 rounded-full transition-all`}
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Alerts */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Alerts ({allAlerts.length})
            {statistics.criticalAlerts > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{statistics.criticalAlerts} critical</span>
            )}
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterSystem}
              onChange={(e) => setFilterSystem(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">All Systems</option>
              <option value="transmission">Transmission</option>
              <option value="broadcast">Broadcast</option>
              <option value="streaming">Streaming</option>
              <option value="system">System</option>
            </select>
            <button
              onClick={() => toggleSection('alerts')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expandedSections.has('alerts') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {expandedSections.has('alerts') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border-l-4 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                        alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                        alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}
                      onClick={() => {
                        setSelectedAlert(alert.id);
                        setShowAlertDetails(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                            <span className="font-bold text-gray-900">{alert.type.replace('_', ' ').toUpperCase()}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              alert.system === 'transmission' ? 'bg-purple-100 text-purple-700' :
                              alert.system === 'broadcast' ? 'bg-blue-100 text-blue-700' :
                              alert.system === 'streaming' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {alert.system}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                              alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                              alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                          <div className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Systems Status */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Systems Status
          </h2>
          <button
            onClick={() => toggleSection('systems')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('systems') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('systems') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Transmission Systems */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Transmission
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor('online')}`}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transmitters:</span>
                      <span className="font-semibold">{activeTransmitters.length} / {transmitters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Channels:</span>
                      <span className="font-semibold">{activeTransmissionChannels.length} / {transmissionChannels.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alerts:</span>
                      <span className="font-semibold text-red-600">{activeTransmissionAlerts.length}</span>
                    </div>
                  </div>
                </div>

                {/* Broadcast Systems */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Radio className="w-4 h-4" />
                      Broadcast
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor('online')}`}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Channels:</span>
                      <span className="font-semibold">{broadcastChannels.filter(c => c.isLive).length} / {broadcastChannels.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Errors:</span>
                      <span className="font-semibold text-red-600">{activeBroadcastErrors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Black Screens:</span>
                      <span className="font-semibold text-orange-600">{activeBlackScreens.length}</span>
                    </div>
                  </div>
                </div>

                {/* Streaming Systems */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Streaming
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor('online')}`}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Streams:</span>
                      <span className="font-semibold">{activeLiveStreams.length} / {liveStreamSessions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Viewers:</span>
                      <span className="font-semibold">{statistics.totalViewers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platforms:</span>
                      <span className="font-semibold">{new Set(activeLiveStreams.flatMap(s => s.platforms)).size}</span>
                    </div>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      System
                    </h3>
                    <div className={`w-3 h-3 rounded-full ${systemHealth.healthScore > 80 ? getStatusColor('healthy') : getStatusColor('warning')}`}></div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Health Score:</span>
                      <span className={`font-semibold ${systemHealth.healthScore > 80 ? 'text-green-600' : systemHealth.healthScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {systemHealth.healthScore.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Online:</span>
                      <span className="font-semibold text-green-600">{systemHealth.onlineSystems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offline:</span>
                      <span className="font-semibold text-gray-600">{systemHealth.offlineSystems}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Performance Metrics */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Metrics
          </h2>
          <button
            onClick={() => toggleSection('performance')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('performance') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('performance') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Power Output', value: `${statistics.totalPowerOutput.toFixed(1)} kW`, icon: Power, color: 'bg-yellow-500' },
                  { label: 'Avg Signal Quality', value: `${statistics.avgSignalQuality.toFixed(1)}%`, icon: Signal, color: 'bg-blue-500' },
                  { label: 'Active Channels', value: statistics.activeChannels, icon: Radio, color: 'bg-green-500' },
                  { label: 'Active Streams', value: statistics.activeStreams, icon: Video, color: 'bg-purple-500' },
                  { label: 'Total Viewers', value: statistics.totalViewers, icon: Eye, color: 'bg-indigo-500' },
                  { label: 'Network Latency', value: '12ms', icon: Network, color: 'bg-orange-500' },
                ].map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className={`${metric.color} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-xs text-gray-600 mb-1">{metric.label}</div>
                      <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Activity Logs */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Activity Logs
          </h2>
          <button
            onClick={() => toggleSection('logs')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('logs') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('logs') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  { action: 'Transmitter 1 status changed to online', system: 'transmission', time: new Date() },
                  { action: 'Black screen detected on Channel 2', system: 'broadcast', time: new Date(Date.now() - 60000) },
                  { action: 'Stream started on YouTube', system: 'streaming', time: new Date(Date.now() - 120000) },
                  { action: 'Alert resolved: Signal quality restored', system: 'transmission', time: new Date(Date.now() - 180000) },
                  { action: 'New viewer joined stream', system: 'streaming', time: new Date(Date.now() - 240000) },
                ].map((log, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">{log.action}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ml-2 ${
                          log.system === 'transmission' ? 'bg-purple-100 text-purple-700' :
                          log.system === 'broadcast' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {log.system}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.time.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
