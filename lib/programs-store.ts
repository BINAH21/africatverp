// Shared programs store for cross-system access
import { create } from 'zustand';

export interface Program {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: 'series' | 'episode' | 'special' | 'live' | 'documentary' | 'news' | 'sports' | 'entertainment';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'completed' | 'on-air' | 'scheduled';
  assignedTo: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  duration?: number; // in minutes
  episodeNumber?: number;
  seasonNumber?: number;
  airDate?: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  thumbnail?: string;
  metadata?: {
    director?: string;
    producer?: string;
    cast?: string[];
    rating?: string;
    language?: string;
  };
}

interface ProgramsStore {
  programs: Program[];
  addProgram: (program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  getProgram: (id: string) => Program | undefined;
  getProgramsByCategory: (category: string) => Program[];
  getProgramsByStatus: (status: Program['status']) => Program[];
  getActivePrograms: () => Program[];
  getScheduledPrograms: () => Program[];
  getOnAirPrograms: () => Program[];
}

export const useProgramsStore = create<ProgramsStore>()((set, get) => ({
  programs: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('programs-storage') || '[]').map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    airDate: p.airDate ? new Date(p.airDate) : undefined,
  })) : [],
  addProgram: (programData) => {
    const newProgram: Program = {
      ...programData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.programs, newProgram];
      if (typeof window !== 'undefined') {
        localStorage.setItem('programs-storage', JSON.stringify(updated));
      }
      return { programs: updated };
    });
  },
  updateProgram: (id, updates) => {
    set((state) => {
      const updated = state.programs.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('programs-storage', JSON.stringify(updated));
      }
      return { programs: updated };
    });
  },
  deleteProgram: (id) => {
    set((state) => {
      const updated = state.programs.filter((p) => p.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('programs-storage', JSON.stringify(updated));
      }
      return { programs: updated };
    });
  },
  getProgram: (id) => {
    return get().programs.find((p) => p.id === id);
  },
  getProgramsByCategory: (category) => {
    return get().programs.filter((p) => p.category === category);
  },
  getProgramsByStatus: (status) => {
    return get().programs.filter((p) => p.status === status);
  },
  getActivePrograms: () => {
    return get().programs.filter((p) => 
      ['approved', 'scheduled', 'on-air'].includes(p.status)
    );
  },
  getScheduledPrograms: () => {
    return get().programs.filter((p) => p.status === 'scheduled');
  },
  getOnAirPrograms: () => {
    return get().programs.filter((p) => p.status === 'on-air');
  },
}));

