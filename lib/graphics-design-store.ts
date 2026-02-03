// Shared graphics & design store for cross-system access
import { create } from 'zustand';

export interface DesignProgram {
  id: string;
  name: string;
  version?: string;
  description?: string;
  category: string;
  type: 'software' | 'plugin' | 'template' | 'preset' | 'font' | 'asset' | 'other';
  status: 'active' | 'inactive' | 'deprecated';
  installed: boolean;
  path?: string;
  icon?: string;
  metadata?: {
    developer?: string;
    license?: string;
    website?: string;
    releaseDate?: Date;
    lastUpdated?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GraphicsProject {
  id: string;
  title: string;
  description?: string;
  type: 'template' | 'graphic' | 'design' | 'logo' | 'animation' | 'infographic' | 'other';
  status: 'draft' | 'in-progress' | 'pending-review' | 'approved' | 'rejected' | 'completed' | 'archived';
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  programs: string[]; // IDs of design programs used
  files: {
    id: string;
    name: string;
    type: string;
    size: number;
    path: string;
    uploadedAt: Date;
    thumbnail?: string;
  }[];
  workflow: {
    currentStep: string;
    history: {
      step: string;
      action: string;
      user: string;
      timestamp: Date;
      notes?: string;
    }[];
  };
  orders: {
    id: string;
    type: 'given' | 'received';
    from?: string;
    to?: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    createdAt: Date;
  }[];
  metadata?: {
    dimensions?: string;
    format?: string;
    colorMode?: string;
    resolution?: string;
    notes?: string;
  };
}

interface GraphicsDesignStore {
  programs: DesignProgram[];
  projects: GraphicsProject[];
  
  // Program management
  addProgram: (program: Omit<DesignProgram, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProgram: (id: string, updates: Partial<DesignProgram>) => void;
  deleteProgram: (id: string) => void;
  getProgram: (id: string) => DesignProgram | undefined;
  getProgramsByType: (type: DesignProgram['type']) => DesignProgram[];
  getActivePrograms: () => DesignProgram[];
  
  // Project management
  addProject: (project: Omit<GraphicsProject, 'id' | 'createdAt' | 'updatedAt' | 'workflow' | 'orders'>) => void;
  updateProject: (id: string, updates: Partial<GraphicsProject>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => GraphicsProject | undefined;
  getProjectsByStatus: (status: GraphicsProject['status']) => GraphicsProject[];
  getProjectsByType: (type: GraphicsProject['type']) => GraphicsProject[];
  getActiveProjects: () => GraphicsProject[];
  getInProgressProjects: () => GraphicsProject[];
  getCompletedProjects: () => GraphicsProject[];
  
  // Workflow actions
  approveProject: (id: string, userId: string, notes?: string) => void;
  rejectProject: (id: string, userId: string, notes?: string) => void;
  sendProject: (id: string, toUserId: string, fromUserId: string, message?: string) => void;
  assignProject: (id: string, userId: string) => void;
  registerProject: (id: string, userId: string, notes?: string) => void;
  completeProject: (id: string, userId: string) => void;
  archiveProject: (id: string) => void;
  
  // Order management
  giveOrder: (projectId: string, toUserId: string, fromUserId: string, message: string) => void;
  receiveOrder: (projectId: string, fromUserId: string, toUserId: string, message: string) => void;
  acceptOrder: (projectId: string, orderId: string) => void;
  rejectOrder: (projectId: string, orderId: string) => void;
  completeOrder: (projectId: string, orderId: string) => void;
  
  // Export
  exportProject: (id: string) => void;
  exportProjects: (ids: string[]) => void;
}

const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      workflow: {
        ...item.workflow,
        history: item.workflow?.history?.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        })) || [],
      },
      orders: item.orders?.map((o: any) => ({
        ...o,
        createdAt: new Date(o.createdAt),
      })) || [],
      files: item.files?.map((f: any) => ({
        ...f,
        uploadedAt: new Date(f.uploadedAt),
      })) || [],
      metadata: {
        ...item.metadata,
        releaseDate: item.metadata?.releaseDate ? new Date(item.metadata.releaseDate) : undefined,
        lastUpdated: item.metadata?.lastUpdated ? new Date(item.metadata.lastUpdated) : undefined,
      },
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

export const useGraphicsDesignStore = create<GraphicsDesignStore>()((set, get) => ({
  programs: loadFromStorage<DesignProgram>('graphics-design-programs', []),
  projects: loadFromStorage<GraphicsProject>('graphics-design-projects', []),
  
  // Program management
  addProgram: (programData) => {
    const newProgram: DesignProgram = {
      ...programData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.programs, newProgram];
      saveToStorage('graphics-design-programs', updated);
      return { programs: updated };
    });
  },
  updateProgram: (id, updates) => {
    set((state) => {
      const updated = state.programs.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      );
      saveToStorage('graphics-design-programs', updated);
      return { programs: updated };
    });
  },
  deleteProgram: (id) => {
    set((state) => {
      const updated = state.programs.filter((p) => p.id !== id);
      saveToStorage('graphics-design-programs', updated);
      return { programs: updated };
    });
  },
  getProgram: (id) => {
    return get().programs.find((p) => p.id === id);
  },
  getProgramsByType: (type) => {
    return get().programs.filter((p) => p.type === type);
  },
  getActivePrograms: () => {
    return get().programs.filter((p) => p.status === 'active');
  },
  
  // Project management
  addProject: (projectData) => {
    const newProject: GraphicsProject = {
      ...projectData,
      id: Date.now().toString(),
      workflow: {
        currentStep: 'draft',
        history: [{
          step: 'draft',
          action: 'created',
          user: projectData.createdBy,
          timestamp: new Date(),
        }],
      },
      orders: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.projects, newProject];
      saveToStorage('graphics-design-projects', updated);
      return { projects: updated };
    });
  },
  updateProject: (id, updates) => {
    set((state) => {
      const updated = state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      );
      saveToStorage('graphics-design-projects', updated);
      return { projects: updated };
    });
  },
  deleteProject: (id) => {
    set((state) => {
      const updated = state.projects.filter((p) => p.id !== id);
      saveToStorage('graphics-design-projects', updated);
      return { projects: updated };
    });
  },
  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },
  getProjectsByStatus: (status) => {
    return get().projects.filter((p) => p.status === status);
  },
  getProjectsByType: (type) => {
    return get().projects.filter((p) => p.type === type);
  },
  getActiveProjects: () => {
    return get().projects.filter((p) => 
      ['draft', 'in-progress', 'pending-review'].includes(p.status)
    );
  },
  getInProgressProjects: () => {
    return get().projects.filter((p) => p.status === 'in-progress');
  },
  getCompletedProjects: () => {
    return get().projects.filter((p) => p.status === 'completed');
  },
  
  // Workflow actions
  approveProject: (id, userId, notes) => {
    const project = get().getProject(id);
    if (!project) return;
    
    const updatedWorkflow = {
      ...project.workflow,
      currentStep: 'approved',
      history: [
        ...project.workflow.history,
        {
          step: 'approved',
          action: 'approved',
          user: userId,
          timestamp: new Date(),
          notes,
        },
      ],
    };
    
    get().updateProject(id, {
      status: 'approved',
      workflow: updatedWorkflow,
    });
  },
  rejectProject: (id, userId, notes) => {
    const project = get().getProject(id);
    if (!project) return;
    
    const updatedWorkflow = {
      ...project.workflow,
      currentStep: 'rejected',
      history: [
        ...project.workflow.history,
        {
          step: 'rejected',
          action: 'rejected',
          user: userId,
          timestamp: new Date(),
          notes,
        },
      ],
    };
    
    get().updateProject(id, {
      status: 'rejected',
      workflow: updatedWorkflow,
    });
  },
  sendProject: (id, toUserId, fromUserId, message) => {
    const project = get().getProject(id);
    if (!project) return;
    
    const updatedWorkflow = {
      ...project.workflow,
      currentStep: 'sent',
      history: [
        ...project.workflow.history,
        {
          step: 'sent',
          action: 'sent',
          user: fromUserId,
          timestamp: new Date(),
          notes: message || `Sent to ${toUserId}`,
        },
      ],
    };
    
    get().updateProject(id, {
      assignedTo: toUserId,
      workflow: updatedWorkflow,
    });
  },
  assignProject: (id, userId) => {
    get().updateProject(id, {
      assignedTo: userId,
    });
  },
  registerProject: (id, userId, notes) => {
    const project = get().getProject(id);
    if (!project) return;
    
    const updatedWorkflow = {
      ...project.workflow,
      currentStep: 'registered',
      history: [
        ...project.workflow.history,
        {
          step: 'registered',
          action: 'registered',
          user: userId,
          timestamp: new Date(),
          notes,
        },
      ],
    };
    
    get().updateProject(id, {
      workflow: updatedWorkflow,
    });
  },
  completeProject: (id, userId) => {
    const project = get().getProject(id);
    if (!project) return;
    
    const updatedWorkflow = {
      ...project.workflow,
      currentStep: 'completed',
      history: [
        ...project.workflow.history,
        {
          step: 'completed',
          action: 'completed',
          user: userId,
          timestamp: new Date(),
        },
      ],
    };
    
    get().updateProject(id, {
      status: 'completed',
      workflow: updatedWorkflow,
    });
  },
  archiveProject: (id) => {
    get().updateProject(id, {
      status: 'archived',
    });
  },
  
  // Order management
  giveOrder: (projectId, toUserId, fromUserId, message) => {
    const project = get().getProject(projectId);
    if (!project) return;
    
    const newOrder = {
      id: Date.now().toString(),
      type: 'given' as const,
      from: fromUserId,
      to: toUserId,
      message,
      status: 'pending' as const,
      createdAt: new Date(),
    };
    
    get().updateProject(projectId, {
      orders: [...project.orders, newOrder],
    });
  },
  receiveOrder: (projectId, fromUserId, toUserId, message) => {
    const project = get().getProject(projectId);
    if (!project) return;
    
    const newOrder = {
      id: Date.now().toString(),
      type: 'received' as const,
      from: fromUserId,
      to: toUserId,
      message,
      status: 'pending' as const,
      createdAt: new Date(),
    };
    
    get().updateProject(projectId, {
      orders: [...project.orders, newOrder],
    });
  },
  acceptOrder: (projectId, orderId) => {
    const project = get().getProject(projectId);
    if (!project) return;
    
    get().updateProject(projectId, {
      orders: project.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'accepted' } : o
      ),
    });
  },
  rejectOrder: (projectId, orderId) => {
    const project = get().getProject(projectId);
    if (!project) return;
    
    get().updateProject(projectId, {
      orders: project.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'rejected' } : o
      ),
    });
  },
  completeOrder: (projectId, orderId) => {
    const project = get().getProject(projectId);
    if (!project) return;
    
    get().updateProject(projectId, {
      orders: project.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed' } : o
      ),
    });
  },
  
  // Export
  exportProject: (id) => {
    const project = get().getProject(id);
    if (!project) return;
    
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graphics-design-project-${project.title}-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
  exportProjects: (ids) => {
    const projects = ids.map((id) => get().getProject(id)).filter(Boolean);
    const dataStr = JSON.stringify(projects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graphics-design-projects-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
}));
