// Comprehensive journalist management store
import { create } from 'zustand';

export type JournalistStatus = 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated';
export type JournalistType = 'journalist' | 'reporter' | 'correspondent' | 'editor' | 'photographer' | 'videographer' | 'anchor' | 'producer';
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'expert';
export type AssignmentStatus = 'pending' | 'in_progress' | 'submitted' | 'reviewed' | 'published' | 'rejected' | 'cancelled';
export type AssignmentPriority = 'low' | 'normal' | 'high' | 'urgent';
export type AwardType = 'excellence' | 'breaking_news' | 'investigative' | 'feature' | 'photography' | 'video' | 'lifetime_achievement' | 'community_service';

export interface Journalist {
  id: string;
  // Basic Information
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  profileImage?: string;
  bio?: string;
  
  // Professional Information
  type: JournalistType;
  status: JournalistStatus;
  employeeId?: string;
  department?: string;
  specialization?: string[];
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  hireDate: Date;
  contractType: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'intern';
  
  // Location
  location?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  
  // Social Media & Contact
  socialMedia?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
  
  // Skills & Expertise
  skills: string[];
  languages: string[];
  certifications: Certification[];
  
  // Performance Metrics
  performance: {
    totalArticles: number;
    publishedArticles: number;
    totalViews: number;
    averageViews: number;
    totalShares: number;
    averageEngagement: number;
    onTimeDelivery: number; // percentage
    qualityScore: number; // 0-100
    deadlineCompliance: number; // percentage
    lastPerformanceReview?: Date;
  };
  
  // Work Schedule
  workSchedule?: {
    daysOfWeek: number[]; // 0-6, Sunday-Saturday
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
  
  // Availability
  availability: {
    isAvailable: boolean;
    availableFrom?: Date;
    availableUntil?: Date;
    currentLocation?: string;
    isOnAssignment: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

export interface Certification {
  id: string;
  journalistId: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface Award {
  id: string;
  journalistId: string;
  title: string;
  type: AwardType;
  organization: string;
  date: Date;
  description?: string;
  certificateUrl?: string;
  mediaUrl?: string;
  isVerified: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  journalistId: string;
  journalistName: string;
  assignedBy: string;
  assignedByName: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  dueDate: Date;
  completedDate?: Date;
  location?: string;
  category?: string;
  tags: string[];
  articleId?: string;
  notes?: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  journalistId: string;
  reviewedBy: string;
  reviewedByName: string;
  reviewDate: Date;
  periodStart: Date;
  periodEnd: Date;
  scores: {
    quality: number;
    productivity: number;
    punctuality: number;
    teamwork: number;
    innovation: number;
    overall: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  comments: string;
  nextReviewDate?: Date;
}

export interface WorkHistory {
  id: string;
  journalistId: string;
  organization: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  achievements?: string[];
  isCurrent: boolean;
}

export interface PortfolioItem {
  id: string;
  journalistId: string;
  title: string;
  type: 'article' | 'video' | 'photo' | 'audio' | 'document';
  url?: string;
  thumbnail?: string;
  description?: string;
  publishedDate?: Date;
  views?: number;
  featured: boolean;
  createdAt: Date;
}

export interface CommunicationLog {
  id: string;
  journalistId: string;
  type: 'email' | 'phone' | 'meeting' | 'message' | 'note';
  subject?: string;
  content: string;
  initiatedBy: string;
  date: Date;
  attachments?: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface ScheduleEntry {
  id: string;
  journalistId: string;
  title: string;
  type: 'assignment' | 'meeting' | 'training' | 'leave' | 'other';
  startDate: Date;
  endDate: Date;
  location?: string;
  description?: string;
  relatedAssignmentId?: string;
  createdAt: Date;
}

export interface JournalistAnalytics {
  journalistId: string;
  period: {
    start: Date;
    end: Date;
  };
  articles: {
    total: number;
    published: number;
    draft: number;
    rejected: number;
    averagePerWeek: number;
  };
  engagement: {
    totalViews: number;
    averageViews: number;
    totalShares: number;
    averageShares: number;
    totalLikes: number;
    averageLikes: number;
  };
  performance: {
    onTimeDelivery: number;
    qualityScore: number;
    deadlineCompliance: number;
    averageResponseTime: number; // hours
  };
  assignments: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
}

interface JournalistStore {
  journalists: Journalist[];
  assignments: Assignment[];
  awards: Award[];
  certifications: Certification[];
  performanceReviews: PerformanceReview[];
  workHistory: WorkHistory[];
  portfolioItems: PortfolioItem[];
  communicationLogs: CommunicationLog[];
  scheduleEntries: ScheduleEntry[];
  
  // Journalist CRUD
  addJournalist: (journalist: Omit<Journalist, 'id' | 'createdAt' | 'updatedAt' | 'performance'>) => string;
  updateJournalist: (id: string, updates: Partial<Journalist>) => void;
  deleteJournalist: (id: string) => void;
  getJournalist: (id: string) => Journalist | undefined;
  getJournalistsByType: (type: JournalistType) => Journalist[];
  getJournalistsByStatus: (status: JournalistStatus) => Journalist[];
  getActiveJournalists: () => Journalist[];
  searchJournalists: (query: string) => Journalist[];
  
  // Assignments
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignment: (id: string) => Assignment | undefined;
  getAssignmentsByJournalist: (journalistId: string) => Assignment[];
  getAssignmentsByStatus: (status: AssignmentStatus) => Assignment[];
  getOverdueAssignments: () => Assignment[];
  
  // Awards
  addAward: (award: Omit<Award, 'id'>) => string;
  updateAward: (id: string, updates: Partial<Award>) => void;
  deleteAward: (id: string) => void;
  getAwardsByJournalist: (journalistId: string) => Award[];
  
  // Certifications
  addCertification: (certification: Omit<Certification, 'id'>) => string;
  updateCertification: (id: string, updates: Partial<Certification>) => void;
  deleteCertification: (id: string) => void;
  getCertificationsByJournalist: (journalistId: string) => Certification[];
  
  // Performance Reviews
  addPerformanceReview: (review: Omit<PerformanceReview, 'id'>) => string;
  updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => void;
  getPerformanceReviewsByJournalist: (journalistId: string) => PerformanceReview[];
  
  // Work History
  addWorkHistory: (history: Omit<WorkHistory, 'id'>) => string;
  updateWorkHistory: (id: string, updates: Partial<WorkHistory>) => void;
  deleteWorkHistory: (id: string) => void;
  getWorkHistoryByJournalist: (journalistId: string) => WorkHistory[];
  
  // Portfolio
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => string;
  updatePortfolioItem: (id: string, updates: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;
  getPortfolioByJournalist: (journalistId: string) => PortfolioItem[];
  
  // Communication
  addCommunicationLog: (log: Omit<CommunicationLog, 'id'>) => string;
  getCommunicationLogsByJournalist: (journalistId: string) => CommunicationLog[];
  
  // Schedule
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'createdAt'>) => string;
  updateScheduleEntry: (id: string, updates: Partial<ScheduleEntry>) => void;
  deleteScheduleEntry: (id: string) => void;
  getScheduleByJournalist: (journalistId: string, startDate?: Date, endDate?: Date) => ScheduleEntry[];
  
  // Analytics
  getJournalistAnalytics: (journalistId: string, startDate: Date, endDate: Date) => JournalistAnalytics;
  getStatistics: () => {
    totalJournalists: number;
    activeJournalists: number;
    reporters: number;
    totalAwards: number;
    totalAssignments: number;
    pendingAssignments: number;
    overdueAssignments: number;
    averagePerformance: number;
  };
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initialize with sample data
const initializeSampleData = () => {
  const now = new Date();
  const sampleJournalists: Journalist[] = [
    {
      id: 'j1',
      firstName: 'Ahmed',
      lastName: 'Hassan',
      fullName: 'Ahmed Hassan',
      email: 'ahmed.hassan@africatv.com',
      phone: '+251911234567',
      type: 'journalist',
      status: 'active',
      experienceLevel: 'senior',
      yearsOfExperience: 8,
      hireDate: new Date(2016, 0, 15),
      contractType: 'full_time',
      skills: ['Investigative Journalism', 'Political Reporting', 'Interviewing'],
      languages: ['English', 'Amharic', 'Arabic'],
      certifications: [],
      specialization: ['Politics', 'Current Affairs'],
      location: 'Addis Ababa, Ethiopia',
      performance: {
        totalArticles: 245,
        publishedArticles: 230,
        totalViews: 1250000,
        averageViews: 5434,
        totalShares: 45000,
        averageEngagement: 8.5,
        onTimeDelivery: 95,
        qualityScore: 88,
        deadlineCompliance: 92,
      },
      availability: {
        isAvailable: true,
        isOnAssignment: false,
      },
      createdAt: new Date(2016, 0, 15),
      updatedAt: now,
    },
    {
      id: 'j2',
      firstName: 'Mariam',
      lastName: 'Tesfaye',
      fullName: 'Mariam Tesfaye',
      email: 'mariam.tesfaye@africatv.com',
      phone: '+251922345678',
      type: 'reporter',
      status: 'active',
      experienceLevel: 'mid',
      yearsOfExperience: 4,
      hireDate: new Date(2020, 2, 10),
      contractType: 'full_time',
      skills: ['Field Reporting', 'Breaking News', 'Video Production'],
      languages: ['English', 'Amharic', 'Oromo'],
      certifications: [],
      specialization: ['Breaking News', 'Social Issues'],
      location: 'Addis Ababa, Ethiopia',
      performance: {
        totalArticles: 156,
        publishedArticles: 142,
        totalViews: 890000,
        averageViews: 6267,
        totalShares: 32000,
        averageEngagement: 7.8,
        onTimeDelivery: 98,
        qualityScore: 85,
        deadlineCompliance: 96,
      },
      availability: {
        isAvailable: true,
        isOnAssignment: true,
      },
      createdAt: new Date(2020, 2, 10),
      updatedAt: now,
    },
    {
      id: 'j3',
      firstName: 'Yonas',
      lastName: 'Gebremichael',
      fullName: 'Yonas Gebremichael',
      email: 'yonas.gebremichael@africatv.com',
      phone: '+251933456789',
      type: 'correspondent',
      status: 'active',
      experienceLevel: 'senior',
      yearsOfExperience: 12,
      hireDate: new Date(2012, 5, 20),
      contractType: 'full_time',
      skills: ['International Reporting', 'Conflict Zones', 'Documentary'],
      languages: ['English', 'Amharic', 'Tigrinya', 'French'],
      certifications: [],
      specialization: ['International Affairs', 'Documentaries'],
      location: 'Nairobi, Kenya',
      performance: {
        totalArticles: 312,
        publishedArticles: 298,
        totalViews: 2100000,
        averageViews: 7046,
        totalShares: 78000,
        averageEngagement: 9.2,
        onTimeDelivery: 92,
        qualityScore: 91,
        deadlineCompliance: 94,
      },
      availability: {
        isAvailable: true,
        isOnAssignment: false,
      },
      createdAt: new Date(2012, 5, 20),
      updatedAt: now,
    },
  ];

  const sampleAssignments: Assignment[] = [
    {
      id: 'a1',
      title: 'Cover Parliament Session on Economic Policy',
      description: 'Attend and report on the parliamentary session discussing new economic policies',
      journalistId: 'j1',
      journalistName: 'Ahmed Hassan',
      assignedBy: 'system',
      assignedByName: 'Editor-in-Chief',
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      tags: ['Politics', 'Economy'],
      attachments: [],
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
    {
      id: 'a2',
      title: 'Breaking News: City Center Incident',
      description: 'Cover breaking news story at city center',
      journalistId: 'j2',
      journalistName: 'Mariam Tesfaye',
      assignedBy: 'system',
      assignedByName: 'News Director',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      location: 'City Center, Addis Ababa',
      tags: ['Breaking News'],
      attachments: [],
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      updatedAt: now,
    },
  ];

  const sampleAwards: Award[] = [
    {
      id: 'aw1',
      journalistId: 'j1',
      title: 'Excellence in Investigative Journalism',
      type: 'investigative',
      organization: 'Ethiopian Media Association',
      date: new Date(2023, 5, 15),
      description: 'Awarded for outstanding investigative reporting on corruption',
      isVerified: true,
    },
    {
      id: 'aw2',
      journalistId: 'j3',
      title: 'International Correspondent of the Year',
      type: 'excellence',
      organization: 'African Journalism Awards',
      date: new Date(2022, 11, 10),
      description: 'Recognized for exceptional international coverage',
      isVerified: true,
    },
  ];

  return { sampleJournalists, sampleAssignments, sampleAwards };
};

export const useJournalistStore = create<JournalistStore>((set, get) => {
  const { sampleJournalists, sampleAssignments, sampleAwards } = initializeSampleData();
  
  return {
    journalists: sampleJournalists,
    assignments: sampleAssignments,
    awards: sampleAwards,
    certifications: [],
    performanceReviews: [],
    workHistory: [],
    portfolioItems: [],
    communicationLogs: [],
    scheduleEntries: [],
  
  // Journalist CRUD
  addJournalist: (journalistData) => {
    const id = generateId();
    const now = new Date();
    const journalist: Journalist = {
      ...journalistData,
      id,
      fullName: `${journalistData.firstName} ${journalistData.lastName}`,
      performance: {
        totalArticles: 0,
        publishedArticles: 0,
        totalViews: 0,
        averageViews: 0,
        totalShares: 0,
        averageEngagement: 0,
        onTimeDelivery: 100,
        qualityScore: 0,
        deadlineCompliance: 100,
      },
      availability: {
        isAvailable: true,
        isOnAssignment: false,
      },
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ journalists: [...state.journalists, journalist] }));
    return id;
  },
  
  updateJournalist: (id, updates) => {
    set((state) => ({
      journalists: state.journalists.map((j) =>
        j.id === id
          ? {
              ...j,
              ...updates,
              fullName: updates.firstName || updates.lastName
                ? `${updates.firstName || j.firstName} ${updates.lastName || j.lastName}`
                : j.fullName,
              updatedAt: new Date(),
            }
          : j
      ),
    }));
  },
  
  deleteJournalist: (id) => {
    set((state) => ({
      journalists: state.journalists.filter((j) => j.id !== id),
      assignments: state.assignments.filter((a) => a.journalistId !== id),
      awards: state.awards.filter((a) => a.journalistId !== id),
      certifications: state.certifications.filter((c) => c.journalistId !== id),
      performanceReviews: state.performanceReviews.filter((r) => r.journalistId !== id),
      workHistory: state.workHistory.filter((w) => w.journalistId !== id),
      portfolioItems: state.portfolioItems.filter((p) => p.journalistId !== id),
      communicationLogs: state.communicationLogs.filter((c) => c.journalistId !== id),
      scheduleEntries: state.scheduleEntries.filter((s) => s.journalistId !== id),
    }));
  },
  
  getJournalist: (id) => get().journalists.find((j) => j.id === id),
  
  getJournalistsByType: (type) => get().journalists.filter((j) => j.type === type),
  
  getJournalistsByStatus: (status) => get().journalists.filter((j) => j.status === status),
  
  getActiveJournalists: () => get().journalists.filter((j) => j.status === 'active'),
  
  searchJournalists: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().journalists.filter(
      (j) =>
        j.fullName.toLowerCase().includes(lowerQuery) ||
        j.email.toLowerCase().includes(lowerQuery) ||
        j.phone.includes(query) ||
        j.specialization?.some((s) => s.toLowerCase().includes(lowerQuery)) ||
        j.skills.some((s) => s.toLowerCase().includes(lowerQuery))
    );
  },
  
  // Assignments
  addAssignment: (assignmentData) => {
    const id = generateId();
    const now = new Date();
    const assignment: Assignment = {
      ...assignmentData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ assignments: [...state.assignments, assignment] }));
    return id;
  },
  
  updateAssignment: (id, updates) => {
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      ),
    }));
  },
  
  deleteAssignment: (id) => {
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
    }));
  },
  
  getAssignment: (id) => get().assignments.find((a) => a.id === id),
  
  getAssignmentsByJournalist: (journalistId) =>
    get().assignments.filter((a) => a.journalistId === journalistId),
  
  getAssignmentsByStatus: (status) =>
    get().assignments.filter((a) => a.status === status),
  
  getOverdueAssignments: () => {
    const now = new Date();
    return get().assignments.filter(
      (a) => a.dueDate < now && (a.status === 'pending' || a.status === 'in_progress')
    );
  },
  
  // Awards
  addAward: (awardData) => {
    const id = generateId();
    const award: Award = { ...awardData, id };
    set((state) => ({ awards: [...state.awards, award] }));
    return id;
  },
  
  updateAward: (id, updates) => {
    set((state) => ({
      awards: state.awards.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  },
  
  deleteAward: (id) => {
    set((state) => ({
      awards: state.awards.filter((a) => a.id !== id),
    }));
  },
  
  getAwardsByJournalist: (journalistId) =>
    get().awards.filter((a) => a.journalistId === journalistId),
  
  // Certifications
  addCertification: (certData) => {
    const id = generateId();
    const cert: Certification = { ...certData, id };
    set((state) => ({ certifications: [...state.certifications, cert] }));
    return id;
  },
  
  updateCertification: (id, updates) => {
    set((state) => ({
      certifications: state.certifications.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
  
  deleteCertification: (id) => {
    set((state) => ({
      certifications: state.certifications.filter((c) => c.id !== id),
    }));
  },
  
  getCertificationsByJournalist: (journalistId) =>
    get().certifications.filter((c) => c.journalistId === journalistId),
  
  // Performance Reviews
  addPerformanceReview: (reviewData) => {
    const id = generateId();
    const review: PerformanceReview = { ...reviewData, id };
    set((state) => ({
      performanceReviews: [...state.performanceReviews, review],
    }));
    return id;
  },
  
  updatePerformanceReview: (id, updates) => {
    set((state) => ({
      performanceReviews: state.performanceReviews.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },
  
  getPerformanceReviewsByJournalist: (journalistId) =>
    get().performanceReviews.filter((r) => r.journalistId === journalistId),
  
  // Work History
  addWorkHistory: (historyData) => {
    const id = generateId();
    const history: WorkHistory = { ...historyData, id };
    set((state) => ({ workHistory: [...state.workHistory, history] }));
    return id;
  },
  
  updateWorkHistory: (id, updates) => {
    set((state) => ({
      workHistory: state.workHistory.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    }));
  },
  
  deleteWorkHistory: (id) => {
    set((state) => ({
      workHistory: state.workHistory.filter((h) => h.id !== id),
    }));
  },
  
  getWorkHistoryByJournalist: (journalistId) =>
    get().workHistory.filter((h) => h.journalistId === journalistId),
  
  // Portfolio
  addPortfolioItem: (itemData) => {
    const id = generateId();
    const now = new Date();
    const item: PortfolioItem = { ...itemData, id, createdAt: now };
    set((state) => ({ portfolioItems: [...state.portfolioItems, item] }));
    return id;
  },
  
  updatePortfolioItem: (id, updates) => {
    set((state) => ({
      portfolioItems: state.portfolioItems.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },
  
  deletePortfolioItem: (id) => {
    set((state) => ({
      portfolioItems: state.portfolioItems.filter((p) => p.id !== id),
    }));
  },
  
  getPortfolioByJournalist: (journalistId) =>
    get().portfolioItems.filter((p) => p.journalistId === journalistId),
  
  // Communication
  addCommunicationLog: (logData) => {
    const id = generateId();
    const log: CommunicationLog = { ...logData, id };
    set((state) => ({
      communicationLogs: [...state.communicationLogs, log],
    }));
    return id;
  },
  
  getCommunicationLogsByJournalist: (journalistId) =>
    get().communicationLogs.filter((c) => c.journalistId === journalistId),
  
  // Schedule
  addScheduleEntry: (entryData) => {
    const id = generateId();
    const now = new Date();
    const entry: ScheduleEntry = { ...entryData, id, createdAt: now };
    set((state) => ({ scheduleEntries: [...state.scheduleEntries, entry] }));
    return id;
  },
  
  updateScheduleEntry: (id, updates) => {
    set((state) => ({
      scheduleEntries: state.scheduleEntries.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },
  
  deleteScheduleEntry: (id) => {
    set((state) => ({
      scheduleEntries: state.scheduleEntries.filter((s) => s.id !== id),
    }));
  },
  
  getScheduleByJournalist: (journalistId, startDate, endDate) => {
    let entries = get().scheduleEntries.filter((s) => s.journalistId === journalistId);
    if (startDate) {
      entries = entries.filter((e) => e.startDate >= startDate);
    }
    if (endDate) {
      entries = entries.filter((e) => e.endDate <= endDate);
    }
    return entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  },
  
  // Analytics
  getJournalistAnalytics: (journalistId, startDate, endDate) => {
    const assignments = get().getAssignmentsByJournalist(journalistId);
    const periodAssignments = assignments.filter(
      (a) => a.createdAt >= startDate && a.createdAt <= endDate
    );
    
    const completed = periodAssignments.filter((a) => a.status === 'published' || a.status === 'submitted').length;
    const inProgress = periodAssignments.filter((a) => a.status === 'in_progress').length;
    const overdue = periodAssignments.filter(
      (a) => a.dueDate < new Date() && (a.status === 'pending' || a.status === 'in_progress')
    ).length;
    
    const journalist = get().getJournalist(journalistId);
    const performance = journalist?.performance || {
      totalArticles: 0,
      publishedArticles: 0,
      totalViews: 0,
      averageViews: 0,
      totalShares: 0,
      averageEngagement: 0,
      onTimeDelivery: 100,
      qualityScore: 0,
      deadlineCompliance: 100,
    };
    
    return {
      journalistId,
      period: { start: startDate, end: endDate },
      articles: {
        total: performance.totalArticles,
        published: performance.publishedArticles,
        draft: 0,
        rejected: 0,
        averagePerWeek: performance.totalArticles / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))),
      },
      engagement: {
        totalViews: performance.totalViews,
        averageViews: performance.averageViews,
        totalShares: performance.totalShares,
        averageShares: performance.totalShares / Math.max(1, performance.publishedArticles),
        totalLikes: 0,
        averageLikes: 0,
      },
      performance: {
        onTimeDelivery: performance.onTimeDelivery,
        qualityScore: performance.qualityScore,
        deadlineCompliance: performance.deadlineCompliance,
        averageResponseTime: 24,
      },
      assignments: {
        total: periodAssignments.length,
        completed,
        inProgress,
        overdue,
        completionRate: periodAssignments.length > 0 ? (completed / periodAssignments.length) * 100 : 0,
      },
    };
  },
  
  getStatistics: () => {
    const journalists = get().journalists;
    const assignments = get().assignments;
    const awards = get().awards;
    
    const activeJournalists = journalists.filter((j) => j.status === 'active').length;
    const reporters = journalists.filter((j) => j.type === 'reporter').length;
    const pendingAssignments = assignments.filter((a) => a.status === 'pending').length;
    const overdueAssignments = get().getOverdueAssignments().length;
    
    const averagePerformance =
      journalists.length > 0
        ? journalists.reduce((sum, j) => sum + j.performance.qualityScore, 0) / journalists.length
        : 0;
    
    return {
      totalJournalists: journalists.length,
      activeJournalists,
      reporters,
      totalAwards: awards.length,
      totalAssignments: assignments.length,
      pendingAssignments,
      overdueAssignments,
      averagePerformance,
    };
  },
  };
});

