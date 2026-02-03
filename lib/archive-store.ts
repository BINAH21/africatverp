// Comprehensive archive store for system-wide archiving with role-based access
import { create } from 'zustand';

export type ArchiveCategory = 
  | 'recording' 
  | 'content' 
  | 'report' 
  | 'system-log' 
  | 'order' 
  | 'task' 
  | 'camera-report' 
  | 'failed-task'
  | 'user-action'
  | 'financial'
  | 'personnel'
  | 'inventory'
  | 'broadcast'
  | 'scheduling'
  | 'other';

export type ArchiveStatus = 'active' | 'archived' | 'deleted' | 'pending';

export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer' | 'guest';

export interface RecordingArchive {
  id: string;
  cameraId: number;
  cameraName: string;
  recordingDate: Date;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  filePath: string;
  serverPath: string;
  isCopied: boolean;
  isLinked: boolean;
  fileExists: boolean;
  fileSize: number; // in bytes
  format: string;
  resolution?: string;
  storageLocation: string;
  backupLocation?: string;
  metadata?: {
    quality?: string;
    bitrate?: number;
    codec?: string;
    notes?: string;
  };
  archivedAt: Date;
  archivedBy: string;
  category: ArchiveCategory;
  tags: string[];
  accessRoles: UserRole[];
}

export interface SystemActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: Record<string, any>;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  archivedAt: Date;
  category: ArchiveCategory;
  tags: string[];
  accessRoles: UserRole[];
}

export interface OrderArchive {
  id: string;
  orderId: string;
  orderType: 'given' | 'received';
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  archivedAt: Date;
  archivedBy: string;
  category: ArchiveCategory;
  tags: string[];
  accessRoles: UserRole[];
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
}

export interface FailedTaskArchive {
  id: string;
  taskId: string;
  taskName: string;
  taskType: string;
  module: string;
  userId: string;
  userName: string;
  errorMessage: string;
  errorDetails: Record<string, any>;
  failedAt: Date;
  retryCount: number;
  lastRetryAt?: Date;
  resolvedAt?: Date;
  isResolved: boolean;
  archivedAt: Date;
  archivedBy: string;
  category: ArchiveCategory;
  tags: string[];
  accessRoles: UserRole[];
}

export interface ArchiveItem {
  id: string;
  title: string;
  description?: string;
  category: ArchiveCategory;
  type: 'recording' | 'content' | 'report' | 'system-log' | 'order' | 'task' | 'camera-report' | 'failed-task' | 'other';
  status: ArchiveStatus;
  createdAt: Date;
  archivedAt: Date;
  archivedBy: string;
  filePath?: string;
  serverPath?: string;
  fileExists?: boolean;
  isLinked?: boolean;
  isCopied?: boolean;
  metadata: Record<string, any>;
  tags: string[];
  accessRoles: UserRole[];
  relatedItems?: string[]; // IDs of related archive items
  collectionId?: string;
  year: number;
  month: number;
}

export interface ArchiveCollection {
  id: string;
  name: string;
  description?: string;
  category: ArchiveCategory;
  year: number;
  month?: number;
  itemCount: number;
  createdAt: Date;
  createdBy: string;
  accessRoles: UserRole[];
  tags: string[];
}

interface ArchiveStore {
  recordings: RecordingArchive[];
  systemLogs: SystemActivityLog[];
  orders: OrderArchive[];
  failedTasks: FailedTaskArchive[];
  items: ArchiveItem[];
  collections: ArchiveCollection[];
  
  // Recording management
  addRecording: (recording: Omit<RecordingArchive, 'id' | 'archivedAt'>) => void;
  updateRecording: (id: string, updates: Partial<RecordingArchive>) => void;
  getRecording: (id: string) => RecordingArchive | undefined;
  getRecordingsByCamera: (cameraId: number) => RecordingArchive[];
  getRecordingsByDate: (date: Date) => RecordingArchive[];
  checkRecordingStatus: (id: string) => { isCopied: boolean; isLinked: boolean; fileExists: boolean };
  linkToServer: (id: string, serverPath: string) => void;
  
  // System activity logging
  logActivity: (activity: Omit<SystemActivityLog, 'id' | 'timestamp' | 'archivedAt'>) => void;
  getActivityLogs: (filters?: { userId?: string; module?: string; action?: string; dateFrom?: Date; dateTo?: Date }) => SystemActivityLog[];
  getActivityLogsByUser: (userId: string) => SystemActivityLog[];
  getActivityLogsByModule: (module: string) => SystemActivityLog[];
  
  // Order archiving
  archiveOrder: (order: Omit<OrderArchive, 'id' | 'archivedAt'>) => void;
  getOrdersByUser: (userId: string) => OrderArchive[];
  getOrdersByStatus: (status: OrderArchive['status']) => OrderArchive[];
  
  // Failed task archiving
  archiveFailedTask: (task: Omit<FailedTaskArchive, 'id' | 'archivedAt'>) => void;
  getFailedTasksByModule: (module: string) => FailedTaskArchive[];
  getUnresolvedFailedTasks: () => FailedTaskArchive[];
  markTaskResolved: (id: string) => void;
  
  // General archive management
  archiveItem: (item: Omit<ArchiveItem, 'id' | 'archivedAt'>) => void;
  getItemsByCategory: (category: ArchiveCategory) => ArchiveItem[];
  getItemsByYear: (year: number) => ArchiveItem[];
  getItemsByMonth: (year: number, month: number) => ArchiveItem[];
  getItemsByRole: (role: UserRole) => ArchiveItem[];
  searchItems: (query: string, filters?: { category?: ArchiveCategory; year?: number; month?: number }) => ArchiveItem[];
  
  // Collections
  createCollection: (collection: Omit<ArchiveCollection, 'id' | 'itemCount' | 'createdAt'>) => void;
  addItemToCollection: (collectionId: string, itemId: string) => void;
  getCollection: (id: string) => ArchiveCollection | undefined;
  getCollectionsByYear: (year: number) => ArchiveCollection[];
  
  // Monthly reports
  generateMonthlyReport: (year: number, month: number) => {
    summary: {
      totalItems: number;
      byCategory: Record<ArchiveCategory, number>;
      recordings: {
        total: number;
        copied: number;
        notCopied: number;
        linked: number;
        notLinked: number;
        fileExists: number;
        fileMissing: number;
      };
      systemLogs: number;
      orders: number;
      failedTasks: number;
      resolvedTasks: number;
    };
    details: {
      recordings: RecordingArchive[];
      systemLogs: SystemActivityLog[];
      orders: OrderArchive[];
      failedTasks: FailedTaskArchive[];
      items: ArchiveItem[];
    };
  };
  
  // Role-based access
  canAccess: (item: ArchiveItem | RecordingArchive | SystemActivityLog | OrderArchive | FailedTaskArchive, userRole: UserRole) => boolean;
  filterByRole: <T extends { accessRoles: UserRole[] }>(items: T[], userRole: UserRole) => T[];
  
  // Server folder operations
  openServerFolder: (serverPath: string) => void;
  verifyFileExists: (filePath: string) => boolean;
}

const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      recordingDate: item.recordingDate ? new Date(item.recordingDate) : new Date(),
      startTime: item.startTime ? new Date(item.startTime) : new Date(),
      endTime: item.endTime ? new Date(item.endTime) : undefined,
      timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      failedAt: item.failedAt ? new Date(item.failedAt) : undefined,
      archivedAt: item.archivedAt ? new Date(item.archivedAt) : new Date(),
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

export const useArchiveStore = create<ArchiveStore>()((set, get) => ({
  recordings: loadFromStorage<RecordingArchive>('archive-recordings', []),
  systemLogs: loadFromStorage<SystemActivityLog>('archive-system-logs', []),
  orders: loadFromStorage<OrderArchive>('archive-orders', []),
  failedTasks: loadFromStorage<FailedTaskArchive>('archive-failed-tasks', []),
  items: loadFromStorage<ArchiveItem>('archive-items', []),
  collections: loadFromStorage<ArchiveCollection>('archive-collections', []),
  
  // Recording management
  addRecording: (recordingData) => {
    const newRecording: RecordingArchive = {
      ...recordingData,
      id: Date.now().toString(),
      archivedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.recordings, newRecording];
      saveToStorage('archive-recordings', updated);
      return { recordings: updated };
    });
  },
  updateRecording: (id, updates) => {
    set((state) => {
      const updated = state.recordings.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      saveToStorage('archive-recordings', updated);
      return { recordings: updated };
    });
  },
  getRecording: (id) => {
    return get().recordings.find((r) => r.id === id);
  },
  getRecordingsByCamera: (cameraId) => {
    return get().recordings.filter((r) => r.cameraId === cameraId);
  },
  getRecordingsByDate: (date) => {
    const dateStr = date.toDateString();
    return get().recordings.filter((r) => 
      new Date(r.recordingDate).toDateString() === dateStr
    );
  },
  checkRecordingStatus: (id) => {
    const recording = get().getRecording(id);
    if (!recording) return { isCopied: false, isLinked: false, fileExists: false };
    return {
      isCopied: recording.isCopied,
      isLinked: recording.isLinked,
      fileExists: recording.fileExists,
    };
  },
  linkToServer: (id, serverPath) => {
    get().updateRecording(id, { serverPath, isLinked: true });
  },
  
  // System activity logging
  logActivity: (activityData) => {
    const newActivity: SystemActivityLog = {
      ...activityData,
      id: Date.now().toString(),
      timestamp: new Date(),
      archivedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.systemLogs, newActivity];
      saveToStorage('archive-system-logs', updated);
      return { systemLogs: updated };
    });
    
    // Auto-archive failed tasks after 24 hours
    if (activityData.status === 'failed' && activityData.entityType === 'task') {
      setTimeout(() => {
        const task = get().failedTasks.find(t => t.taskId === activityData.entityId);
        if (!task && activityData.entityId) {
          get().archiveFailedTask({
            taskId: activityData.entityId,
            taskName: activityData.entityName,
            taskType: activityData.entityType,
            module: activityData.module,
            userId: activityData.userId,
            userName: activityData.userName,
            errorMessage: activityData.errorMessage || 'Task failed',
            errorDetails: activityData.details,
            failedAt: new Date(),
            retryCount: 0,
            isResolved: false,
            archivedBy: 'system',
            category: 'failed-task',
            tags: [],
            accessRoles: ['admin', 'manager'],
          });
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
    }
  },
  getActivityLogs: (filters) => {
    let logs = get().systemLogs;
    if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId);
    if (filters?.module) logs = logs.filter(l => l.module === filters.module);
    if (filters?.action) logs = logs.filter(l => l.action === filters.action);
    if (filters?.dateFrom) logs = logs.filter(l => l.timestamp >= filters.dateFrom!);
    if (filters?.dateTo) logs = logs.filter(l => l.timestamp <= filters.dateTo!);
    return logs;
  },
  getActivityLogsByUser: (userId) => {
    return get().systemLogs.filter(l => l.userId === userId);
  },
  getActivityLogsByModule: (module) => {
    return get().systemLogs.filter(l => l.module === module);
  },
  
  // Order archiving
  archiveOrder: (orderData) => {
    const newOrder: OrderArchive = {
      ...orderData,
      id: Date.now().toString(),
      archivedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.orders, newOrder];
      saveToStorage('archive-orders', updated);
      return { orders: updated };
    });
  },
  getOrdersByUser: (userId) => {
    return get().orders.filter(o => o.fromUserId === userId || o.toUserId === userId);
  },
  getOrdersByStatus: (status) => {
    return get().orders.filter(o => o.status === status);
  },
  
  // Failed task archiving
  archiveFailedTask: (taskData) => {
    const newTask: FailedTaskArchive = {
      ...taskData,
      id: Date.now().toString(),
      archivedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.failedTasks, newTask];
      saveToStorage('archive-failed-tasks', updated);
      return { failedTasks: updated };
    });
  },
  getFailedTasksByModule: (module) => {
    return get().failedTasks.filter(t => t.module === module);
  },
  getUnresolvedFailedTasks: () => {
    return get().failedTasks.filter(t => !t.isResolved);
  },
  markTaskResolved: (id) => {
    set((state) => {
      const updated = state.failedTasks.map((t) =>
        t.id === id ? { ...t, isResolved: true, resolvedAt: new Date() } : t
      );
      saveToStorage('archive-failed-tasks', updated);
      return { failedTasks: updated };
    });
  },
  
  // General archive management
  archiveItem: (itemData) => {
    const newItem: ArchiveItem = {
      ...itemData,
      id: Date.now().toString(),
      archivedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.items, newItem];
      saveToStorage('archive-items', updated);
      return { items: updated };
    });
  },
  getItemsByCategory: (category) => {
    return get().items.filter(i => i.category === category);
  },
  getItemsByYear: (year) => {
    return get().items.filter(i => i.year === year);
  },
  getItemsByMonth: (year, month) => {
    return get().items.filter(i => i.year === year && i.month === month);
  },
  getItemsByRole: (role) => {
    return get().items.filter(i => i.accessRoles.includes(role));
  },
  searchItems: (query, filters) => {
    let items = get().items;
    const lowerQuery = query.toLowerCase();
    items = items.filter(i => 
      i.title.toLowerCase().includes(lowerQuery) ||
      i.description?.toLowerCase().includes(lowerQuery) ||
      i.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    if (filters?.category) items = items.filter(i => i.category === filters.category);
    if (filters?.year) items = items.filter(i => i.year === filters.year);
    if (filters?.month) items = items.filter(i => i.month === filters.month);
    return items;
  },
  
  // Collections
  createCollection: (collectionData) => {
    const newCollection: ArchiveCollection = {
      ...collectionData,
      id: Date.now().toString(),
      itemCount: 0,
      createdAt: new Date(),
    };
    set((state) => {
      const updated = [...state.collections, newCollection];
      saveToStorage('archive-collections', updated);
      return { collections: updated };
    });
  },
  addItemToCollection: (collectionId, itemId) => {
    set((state) => {
      const updatedCollections = state.collections.map(c =>
        c.id === collectionId ? { ...c, itemCount: c.itemCount + 1 } : c
      );
      const updatedItems = state.items.map(i =>
        i.id === itemId ? { ...i, collectionId } : i
      );
      saveToStorage('archive-collections', updatedCollections);
      saveToStorage('archive-items', updatedItems);
      return { collections: updatedCollections, items: updatedItems };
    });
  },
  getCollection: (id) => {
    return get().collections.find(c => c.id === id);
  },
  getCollectionsByYear: (year) => {
    return get().collections.filter(c => c.year === year);
  },
  
  // Monthly reports
  generateMonthlyReport: (year, month) => {
    const recordings = get().recordings.filter(r => {
      const date = new Date(r.recordingDate);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    const systemLogs = get().systemLogs.filter(l => {
      const date = new Date(l.timestamp);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    const orders = get().orders.filter(o => {
      const date = new Date(o.createdAt);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    const failedTasks = get().failedTasks.filter(t => {
      const date = new Date(t.failedAt);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
    const items = get().items.filter(i => i.year === year && i.month === month);
    
    const byCategory: Record<ArchiveCategory, number> = {
      recording: recordings.length,
      content: items.filter(i => i.category === 'content').length,
      report: items.filter(i => i.category === 'report').length,
      'system-log': systemLogs.length,
      order: orders.length,
      task: items.filter(i => i.category === 'task').length,
      'camera-report': items.filter(i => i.category === 'camera-report').length,
      'failed-task': failedTasks.length,
      'user-action': systemLogs.filter(l => l.category === 'user-action').length,
      financial: items.filter(i => i.category === 'financial').length,
      personnel: items.filter(i => i.category === 'personnel').length,
      inventory: items.filter(i => i.category === 'inventory').length,
      broadcast: items.filter(i => i.category === 'broadcast').length,
      scheduling: items.filter(i => i.category === 'scheduling').length,
      other: items.filter(i => i.category === 'other').length,
    };
    
    return {
      summary: {
        totalItems: recordings.length + systemLogs.length + orders.length + failedTasks.length + items.length,
        byCategory,
        recordings: {
          total: recordings.length,
          copied: recordings.filter(r => r.isCopied).length,
          notCopied: recordings.filter(r => !r.isCopied).length,
          linked: recordings.filter(r => r.isLinked).length,
          notLinked: recordings.filter(r => !r.isLinked).length,
          fileExists: recordings.filter(r => r.fileExists).length,
          fileMissing: recordings.filter(r => !r.fileExists).length,
        },
        systemLogs: systemLogs.length,
        orders: orders.length,
        failedTasks: failedTasks.length,
        resolvedTasks: failedTasks.filter(t => t.isResolved).length,
      },
      details: {
        recordings,
        systemLogs,
        orders,
        failedTasks,
        items,
      },
    };
  },
  
  // Role-based access
  canAccess: (item, userRole) => {
    return item.accessRoles.includes(userRole) || item.accessRoles.includes('admin');
  },
  filterByRole: (items, userRole) => {
    return items.filter(item => get().canAccess(item as any, userRole));
  },
  
  // Server folder operations
  openServerFolder: (serverPath) => {
    // In a real implementation, this would open the server folder
    // For now, we'll simulate it
    window.open(`file://${serverPath}`, '_blank');
  },
  verifyFileExists: (filePath) => {
    // In a real implementation, this would check if file exists on server
    // For now, we'll return true as a placeholder
    return true;
  },
}));
