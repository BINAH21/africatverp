// Comprehensive transmission system store
import { create } from 'zustand';

export type TransmitterStatus = 'online' | 'offline' | 'standby' | 'maintenance' | 'error' | 'backup';
export type ChannelStatus = 'active' | 'inactive' | 'testing' | 'error' | 'maintenance';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'admin' | 'manager' | 'operator' | 'engineer' | 'viewer' | 'guest';

export interface Transmitter {
  id: string;
  name: string;
  location: string;
  model: string;
  serialNumber: string;
  status: TransmitterStatus;
  powerOutput: number; // kW
  powerInput: number; // kW
  frequency: number; // MHz
  modulation: 'DVB-T' | 'DVB-T2' | 'ATSC' | 'ISDB-T' | 'DTMB' | 'other';
  signalQuality: number; // 0-100
  temperature: number; // Celsius
  voltage: number; // Volts
  current: number; // Amperes
  efficiency: number; // Percentage
  uptime: number; // seconds
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  backupTransmitterId?: string;
  isBackup: boolean;
  remoteControlEnabled: boolean;
  networkAddress?: string;
  firmwareVersion?: string;
  healthScore: number; // 0-100
  alerts: TransmissionAlert[];
  createdAt: Date;
  updatedAt: Date;
  accessRoles: UserRole[];
}

export interface TransmissionChannel {
  id: string;
  name: string;
  channelNumber: number;
  frequency: number; // MHz
  bandwidth: number; // MHz
  power: number; // kW
  status: ChannelStatus;
  transmitterId: string;
  antennaId?: string;
  modulation: 'DVB-T' | 'DVB-T2' | 'ATSC' | 'ISDB-T' | 'DTMB' | 'other';
  bitrate: number; // Mbps
  signalQuality: number; // 0-100
  coverageArea?: string;
  isActive: boolean;
  lastTest?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Antenna {
  id: string;
  name: string;
  location: string;
  type: 'directional' | 'omnidirectional' | 'parabolic' | 'yagi' | 'other';
  gain: number; // dBi
  frequencyRange: { min: number; max: number }; // MHz
  azimuth: number; // degrees
  elevation: number; // degrees
  height: number; // meters
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  transmitterId?: string;
  channelId?: string;
  lastInspection?: Date;
  nextInspection?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransmissionAlert {
  id: string;
  type: 'power_failure' | 'signal_loss' | 'overheating' | 'voltage_anomaly' | 'frequency_drift' | 'equipment_failure' | 'maintenance_due' | 'backup_activated' | 'network_loss' | 'other';
  severity: AlertSeverity;
  transmitterId?: string;
  channelId?: string;
  antennaId?: string;
  message: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  actionTaken?: string;
  notifiedRoles: UserRole[];
}

export interface MaintenanceRecord {
  id: string;
  transmitterId?: string;
  channelId?: string;
  antennaId?: string;
  type: 'scheduled' | 'emergency' | 'preventive' | 'corrective';
  description: string;
  performedBy: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  partsReplaced?: string[];
  cost?: number;
  notes?: string;
  nextScheduled?: Date;
  createdAt: Date;
}

export interface TransmissionLog {
  id: string;
  transmitterId?: string;
  channelId?: string;
  antennaId?: string;
  action: string;
  performedBy: string;
  timestamp: Date;
  details?: Record<string, any>;
  ipAddress?: string;
}

export interface TransmissionStatistic {
  id: string;
  date: Date;
  totalUptime: number; // seconds
  averagePowerOutput: number;
  averageSignalQuality: number;
  totalAlerts: number;
  criticalAlerts: number;
  maintenanceCount: number;
  energyConsumption: number; // kWh
  transmitterCount: number;
  activeChannels: number;
}

export interface BackupSystem {
  id: string;
  name: string;
  primaryTransmitterId: string;
  backupTransmitterId: string;
  autoSwitchEnabled: boolean;
  switchDelay: number; // seconds
  lastSwitch?: Date;
  switchCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RemoteControl {
  id: string;
  transmitterId: string;
  command: 'power_on' | 'power_off' | 'standby' | 'reset' | 'frequency_change' | 'power_adjust' | 'test_mode';
  parameters?: Record<string, any>;
  requestedBy: string;
  requestedAt: Date;
  executedAt?: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  errorMessage?: string;
}

interface TransmissionStore {
  transmitters: Transmitter[];
  channels: TransmissionChannel[];
  antennas: Antenna[];
  alerts: TransmissionAlert[];
  maintenanceRecords: MaintenanceRecord[];
  logs: TransmissionLog[];
  statistics: TransmissionStatistic[];
  backupSystems: BackupSystem[];
  remoteControls: RemoteControl[];
  
  // Transmitter Management
  addTransmitter: (transmitter: Omit<Transmitter, 'id' | 'createdAt' | 'updatedAt' | 'alerts' | 'healthScore' | 'uptime'>) => void;
  updateTransmitter: (id: string, updates: Partial<Transmitter>) => void;
  deleteTransmitter: (id: string) => void;
  getTransmitter: (id: string) => Transmitter | undefined;
  getTransmittersByStatus: (status: TransmitterStatus) => Transmitter[];
  getActiveTransmitters: () => Transmitter[];
  
  // Channel Management
  addChannel: (channel: Omit<TransmissionChannel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateChannel: (id: string, updates: Partial<TransmissionChannel>) => void;
  deleteChannel: (id: string) => void;
  getChannel: (id: string) => TransmissionChannel | undefined;
  getChannelsByTransmitter: (transmitterId: string) => TransmissionChannel[];
  getActiveChannels: () => TransmissionChannel[];
  
  // Antenna Management
  addAntenna: (antenna: Omit<Antenna, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAntenna: (id: string, updates: Partial<Antenna>) => void;
  deleteAntenna: (id: string) => void;
  getAntenna: (id: string) => Antenna | undefined;
  getAntennasByTransmitter: (transmitterId: string) => Antenna[];
  
  // Alert Management
  createAlert: (alert: Omit<TransmissionAlert, 'id' | 'detectedAt' | 'resolved'>) => void;
  resolveAlert: (id: string, resolvedBy: string, actionTaken?: string) => void;
  getActiveAlerts: () => TransmissionAlert[];
  getAlertsBySeverity: (severity: AlertSeverity) => TransmissionAlert[];
  
  // Maintenance
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt'>) => void;
  getMaintenanceRecords: (transmitterId?: string) => MaintenanceRecord[];
  getUpcomingMaintenance: () => MaintenanceRecord[];
  
  // Logging
  addLog: (log: Omit<TransmissionLog, 'id' | 'timestamp'>) => void;
  getLogs: (transmitterId?: string, limit?: number) => TransmissionLog[];
  
  // Statistics
  addStatistic: (stat: Omit<TransmissionStatistic, 'id'>) => void;
  getTodayStatistics: () => TransmissionStatistic | null;
  getStatisticsByDateRange: (from: Date, to: Date) => TransmissionStatistic[];
  
  // Backup Systems
  addBackupSystem: (system: Omit<BackupSystem, 'id' | 'createdAt' | 'updatedAt' | 'switchCount' | 'lastSwitch'>) => void;
  updateBackupSystem: (id: string, updates: Partial<BackupSystem>) => void;
  activateBackup: (backupSystemId: string) => void;
  getBackupSystems: () => BackupSystem[];
  
  // Remote Control
  sendRemoteCommand: (command: Omit<RemoteControl, 'id' | 'requestedAt' | 'status'>) => Promise<void>;
  getRemoteControlHistory: (transmitterId?: string) => RemoteControl[];
  
  // Monitoring
  updateTransmitterMetrics: (id: string, metrics: { powerOutput?: number; powerInput?: number; signalQuality?: number; temperature?: number; voltage?: number; current?: number }) => void;
  calculateHealthScore: (transmitterId: string) => number;
  
  // Testing & Diagnostics
  runDiagnostics: (transmitterId: string) => Promise<{ passed: boolean; issues: string[] }>;
  testChannel: (channelId: string) => Promise<{ passed: boolean; signalQuality: number; bitrate: number }>;
  
  // Emergency Procedures
  emergencyShutdown: (transmitterId: string, reason: string) => void;
  activateEmergencyBackup: (channelId: string) => void;
}

const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      detectedAt: item.detectedAt ? new Date(item.detectedAt) : new Date(),
      resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
      lastMaintenance: item.lastMaintenance ? new Date(item.lastMaintenance) : undefined,
      nextMaintenance: item.nextMaintenance ? new Date(item.nextMaintenance) : undefined,
      lastInspection: item.lastInspection ? new Date(item.lastInspection) : undefined,
      nextInspection: item.nextInspection ? new Date(item.nextInspection) : undefined,
      startTime: item.startTime ? new Date(item.startTime) : new Date(),
      endTime: item.endTime ? new Date(item.endTime) : undefined,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      requestedAt: item.requestedAt ? new Date(item.requestedAt) : new Date(),
      executedAt: item.executedAt ? new Date(item.executedAt) : undefined,
      lastTest: item.lastTest ? new Date(item.lastTest) : undefined,
      lastSwitch: item.lastSwitch ? new Date(item.lastSwitch) : undefined,
      date: item.date ? new Date(item.date) : new Date(),
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    }));
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const useTransmissionStore = create<TransmissionStore>()((set, get) => ({
  transmitters: loadFromStorage<Transmitter>('transmission-transmitters', [
    {
      id: '1',
      name: 'Main Transmitter 1',
      location: 'Tower A',
      model: 'Harris DTV-50',
      serialNumber: 'HTX-2024-001',
      status: 'online',
      powerOutput: 50,
      powerInput: 60,
      frequency: 650,
      modulation: 'DVB-T2',
      signalQuality: 98,
      temperature: 45,
      voltage: 240,
      current: 250,
      efficiency: 83,
      uptime: 86400,
      isBackup: false,
      remoteControlEnabled: true,
      networkAddress: '192.168.1.100',
      firmwareVersion: 'v2.3.1',
      healthScore: 95,
      alerts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      accessRoles: ['admin', 'manager', 'engineer'],
    },
  ]),
  channels: loadFromStorage<TransmissionChannel>('transmission-channels', []),
  antennas: loadFromStorage<Antenna>('transmission-antennas', []),
  alerts: loadFromStorage<TransmissionAlert>('transmission-alerts', []),
  maintenanceRecords: loadFromStorage<MaintenanceRecord>('transmission-maintenance', []),
  logs: loadFromStorage<TransmissionLog>('transmission-logs', []),
  statistics: loadFromStorage<TransmissionStatistic>('transmission-statistics', []),
  backupSystems: loadFromStorage<BackupSystem>('transmission-backups', []),
  remoteControls: loadFromStorage<RemoteControl>('transmission-remote-controls', []),
  
  // Transmitter Management
  addTransmitter: (transmitterData) => {
    const newTransmitter: Transmitter = {
      ...transmitterData,
      id: Date.now().toString(),
      alerts: [],
      healthScore: 100,
      uptime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.transmitters, newTransmitter];
      saveToStorage('transmission-transmitters', updated);
      return { transmitters: updated };
    });
  },
  
  updateTransmitter: (id, updates) => {
    set((state) => {
      const updated = state.transmitters.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      );
      saveToStorage('transmission-transmitters', updated);
      return { transmitters: updated };
    });
  },
  
  deleteTransmitter: (id) => {
    set((state) => {
      const updated = state.transmitters.filter((t) => t.id !== id);
      saveToStorage('transmission-transmitters', updated);
      return { transmitters: updated };
    });
  },
  
  getTransmitter: (id) => {
    return get().transmitters.find((t) => t.id === id);
  },
  
  getTransmittersByStatus: (status) => {
    return get().transmitters.filter((t) => t.status === status);
  },
  
  getActiveTransmitters: () => {
    return get().transmitters.filter((t) => t.status === 'online');
  },
  
  // Channel Management
  addChannel: (channelData) => {
    const newChannel: TransmissionChannel = {
      ...channelData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.channels, newChannel];
      saveToStorage('transmission-channels', updated);
      return { channels: updated };
    });
  },
  
  updateChannel: (id, updates) => {
    set((state) => {
      const updated = state.channels.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      );
      saveToStorage('transmission-channels', updated);
      return { channels: updated };
    });
  },
  
  deleteChannel: (id) => {
    set((state) => {
      const updated = state.channels.filter((c) => c.id !== id);
      saveToStorage('transmission-channels', updated);
      return { channels: updated };
    });
  },
  
  getChannel: (id) => {
    return get().channels.find((c) => c.id === id);
  },
  
  getChannelsByTransmitter: (transmitterId) => {
    return get().channels.filter((c) => c.transmitterId === transmitterId);
  },
  
  getActiveChannels: () => {
    return get().channels.filter((c) => c.status === 'active' && c.isActive);
  },
  
  // Antenna Management
  addAntenna: (antennaData) => {
    const newAntenna: Antenna = {
      ...antennaData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.antennas, newAntenna];
      saveToStorage('transmission-antennas', updated);
      return { antennas: updated };
    });
  },
  
  updateAntenna: (id, updates) => {
    set((state) => {
      const updated = state.antennas.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      );
      saveToStorage('transmission-antennas', updated);
      return { antennas: updated };
    });
  },
  
  deleteAntenna: (id) => {
    set((state) => {
      const updated = state.antennas.filter((a) => a.id !== id);
      saveToStorage('transmission-antennas', updated);
      return { antennas: updated };
    });
  },
  
  getAntenna: (id) => {
    return get().antennas.find((a) => a.id === id);
  },
  
  getAntennasByTransmitter: (transmitterId) => {
    return get().antennas.filter((a) => a.transmitterId === transmitterId);
  },
  
  // Alert Management
  createAlert: (alertData) => {
    const alert: TransmissionAlert = {
      ...alertData,
      id: Date.now().toString(),
      detectedAt: new Date(),
      resolved: false,
    };
    set((state) => {
      const updated = [...state.alerts, alert];
      saveToStorage('transmission-alerts', updated);
      
      // Add alert to transmitter if applicable
      if (alert.transmitterId) {
        const transmitter = state.transmitters.find((t) => t.id === alert.transmitterId);
        if (transmitter) {
          get().updateTransmitter(alert.transmitterId, {
            alerts: [...transmitter.alerts, alert],
          });
        }
      }
      
      return { alerts: updated };
    });
  },
  
  resolveAlert: (id, resolvedBy, actionTaken) => {
    set((state) => {
      const updated = state.alerts.map((a) =>
        a.id === id
          ? { ...a, resolved: true, resolvedAt: new Date(), resolvedBy, actionTaken }
          : a
      );
      saveToStorage('transmission-alerts', updated);
      return { alerts: updated };
    });
  },
  
  getActiveAlerts: () => {
    return get().alerts.filter((a) => !a.resolved);
  },
  
  getAlertsBySeverity: (severity) => {
    return get().alerts.filter((a) => a.severity === severity);
  },
  
  // Maintenance
  addMaintenanceRecord: (recordData) => {
    const record: MaintenanceRecord = {
      ...recordData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    set((state) => {
      const updated = [...state.maintenanceRecords, record];
      saveToStorage('transmission-maintenance', updated);
      return { maintenanceRecords: updated };
    });
  },
  
  getMaintenanceRecords: (transmitterId) => {
    if (transmitterId) {
      return get().maintenanceRecords.filter((r) => r.transmitterId === transmitterId);
    }
    return get().maintenanceRecords;
  },
  
  getUpcomingMaintenance: () => {
    const now = new Date();
    return get().maintenanceRecords.filter((r) => 
      r.nextScheduled && new Date(r.nextScheduled) > now && !r.endTime
    );
  },
  
  // Logging
  addLog: (logData) => {
    const log: TransmissionLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    set((state) => {
      const updated = [...state.logs, log];
      // Keep only last 1000 logs
      if (updated.length > 1000) {
        updated.shift();
      }
      saveToStorage('transmission-logs', updated);
      return { logs: updated };
    });
  },
  
  getLogs: (transmitterId, limit = 100) => {
    let logs = get().logs;
    if (transmitterId) {
      logs = logs.filter((l) => l.transmitterId === transmitterId);
    }
    return logs.slice(-limit).reverse();
  },
  
  // Statistics
  addStatistic: (statData) => {
    const stat: TransmissionStatistic = {
      ...statData,
      id: Date.now().toString(),
    };
    set((state) => {
      const updated = [...state.statistics, stat];
      saveToStorage('transmission-statistics', updated);
      return { statistics: updated };
    });
  },
  
  getTodayStatistics: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = get().statistics.filter((s) => {
      const statDate = new Date(s.date);
      statDate.setHours(0, 0, 0, 0);
      return statDate.getTime() === today.getTime();
    });
    return stats.length > 0 ? stats[0] : null;
  },
  
  getStatisticsByDateRange: (from, to) => {
    return get().statistics.filter((s) => {
      const statDate = new Date(s.date);
      return statDate >= from && statDate <= to;
    });
  },
  
  // Backup Systems
  addBackupSystem: (systemData) => {
    const system: BackupSystem = {
      ...systemData,
      id: Date.now().toString(),
      switchCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.backupSystems, system];
      saveToStorage('transmission-backups', updated);
      return { backupSystems: updated };
    });
  },
  
  updateBackupSystem: (id, updates) => {
    set((state) => {
      const updated = state.backupSystems.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      );
      saveToStorage('transmission-backups', updated);
      return { backupSystems: updated };
    });
  },
  
  activateBackup: (backupSystemId) => {
    const system = get().backupSystems.find((s) => s.id === backupSystemId);
    if (!system) return;
    
    get().updateTransmitter(system.primaryTransmitterId, { status: 'backup' });
    get().updateTransmitter(system.backupTransmitterId, { status: 'online' });
    
    get().updateBackupSystem(backupSystemId, {
      lastSwitch: new Date(),
      switchCount: system.switchCount + 1,
      isActive: true,
    });
    
    get().addLog({
      transmitterId: system.backupTransmitterId,
      action: 'Backup activated',
      performedBy: 'System',
      details: { backupSystemId, primaryTransmitterId: system.primaryTransmitterId },
    });
  },
  
  getBackupSystems: () => {
    return get().backupSystems;
  },
  
  // Remote Control
  sendRemoteCommand: async (commandData) => {
    const command: RemoteControl = {
      ...commandData,
      id: Date.now().toString(),
      requestedAt: new Date(),
      status: 'pending',
    };
    
    set((state) => {
      const updated = [...state.remoteControls, command];
      saveToStorage('transmission-remote-controls', updated);
      return { remoteControls: updated };
    });
    
    // Simulate command execution
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    set((state) => {
      const updated = state.remoteControls.map((c) =>
        c.id === command.id
          ? { ...c, status: 'executing', executedAt: new Date() }
          : c
      );
      saveToStorage('transmission-remote-controls', updated);
      return { remoteControls: updated };
    });
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    set((state) => {
      const updated = state.remoteControls.map((c) =>
        c.id === command.id
          ? { ...c, status: 'completed' }
          : c
      );
      saveToStorage('transmission-remote-controls', updated);
      
      // Update transmitter based on command
      if (command.command === 'power_on') {
        get().updateTransmitter(command.transmitterId, { status: 'online' });
      } else if (command.command === 'power_off') {
        get().updateTransmitter(command.transmitterId, { status: 'offline' });
      } else if (command.command === 'standby') {
        get().updateTransmitter(command.transmitterId, { status: 'standby' });
      }
      
      return { remoteControls: updated };
    });
    
    get().addLog({
      transmitterId: command.transmitterId,
      action: `Remote command: ${command.command}`,
      performedBy: command.requestedBy,
      details: command.parameters,
    });
  },
  
  getRemoteControlHistory: (transmitterId) => {
    let history = get().remoteControls;
    if (transmitterId) {
      history = history.filter((c) => c.transmitterId === transmitterId);
    }
    return history.slice().reverse();
  },
  
  // Monitoring
  updateTransmitterMetrics: (id, metrics) => {
    const transmitter = get().getTransmitter(id);
    if (!transmitter) return;
    
    const updated = { ...transmitter, ...metrics };
    
    // Calculate efficiency
    if (metrics.powerOutput !== undefined && metrics.powerInput !== undefined) {
      updated.efficiency = (metrics.powerOutput / metrics.powerInput) * 100;
    }
    
    // Calculate health score
    updated.healthScore = get().calculateHealthScore(id);
    
    // Check for alerts
    if (metrics.temperature !== undefined && metrics.temperature > 70) {
      get().createAlert({
        type: 'overheating',
        severity: metrics.temperature > 80 ? 'critical' : 'high',
        transmitterId: id,
        message: `Transmitter temperature is ${metrics.temperature}°C`,
        notifiedRoles: transmitter.accessRoles,
      });
    }
    
    if (metrics.signalQuality !== undefined && metrics.signalQuality < 50) {
      get().createAlert({
        type: 'signal_loss',
        severity: metrics.signalQuality < 30 ? 'critical' : 'high',
        transmitterId: id,
        message: `Signal quality dropped to ${metrics.signalQuality}%`,
        notifiedRoles: transmitter.accessRoles,
      });
    }
    
    get().updateTransmitter(id, updated);
  },
  
  calculateHealthScore: (transmitterId) => {
    const transmitter = get().getTransmitter(transmitterId);
    if (!transmitter) return 0;
    
    let score = 100;
    
    // Deduct points for issues
    if (transmitter.temperature > 60) score -= 10;
    if (transmitter.temperature > 70) score -= 20;
    if (transmitter.signalQuality < 80) score -= 15;
    if (transmitter.signalQuality < 50) score -= 30;
    if (transmitter.efficiency < 70) score -= 10;
    if (transmitter.alerts.filter((a) => !a.resolved && a.severity === 'critical').length > 0) score -= 30;
    if (transmitter.alerts.filter((a) => !a.resolved && a.severity === 'high').length > 0) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  },
  
  // Testing & Diagnostics
  runDiagnostics: async (transmitterId) => {
    const transmitter = get().getTransmitter(transmitterId);
    if (!transmitter) return { passed: false, issues: ['Transmitter not found'] };
    
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const issues: string[] = [];
    
    if (transmitter.signalQuality < 80) {
      issues.push('Signal quality below optimal');
    }
    if (transmitter.temperature > 65) {
      issues.push('Temperature above normal');
    }
    if (transmitter.efficiency < 75) {
      issues.push('Efficiency below expected');
    }
    if (transmitter.voltage < 220 || transmitter.voltage > 250) {
      issues.push('Voltage out of range');
    }
    
    return {
      passed: issues.length === 0,
      issues,
    };
  },
  
  testChannel: async (channelId) => {
    const channel = get().getChannel(channelId);
    if (!channel) {
      return { passed: false, signalQuality: 0, bitrate: 0 };
    }
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simulate test results
    const signalQuality = Math.max(70, Math.min(100, channel.signalQuality + (Math.random() - 0.5) * 10));
    const bitrate = channel.bitrate;
    
    get().updateChannel(channelId, {
      lastTest: new Date(),
      signalQuality,
    });
    
    return {
      passed: signalQuality >= 80,
      signalQuality,
      bitrate,
    };
  },
  
  // Emergency Procedures
  emergencyShutdown: (transmitterId, reason) => {
    get().updateTransmitter(transmitterId, { status: 'offline' });
    
    get().createAlert({
      type: 'equipment_failure',
      severity: 'critical',
      transmitterId,
      message: `Emergency shutdown: ${reason}`,
      notifiedRoles: ['admin', 'manager', 'engineer'],
    });
    
    get().addLog({
      transmitterId,
      action: 'Emergency shutdown',
      performedBy: 'System',
      details: { reason },
    });
  },
  
  activateEmergencyBackup: (channelId) => {
    const channel = get().getChannel(channelId);
    if (!channel) return;
    
    const backupSystem = get().backupSystems.find((b) => 
      get().getChannelsByTransmitter(b.primaryTransmitterId).some((c) => c.id === channelId)
    );
    
    if (backupSystem) {
      get().activateBackup(backupSystem.id);
    }
  },
}));

// Auto-update metrics every 5 seconds
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useTransmissionStore.getState();
    store.getActiveTransmitters().forEach((transmitter) => {
      // Simulate metric updates
      const powerOutput = Math.max(transmitter.powerOutput * 0.95, Math.min(transmitter.powerOutput * 1.05, transmitter.powerOutput + (Math.random() - 0.5) * 2));
      const signalQuality = Math.max(70, Math.min(100, transmitter.signalQuality + (Math.random() - 0.5) * 5));
      const temperature = Math.max(35, Math.min(75, transmitter.temperature + (Math.random() - 0.5) * 3));
      
      store.updateTransmitterMetrics(transmitter.id, {
        powerOutput,
        signalQuality,
        temperature,
      });
      
      // Update uptime
      store.updateTransmitter(transmitter.id, {
        uptime: transmitter.uptime + 5,
      });
    });
  }, 5000);
}
