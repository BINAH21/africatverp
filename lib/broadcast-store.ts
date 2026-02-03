// Comprehensive broadcast control store
import { create } from 'zustand';

export type BroadcastStatus = 'idle' | 'playing' | 'paused' | 'stopped' | 'error';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer' | 'guest';

export interface BroadcastChannel {
  id: string;
  name: string;
  description: string;
  status: BroadcastStatus;
  tvLink: string;
  currentProgram?: string;
  signalQuality: number; // 0-100
  isRecording: boolean;
  isLive: boolean;
  startedAt?: Date;
  lastUpdate: Date;
  accessRoles: UserRole[];
}

export interface BlackScreenDetection {
  id: string;
  channelId: string;
  detectedAt: Date;
  duration: number; // seconds
  severity: AlertSeverity;
  resolved: boolean;
  resolvedAt?: Date;
  notifiedRoles: UserRole[];
}

export interface SatelliteStatistic {
  id: string;
  date: Date;
  textsCount: number;
  errorsCount: number;
  viewingMinutes: number;
  programsAired: number;
  blackScreenDetections: number;
  signalInterruptions: number;
  peakViewers: number;
  averageViewers: number;
}

export interface DisplayBarItem {
  id: string;
  text: string;
  category: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  priority: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface BroadcastError {
  id: string;
  channelId: string;
  type: 'signal_loss' | 'audio_loss' | 'video_loss' | 'black_screen' | 'sync_issue' | 'other';
  severity: AlertSeverity;
  detectedAt: Date;
  resolvedAt?: Date;
  description: string;
  autoResolved: boolean;
  actionTaken?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'black_screen' | 'error' | 'warning' | 'info' | 'success';
  severity: AlertSeverity;
  channelId?: string;
  targetRoles: UserRole[];
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface ExcelData {
  id: string;
  fileName: string;
  uploadedAt: Date;
  processed: boolean;
  processedAt?: Date;
  texts: DisplayBarItem[];
  categories: string[];
  totalItems: number;
}

export interface ProblemReport {
  id: string;
  channelId: string;
  type: string;
  description: string;
  detectedAt: Date;
  severity: AlertSeverity;
  status: 'open' | 'investigating' | 'resolved' | 'false_alarm';
  feedback?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface QuickFeedback {
  id: string;
  problemId: string;
  message: string;
  createdBy: string;
  createdAt: Date;
  acknowledged: boolean;
}

interface BroadcastStore {
  // Channels
  channels: BroadcastChannel[];
  activeChannel: string | null;
  
  // Detection & Monitoring
  blackScreenDetections: BlackScreenDetection[];
  errors: BroadcastError[];
  problems: ProblemReport[];
  
  // Statistics
  statistics: SatelliteStatistic[];
  displayBarItems: DisplayBarItem[];
  
  // Notifications
  notifications: Notification[];
  
  // Excel Data
  excelFiles: ExcelData[];
  
  // Feedback
  feedbacks: QuickFeedback[];
  
  // Settings
  blackScreenDetectionEnabled: boolean;
  blackScreenThreshold: number; // seconds
  autoNotificationEnabled: boolean;
  monitoringInterval: number; // seconds
  
  // Actions - Channel Management
  addChannel: (channel: Omit<BroadcastChannel, 'id' | 'lastUpdate'>) => void;
  updateChannel: (id: string, updates: Partial<BroadcastChannel>) => void;
  deleteChannel: (id: string) => void;
  setActiveChannel: (id: string | null) => void;
  startBroadcast: (channelId: string) => void;
  pauseBroadcast: (channelId: string) => void;
  stopBroadcast: (channelId: string) => void;
  
  // Actions - Black Screen Detection
  detectBlackScreen: (channelId: string, duration: number) => void;
  resolveBlackScreen: (detectionId: string) => void;
  getActiveBlackScreens: () => BlackScreenDetection[];
  
  // Actions - Error Management
  logError: (error: Omit<BroadcastError, 'id' | 'detectedAt'>) => void;
  resolveError: (errorId: string, actionTaken?: string) => void;
  getActiveErrors: () => BroadcastError[];
  
  // Actions - Statistics
  addStatistic: (stat: Omit<SatelliteStatistic, 'id'>) => void;
  getTodayStatistics: () => SatelliteStatistic | null;
  getStatisticsByDateRange: (from: Date, to: Date) => SatelliteStatistic[];
  
  // Actions - Display Bar
  addDisplayBarItem: (item: Omit<DisplayBarItem, 'id'>) => void;
  updateDisplayBarItem: (id: string, updates: Partial<DisplayBarItem>) => void;
  getActiveDisplayBarItems: () => DisplayBarItem[];
  getDisplayBarItemsByCategory: (category: string) => DisplayBarItem[];
  
  // Actions - Notifications
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  getUnreadNotifications: (role: UserRole) => Notification[];
  
  // Actions - Excel Processing
  processExcelFile: (file: File) => Promise<void>;
  addExcelData: (data: Omit<ExcelData, 'id' | 'uploadedAt'>) => void;
  
  // Actions - Problem Detection
  createProblem: (problem: Omit<ProblemReport, 'id' | 'detectedAt' | 'status'>) => void;
  updateProblem: (id: string, updates: Partial<ProblemReport>) => void;
  resolveProblem: (id: string, feedback: string, resolvedBy: string) => void;
  
  // Actions - Quick Feedback
  addFeedback: (feedback: Omit<QuickFeedback, 'id' | 'createdAt' | 'acknowledged'>) => void;
  acknowledgeFeedback: (id: string) => void;
  
  // Actions - Settings
  updateSettings: (settings: {
    blackScreenDetectionEnabled?: boolean;
    blackScreenThreshold?: number;
    autoNotificationEnabled?: boolean;
    monitoringInterval?: number;
  }) => void;
  
  // Actions - Analytics
  getChannelStatistics: (channelId: string, date: Date) => {
    totalErrors: number;
    blackScreenCount: number;
    totalViewingMinutes: number;
    averageSignalQuality: number;
  };
  
  // Actions - Monitoring
  checkBlackScreens: () => void;
  updateSignalQuality: (channelId: string, quality: number) => void;
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
      date: item.date ? new Date(item.date) : new Date(),
      startTime: item.startTime ? new Date(item.startTime) : new Date(),
      endTime: item.endTime ? new Date(item.endTime) : undefined,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      readAt: item.readAt ? new Date(item.readAt) : undefined,
      startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
      lastUpdate: item.lastUpdate ? new Date(item.lastUpdate) : new Date(),
      uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
      processedAt: item.processedAt ? new Date(item.processedAt) : undefined,
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

export const useBroadcastStore = create<BroadcastStore>()((set, get) => ({
  channels: loadFromStorage<BroadcastChannel>('broadcast-channels', [
    {
      id: '1',
      name: 'Channel 1 - Main Studio',
      description: 'Primary broadcast channel',
      status: 'idle',
      tvLink: 'rtmp://broadcast.example.com/live/main',
      signalQuality: 95,
      isRecording: false,
      isLive: false,
      accessRoles: ['admin', 'manager', 'operator'],
      lastUpdate: new Date(),
    },
  ]),
  activeChannel: null,
  blackScreenDetections: loadFromStorage<BlackScreenDetection>('broadcast-black-screens', []),
  errors: loadFromStorage<BroadcastError>('broadcast-errors', []),
  problems: loadFromStorage<ProblemReport>('broadcast-problems', []),
  statistics: loadFromStorage<SatelliteStatistic>('broadcast-statistics', []),
  displayBarItems: loadFromStorage<DisplayBarItem>('broadcast-display-bar', []),
  notifications: loadFromStorage<Notification>('broadcast-notifications', []),
  excelFiles: loadFromStorage<ExcelData>('broadcast-excel-files', []),
  feedbacks: loadFromStorage<QuickFeedback>('broadcast-feedbacks', []),
  blackScreenDetectionEnabled: true,
  blackScreenThreshold: 5, // 5 seconds
  autoNotificationEnabled: true,
  monitoringInterval: 10, // 10 seconds
  
  // Channel Management
  addChannel: (channelData) => {
    const newChannel: BroadcastChannel = {
      ...channelData,
      id: Date.now().toString(),
      lastUpdate: new Date(),
    };
    set((state) => {
      const updated = [...state.channels, newChannel];
      saveToStorage('broadcast-channels', updated);
      return { channels: updated };
    });
  },
  updateChannel: (id, updates) => {
    set((state) => {
      const updated = state.channels.map((c) =>
        c.id === id ? { ...c, ...updates, lastUpdate: new Date() } : c
      );
      saveToStorage('broadcast-channels', updated);
      return { channels: updated };
    });
  },
  deleteChannel: (id) => {
    set((state) => {
      const updated = state.channels.filter((c) => c.id !== id);
      saveToStorage('broadcast-channels', updated);
      if (state.activeChannel === id) {
        return { channels: updated, activeChannel: null };
      }
      return { channels: updated };
    });
  },
  setActiveChannel: (id) => set({ activeChannel: id }),
  startBroadcast: (channelId) => {
    get().updateChannel(channelId, {
      status: 'playing',
      isLive: true,
      startedAt: new Date(),
    });
  },
  pauseBroadcast: (channelId) => {
    get().updateChannel(channelId, {
      status: 'paused',
    });
  },
  stopBroadcast: (channelId) => {
    get().updateChannel(channelId, {
      status: 'stopped',
      isLive: false,
    });
  },
  
  // Black Screen Detection
  detectBlackScreen: (channelId, duration) => {
    const channel = get().channels.find((c) => c.id === channelId);
    if (!channel) return;
    
    const detection: BlackScreenDetection = {
      id: Date.now().toString(),
      channelId,
      detectedAt: new Date(),
      duration,
      severity: duration > 30 ? 'critical' : duration > 15 ? 'high' : duration > 5 ? 'medium' : 'low',
      resolved: false,
      notifiedRoles: channel.accessRoles,
    };
    
    set((state) => {
      const updated = [...state.blackScreenDetections, detection];
      saveToStorage('broadcast-black-screens', updated);
      
      // Create notification if enabled
      if (state.autoNotificationEnabled) {
        get().createNotification({
          title: 'Black Screen Detected',
          message: `Black screen detected on ${channel.name} for ${duration} seconds`,
          type: 'black_screen',
          severity: detection.severity,
          channelId,
          targetRoles: channel.accessRoles,
        });
      }
      
      return { blackScreenDetections: updated };
    });
  },
  resolveBlackScreen: (detectionId) => {
    set((state) => {
      const updated = state.blackScreenDetections.map((d) =>
        d.id === detectionId ? { ...d, resolved: true, resolvedAt: new Date() } : d
      );
      saveToStorage('broadcast-black-screens', updated);
      return { blackScreenDetections: updated };
    });
  },
  getActiveBlackScreens: () => {
    return get().blackScreenDetections.filter((d) => !d.resolved);
  },
  
  // Error Management
  logError: (errorData) => {
    const error: BroadcastError = {
      ...errorData,
      id: Date.now().toString(),
      detectedAt: new Date(),
    };
    
    set((state) => {
      const updated = [...state.errors, error];
      saveToStorage('broadcast-errors', updated);
      
      // Create notification
      const channel = state.channels.find((c) => c.id === error.channelId);
      if (channel && state.autoNotificationEnabled) {
        get().createNotification({
          title: 'Broadcast Error',
          message: `${error.type} error on ${channel.name}`,
          type: 'error',
          severity: error.severity,
          channelId: error.channelId,
          targetRoles: channel.accessRoles,
        });
      }
      
      return { errors: updated };
    });
  },
  resolveError: (errorId, actionTaken) => {
    set((state) => {
      const updated = state.errors.map((e) =>
        e.id === errorId ? { ...e, resolvedAt: new Date(), actionTaken } : e
      );
      saveToStorage('broadcast-errors', updated);
      return { errors: updated };
    });
  },
  getActiveErrors: () => {
    return get().errors.filter((e) => !e.resolvedAt);
  },
  
  // Statistics
  addStatistic: (statData) => {
    const stat: SatelliteStatistic = {
      ...statData,
      id: Date.now().toString(),
    };
    set((state) => {
      const updated = [...state.statistics, stat];
      saveToStorage('broadcast-statistics', updated);
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
  
  // Display Bar
  addDisplayBarItem: (itemData) => {
    const item: DisplayBarItem = {
      ...itemData,
      id: Date.now().toString(),
    };
    set((state) => {
      const updated = [...state.displayBarItems, item];
      saveToStorage('broadcast-display-bar', updated);
      return { displayBarItems: updated };
    });
  },
  updateDisplayBarItem: (id, updates) => {
    set((state) => {
      const updated = state.displayBarItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      saveToStorage('broadcast-display-bar', updated);
      return { displayBarItems: updated };
    });
  },
  getActiveDisplayBarItems: () => {
    return get().displayBarItems.filter((i) => i.status === 'active');
  },
  getDisplayBarItemsByCategory: (category) => {
    return get().displayBarItems.filter((i) => i.category === category);
  },
  
  // Notifications
  createNotification: (notificationData) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false,
    };
    set((state) => {
      const updated = [...state.notifications, notification];
      saveToStorage('broadcast-notifications', updated);
      return { notifications: updated };
    });
  },
  markNotificationAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date() } : n
      );
      saveToStorage('broadcast-notifications', updated);
      return { notifications: updated };
    });
  },
  getUnreadNotifications: (role) => {
    return get().notifications.filter((n) => !n.read && n.targetRoles.includes(role));
  },
  
  // Excel Processing
  processExcelFile: async (file) => {
    // Simulate Excel processing
    // In real implementation, use a library like xlsx to parse Excel files
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock extracted data
    const mockItems: DisplayBarItem[] = [
      {
        id: Date.now().toString(),
        text: 'Sample Text 1',
        category: 'News',
        startTime: new Date(),
        duration: 30,
        priority: 1,
        status: 'active',
      },
    ];
    
    const excelData: ExcelData = {
      id: Date.now().toString(),
      fileName: file.name,
      uploadedAt: new Date(),
      processed: true,
      processedAt: new Date(),
      texts: mockItems,
      categories: ['News', 'Sports', 'Weather'],
      totalItems: mockItems.length,
    };
    
    get().addExcelData(excelData);
    
    // Add display bar items
    mockItems.forEach((item) => {
      get().addDisplayBarItem(item);
    });
  },
  addExcelData: (data) => {
    const excelData: ExcelData = {
      ...data,
      id: Date.now().toString(),
      uploadedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.excelFiles, excelData];
      saveToStorage('broadcast-excel-files', updated);
      return { excelFiles: updated };
    });
  },
  
  // Problem Detection
  createProblem: (problemData) => {
    const problem: ProblemReport = {
      ...problemData,
      id: Date.now().toString(),
      detectedAt: new Date(),
      status: 'open',
    };
    set((state) => {
      const updated = [...state.problems, problem];
      saveToStorage('broadcast-problems', updated);
      return { problems: updated };
    });
  },
  updateProblem: (id, updates) => {
    set((state) => {
      const updated = state.problems.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      saveToStorage('broadcast-problems', updated);
      return { problems: updated };
    });
  },
  resolveProblem: (id, feedback, resolvedBy) => {
    get().updateProblem(id, {
      status: 'resolved',
      feedback,
      resolvedBy,
      resolvedAt: new Date(),
    });
  },
  
  // Quick Feedback
  addFeedback: (feedbackData) => {
    const feedback: QuickFeedback = {
      ...feedbackData,
      id: Date.now().toString(),
      createdAt: new Date(),
      acknowledged: false,
    };
    set((state) => {
      const updated = [...state.feedbacks, feedback];
      saveToStorage('broadcast-feedbacks', updated);
      return { feedbacks: updated };
    });
  },
  acknowledgeFeedback: (id) => {
    set((state) => {
      const updated = state.feedbacks.map((f) =>
        f.id === id ? { ...f, acknowledged: true } : f
      );
      saveToStorage('broadcast-feedbacks', updated);
      return { feedbacks: updated };
    });
  },
  
  // Settings
  updateSettings: (settings) => {
    set((state) => ({
      ...state,
      ...settings,
    }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('broadcast-settings', JSON.stringify({
        blackScreenDetectionEnabled: settings.blackScreenDetectionEnabled ?? get().blackScreenDetectionEnabled,
        blackScreenThreshold: settings.blackScreenThreshold ?? get().blackScreenThreshold,
        autoNotificationEnabled: settings.autoNotificationEnabled ?? get().autoNotificationEnabled,
        monitoringInterval: settings.monitoringInterval ?? get().monitoringInterval,
      }));
    }
  },
  
  // Analytics
  getChannelStatistics: (channelId, date) => {
    const channelErrors = get().errors.filter(
      (e) => e.channelId === channelId && new Date(e.detectedAt).toDateString() === date.toDateString()
    );
    const blackScreens = get().blackScreenDetections.filter(
      (d) => d.channelId === channelId && new Date(d.detectedAt).toDateString() === date.toDateString()
    );
    const channel = get().channels.find((c) => c.id === channelId);
    const todayStats = get().getTodayStatistics();
    
    return {
      totalErrors: channelErrors.length,
      blackScreenCount: blackScreens.length,
      totalViewingMinutes: todayStats?.viewingMinutes || 0,
      averageSignalQuality: channel?.signalQuality || 0,
    };
  },
  
  // Monitoring
  checkBlackScreens: () => {
    // Simulate black screen detection
    // In real implementation, this would check actual video feeds
    if (!get().blackScreenDetectionEnabled) return;
    
    get().channels.forEach((channel) => {
      if (channel.isLive && channel.status === 'playing') {
        // Simulate random black screen detection
        if (Math.random() < 0.05) { // 5% chance
          const duration = Math.floor(Math.random() * 30) + 1;
          if (duration >= get().blackScreenThreshold) {
            get().detectBlackScreen(channel.id, duration);
          }
        }
      }
    });
  },
  updateSignalQuality: (channelId, quality) => {
    get().updateChannel(channelId, { signalQuality: quality });
    
    // Log error if signal quality is too low
    if (quality < 50) {
      get().logError({
        channelId,
        type: 'signal_loss',
        severity: quality < 20 ? 'critical' : 'high',
        description: `Signal quality dropped to ${quality}%`,
        autoResolved: false,
      });
    }
  },
}));

// Initialize monitoring interval
if (typeof window !== 'undefined') {
  const store = useBroadcastStore.getState();
  setInterval(() => {
    store.checkBlackScreens();
  }, store.monitoringInterval * 1000);
}
