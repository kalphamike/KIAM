import { useProjects, useReviews, useStatuses, useProfile, useAiResponses } from './useCMS';
import type { Project } from '@/data/seed';
import type { GoogleReview } from '@/data/google';

interface StatusItem {
  id: string;
  projectId: string;
  title: string;
  mediaUrl: string;
  timestamp: string;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  about: string;
  linkedinUrl: string;
}

const DEFAULT_PROFILE: Profile = {
  name: 'Owner',
  email: '',
  phone: '',
  location: '',
  headline: '',
  about: '',
  linkedinUrl: '',
};

export function usePortfolio() {
  const { data: dbProjects = [], isLoading: projectsLoading, isError: projectsError } = useProjects();
  const { data: dbReviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: dbStatuses = [], isLoading: statusesLoading } = useStatuses();
  const { data: dbProfile, isLoading: profileLoading } = useProfile();
  const { data: aiResponses = {} } = useAiResponses();

  const projects: Project[] = dbProjects;
  const reviews: GoogleReview[] = dbReviews;
  const statuses: StatusItem[] = dbStatuses;
  
  const profile: Profile = dbProfile ? {
    name: dbProfile.name || DEFAULT_PROFILE.name,
    email: dbProfile.email || DEFAULT_PROFILE.email,
    phone: dbProfile.phone || DEFAULT_PROFILE.phone,
    location: dbProfile.location || DEFAULT_PROFILE.location,
    headline: dbProfile.headline || DEFAULT_PROFILE.headline,
    about: dbProfile.about || DEFAULT_PROFILE.about,
    linkedinUrl: dbProfile.linkedin_url || DEFAULT_PROFILE.linkedinUrl,
  } : DEFAULT_PROFILE;

  const loading = projectsLoading || reviewsLoading || statusesLoading || profileLoading;
  const isConfigured = Boolean(dbProfile !== undefined || projects.length > 0);

  const refresh = async () => {
    window.location.reload();
  };

  return {
    projects,
    reviews,
    statuses,
    profile,
    aiResponses,
    loading,
    source: isConfigured ? 'api' : 'none',
    error: projectsError ? 'Failed to load content' : null,
    refresh,
    isApi: isConfigured,
    isEmpty: !loading && projects.length === 0,
  };
}

export function useOwner() {
  const { profile } = usePortfolio();
  return profile;
}
