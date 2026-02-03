// Comprehensive live streaming store (Restream.io-like)
import { create } from 'zustand';

export type StreamStatus = 'idle' | 'starting' | 'live' | 'paused' | 'stopped' | 'archived' | 'error';
export type SocialPlatform = 
  | 'facebook' | 'youtube' | 'tiktok' | 'telegram' | 'twitter' | 'instagram' | 'linkedin'
  | 'twitch' | 'vimeo' | 'dailymotion' | 'periscope' | 'mixer' | 'dlive' | 'trovo'
  | 'rumble' | 'bitchute' | 'odnoklassniki' | 'vk' | 'okru' | 'custom_rtmp';

export interface SocialPlatformConfig {
  platform: SocialPlatform;
  enabled: boolean;
  streamKey?: string;
  rtmpUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  channelId?: string;
  pageId?: string;
  username?: string;
  customSettings?: Record<string, any>;
  lastConnected?: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  errorMessage?: string;
}

export interface StreamComment {
  id: string;
  streamId: string;
  platform: SocialPlatform;
  author: string;
  authorId?: string;
  message: string;
  timestamp: Date;
  likes?: number;
  isSubscriber?: boolean;
  isFollower?: boolean;
  isModerator?: boolean;
  avatar?: string;
}

export interface ViewerStatistic {
  id: string;
  streamId: string;
  platform: SocialPlatform;
  viewerCount: number;
  timestamp: Date;
  peakViewers?: number;
  averageViewers?: number;
}

export interface SubscriberFollower {
  id: string;
  streamId: string;
  platform: SocialPlatform;
  userId: string;
  username: string;
  type: 'subscriber' | 'follower' | 'both';
  joinedAt: Date;
  avatar?: string;
}

export interface LiveStreamSession {
  id: string;
  title: string;
  description?: string;
  broadcastChannelId: string; // Links to Broadcast Control
  status: StreamStatus;
  satelliteSource?: string;
  rtmpUrl?: string;
  streamKey?: string;
  startedAt?: Date;
  endedAt?: Date;
  duration: number; // seconds
  platforms: SocialPlatform[];
  platformConfigs: SocialPlatformConfig[];
  currentViewers: number;
  totalViewers: number;
  peakViewers: number;
  comments: StreamComment[];
  viewerStats: ViewerStatistic[];
  subscribersFollowers: SubscriberFollower[];
  isRecording: boolean;
  recordingPath?: string;
  recordingStartedAt?: Date;
  archived: boolean;
  archivedAt?: Date;
  archivePath?: string;
  thumbnail?: string;
  tags?: string[];
  scheduledStart?: Date;
  scheduledEnd?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LiveStreamingStore {
  sessions: LiveStreamSession[];
  activeSession: string | null;
  
  // Session Management
  createSession: (session: Omit<LiveStreamSession, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentViewers' | 'totalViewers' | 'peakViewers' | 'comments' | 'viewerStats' | 'subscribersFollowers' | 'isRecording' | 'archived' | 'duration'>) => void;
  updateSession: (id: string, updates: Partial<LiveStreamSession>) => void;
  deleteSession: (id: string) => void;
  getSession: (id: string) => LiveStreamSession | undefined;
  getActiveSessions: () => LiveStreamSession[];
  getScheduledSessions: () => LiveStreamSession[];
  
  // Stream Control
  startStream: (sessionId: string) => Promise<void>;
  pauseStream: (sessionId: string) => void;
  stopStream: (sessionId: string) => void;
  goLive: (sessionId: string, satelliteSource?: string) => Promise<void>;
  
  // Recording
  startRecording: (sessionId: string) => void;
  stopRecording: (sessionId: string) => void;
  
  // Archiving
  archiveSession: (sessionId: string) => void;
  
  // Comments
  addComment: (sessionId: string, comment: Omit<StreamComment, 'id' | 'timestamp'>) => void;
  getComments: (sessionId: string) => StreamComment[];
  
  // Viewer Statistics
  updateViewerCount: (sessionId: string, platform: SocialPlatform, count: number) => void;
  getViewerStats: (sessionId: string) => ViewerStatistic[];
  getTotalViewers: (sessionId: string) => number;
  
  // Subscribers & Followers
  addSubscriberFollower: (sessionId: string, data: Omit<SubscriberFollower, 'id' | 'joinedAt'>) => void;
  getSubscribersFollowers: (sessionId: string) => SubscriberFollower[];
  
  // Platform Configuration
  updatePlatformConfig: (sessionId: string, platform: SocialPlatform, config: Partial<SocialPlatformConfig>) => void;
  getPlatformConfig: (sessionId: string, platform: SocialPlatform) => SocialPlatformConfig | undefined;
  connectPlatform: (sessionId: string, platform: SocialPlatform) => Promise<void>;
  disconnectPlatform: (sessionId: string, platform: SocialPlatform) => void;
  
  // Statistics
  getSessionStatistics: (sessionId: string) => {
    totalViewers: number;
    peakViewers: number;
    averageViewers: number;
    totalComments: number;
    totalSubscribers: number;
    totalFollowers: number;
    duration: number;
    platformsActive: number;
  };
  
  // Get sessions from Broadcast Control
  getSessionsFromBroadcast: (broadcastChannelId: string) => LiveStreamSession[];
}

const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
      endedAt: item.endedAt ? new Date(item.endedAt) : undefined,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      joinedAt: item.joinedAt ? new Date(item.joinedAt) : new Date(),
      scheduledStart: item.scheduledStart ? new Date(item.scheduledStart) : undefined,
      scheduledEnd: item.scheduledEnd ? new Date(item.scheduledEnd) : undefined,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      lastConnected: item.lastConnected ? new Date(item.lastConnected) : undefined,
      archivedAt: item.archivedAt ? new Date(item.archivedAt) : undefined,
      recordingStartedAt: item.recordingStartedAt ? new Date(item.recordingStartedAt) : undefined,
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

export const useLiveStreamingStore = create<LiveStreamingStore>()((set, get) => ({
  sessions: loadFromStorage<LiveStreamSession>('live-streaming-sessions', []),
  activeSession: null,
  
  createSession: (sessionData) => {
    const newSession: LiveStreamSession = {
      ...sessionData,
      id: Date.now().toString(),
      status: 'idle',
      currentViewers: 0,
      totalViewers: 0,
      peakViewers: 0,
      comments: [],
      viewerStats: [],
      subscribersFollowers: [],
      isRecording: false,
      archived: false,
      duration: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.sessions, newSession];
      saveToStorage('live-streaming-sessions', updated);
      return { sessions: updated };
    });
  },
  
  updateSession: (id, updates) => {
    set((state) => {
      const updated = state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      );
      saveToStorage('live-streaming-sessions', updated);
      return { sessions: updated };
    });
  },
  
  deleteSession: (id) => {
    set((state) => {
      const updated = state.sessions.filter((s) => s.id !== id);
      saveToStorage('live-streaming-sessions', updated);
      if (state.activeSession === id) {
        return { sessions: updated, activeSession: null };
      }
      return { sessions: updated };
    });
  },
  
  getSession: (id) => {
    return get().sessions.find((s) => s.id === id);
  },
  
  getActiveSessions: () => {
    return get().sessions.filter((s) => s.status === 'live' || s.status === 'starting');
  },
  
  getScheduledSessions: () => {
    return get().sessions.filter((s) => 
      s.status === 'idle' && s.scheduledStart && s.scheduledStart > new Date()
    );
  },
  
  startStream: async (sessionId) => {
    const session = get().getSession(sessionId);
    if (!session) return;
    
    get().updateSession(sessionId, {
      status: 'starting',
      startedAt: new Date(),
    });
    
    // Simulate stream start
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    get().updateSession(sessionId, {
      status: 'live',
    });
    
    // Start periodic viewer updates
    const intervalId = setInterval(() => {
      const currentSession = get().getSession(sessionId);
      if (!currentSession || currentSession.status !== 'live') {
        clearInterval(intervalId);
        return;
      }
      
      // Simulate viewer count updates
      session.platforms.forEach((platform) => {
        const count = Math.floor(Math.random() * 1000) + 100;
        get().updateViewerCount(sessionId, platform, count);
      });
      
      // Simulate comments
      if (Math.random() < 0.3) {
        const comments = ['Great stream!', 'Love this!', 'Amazing content', 'Keep it up!', 'Thank you!'];
        get().addComment(sessionId, {
          streamId: sessionId,
          platform: session.platforms[Math.floor(Math.random() * session.platforms.length)],
          author: `Viewer${Math.floor(Math.random() * 1000)}`,
          message: comments[Math.floor(Math.random() * comments.length)],
        });
      }
    }, 5000);
    
    (window as any)[`streamInterval_${sessionId}`] = intervalId;
  },
  
  pauseStream: (sessionId) => {
    get().updateSession(sessionId, { status: 'paused' });
  },
  
  stopStream: (sessionId) => {
    const session = get().getSession(sessionId);
    if (!session) return;
    
    const intervalId = (window as any)[`streamInterval_${sessionId}`];
    if (intervalId) {
      clearInterval(intervalId);
      delete (window as any)[`streamInterval_${sessionId}`];
    }
    
    const duration = session.startedAt 
      ? Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000)
      : 0;
    
    get().updateSession(sessionId, {
      status: 'stopped',
      endedAt: new Date(),
      duration,
    });
    
    if (session.isRecording) {
      get().stopRecording(sessionId);
    }
  },
  
  goLive: async (sessionId, satelliteSource) => {
    const session = get().getSession(sessionId);
    if (!session) return;
    
    // Connect to satellite source
    get().updateSession(sessionId, {
      status: 'starting',
      satelliteSource: satelliteSource || session.broadcastChannelId,
      startedAt: new Date(),
    });
    
    // Simulate connection to satellite
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Start streaming to all enabled platforms
    get().updateSession(sessionId, {
      status: 'live',
    });
    
    // Start the stream
    await get().startStream(sessionId);
  },
  
  startRecording: (sessionId) => {
    const session = get().getSession(sessionId);
    if (!session) return;
    
    get().updateSession(sessionId, {
      isRecording: true,
      recordingStartedAt: new Date(),
      recordingPath: `/recordings/${sessionId}_${Date.now()}.mp4`,
    });
  },
  
  stopRecording: (sessionId) => {
    get().updateSession(sessionId, {
      isRecording: false,
    });
  },
  
  archiveSession: (sessionId) => {
    const session = get().getSession(sessionId);
    if (!session) return;
    
    get().updateSession(sessionId, {
      archived: true,
      archivedAt: new Date(),
      archivePath: `/archive/${sessionId}_${Date.now()}.zip`,
      status: 'archived',
    });
    
    // In real implementation, this would send to Archive module
  },
  
  addComment: (sessionId, commentData) => {
    const comment: StreamComment = {
      ...commentData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return state;
      
      const updated = state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, comments: [...s.comments, comment], updatedAt: new Date() }
          : s
      );
      saveToStorage('live-streaming-sessions', updated);
      return { sessions: updated };
    });
  },
  
  getComments: (sessionId) => {
    const session = get().getSession(sessionId);
    return session?.comments || [];
  },
  
  updateViewerCount: (sessionId, platform, count) => {
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return state;
      
      const totalViewers = session.platforms.reduce((sum, p) => {
        if (p === platform) return sum + count;
        const stats = session.viewerStats.filter((v) => v.platform === p);
        return sum + (stats[stats.length - 1]?.viewerCount || 0);
      }, 0);
      
      const peakViewers = Math.max(session.peakViewers, totalViewers);
      
      const viewerStat: ViewerStatistic = {
        id: Date.now().toString(),
        streamId: sessionId,
        platform,
        viewerCount: count,
        timestamp: new Date(),
      };
      
      const updated = state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              currentViewers: totalViewers,
              totalViewers: Math.max(s.totalViewers, totalViewers),
              peakViewers,
              viewerStats: [...s.viewerStats, viewerStat],
              updatedAt: new Date(),
            }
          : s
      );
      saveToStorage('live-streaming-sessions', updated);
      return { sessions: updated };
    });
  },
  
  getViewerStats: (sessionId) => {
    const session = get().getSession(sessionId);
    return session?.viewerStats || [];
  },
  
  getTotalViewers: (sessionId) => {
    const session = get().getSession(sessionId);
    return session?.currentViewers || 0;
  },
  
  addSubscriberFollower: (sessionId, data) => {
    const subFollower: SubscriberFollower = {
      ...data,
      id: Date.now().toString(),
      joinedAt: new Date(),
    };
    
    set((state) => {
      const updated = state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, subscribersFollowers: [...s.subscribersFollowers, subFollower], updatedAt: new Date() }
          : s
      );
      saveToStorage('live-streaming-sessions', updated);
      return { sessions: updated };
    });
  },
  
  getSubscribersFollowers: (sessionId) => {
    const session = get().getSession(sessionId);
    return session?.subscribersFollowers || [];
  },
  
  updatePlatformConfig: (sessionId, platform, config) => {
    set((state) => {
      const session = state.sessions.find((s) => s.id === sessionId);
      if (!session) return state;
      
      const updatedConfigs = session.platformConfigs.map((c) =>
        c.platform === platform ? { ...c, ...config } : c
      );
      
      if (!updatedConfigs.find((c) => c.platform === platform)) {
        updatedConfigs.push({
          platform,
          enabled: false,
          connectionStatus: 'pending',
          ...config,
        } as SocialPlatformConfig);
      }
      
      const updated = state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, platformConfigs: updatedConfigs, updatedAt: new Date() }
          : s
      );
      saveToStorage('live-streaming-sessions', updated);
      return { sessions: updated };
    });
  },
  
  getPlatformConfig: (sessionId, platform) => {
    const session = get().getSession(sessionId);
    return session?.platformConfigs.find((c) => c.platform === platform);
  },
  
  connectPlatform: async (sessionId, platform) => {
    const config = get().getPlatformConfig(sessionId, platform);
    if (!config) return;
    
    get().updatePlatformConfig(sessionId, platform, {
      connectionStatus: 'pending',
    });
    
    // Simulate platform connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    get().updatePlatformConfig(sessionId, platform, {
      connectionStatus: 'connected',
      lastConnected: new Date(),
    });
  },
  
  disconnectPlatform: (sessionId, platform) => {
    get().updatePlatformConfig(sessionId, platform, {
      connectionStatus: 'disconnected',
      enabled: false,
    });
  },
  
  getSessionStatistics: (sessionId) => {
    const session = get().getSession(sessionId);
    if (!session) {
      return {
        totalViewers: 0,
        peakViewers: 0,
        averageViewers: 0,
        totalComments: 0,
        totalSubscribers: 0,
        totalFollowers: 0,
        duration: 0,
        platformsActive: 0,
      };
    }
    
    const avgViewers = session.viewerStats.length > 0
      ? session.viewerStats.reduce((sum, v) => sum + v.viewerCount, 0) / session.viewerStats.length
      : 0;
    
    const subscribers = session.subscribersFollowers.filter((s) => 
      s.type === 'subscriber' || s.type === 'both'
    ).length;
    
    const followers = session.subscribersFollowers.filter((s) => 
      s.type === 'follower' || s.type === 'both'
    ).length;
    
    return {
      totalViewers: session.totalViewers,
      peakViewers: session.peakViewers,
      averageViewers: Math.round(avgViewers),
      totalComments: session.comments.length,
      totalSubscribers: subscribers,
      totalFollowers: followers,
      duration: session.duration,
      platformsActive: session.platforms.filter((p) => {
        const config = session.platformConfigs.find((c) => c.platform === p);
        return config?.enabled && config?.connectionStatus === 'connected';
      }).length,
    };
  },
  
  getSessionsFromBroadcast: (broadcastChannelId) => {
    return get().sessions.filter((s) => s.broadcastChannelId === broadcastChannelId);
  },
}));
