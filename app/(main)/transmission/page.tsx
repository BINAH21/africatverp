'use client';

import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Zap, Signal, Activity, AlertCircle, AlertTriangle, CheckCircle, XCircle,
  Settings, RefreshCw, Power, PowerOff, Clock, Calendar,
  TrendingUp, TrendingDown, Gauge, Thermometer, Wifi, WifiOff, Shield,
  Radio, Satellite, BarChart3, LineChart, PieChart, FileText,
  History, Bell, Edit, Trash2, Plus, X, Search,
  ChevronDown, ChevronUp, MoreVertical, Download, Upload,
  Wrench, TestTube, RotateCcw, RotateCw,
  ExternalLink,
  HardDrive, Server, Network, Cpu, MemoryStick, Database, Archive,
  MapPin, Globe, Target, Layers, Monitor, Tv,
} from 'lucide-react';
import {
  useTransmissionStore,
  Transmitter,
  TransmissionChannel,
  Antenna as AntennaType,
  TransmissionAlert,
  MaintenanceRecord,
  BackupSystem,
  RemoteControl,
  TransmitterStatus,
  ChannelStatus,
  AlertSeverity,
} from '@/lib/transmission-store';
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

const getStatusColor = (status: TransmitterStatus | ChannelStatus | string) => {
  switch (status) {
    case 'online':
    case 'active':
      return 'bg-green-500';
    case 'offline':
    case 'inactive':
      return 'bg-gray-500';
    case 'standby':
      return 'bg-yellow-500';
    case 'maintenance':
      return 'bg-blue-500';
    case 'error':
      return 'bg-red-500';
    case 'backup':
      return 'bg-purple-500';
    case 'testing':
      return 'bg-orange-500';
    default:
      return 'bg-gray-400';
  }
};

const getSeverityColor = (severity: AlertSeverity) => {
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

const getHealthColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function TransmissionPage() {
  const { t } = useTranslation();
  const { user } = useAppStore();
  
  const {
    transmitters,
    channels,
    antennas,
    alerts,
    maintenanceRecords,
    logs,
    statistics,
    backupSystems,
    remoteControls,
    getActiveTransmitters,
    getActiveChannels,
    getActiveAlerts,
    getAlertsBySeverity,
    getMaintenanceRecords,
    getUpcomingMaintenance,
    getLogs,
    getTodayStatistics,
    getBackupSystems,
    getRemoteControlHistory,
    addTransmitter,
    updateTransmitter,
    deleteTransmitter,
    addChannel,
    updateChannel,
    deleteChannel,
    addAntenna,
    updateAntenna,
    deleteAntenna,
    createAlert,
    resolveAlert,
    addMaintenanceRecord,
    addLog,
    sendRemoteCommand,
    runDiagnostics,
    testChannel,
    emergencyShutdown,
    activateEmergencyBackup,
    activateBackup,
  } = useTransmissionStore();

  // State management
  const [selectedTransmitter, setSelectedTransmitter] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'transmitters' | 'channels' | 'antennas' | 'alerts' | 'maintenance' | 'logs' | 'backup' | 'remote'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'transmitters', 'alerts']));
  const [showAddTransmitter, setShowAddTransmitter] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddAntenna, setShowAddAntenna] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showRemoteControlModal, setShowRemoteControlModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<{ passed: boolean; issues: string[] } | null>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState<string | null>(null);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TransmitterStatus | 'all'>('all');

  // Computed values
  const activeTransmitters = useMemo(() => getActiveTransmitters(), [getActiveTransmitters]);
  const activeChannels = useMemo(() => getActiveChannels(), [getActiveChannels]);
  const activeAlerts = useMemo(() => getActiveAlerts(), [getActiveAlerts]);
  const criticalAlerts = useMemo(() => getAlertsBySeverity('critical'), [getAlertsBySeverity]);
  const highAlerts = useMemo(() => getAlertsBySeverity('high'), [getAlertsBySeverity]);
  const upcomingMaintenance = useMemo(() => getUpcomingMaintenance(), [getUpcomingMaintenance]);
  const recentLogs = useMemo(() => getLogs(undefined, 50), [getLogs]);
  const todayStats = useMemo(() => getTodayStatistics(), [getTodayStatistics]);
  const backupSystemsList = useMemo(() => getBackupSystems(), [getBackupSystems]);

  // Filtered transmitters
  const filteredTransmitters = useMemo(() => {
    let filtered = transmitters;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.location.toLowerCase().includes(query) ||
        t.model.toLowerCase().includes(query) ||
        t.serialNumber.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [transmitters, filterStatus, searchQuery]);

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

  const handleRemoteCommand = async (transmitterId: string, command: 'power_on' | 'power_off' | 'standby' | 'reset') => {
    try {
      await sendRemoteCommand({
        transmitterId,
        command,
        requestedBy: user?.name || 'System',
      });
      addLog({
        transmitterId,
        action: `Remote command: ${command}`,
        performedBy: user?.name || 'System',
      });
    } catch (error) {
      console.error('Remote command failed:', error);
    }
  };

  const handleRunDiagnostics = async (transmitterId: string) => {
    setRunningDiagnostics(transmitterId);
    setShowDiagnosticsModal(true);
    try {
      const result = await runDiagnostics(transmitterId);
      setDiagnosticsResult(result);
    } catch (error) {
      setDiagnosticsResult({ passed: false, issues: ['Diagnostics failed'] });
    } finally {
      setRunningDiagnostics(null);
    }
  };

  const handleTestChannel = async (channelId: string) => {
    setTestingChannel(channelId);
    try {
      const result = await testChannel(channelId);
      if (result.passed) {
        addLog({
          channelId,
          action: 'Channel test passed',
          performedBy: user?.name || 'System',
          details: { signalQuality: result.signalQuality, bitrate: result.bitrate },
        });
      } else {
        createAlert({
          type: 'signal_loss',
          severity: 'medium',
          channelId,
          message: `Channel test failed: Signal quality ${result.signalQuality}%`,
          notifiedRoles: ['admin', 'engineer'],
        });
      }
    } catch (error) {
      console.error('Channel test failed:', error);
    } finally {
      setTestingChannel(null);
    }
  };

  // Auto-refresh for real-time updates
  useEffect(() => {
    // The store already has an interval for metric updates
    // This effect can be used for UI refresh if needed
  }, []);

  // Statistics calculations
  const totalPowerOutput = useMemo(() => 
    transmitters.reduce((sum, t) => sum + (t.status === 'online' ? t.powerOutput : 0), 0),
    [transmitters]
  );

  const averageSignalQuality = useMemo(() => {
    const active = activeTransmitters;
    if (active.length === 0) return 0;
    return active.reduce((sum, t) => sum + t.signalQuality, 0) / active.length;
  }, [activeTransmitters]);

  const averageTemperature = useMemo(() => {
    const active = activeTransmitters;
    if (active.length === 0) return 0;
    return active.reduce((sum, t) => sum + t.temperature, 0) / active.length;
  }, [activeTransmitters]);

  const totalUptime = useMemo(() => 
    transmitters.reduce((sum, t) => sum + t.uptime, 0),
    [transmitters]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transmission Monitor & Control</h1>
          <p className="text-gray-500 mt-1">Monitor and control transmission systems - 24/7 Real-time Monitoring</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTransmitter(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Transmitter
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
          { label: 'Active Transmitters', value: activeTransmitters.length, icon: Zap, color: 'bg-green-500', total: transmitters.length },
          { label: 'Active Channels', value: activeChannels.length, icon: Radio, color: 'bg-blue-500', total: channels.length },
          { label: 'Total Power Output', value: `${totalPowerOutput.toFixed(1)} kW`, icon: Power, color: 'bg-yellow-500' },
          { label: 'Avg Signal Quality', value: `${averageSignalQuality.toFixed(1)}%`, icon: Signal, color: 'bg-indigo-500' },
          { label: 'Active Alerts', value: activeAlerts.length, icon: AlertCircle, color: 'bg-red-500', badge: criticalAlerts.length },
          { label: 'Avg Temperature', value: `${averageTemperature.toFixed(1)}°C`, icon: Thermometer, color: 'bg-orange-500' },
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
      {criticalAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-500 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900">Critical Alerts: {criticalAlerts.length}</h3>
                <p className="text-sm text-red-700">Immediate attention required</p>
              </div>
            </div>
            <button
              onClick={() => {
                setViewMode('alerts');
                toggleSection('alerts');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              View All
            </button>
          </div>
        </motion.div>
      )}

      {/* Transmitters Overview */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Transmitters ({transmitters.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transmitters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TransmitterStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="standby">Standby</option>
                <option value="maintenance">Maintenance</option>
                <option value="error">Error</option>
                <option value="backup">Backup</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => toggleSection('transmitters')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('transmitters') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('transmitters') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransmitters.map((transmitter) => (
                  <motion.div
                    key={transmitter.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-gradient-to-br rounded-xl p-5 border-2 transition-all cursor-pointer ${
                      selectedTransmitter === transmitter.id
                        ? 'border-primary-500 from-primary-50 to-blue-50 shadow-lg'
                        : 'border-gray-200 from-white to-gray-50 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedTransmitter(transmitter.id === selectedTransmitter ? null : transmitter.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(transmitter.status)} ${transmitter.status === 'online' ? 'animate-pulse' : ''}`}></div>
                          <h3 className="font-bold text-gray-900">{transmitter.name}</h3>
                          {transmitter.isBackup && (
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">Backup</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{transmitter.location}</p>
                        <p className="text-xs text-gray-500 mt-1">{transmitter.model} • {transmitter.serialNumber}</p>
                      </div>
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Power Output</div>
                        <div className="text-sm font-bold text-gray-900">{transmitter.powerOutput} kW</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Signal Quality</div>
                        <div className="flex items-center gap-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                transmitter.signalQuality > 80 ? 'bg-green-500' :
                                transmitter.signalQuality > 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${transmitter.signalQuality}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">{transmitter.signalQuality}%</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Temperature</div>
                        <div className="flex items-center gap-1">
                          <Thermometer className={`w-3 h-3 ${transmitter.temperature > 60 ? 'text-red-500' : 'text-gray-500'}`} />
                          <span className="text-sm font-bold text-gray-900">{transmitter.temperature}°C</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Health Score</div>
                        <div className={`text-sm font-bold ${getHealthColor(transmitter.healthScore)}`}>
                          {transmitter.healthScore}%
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <span>Uptime: {formatDuration(transmitter.uptime)}</span>
                      <span>Freq: {transmitter.frequency} MHz</span>
                    </div>

                    {/* Alerts Badge */}
                    {transmitter.alerts.filter(a => !a.resolved).length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-600 font-semibold">
                            {transmitter.alerts.filter(a => !a.resolved).length} active alert(s)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {selectedTransmitter === transmitter.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200 space-y-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoteCommand(transmitter.id, transmitter.status === 'online' ? 'standby' : 'power_on');
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <Power className="w-3 h-3" />
                            {transmitter.status === 'online' ? 'Standby' : 'Power On'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRunDiagnostics(transmitter.id);
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <TestTube className="w-3 h-3" />
                            Diagnostics
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMaintenanceModal(true);
                            }}
                            className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <Wrench className="w-3 h-3" />
                            Maintenance
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Emergency shutdown this transmitter?')) {
                                emergencyShutdown(transmitter.id, 'Manual shutdown');
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs flex items-center justify-center gap-1"
                          >
                            <PowerOff className="w-3 h-3" />
                            Emergency
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Channels Overview */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Transmission Channels ({channels.length})
            </h2>
            <button
              onClick={() => setShowAddChannel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Channel
            </button>
          </div>
          <button
            onClick={() => toggleSection('channels')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('channels') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('channels') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {channels.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Radio className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No channels configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.map((channel) => {
                    const transmitter = transmitters.find(t => t.id === channel.transmitterId);
                    return (
                      <div
                        key={channel.id}
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(channel.status)}`}></div>
                              <h3 className="font-bold text-gray-900">{channel.name}</h3>
                            </div>
                            <p className="text-xs text-gray-600">Ch {channel.channelNumber} • {channel.frequency} MHz</p>
                            {transmitter && (
                              <p className="text-xs text-gray-500 mt-1">Transmitter: {transmitter.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white rounded-lg p-2 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Power</div>
                            <div className="text-sm font-bold text-gray-900">{channel.power} kW</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-gray-200">
                            <div className="text-xs text-gray-600 mb-1">Signal</div>
                            <div className="text-sm font-bold text-gray-900">{channel.signalQuality}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTestChannel(channel.id)}
                            disabled={testingChannel === channel.id}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs disabled:opacity-50"
                          >
                            {testingChannel === channel.id ? 'Testing...' : 'Test Channel'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this channel?')) {
                                deleteChannel(channel.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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

      {/* Alerts Section */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Alerts ({activeAlerts.length})
            {criticalAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{criticalAlerts.length} critical</span>
            )}
          </h2>
          <button
            onClick={() => toggleSection('alerts')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('alerts') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('alerts') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => {
                    const transmitter = alert.transmitterId ? transmitters.find(t => t.id === alert.transmitterId) : null;
                    const channel = alert.channelId ? channels.find(c => c.id === alert.channelId) : null;
                    return (
                      <div
                        key={alert.id}
                        className={`border-l-4 rounded-lg p-4 ${
                          alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                          alert.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                          alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}></div>
                              <span className="font-bold text-gray-900">{alert.type.replace('_', ' ').toUpperCase()}</span>
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
                            <div className="text-xs text-gray-600 space-y-1">
                              {transmitter && <div>Transmitter: {transmitter.name}</div>}
                              {channel && <div>Channel: {channel.name}</div>}
                              <div>Detected: {new Date(alert.detectedAt).toLocaleString()}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const action = prompt('Enter action taken:');
                              if (action) {
                                resolveAlert(alert.id, user?.name || 'System', action);
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm ml-4"
                          >
                            Resolve
                          </button>
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

      {/* Maintenance Section */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Maintenance ({maintenanceRecords.length})
            {upcomingMaintenance.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">{upcomingMaintenance.length} upcoming</span>
            )}
          </h2>
          <button
            onClick={() => toggleSection('maintenance')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('maintenance') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('maintenance') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No maintenance records</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceRecords.slice().reverse().slice(0, 10).map((record) => {
                    const transmitter = record.transmitterId ? transmitters.find(t => t.id === record.transmitterId) : null;
                    return (
                      <div
                        key={record.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                record.type === 'emergency' ? 'bg-red-100 text-red-700' :
                                record.type === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                record.type === 'preventive' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {record.type}
                              </span>
                              {transmitter && <span className="text-sm text-gray-600">{transmitter.name}</span>}
                            </div>
                            <p className="text-sm text-gray-700">{record.description}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              By: {record.performedBy} • {new Date(record.startTime).toLocaleString()}
                              {record.endTime && ` • Duration: ${formatDuration(record.duration || 0)}`}
                            </div>
                          </div>
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

      {/* Backup Systems */}
      <div className="glossy-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Backup Systems ({backupSystemsList.length})
          </h2>
          <button
            onClick={() => toggleSection('backup')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expandedSections.has('backup') ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {expandedSections.has('backup') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {backupSystemsList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No backup systems configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backupSystemsList.map((system) => {
                    const primary = transmitters.find(t => t.id === system.primaryTransmitterId);
                    const backup = transmitters.find(t => t.id === system.backupTransmitterId);
                    return (
                      <div
                        key={system.id}
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900">{system.name}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            system.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {system.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-600">Primary: </span>
                            <span className="font-semibold">{primary?.name || 'Unknown'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Backup: </span>
                            <span className="font-semibold">{backup?.name || 'Unknown'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Switches: {system.switchCount} • Auto-switch: {system.autoSwitchEnabled ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <button
                          onClick={() => activateBackup(system.id)}
                          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          Activate Backup
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

      {/* Activity Logs */}
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
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No activity logs</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentLogs.map((log) => {
                    const transmitter = log.transmitterId ? transmitters.find(t => t.id === log.transmitterId) : null;
                    return (
                      <div
                        key={log.id}
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900">{log.action}</span>
                            {transmitter && (
                              <span className="text-gray-600 ml-2">• {transmitter.name}</span>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              By: {log.performedBy} • {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
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

      {/* Statistics */}
      {todayStats && (
        <div className="glossy-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" />
            Today&apos;s Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 mb-1">Total Uptime</div>
              <div className="text-xl font-bold text-blue-900">{formatDuration(todayStats.totalUptime)}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 mb-1">Avg Power Output</div>
              <div className="text-xl font-bold text-green-900">{todayStats.averagePowerOutput.toFixed(1)} kW</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 mb-1">Avg Signal Quality</div>
              <div className="text-xl font-bold text-purple-900">{todayStats.averageSignalQuality.toFixed(1)}%</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-sm text-red-600 mb-1">Total Alerts</div>
              <div className="text-xl font-bold text-red-900">{todayStats.totalAlerts}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="text-sm text-orange-600 mb-1">Critical Alerts</div>
              <div className="text-xl font-bold text-orange-900">{todayStats.criticalAlerts}</div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="text-sm text-indigo-600 mb-1">Maintenance Count</div>
              <div className="text-xl font-bold text-indigo-900">{todayStats.maintenanceCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Transmitter Modal */}
      <AnimatePresence>
        {showAddTransmitter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddTransmitter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Transmitter</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addTransmitter({
                    name: formData.get('name') as string,
                    location: formData.get('location') as string,
                    model: formData.get('model') as string,
                    serialNumber: formData.get('serialNumber') as string,
                    status: (formData.get('status') as TransmitterStatus) || 'offline',
                    powerOutput: parseFloat(formData.get('powerOutput') as string) || 0,
                    powerInput: parseFloat(formData.get('powerInput') as string) || 0,
                    frequency: parseFloat(formData.get('frequency') as string) || 0,
                    modulation: (formData.get('modulation') as any) || 'DVB-T2',
                    signalQuality: 100,
                    temperature: 25,
                    voltage: parseFloat(formData.get('voltage') as string) || 240,
                    current: 0,
                    efficiency: 0,
                    isBackup: formData.get('isBackup') === 'on',
                    remoteControlEnabled: formData.get('remoteControlEnabled') === 'on',
                    networkAddress: formData.get('networkAddress') as string || undefined,
                    firmwareVersion: formData.get('firmwareVersion') as string || undefined,
                    accessRoles: ['admin', 'manager', 'engineer'],
                  });
                  setShowAddTransmitter(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" name="location" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input type="text" name="model" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                    <input type="text" name="serialNumber" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Power Output (kW)</label>
                    <input type="number" name="powerOutput" step="0.1" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency (MHz)</label>
                    <input type="number" name="frequency" step="0.1" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="isBackup" className="rounded" />
                    <span className="text-sm text-gray-700">Is Backup Transmitter</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="remoteControlEnabled" defaultChecked className="rounded" />
                    <span className="text-sm text-gray-700">Remote Control Enabled</span>
                  </label>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddTransmitter(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Transmitter
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagnostics Modal */}
      <AnimatePresence>
        {showDiagnosticsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowDiagnosticsModal(false);
              setDiagnosticsResult(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Diagnostics Results</h3>
              {runningDiagnostics ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
                  <p className="text-gray-600">Running diagnostics...</p>
                </div>
              ) : diagnosticsResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    diagnosticsResult.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {diagnosticsResult.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-bold ${diagnosticsResult.passed ? 'text-green-900' : 'text-red-900'}`}>
                        {diagnosticsResult.passed ? 'All Tests Passed' : 'Issues Detected'}
                      </span>
                    </div>
                    {diagnosticsResult.issues.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {diagnosticsResult.issues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowDiagnosticsModal(false);
                      setDiagnosticsResult(null);
                    }}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
