// Comprehensive news management store
import { create } from 'zustand';

export type NewsStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived' | 'rejected';
export type NewsPriority = 'low' | 'normal' | 'high' | 'urgent';
export type UserRole = 'admin' | 'editor' | 'publisher' | 'reviewer' | 'journalist' | 'viewer' | 'guest';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Rich text/HTML content
  status: NewsStatus;
  priority: NewsPriority;
  isBreakingNews: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  
  // Categorization
  categoryId: string;
  categoryName: string;
  tags: string[];
  keywords: string[];
  
  // Authorship
  authorId: string;
  authorName: string;
  coAuthors?: string[];
  assignedEditorId?: string;
  assignedReviewerId?: string;
  
  // Media
  featuredImage?: string;
  images: string[];
  videos: string[];
  audioFiles: string[];
  documents: string[];
  
  // Scheduling
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  scheduledUnpublishAt?: Date;
  expiresAt?: Date;
  
  // SEO & Metadata
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  
  // Analytics
  views: number;
  shares: number;
  likes: number;
  comments: number;
  readingTime: number; // minutes
  
  // Workflow
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  archivedAt?: Date;
  
  // Version Control
  version: number;
  parentArticleId?: string; // For revisions
  revisionHistory: ArticleRevision[];
  
  // Access Control
  accessRoles: UserRole[];
  isPublic: boolean;
  requiresSubscription: boolean;
  
  // Social Media
  socialMediaPublished: {
    facebook: boolean;
    twitter: boolean;
    instagram: boolean;
    linkedin: boolean;
    telegram: boolean;
  };
  
  // Related Content
  relatedArticles: string[];
  relatedVideos?: string[];
  relatedPrograms?: string[];
  
  // Location
  location?: string;
  locationCoordinates?: { lat: number; lng: number };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  changedBy: string;
  changedAt: Date;
  changeSummary?: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  articleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  createdAt: Date;
}

export interface NewsComment {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  parentCommentId?: string; // For replies
  isApproved: boolean;
  isSpam: boolean;
  likes: number;
  reported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsAssignment {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // Journalist ID
  assignedBy: string;
  priority: NewsPriority;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  articleId?: string; // Linked article when created
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsAnalytics {
  id: string;
  articleId: string;
  date: Date;
  views: number;
  uniqueViews: number;
  shares: number;
  likes: number;
  comments: number;
  averageReadingTime: number; // seconds
  bounceRate: number; // percentage
  source: 'direct' | 'search' | 'social' | 'referral' | 'email' | 'other';
}

export interface NewsNotification {
  id: string;
  type: 'article_published' | 'article_approved' | 'article_rejected' | 'review_requested' | 'breaking_news' | 'assignment_created' | 'comment_added';
  articleId?: string;
  assignmentId?: string;
  message: string;
  targetUserId: string;
  targetRole?: UserRole;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

export interface NewsTemplate {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  content: string; // Template content with placeholders
  fields: TemplateField[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'rich_text' | 'image' | 'video' | 'date' | 'select' | 'multiselect';
  label: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For select/multiselect
}

export type JournalismReportType = 
  | 'daily_summary' | 'weekly_summary' | 'monthly_summary' | 'quarterly_summary' | 'annual_summary'
  | 'viewership_analysis' | 'performance_metrics' | 'journalist_performance' | 'category_analysis'
  | 'trending_topics' | 'sentiment_analysis' | 'engagement_report' | 'publishing_statistics'
  | 'breaking_news_report' | 'social_media_impact' | 'readership_demographics' | 'content_quality_score'
  | 'editorial_calendar' | 'deadline_compliance' | 'source_credibility' | 'fact_check_report';

export interface JournalismReport {
  id: string;
  type: JournalismReportType;
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: Date;
  period: {
    from: Date;
    to: Date;
  };
  data: Record<string, any>; // Flexible data structure for different report types
  metrics: {
    totalArticles: number;
    publishedArticles: number;
    totalViews: number;
    totalShares: number;
    totalComments: number;
    averageEngagement: number;
    topPerformingArticle?: string;
    topJournalist?: string;
    topCategory?: string;
  };
  charts?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    data: any[];
    labels: string[];
  }[];
  exportedFormats: ('pdf' | 'excel' | 'csv' | 'json')[];
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipients: string[]; // User IDs who should receive this report
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorialAgenda {
  id: string;
  title: string;
  description: string;
  date: Date;
  time?: string;
  priority: NewsPriority;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  assignedTo: string[]; // Journalist IDs
  assignedBy: string;
  categoryId?: string;
  tags: string[];
  relatedArticles: string[]; // Article IDs
  location?: string;
  notes?: string;
  reminders: {
    enabled: boolean;
    times: Date[]; // Reminder times
  };
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface SupervisorNotification {
  id: string;
  type: 'article_submission' | 'review_request' | 'approval_request' | 'publishing_request' | 'breaking_news' | 'urgent_issue' | 'report_ready' | 'deadline_approaching' | 'quality_concern' | 'compliance_alert';
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // Supervisor ID
  recipientName: string;
  priority: NewsPriority;
  relatedArticleId?: string;
  relatedReportId?: string;
  relatedAgendaId?: string;
  actionRequired: boolean;
  actionUrl?: string; // URL to take action
  read: boolean;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface NewsStore {
  // Articles
  articles: NewsArticle[];
  categories: NewsCategory[];
  tags: NewsTag[];
  comments: NewsComment[];
  assignments: NewsAssignment[];
  analytics: NewsAnalytics[];
  notifications: NewsNotification[];
  templates: NewsTemplate[];
  reports: JournalismReport[];
  agendas: EditorialAgenda[];
  supervisorNotifications: SupervisorNotification[];
  
  // Article Management
  addArticle: (article: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'revisionHistory' | 'views' | 'shares' | 'likes' | 'comments' | 'readingTime'>) => void;
  updateArticle: (id: string, updates: Partial<NewsArticle>) => void;
  deleteArticle: (id: string) => void;
  getArticle: (id: string) => NewsArticle | undefined;
  getArticlesByStatus: (status: NewsStatus) => NewsArticle[];
  getPublishedArticles: () => NewsArticle[];
  getDraftArticles: () => NewsArticle[];
  getBreakingNews: () => NewsArticle[];
  getFeaturedArticles: () => NewsArticle[];
  getArticlesByCategory: (categoryId: string) => NewsArticle[];
  getArticlesByAuthor: (authorId: string) => NewsArticle[];
  getArticlesByTag: (tag: string) => NewsArticle[];
  searchArticles: (query: string) => NewsArticle[];
  
  // Status Workflow
  submitForReview: (articleId: string) => void;
  approveArticle: (articleId: string, approvedBy: string) => void;
  rejectArticle: (articleId: string, rejectedBy: string, reason: string) => void;
  publishArticle: (articleId: string, publishedBy: string) => void;
  unpublishArticle: (articleId: string) => void;
  archiveArticle: (articleId: string) => void;
  restoreArticle: (articleId: string) => void;
  markAsBreakingNews: (articleId: string) => void;
  unmarkBreakingNews: (articleId: string) => void;
  
  // Version Control
  createRevision: (articleId: string, changedBy: string, changeSummary?: string) => void;
  getRevisions: (articleId: string) => ArticleRevision[];
  restoreRevision: (articleId: string, revisionId: string) => void;
  
  // Category Management
  addCategory: (category: Omit<NewsCategory, 'id' | 'createdAt' | 'updatedAt' | 'articleCount'>) => void;
  updateCategory: (id: string, updates: Partial<NewsCategory>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => NewsCategory | undefined;
  
  // Tag Management
  addTag: (tag: Omit<NewsTag, 'id' | 'createdAt' | 'articleCount'>) => void;
  updateTag: (id: string, updates: Partial<NewsTag>) => void;
  deleteTag: (id: string) => void;
  getTag: (id: string) => NewsTag | undefined;
  getPopularTags: (limit?: number) => NewsTag[];
  
  // Comment Management
  addComment: (comment: Omit<NewsComment, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'reported' | 'isSpam'>) => void;
  updateComment: (id: string, updates: Partial<NewsComment>) => void;
  deleteComment: (id: string) => void;
  approveComment: (id: string) => void;
  rejectComment: (id: string) => void;
  getCommentsByArticle: (articleId: string) => NewsComment[];
  
  // Assignment Management
  addAssignment: (assignment: Omit<NewsAssignment, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateAssignment: (id: string, updates: Partial<NewsAssignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentsByJournalist: (journalistId: string) => NewsAssignment[];
  getPendingAssignments: () => NewsAssignment[];
  
  // Analytics
  addAnalytics: (analytics: Omit<NewsAnalytics, 'id'>) => void;
  getArticleAnalytics: (articleId: string, fromDate?: Date, toDate?: Date) => NewsAnalytics[];
  getPopularArticles: (limit?: number, period?: 'day' | 'week' | 'month' | 'year') => NewsArticle[];
  
  // Notifications
  createNotification: (notification: Omit<NewsNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  getUnreadNotifications: (userId?: string, role?: UserRole) => NewsNotification[];
  
  // Templates
  addTemplate: (template: Omit<NewsTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<NewsTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => NewsTemplate | undefined;
  createArticleFromTemplate: (templateId: string, authorId: string, data: Record<string, any>) => NewsArticle;
  
  // Scheduling
  getScheduledArticles: () => NewsArticle[];
  publishScheduledArticles: () => void;
  unpublishExpiredArticles: () => void;
  
  // Social Media
  publishToSocialMedia: (articleId: string, platforms: string[]) => void;
  
  // Statistics
  getStatistics: () => {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    breakingNews: number;
    pendingReview: number;
    totalViews: number;
    totalShares: number;
    totalComments: number;
    averageViews: number;
    topCategory: string;
    topAuthor: string;
  };
  
  // Journalism Reports
  generateReport: (type: JournalismReportType, period: { from: Date; to: Date }, generatedBy: string) => JournalismReport;
  addReport: (report: Omit<JournalismReport, 'id' | 'generatedAt' | 'createdAt' | 'updatedAt'>) => void;
  updateReport: (id: string, updates: Partial<JournalismReport>) => void;
  deleteReport: (id: string) => void;
  getReport: (id: string) => JournalismReport | undefined;
  getReportsByType: (type: JournalismReportType) => JournalismReport[];
  getReportsByPeriod: (from: Date, to: Date) => JournalismReport[];
  exportReport: (id: string, format: 'pdf' | 'excel' | 'csv' | 'json') => void;
  
  // Editorial Agendas
  addAgenda: (agenda: Omit<EditorialAgenda, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAgenda: (id: string, updates: Partial<EditorialAgenda>) => void;
  deleteAgenda: (id: string) => void;
  getAgenda: (id: string) => EditorialAgenda | undefined;
  getAgendasByDate: (date: Date) => EditorialAgenda[];
  getAgendasByJournalist: (journalistId: string) => EditorialAgenda[];
  getUpcomingAgendas: (days?: number) => EditorialAgenda[];
  completeAgenda: (id: string) => void;
  
  // Supervisor Notifications
  createSupervisorNotification: (notification: Omit<SupervisorNotification, 'id' | 'createdAt' | 'read' | 'acknowledged'>) => void;
  markNotificationRead: (id: string) => void;
  acknowledgeNotification: (id: string) => void;
  getSupervisorNotifications: (supervisorId: string, unreadOnly?: boolean) => SupervisorNotification[];
  getUnreadSupervisorNotifications: (supervisorId: string) => SupervisorNotification[];
  notifySupervisor: (supervisorId: string, type: SupervisorNotification['type'], title: string, message: string, senderId: string, senderName: string, senderRole: UserRole, priority: NewsPriority, metadata?: Record<string, any>) => void;
}

const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
      scheduledPublishAt: item.scheduledPublishAt ? new Date(item.scheduledPublishAt) : undefined,
      scheduledUnpublishAt: item.scheduledUnpublishAt ? new Date(item.scheduledUnpublishAt) : undefined,
      expiresAt: item.expiresAt ? new Date(item.expiresAt) : undefined,
      submittedAt: item.submittedAt ? new Date(item.submittedAt) : undefined,
      reviewedAt: item.reviewedAt ? new Date(item.reviewedAt) : undefined,
      approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
      rejectedAt: item.rejectedAt ? new Date(item.rejectedAt) : undefined,
      archivedAt: item.archivedAt ? new Date(item.archivedAt) : undefined,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changedAt: item.changedAt ? new Date(item.changedAt) : new Date(),
      dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
      date: item.date ? new Date(item.date) : new Date(),
      readAt: item.readAt ? new Date(item.readAt) : undefined,
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

export const useNewsStore = create<NewsStore>()((set, get) => ({
  articles: loadFromStorage<NewsArticle>('news-articles', [
    {
      id: '1',
      title: 'Major Economic Summit Concludes Successfully',
      slug: 'major-economic-summit-concludes-successfully',
      summary: 'The annual economic summit brought together leaders from across the continent to discuss key economic policies.',
      content: '<p>The annual economic summit concluded today with significant agreements reached on regional economic cooperation...</p>',
      status: 'published',
      priority: 'high',
      isBreakingNews: false,
      isFeatured: true,
      isExclusive: false,
      categoryId: '1',
      categoryName: 'Business',
      tags: ['economy', 'summit', 'politics'],
      keywords: ['economic summit', 'regional cooperation', 'economic policy'],
      authorId: '1',
      authorName: 'John Doe',
      views: 1250,
      shares: 45,
      likes: 120,
      comments: 23,
      readingTime: 5,
      version: 1,
      revisionHistory: [],
      accessRoles: ['admin', 'editor', 'publisher', 'viewer'],
      isPublic: true,
      requiresSubscription: false,
      socialMediaPublished: {
        facebook: true,
        twitter: true,
        instagram: false,
        linkedin: true,
        telegram: false,
      },
      relatedArticles: [],
      images: [],
      videos: [],
      audioFiles: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: 'John Doe',
    },
  ]),
  categories: loadFromStorage<NewsCategory>('news-categories', [
    {
      id: '1',
      name: 'Business',
      slug: 'business',
      description: 'Business and economic news',
      isActive: true,
      articleCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Politics',
      slug: 'politics',
      description: 'Political news and analysis',
      isActive: true,
      articleCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Sports',
      slug: 'sports',
      description: 'Sports news and updates',
      isActive: true,
      articleCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  tags: loadFromStorage<NewsTag>('news-tags', []),
  comments: loadFromStorage<NewsComment>('news-comments', []),
  assignments: loadFromStorage<NewsAssignment>('news-assignments', []),
  analytics: loadFromStorage<NewsAnalytics>('news-analytics', []),
  notifications: loadFromStorage<NewsNotification>('news-notifications', []),
  templates: loadFromStorage<NewsTemplate>('news-templates', []),
  reports: loadFromStorage<JournalismReport>('news-reports', []),
  agendas: loadFromStorage<EditorialAgenda>('news-agendas', []),
  supervisorNotifications: loadFromStorage<SupervisorNotification>('news-supervisor-notifications', []),
  
  // Article Management
  addArticle: (articleData) => {
    const newArticle: NewsArticle = {
      ...articleData,
      id: Date.now().toString(),
      views: 0,
      shares: 0,
      likes: 0,
      comments: 0,
      readingTime: Math.ceil(articleData.content.length / 1000), // Rough estimate
      version: 1,
      revisionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.articles, newArticle];
      saveToStorage('news-articles', updated);
      return { articles: updated };
    });
  },
  
  updateArticle: (id, updates) => {
    set((state) => {
      const updated = state.articles.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates, updatedAt: new Date() };
        }
        return a;
      });
      saveToStorage('news-articles', updated);
      return { articles: updated };
    });
  },
  
  deleteArticle: (id) => {
    set((state) => {
      const updated = state.articles.filter((a) => a.id !== id);
      saveToStorage('news-articles', updated);
      return { articles: updated };
    });
  },
  
  getArticle: (id) => {
    return get().articles.find((a) => a.id === id);
  },
  
  getArticlesByStatus: (status) => {
    return get().articles.filter((a) => a.status === status);
  },
  
  getPublishedArticles: () => {
    return get().articles.filter((a) => a.status === 'published');
  },
  
  getDraftArticles: () => {
    return get().articles.filter((a) => a.status === 'draft');
  },
  
  getBreakingNews: () => {
    return get().articles.filter((a) => a.isBreakingNews && a.status === 'published');
  },
  
  getFeaturedArticles: () => {
    return get().articles.filter((a) => a.isFeatured && a.status === 'published');
  },
  
  getArticlesByCategory: (categoryId) => {
    return get().articles.filter((a) => a.categoryId === categoryId);
  },
  
  getArticlesByAuthor: (authorId) => {
    return get().articles.filter((a) => a.authorId === authorId);
  },
  
  getArticlesByTag: (tag) => {
    return get().articles.filter((a) => a.tags.includes(tag));
  },
  
  searchArticles: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().articles.filter((a) =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.summary.toLowerCase().includes(lowerQuery) ||
      a.content.toLowerCase().includes(lowerQuery) ||
      a.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
      a.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
    );
  },
  
  // Status Workflow
  submitForReview: (articleId) => {
    get().updateArticle(articleId, {
      status: 'pending_review',
      submittedAt: new Date(),
    });
  },
  
  approveArticle: (articleId, approvedBy) => {
    get().updateArticle(articleId, {
      status: 'approved',
      reviewedAt: new Date(),
      approvedAt: new Date(),
    });
  },
  
  rejectArticle: (articleId, rejectedBy, reason) => {
    get().updateArticle(articleId, {
      status: 'rejected',
      reviewedAt: new Date(),
      rejectedAt: new Date(),
      rejectionReason: reason,
    });
  },
  
  publishArticle: (articleId, publishedBy) => {
    get().updateArticle(articleId, {
      status: 'published',
      publishedAt: new Date(),
      lastModifiedBy: publishedBy,
    });
  },
  
  unpublishArticle: (articleId) => {
    get().updateArticle(articleId, {
      status: 'approved',
      publishedAt: undefined,
    });
  },
  
  archiveArticle: (articleId) => {
    get().updateArticle(articleId, {
      status: 'archived',
      archivedAt: new Date(),
    });
  },
  
  restoreArticle: (articleId) => {
    const article = get().getArticle(articleId);
    if (article) {
      get().updateArticle(articleId, {
        status: article.publishedAt ? 'published' : 'draft',
        archivedAt: undefined,
      });
    }
  },
  
  markAsBreakingNews: (articleId) => {
    get().updateArticle(articleId, { isBreakingNews: true });
  },
  
  unmarkBreakingNews: (articleId) => {
    get().updateArticle(articleId, { isBreakingNews: false });
  },
  
  // Version Control
  createRevision: (articleId, changedBy, changeSummary) => {
    const article = get().getArticle(articleId);
    if (!article) return;
    
    const revision: ArticleRevision = {
      id: Date.now().toString(),
      articleId,
      version: article.version,
      title: article.title,
      content: article.content,
      changedBy,
      changedAt: new Date(),
      changeSummary,
    };
    
    get().updateArticle(articleId, {
      version: article.version + 1,
      revisionHistory: [...article.revisionHistory, revision],
    });
  },
  
  getRevisions: (articleId) => {
    const article = get().getArticle(articleId);
    return article?.revisionHistory || [];
  },
  
  restoreRevision: (articleId, revisionId) => {
    const article = get().getArticle(articleId);
    const revision = article?.revisionHistory.find((r) => r.id === revisionId);
    if (article && revision) {
      get().updateArticle(articleId, {
        title: revision.title,
        content: revision.content,
      });
      get().createRevision(articleId, 'System', 'Restored from revision');
    }
  },
  
  // Category Management
  addCategory: (categoryData) => {
    const newCategory: NewsCategory = {
      ...categoryData,
      id: Date.now().toString(),
      articleCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.categories, newCategory];
      saveToStorage('news-categories', updated);
      return { categories: updated };
    });
  },
  
  updateCategory: (id, updates) => {
    set((state) => {
      const updated = state.categories.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      );
      saveToStorage('news-categories', updated);
      return { categories: updated };
    });
  },
  
  deleteCategory: (id) => {
    set((state) => {
      const updated = state.categories.filter((c) => c.id !== id);
      saveToStorage('news-categories', updated);
      return { categories: updated };
    });
  },
  
  getCategory: (id) => {
    return get().categories.find((c) => c.id === id);
  },
  
  // Tag Management
  addTag: (tagData) => {
    const newTag: NewsTag = {
      ...tagData,
      id: Date.now().toString(),
      articleCount: 0,
      createdAt: new Date(),
    };
    set((state) => {
      const updated = [...state.tags, newTag];
      saveToStorage('news-tags', updated);
      return { tags: updated };
    });
  },
  
  updateTag: (id, updates) => {
    set((state) => {
      const updated = state.tags.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      saveToStorage('news-tags', updated);
      return { tags: updated };
    });
  },
  
  deleteTag: (id) => {
    set((state) => {
      const updated = state.tags.filter((t) => t.id !== id);
      saveToStorage('news-tags', updated);
      return { tags: updated };
    });
  },
  
  getTag: (id) => {
    return get().tags.find((t) => t.id === id);
  },
  
  getPopularTags: (limit = 10) => {
    return get().tags
      .sort((a, b) => b.articleCount - a.articleCount)
      .slice(0, limit);
  },
  
  // Comment Management
  addComment: (commentData) => {
    const newComment: NewsComment = {
      ...commentData,
      id: Date.now().toString(),
      likes: 0,
      reported: false,
      isSpam: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.comments, newComment];
      // Update article comment count
      const article = state.articles.find((a) => a.id === commentData.articleId);
      if (article) {
        get().updateArticle(commentData.articleId, { comments: article.comments + 1 });
      }
      saveToStorage('news-comments', updated);
      return { comments: updated };
    });
  },
  
  updateComment: (id, updates) => {
    set((state) => {
      const updated = state.comments.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
      );
      saveToStorage('news-comments', updated);
      return { comments: updated };
    });
  },
  
  deleteComment: (id) => {
    set((state) => {
      const comment = state.comments.find((c) => c.id === id);
      const updated = state.comments.filter((c) => c.id !== id);
      if (comment) {
        const article = state.articles.find((a) => a.id === comment.articleId);
        if (article) {
          get().updateArticle(comment.articleId, { comments: Math.max(0, article.comments - 1) });
        }
      }
      saveToStorage('news-comments', updated);
      return { comments: updated };
    });
  },
  
  approveComment: (id) => {
    get().updateComment(id, { isApproved: true });
  },
  
  rejectComment: (id) => {
    get().updateComment(id, { isApproved: false });
  },
  
  getCommentsByArticle: (articleId) => {
    return get().comments.filter((c) => c.articleId === articleId && c.isApproved);
  },
  
  // Assignment Management
  addAssignment: (assignmentData) => {
    const newAssignment: NewsAssignment = {
      ...assignmentData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.assignments, newAssignment];
      saveToStorage('news-assignments', updated);
      return { assignments: updated };
    });
  },
  
  updateAssignment: (id, updates) => {
    set((state) => {
      const updated = state.assignments.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
      );
      saveToStorage('news-assignments', updated);
      return { assignments: updated };
    });
  },
  
  deleteAssignment: (id) => {
    set((state) => {
      const updated = state.assignments.filter((a) => a.id !== id);
      saveToStorage('news-assignments', updated);
      return { assignments: updated };
    });
  },
  
  getAssignmentsByJournalist: (journalistId) => {
    return get().assignments.filter((a) => a.assignedTo === journalistId);
  },
  
  getPendingAssignments: () => {
    return get().assignments.filter((a) => a.status === 'pending' || a.status === 'in_progress');
  },
  
  // Analytics
  addAnalytics: (analyticsData) => {
    const newAnalytics: NewsAnalytics = {
      ...analyticsData,
      id: Date.now().toString(),
    };
    set((state) => {
      const updated = [...state.analytics, newAnalytics];
      saveToStorage('news-analytics', updated);
      return { analytics: updated };
    });
  },
  
  getArticleAnalytics: (articleId, fromDate, toDate) => {
    let analytics = get().analytics.filter((a) => a.articleId === articleId);
    if (fromDate) {
      analytics = analytics.filter((a) => a.date >= fromDate);
    }
    if (toDate) {
      analytics = analytics.filter((a) => a.date <= toDate);
    }
    return analytics;
  },
  
  getPopularArticles: (limit = 10, period = 'week') => {
    const now = new Date();
    const periodStart = new Date();
    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return get().articles
      .filter((a) => a.publishedAt && a.publishedAt >= periodStart)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },
  
  // Notifications
  createNotification: (notificationData) => {
    const newNotification: NewsNotification = {
      ...notificationData,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };
    set((state) => {
      const updated = [...state.notifications, newNotification];
      saveToStorage('news-notifications', updated);
      return { notifications: updated };
    });
  },
  
  markNotificationAsRead: (id) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date() } : n
      );
      saveToStorage('news-notifications', updated);
      return { notifications: updated };
    });
  },
  
  getUnreadNotifications: (userId, role) => {
    let notifications = get().notifications.filter((n) => !n.read);
    if (userId) {
      notifications = notifications.filter((n) => n.targetUserId === userId);
    }
    if (role) {
      notifications = notifications.filter((n) => n.targetRole === role);
    }
    return notifications;
  },
  
  // Templates
  addTemplate: (templateData) => {
    const newTemplate: NewsTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.templates, newTemplate];
      saveToStorage('news-templates', updated);
      return { templates: updated };
    });
  },
  
  updateTemplate: (id, updates) => {
    set((state) => {
      const updated = state.templates.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      );
      saveToStorage('news-templates', updated);
      return { templates: updated };
    });
  },
  
  deleteTemplate: (id) => {
    set((state) => {
      const updated = state.templates.filter((t) => t.id !== id);
      saveToStorage('news-templates', updated);
      return { templates: updated };
    });
  },
  
  getTemplate: (id) => {
    return get().templates.find((t) => t.id === id);
  },
  
  createArticleFromTemplate: (templateId, authorId, data) => {
    const template = get().getTemplate(templateId);
    if (!template) throw new Error('Template not found');
    
    let content = template.content;
    template.fields.forEach((field) => {
      const value = data[field.name] || field.defaultValue || '';
      content = content.replace(`{{${field.name}}}`, value);
    });
    
    const article: NewsArticle = {
      id: Date.now().toString(),
      title: data.title || 'Untitled Article',
      slug: (data.title || 'untitled-article').toLowerCase().replace(/\s+/g, '-'),
      summary: data.summary || '',
      content,
      status: 'draft',
      priority: 'normal',
      isBreakingNews: false,
      isFeatured: false,
      isExclusive: false,
      categoryId: template.categoryId || '',
      categoryName: get().getCategory(template.categoryId || '')?.name || '',
      tags: [],
      keywords: [],
      authorId,
      authorName: 'Author',
      views: 0,
      shares: 0,
      likes: 0,
      comments: 0,
      readingTime: Math.ceil(content.length / 1000),
      version: 1,
      revisionHistory: [],
      accessRoles: ['admin', 'editor', 'publisher', 'viewer'],
      isPublic: true,
      requiresSubscription: false,
      socialMediaPublished: {
        facebook: false,
        twitter: false,
        instagram: false,
        linkedin: false,
        telegram: false,
      },
      relatedArticles: [],
      images: [],
      videos: [],
      audioFiles: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastModifiedBy: 'System',
    };
    
    get().addArticle(article);
    return article;
  },
  
  // Scheduling
  getScheduledArticles: () => {
    const now = new Date();
    return get().articles.filter((a) =>
      a.scheduledPublishAt && a.scheduledPublishAt > now && a.status !== 'published'
    );
  },
  
  publishScheduledArticles: () => {
    const now = new Date();
    get().articles
      .filter((a) => a.scheduledPublishAt && a.scheduledPublishAt <= now && a.status === 'approved')
      .forEach((a) => {
        get().publishArticle(a.id, 'System');
      });
  },
  
  unpublishExpiredArticles: () => {
    const now = new Date();
    get().articles
      .filter((a) => a.expiresAt && a.expiresAt <= now && a.status === 'published')
      .forEach((a) => {
        get().unpublishArticle(a.id);
      });
  },
  
  // Social Media
  publishToSocialMedia: (articleId, platforms) => {
    const updates: Partial<NewsArticle> = {};
    platforms.forEach((platform) => {
      if (platform === 'facebook') updates.socialMediaPublished = { ...get().getArticle(articleId)?.socialMediaPublished, facebook: true } as any;
      if (platform === 'twitter') updates.socialMediaPublished = { ...get().getArticle(articleId)?.socialMediaPublished, twitter: true } as any;
      if (platform === 'instagram') updates.socialMediaPublished = { ...get().getArticle(articleId)?.socialMediaPublished, instagram: true } as any;
      if (platform === 'linkedin') updates.socialMediaPublished = { ...get().getArticle(articleId)?.socialMediaPublished, linkedin: true } as any;
      if (platform === 'telegram') updates.socialMediaPublished = { ...get().getArticle(articleId)?.socialMediaPublished, telegram: true } as any;
    });
    get().updateArticle(articleId, updates);
  },
  
  // Statistics
  getStatistics: () => {
    const articles = get().articles;
    const published = articles.filter((a) => a.status === 'published');
    const totalViews = published.reduce((sum, a) => sum + a.views, 0);
    const totalShares = published.reduce((sum, a) => sum + a.shares, 0);
    const totalComments = published.reduce((sum, a) => sum + a.comments, 0);
    
    const categoryCounts: Record<string, number> = {};
    articles.forEach((a) => {
      categoryCounts[a.categoryId] = (categoryCounts[a.categoryId] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    
    const authorCounts: Record<string, number> = {};
    articles.forEach((a) => {
      authorCounts[a.authorId] = (authorCounts[a.authorId] || 0) + 1;
    });
    const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    
    return {
      totalArticles: articles.length,
      publishedArticles: published.length,
      draftArticles: articles.filter((a) => a.status === 'draft').length,
      breakingNews: articles.filter((a) => a.isBreakingNews && a.status === 'published').length,
      pendingReview: articles.filter((a) => a.status === 'pending_review').length,
      totalViews,
      totalShares,
      totalComments,
      averageViews: published.length > 0 ? totalViews / published.length : 0,
      topCategory: get().getCategory(topCategory)?.name || '',
      topAuthor,
    };
  },
  
  // Journalism Reports
  generateReport: (type, period, generatedBy) => {
    const articles = get().articles.filter((a) => {
      const pubDate = a.publishedAt || a.createdAt;
      return pubDate >= period.from && pubDate <= period.to;
    });
    const published = articles.filter((a) => a.status === 'published');
    const totalViews = published.reduce((sum, a) => sum + a.views, 0);
    const totalShares = published.reduce((sum, a) => sum + a.shares, 0);
    const totalComments = published.reduce((sum, a) => sum + a.comments, 0);
    
    const report: JournalismReport = {
      id: Date.now().toString(),
      type,
      title: `${type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} - ${period.from.toLocaleDateString()} to ${period.to.toLocaleDateString()}`,
      description: `Automatically generated ${type} report`,
      generatedBy,
      generatedAt: new Date(),
      period,
      data: { articles, type },
      metrics: {
        totalArticles: articles.length,
        publishedArticles: published.length,
        totalViews,
        totalShares,
        totalComments,
        averageEngagement: published.length > 0 ? (totalViews + totalShares + totalComments) / published.length : 0,
        topPerformingArticle: published.sort((a, b) => b.views - a.views)[0]?.id,
        topJournalist: published.sort((a, b) => b.views - a.views)[0]?.authorId,
        topCategory: published.sort((a, b) => b.views - a.views)[0]?.categoryId,
      },
      exportedFormats: [],
      isScheduled: false,
      recipients: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => {
      const updated = [...state.reports, report];
      saveToStorage('news-reports', updated);
      return { reports: updated };
    });
    
    return report;
  },
  
  addReport: (reportData) => {
    const newReport: JournalismReport = {
      ...reportData,
      id: Date.now().toString(),
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.reports, newReport];
      saveToStorage('news-reports', updated);
      return { reports: updated };
    });
  },
  
  updateReport: (id, updates) => {
    set((state) => {
      const updated = state.reports.map((r) => {
        if (r.id === id) {
          return { ...r, ...updates, updatedAt: new Date() };
        }
        return r;
      });
      saveToStorage('news-reports', updated);
      return { reports: updated };
    });
  },
  
  deleteReport: (id) => {
    set((state) => {
      const updated = state.reports.filter((r) => r.id !== id);
      saveToStorage('news-reports', updated);
      return { reports: updated };
    });
  },
  
  getReport: (id) => {
    return get().reports.find((r) => r.id === id);
  },
  
  getReportsByType: (type) => {
    return get().reports.filter((r) => r.type === type);
  },
  
  getReportsByPeriod: (from, to) => {
    return get().reports.filter((r) => {
      return r.period.from >= from && r.period.to <= to;
    });
  },
  
  exportReport: (id, format) => {
    const report = get().getReport(id);
    if (!report) return;
    
    const updated = [...report.exportedFormats, format];
    get().updateReport(id, { exportedFormats: updated });
    // In a real app, this would trigger a download
    console.log(`Exporting report ${id} as ${format}`);
  },
  
  // Editorial Agendas
  addAgenda: (agendaData) => {
    const newAgenda: EditorialAgenda = {
      ...agendaData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => {
      const updated = [...state.agendas, newAgenda];
      saveToStorage('news-agendas', updated);
      return { agendas: updated };
    });
  },
  
  updateAgenda: (id, updates) => {
    set((state) => {
      const updated = state.agendas.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates, updatedAt: new Date() };
        }
        return a;
      });
      saveToStorage('news-agendas', updated);
      return { agendas: updated };
    });
  },
  
  deleteAgenda: (id) => {
    set((state) => {
      const updated = state.agendas.filter((a) => a.id !== id);
      saveToStorage('news-agendas', updated);
      return { agendas: updated };
    });
  },
  
  getAgenda: (id) => {
    return get().agendas.find((a) => a.id === id);
  },
  
  getAgendasByDate: (date) => {
    const dateStr = date.toDateString();
    return get().agendas.filter((a) => a.date.toDateString() === dateStr);
  },
  
  getAgendasByJournalist: (journalistId) => {
    return get().agendas.filter((a) => a.assignedTo.includes(journalistId));
  },
  
  getUpcomingAgendas: (days = 7) => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    return get().agendas.filter((a) => {
      return a.date >= today && a.date <= futureDate && a.status !== 'completed' && a.status !== 'cancelled';
    });
  },
  
  completeAgenda: (id) => {
    get().updateAgenda(id, { status: 'completed', completedAt: new Date() });
  },
  
  // Supervisor Notifications
  createSupervisorNotification: (notificationData) => {
    const newNotification: SupervisorNotification = {
      ...notificationData,
      id: Date.now().toString(),
      read: false,
      acknowledged: false,
      createdAt: new Date(),
    };
    set((state) => {
      const updated = [...state.supervisorNotifications, newNotification];
      saveToStorage('news-supervisor-notifications', updated);
      return { supervisorNotifications: updated };
    });
  },
  
  markNotificationRead: (id) => {
    set((state) => {
      const updated = state.supervisorNotifications.map((n) => {
        if (n.id === id) {
          return { ...n, read: true, readAt: new Date() };
        }
        return n;
      });
      saveToStorage('news-supervisor-notifications', updated);
      return { supervisorNotifications: updated };
    });
  },
  
  acknowledgeNotification: (id) => {
    set((state) => {
      const updated = state.supervisorNotifications.map((n) => {
        if (n.id === id) {
          return { ...n, acknowledged: true, acknowledgedAt: new Date() };
        }
        return n;
      });
      saveToStorage('news-supervisor-notifications', updated);
      return { supervisorNotifications: updated };
    });
  },
  
  getSupervisorNotifications: (supervisorId, unreadOnly = false) => {
    const notifications = get().supervisorNotifications.filter((n) => n.recipientId === supervisorId);
    return unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  },
  
  getUnreadSupervisorNotifications: (supervisorId) => {
    return get().getSupervisorNotifications(supervisorId, true);
  },
  
  notifySupervisor: (supervisorId, type, title, message, senderId, senderName, senderRole, priority, metadata) => {
    get().createSupervisorNotification({
      type,
      title,
      message,
      senderId,
      senderName,
      senderRole,
      recipientId: supervisorId,
      recipientName: 'Supervisor',
      priority,
      actionRequired: priority === 'urgent' || priority === 'high',
      metadata,
    });
  },
}));

// Auto-publish scheduled articles every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useNewsStore.getState();
    store.publishScheduledArticles();
    store.unpublishExpiredArticles();
  }, 60000);
}
