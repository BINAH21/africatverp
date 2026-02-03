// Comprehensive media library store for server-linked files
import { create } from 'zustand';

export type MediaFileType = 'video' | 'image' | 'document' | 'audio' | 'archive' | 'other';
export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer' | 'guest';
export type FileStatus = 'active' | 'archived' | 'deleted' | 'pending';

export interface ServerFolder {
  id: string;
  name: string;
  path: string;
  serverPath: string;
  description?: string;
  isActive: boolean;
  autoScan: boolean;
  scanInterval: number; // in minutes
  lastScanned?: Date;
  fileCount: number;
  totalSize: number; // in bytes
  accessRoles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    year?: number;
    category?: string;
    tags?: string[];
  };
}

export interface MediaFile {
  id: string;
  name: string;
  fileName: string;
  type: MediaFileType;
  serverPath: string;
  localPath?: string;
  size: number; // in bytes
  extension: string;
  mimeType?: string;
  status: FileStatus;
  category?: string;
  tags: string[];
  description?: string;
  thumbnail?: string;
  duration?: number; // for videos/audio in seconds
  dimensions?: { width: number; height: number }; // for images/videos
  resolution?: string;
  bitrate?: number;
  codec?: string;
  frameRate?: number;
  createdAt: Date;
  modifiedAt: Date;
  discoveredAt: Date;
  folderId: string;
  folderPath: string;
  checksum?: string;
  metadata: {
    artist?: string;
    album?: string;
    title?: string;
    year?: number;
    genre?: string;
    camera?: string;
    location?: string;
    notes?: string;
    [key: string]: any;
  };
  accessRoles: UserRole[];
  views: number;
  downloads: number;
  lastAccessed?: Date;
  isFavorite: boolean;
  isShared: boolean;
  sharedWith?: string[];
  collectionIds: string[];
  relatedFiles?: string[]; // IDs of related files
}

export interface MediaCollection {
  id: string;
  name: string;
  description?: string;
  type: 'manual' | 'auto' | 'smart';
  fileIds: string[];
  folderIds: string[];
  criteria?: {
    type?: MediaFileType[];
    category?: string[];
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    sizeMin?: number;
    sizeMax?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  accessRoles: UserRole[];
  isPublic: boolean;
  coverImage?: string;
}

export interface ScanJob {
  id: string;
  folderId: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  progress: number; // 0-100
  filesFound: number;
  filesProcessed: number;
  errors: string[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in seconds
}

interface MediaLibraryStore {
  folders: ServerFolder[];
  files: MediaFile[];
  collections: MediaCollection[];
  scanJobs: ScanJob[];
  
  // Folder management
  addFolder: (folder: Omit<ServerFolder, 'id' | 'fileCount' | 'totalSize' | 'createdAt' | 'updatedAt'>) => void;
  updateFolder: (id: string, updates: Partial<ServerFolder>) => void;
  deleteFolder: (id: string) => void;
  getFolder: (id: string) => ServerFolder | undefined;
  getFoldersByRole: (role: UserRole) => ServerFolder[];
  toggleAutoScan: (id: string) => void;
  
  // File management
  addFile: (file: Omit<MediaFile, 'id' | 'discoveredAt' | 'views' | 'downloads' | 'isFavorite' | 'isShared' | 'collectionIds'>) => void;
  updateFile: (id: string, updates: Partial<MediaFile>) => void;
  deleteFile: (id: string) => void;
  getFile: (id: string) => MediaFile | undefined;
  getFilesByFolder: (folderId: string) => MediaFile[];
  getFilesByType: (type: MediaFileType) => MediaFile[];
  getFilesByRole: (role: UserRole) => MediaFile[];
  searchFiles: (query: string, filters?: { type?: MediaFileType; category?: string; tags?: string[]; dateFrom?: Date; dateTo?: Date }) => MediaFile[];
  
  // Scanning
  scanFolder: (folderId: string) => Promise<void>;
  startAutoScan: (folderId: string) => void;
  stopAutoScan: (folderId: string) => void;
  getScanJob: (id: string) => ScanJob | undefined;
  getActiveScanJobs: () => ScanJob[];
  updateScanJob: (id: string, updates: Partial<ScanJob>) => void;
  
  // Collections
  createCollection: (collection: Omit<MediaCollection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCollection: (id: string, updates: Partial<MediaCollection>) => void;
  deleteCollection: (id: string) => void;
  addFileToCollection: (collectionId: string, fileId: string) => void;
  removeFileFromCollection: (collectionId: string, fileId: string) => void;
  getCollection: (id: string) => MediaCollection | undefined;
  
  // File operations
  markAsFavorite: (fileId: string) => void;
  unmarkAsFavorite: (fileId: string) => void;
  shareFile: (fileId: string, userIds: string[]) => void;
  unshareFile: (fileId: string) => void;
  incrementViews: (fileId: string) => void;
  incrementDownloads: (fileId: string) => void;
  
  // Bulk operations
  bulkDelete: (fileIds: string[]) => void;
  bulkTag: (fileIds: string[], tags: string[]) => void;
  bulkCategorize: (fileIds: string[], category: string) => void;
  bulkMove: (fileIds: string[], folderId: string) => void;
  
  // Statistics
  getStatistics: () => {
    totalFiles: number;
    totalSize: number;
    byType: Record<MediaFileType, number>;
    byCategory: Record<string, number>;
    byYear: Record<number, number>;
    recentFiles: number;
    favoriteFiles: number;
    sharedFiles: number;
  };
  
  // Role-based access
  canAccess: (file: MediaFile, role: UserRole) => boolean;
  filterByRole: <T extends { accessRoles: UserRole[] }>(items: T[], role: UserRole) => T[];
  
  // Duplicate detection
  findDuplicates: (fileId: string) => MediaFile[];
  findDuplicatesByChecksum: (checksum: string) => MediaFile[];
  
  // File verification
  verifyFileExists: (serverPath: string) => boolean;
  openFileLocation: (serverPath: string) => void;
}

const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      discoveredAt: item.discoveredAt ? new Date(item.discoveredAt) : new Date(),
      modifiedAt: item.modifiedAt ? new Date(item.modifiedAt) : new Date(),
      lastScanned: item.lastScanned ? new Date(item.lastScanned) : undefined,
      lastAccessed: item.lastAccessed ? new Date(item.lastAccessed) : undefined,
      startedAt: item.startedAt ? new Date(item.startedAt) : undefined,
      completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
      dateFrom: item.dateFrom ? new Date(item.dateFrom) : undefined,
      dateTo: item.dateTo ? new Date(item.dateTo) : undefined,
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

export const useMediaLibraryStore = create<MediaLibraryStore>()((set, get) => ({
  folders: loadFromStorage<ServerFolder>('media-library-folders', []),
  files: loadFromStorage<MediaFile>('media-library-files', []),
  collections: loadFromStorage<MediaCollection>('media-library-collections', []),
  scanJobs: loadFromStorage<ScanJob>('media-library-scan-jobs', []),
  
  // Folder management
  addFolder: (folderData) => {
    const newFolder: ServerFolder = {
      ...folderData,
      id: Date.now().toString(),
      fileCount: 0,
      totalSize: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.folders, newFolder];
      saveToStorage('media-library-folders', updated);
      return { folders: updated };
    });
    
    // Auto-scan if enabled
    if (newFolder.autoScan) {
      get().startAutoScan(newFolder.id);
    }
  },
  updateFolder: (id, updates) => {
    set((state) => {
      const updated = state.folders.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date() } : f
      );
      saveToStorage('media-library-folders', updated);
      return { folders: updated };
    });
  },
  deleteFolder: (id) => {
    set((state) => {
      const updated = state.folders.filter((f) => f.id !== id);
      const updatedFiles = state.files.filter((f) => f.folderId !== id);
      saveToStorage('media-library-folders', updated);
      saveToStorage('media-library-files', updatedFiles);
      return { folders: updated, files: updatedFiles };
    });
  },
  getFolder: (id) => {
    return get().folders.find((f) => f.id === id);
  },
  getFoldersByRole: (role) => {
    return get().folders.filter((f) => f.accessRoles.includes(role) || f.accessRoles.includes('admin'));
  },
  toggleAutoScan: (id) => {
    const folder = get().getFolder(id);
    if (!folder) return;
    const newValue = !folder.autoScan;
    get().updateFolder(id, { autoScan: newValue });
    if (newValue) {
      get().startAutoScan(id);
    } else {
      get().stopAutoScan(id);
    }
  },
  
  // File management
  addFile: (fileData) => {
    const newFile: MediaFile = {
      ...fileData,
      id: Date.now().toString(),
      discoveredAt: new Date(),
      views: 0,
      downloads: 0,
      isFavorite: false,
      isShared: false,
      collectionIds: [],
    };
    set((state) => {
      const updated = [...state.files, newFile];
      const folder = state.folders.find(f => f.id === fileData.folderId);
      if (folder) {
        get().updateFolder(fileData.folderId, {
          fileCount: folder.fileCount + 1,
          totalSize: folder.totalSize + fileData.size,
        });
      }
      saveToStorage('media-library-files', updated);
      return { files: updated };
    });
  },
  updateFile: (id, updates) => {
    set((state) => {
      const updated = state.files.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      );
      saveToStorage('media-library-files', updated);
      return { files: updated };
    });
  },
  deleteFile: (id) => {
    set((state) => {
      const file = state.files.find(f => f.id === id);
      const updated = state.files.filter((f) => f.id !== id);
      if (file) {
        const folder = state.folders.find(f => f.id === file.folderId);
        if (folder) {
          get().updateFolder(file.folderId, {
            fileCount: Math.max(0, folder.fileCount - 1),
            totalSize: Math.max(0, folder.totalSize - file.size),
          });
        }
      }
      saveToStorage('media-library-files', updated);
      return { files: updated };
    });
  },
  getFile: (id) => {
    return get().files.find((f) => f.id === id);
  },
  getFilesByFolder: (folderId) => {
    return get().files.filter((f) => f.folderId === folderId);
  },
  getFilesByType: (type) => {
    return get().files.filter((f) => f.type === type);
  },
  getFilesByRole: (role) => {
    return get().filterByRole(get().files, role);
  },
  searchFiles: (query, filters) => {
    let files = get().files;
    const lowerQuery = query.toLowerCase();
    files = files.filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.fileName.toLowerCase().includes(lowerQuery) ||
      f.description?.toLowerCase().includes(lowerQuery) ||
      f.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
    if (filters?.type) files = files.filter(f => f.type === filters.type);
    if (filters?.category) files = files.filter(f => f.category === filters.category);
    if (filters?.tags) files = files.filter(f => filters.tags!.some(tag => f.tags.includes(tag)));
    if (filters?.dateFrom) files = files.filter(f => f.createdAt >= filters.dateFrom!);
    if (filters?.dateTo) files = files.filter(f => f.createdAt <= filters.dateTo!);
    return files;
  },
  
  // Scanning
  scanFolder: async (folderId) => {
    const folder = get().getFolder(folderId);
    if (!folder) return;
    
    const jobId = Date.now().toString();
    const job: ScanJob = {
      id: jobId,
      folderId,
      status: 'scanning',
      progress: 0,
      filesFound: 0,
      filesProcessed: 0,
      errors: [],
      startedAt: new Date(),
    };
    
    set((state) => {
      const updated = [...state.scanJobs, job];
      saveToStorage('media-library-scan-jobs', updated);
      return { scanJobs: updated };
    });
    
    // Simulate scanning (in real implementation, this would scan the server folder)
    // For now, we'll simulate finding files
    setTimeout(() => {
      get().updateScanJob(jobId, {
        status: 'completed',
        progress: 100,
        filesFound: 10,
        filesProcessed: 10,
        completedAt: new Date(),
        duration: 5,
      });
    }, 2000);
  },
  startAutoScan: (folderId) => {
    const folder = get().getFolder(folderId);
    if (!folder) return;
    
    // In a real implementation, this would set up an interval to scan
    // For now, we'll scan immediately and set up a simulated interval
    get().scanFolder(folderId);
    
    if (folder.scanInterval > 0) {
      const intervalId = setInterval(() => {
        get().scanFolder(folderId);
      }, folder.scanInterval * 60 * 1000);
      
      // Store interval ID (in real implementation, manage this properly)
      (window as any)[`scanInterval_${folderId}`] = intervalId;
    }
  },
  stopAutoScan: (folderId) => {
    const intervalId = (window as any)[`scanInterval_${folderId}`];
    if (intervalId) {
      clearInterval(intervalId);
      delete (window as any)[`scanInterval_${folderId}`];
    }
  },
  getScanJob: (id) => {
    return get().scanJobs.find(j => j.id === id);
  },
  getActiveScanJobs: () => {
    return get().scanJobs.filter(j => j.status === 'scanning' || j.status === 'pending');
  },
  updateScanJob: (id, updates) => {
    set((state) => {
      const updated = state.scanJobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      );
      saveToStorage('media-library-scan-jobs', updated);
      return { scanJobs: updated };
    });
  },
  
  // Collections
  createCollection: (collectionData) => {
    const newCollection: MediaCollection = {
      ...collectionData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.collections, newCollection];
      saveToStorage('media-library-collections', updated);
      return { collections: updated };
    });
  },
  updateCollection: (id, updates) => {
    set((state) => {
      const updated = state.collections.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      );
      saveToStorage('media-library-collections', updated);
      return { collections: updated };
    });
  },
  deleteCollection: (id) => {
    set((state) => {
      const updated = state.collections.filter((c) => c.id !== id);
      saveToStorage('media-library-collections', updated);
      return { collections: updated };
    });
  },
  addFileToCollection: (collectionId, fileId) => {
    set((state) => {
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection && !collection.fileIds.includes(fileId)) {
        get().updateCollection(collectionId, {
          fileIds: [...collection.fileIds, fileId],
        });
        get().updateFile(fileId, {
          collectionIds: [...(state.files.find(f => f.id === fileId)?.collectionIds || []), collectionId],
        });
      }
      return state;
    });
  },
  removeFileFromCollection: (collectionId, fileId) => {
    set((state) => {
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection) {
        get().updateCollection(collectionId, {
          fileIds: collection.fileIds.filter(id => id !== fileId),
        });
        const file = state.files.find(f => f.id === fileId);
        if (file) {
          get().updateFile(fileId, {
            collectionIds: file.collectionIds.filter(id => id !== collectionId),
          });
        }
      }
      return state;
    });
  },
  getCollection: (id) => {
    return get().collections.find(c => c.id === id);
  },
  
  // File operations
  markAsFavorite: (fileId) => {
    get().updateFile(fileId, { isFavorite: true });
  },
  unmarkAsFavorite: (fileId) => {
    get().updateFile(fileId, { isFavorite: false });
  },
  shareFile: (fileId, userIds) => {
    get().updateFile(fileId, { isShared: true, sharedWith: userIds });
  },
  unshareFile: (fileId) => {
    get().updateFile(fileId, { isShared: false, sharedWith: [] });
  },
  incrementViews: (fileId) => {
    const file = get().getFile(fileId);
    if (file) {
      get().updateFile(fileId, {
        views: file.views + 1,
        lastAccessed: new Date(),
      });
    }
  },
  incrementDownloads: (fileId) => {
    const file = get().getFile(fileId);
    if (file) {
      get().updateFile(fileId, {
        downloads: file.downloads + 1,
        lastAccessed: new Date(),
      });
    }
  },
  
  // Bulk operations
  bulkDelete: (fileIds) => {
    fileIds.forEach(id => get().deleteFile(id));
  },
  bulkTag: (fileIds, tags) => {
    fileIds.forEach(id => {
      const file = get().getFile(id);
      if (file) {
        const newTags = [...new Set([...file.tags, ...tags])];
        get().updateFile(id, { tags: newTags });
      }
    });
  },
  bulkCategorize: (fileIds, category) => {
    fileIds.forEach(id => get().updateFile(id, { category }));
  },
  bulkMove: (fileIds, folderId) => {
    fileIds.forEach(id => get().updateFile(id, { folderId, folderPath: get().getFolder(folderId)?.path || '' }));
  },
  
  // Statistics
  getStatistics: () => {
    const files = get().files;
    const byType: Record<MediaFileType, number> = {
      video: files.filter(f => f.type === 'video').length,
      image: files.filter(f => f.type === 'image').length,
      document: files.filter(f => f.type === 'document').length,
      audio: files.filter(f => f.type === 'audio').length,
      archive: files.filter(f => f.type === 'archive').length,
      other: files.filter(f => f.type === 'other').length,
    };
    const byCategory: Record<string, number> = {};
    files.forEach(f => {
      if (f.category) {
        byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      }
    });
    const byYear: Record<number, number> = {};
    files.forEach(f => {
      const year = new Date(f.createdAt).getFullYear();
      byYear[year] = (byYear[year] || 0) + 1;
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      byType,
      byCategory,
      byYear,
      recentFiles: files.filter(f => f.discoveredAt >= thirtyDaysAgo).length,
      favoriteFiles: files.filter(f => f.isFavorite).length,
      sharedFiles: files.filter(f => f.isShared).length,
    };
  },
  
  // Role-based access
  canAccess: (file, role) => {
    return file.accessRoles.includes(role) || file.accessRoles.includes('admin');
  },
  filterByRole: (items, role) => {
    return items.filter(item => get().canAccess(item as any, role));
  },
  
  // Duplicate detection
  findDuplicates: (fileId) => {
    const file = get().getFile(fileId);
    if (!file) return [];
    return get().files.filter(f =>
      f.id !== fileId &&
      f.name === file.name &&
      f.size === file.size
    );
  },
  findDuplicatesByChecksum: (checksum) => {
    return get().files.filter(f => f.checksum === checksum);
  },
  
  // File verification
  verifyFileExists: (serverPath) => {
    // In real implementation, check if file exists on server
    return true;
  },
  openFileLocation: (serverPath) => {
    // In real implementation, open file location
    window.open(`file://${serverPath}`, '_blank');
  },
}));
