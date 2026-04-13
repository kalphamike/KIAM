import type { Project } from '@/data/seed';
import type { GoogleReview } from '@/data/google';

export interface StatusItem {
  id: string;
  projectId: string;
  title: string;
  mediaUrl: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  projects: 'chatfolio_projects',
  reviews: 'chatfolio_reviews',
  profile: 'chatfolio_profile',
  statuses: 'chatfolio_statuses',
  aiResponses: 'chatfolio_ai',
};

function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function setStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export interface DbProject {
  id: string;
  title: string;
  avatarUrl: string;
  shortDescription: string;
  link: string;
  lastMessage: string;
  lastUpdated: string;
  unread: number;
  techStack: string[];
}

export interface DbReview {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  rating: number;
  text: string;
  time: string;
}

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  headline?: string;
  about?: string;
  linkedin_url?: string;
}

export const db = {
  // Projects
  getProjects: (fallback: Project[]): Project[] => {
    return getStoredData(STORAGE_KEYS.projects, fallback);
  },

  saveProjects: (projects: Project[]): void => {
    setStoredData(STORAGE_KEYS.projects, projects);
  },

  addProject: (project: Project): void => {
    const projects = db.getProjects([]);
    projects.push(project);
    db.saveProjects(projects);
  },

  updateProject: (id: string, updates: Partial<Project>): void => {
    const projects = db.getProjects([]);
    const index = projects.findIndex(p => p.id === id);
    if (index >= 0) {
      projects[index] = { ...projects[index], ...updates };
      db.saveProjects(projects);
    }
  },

  deleteProject: (id: string): void => {
    const projects = db.getProjects([]);
    const filtered = projects.filter(p => p.id !== id);
    db.saveProjects(filtered);
  },

  // Reviews
  getReviews: (fallback: GoogleReview[]): GoogleReview[] => {
    return getStoredData(STORAGE_KEYS.reviews, fallback);
  },

  saveReviews: (reviews: GoogleReview[]): void => {
    setStoredData(STORAGE_KEYS.reviews, reviews);
  },

  addReview: (review: GoogleReview): void => {
    const reviews = db.getReviews([]);
    reviews.unshift(review);
    db.saveReviews(reviews);
  },

  updateReview: (id: string, updates: Partial<GoogleReview>): void => {
    const reviews = db.getReviews([]);
    const index = reviews.findIndex(r => r.id === id);
    if (index >= 0) {
      reviews[index] = { ...reviews[index], ...updates };
      db.saveReviews(reviews);
    }
  },

  deleteReview: (id: string): void => {
    const reviews = db.getReviews([]);
    const filtered = reviews.filter(r => r.id !== id);
    db.saveReviews(filtered);
  },

  // Profile
  getProfile: (fallback: DbProfile): DbProfile => {
    return getStoredData(STORAGE_KEYS.profile, fallback);
  },

  saveProfile: (profile: DbProfile): void => {
    setStoredData(STORAGE_KEYS.profile, profile);
  },

  // Statuses
  getStatuses: (fallback: StatusItem[]): StatusItem[] => {
    return getStoredData(STORAGE_KEYS.statuses, fallback);
  },

  saveStatuses: (statuses: StatusItem[]): void => {
    setStoredData(STORAGE_KEYS.statuses, statuses);
  },

  // Clear all data
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Check if has custom data
  hasData: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.projects);
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};