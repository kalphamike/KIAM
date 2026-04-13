import { useState, useEffect, useCallback } from 'react';
import { supabase, fetchProjects, fetchReviews, fetchProfile, fetchStatuses, isConfigured } from '@/lib/supabase';
import { db } from '@/lib/db';
import { projects as staticProjects, OWNER_NAME, OWNER_EMAIL, OWNER_PHONE, OWNER_LOCATION } from '@/data/seed';
import { googleReviews } from '@/data/google';
import { statusItems as staticStatuses } from '@/data/seed';
import type { Project } from '@/data/seed';
import type { GoogleReview } from '@/data/google';

interface StatusItem {
  id: string;
  projectId: string;
  title: string;
  mediaUrl: string;
  timestamp: string;
}

// Log on module load
const isSupabaseConfigured = isConfigured();
console.log('[usePortfolio] Module loaded, configured:', isSupabaseConfigured);

function mapDbToProject(db: { id: string; title: string; avatar_url: string; short_description: string; link: string; last_message: string; last_updated: string; unread: number; tech_stack: string[]; about?: string }): Project {
  return {
    id: db.id,
    title: db.title,
    avatarUrl: db.avatar_url,
    shortDescription: db.short_description,
    link: db.link,
    lastMessage: db.last_message,
    lastUpdated: db.last_updated,
    unread: db.unread,
    techStack: db.tech_stack,
    about: db.about,
  };
}

function mapDbToReview(db: { id: string; author_name: string; author_photo: string | null; rating: number; text: string; time: string }): GoogleReview {
  return {
    id: db.id,
    authorName: db.author_name,
    authorPhoto: db.author_photo,
    rating: db.rating,
    text: db.text,
    time: db.time,
  };
}

function mapDbToStatus(db: { id: string; project_id: string; title: string; media_url: string; timestamp: string }): StatusItem {
  return {
    id: db.id,
    projectId: db.project_id,
    title: db.title,
    mediaUrl: db.media_url,
    timestamp: db.timestamp,
  };
}

export function usePortfolio() {
  const [projects, setProjects] = useState<Project[]>(db.getProjects(staticProjects));
  const [reviews, setReviews] = useState<GoogleReview[]>(googleReviews);
  const [statuses, setStatuses] = useState<StatusItem[]>(staticStatuses);
  const [profile, setProfileInfo] = useState({
    name: OWNER_NAME,
    email: OWNER_EMAIL,
    phone: OWNER_PHONE,
    location: OWNER_LOCATION,
    headline: '',
    about: '',
    linkedinUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'static'>('static');

  const loadFromApi = useCallback(async () => {
    if (isConfigured()) {
      try {
        console.log('[usePortfolio] Loading from Supabase...');
        const [dbProjects, dbReviews, dbProfile, dbStatuses] = await Promise.all([
          fetchProjects(),
          fetchReviews(),
          fetchProfile(),
          fetchStatuses(),
        ]);

        console.log('[usePortfolio] Raw data:', { projects: dbProjects.length, reviews: dbReviews.length, statuses: dbStatuses.length, profile: dbProfile?.name });

        if (dbProjects.length > 0) {
          const mapped = dbProjects.map(mapDbToProject);
          // Merge with any locally stored projects that aren't in the API response
          const local = db.getProjects(staticProjects);
          const merged = [...mapped, ...local.filter(p => !mapped.some(mp => mp.id === p.id))];
          console.log('[usePortfolio] Setting projects from API (merged with local):', merged.map(p => p.title));
          setProjects(merged);
          setSource('api');
        }

        if (dbReviews.length > 0) {
          setReviews(dbReviews.map(mapDbToReview));
        }

        if (dbStatuses.length > 0) {
          setStatuses(dbStatuses.map(mapDbToStatus));
        }

        if (dbProfile) {
          setProfileInfo({
            name: dbProfile.name || OWNER_NAME,
            email: dbProfile.email || OWNER_EMAIL,
            phone: dbProfile.phone || OWNER_PHONE,
            location: dbProfile.location || OWNER_LOCATION,
            headline: dbProfile.headline || '',
            about: dbProfile.about || '',
            linkedinUrl: dbProfile.linkedin_url || '',
          });
          setSource('api');
        }
      } catch (err) {
        console.error('[usePortfolio] Failed to load from Supabase:', err);
        setError('Using local data');
      }
    } else {
      // Check localStorage for custom data
      console.log('[usePortfolio] Checking localStorage...');
      const storedStatuses = localStorage.getItem('chatfolio_statuses');
      if (storedStatuses) {
        try {
          const parsed = JSON.parse(storedStatuses);
          if (parsed.length > 0) {
            setStatuses(parsed);
            setSource('static');
          }
        } catch (e) {
          console.log('[usePortfolio] Failed to parse local statuses:', e);
        }
      }
    }
    setLoading(false);
  }, []);

useEffect(() => {
  loadFromApi();
}, [loadFromApi]);

  // Listen for external updates via localStorage (projects, statuses)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chatfolio_statuses') {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setStatuses(parsed);
        } catch {
          // ignore parse errors
        }
      }
      if (e.key === 'chatfolio_projects') {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          setProjects(parsed);
        } catch {
          // ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Auto-refresh when page gains focus (for real-time updates after admin saves)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        console.log('[usePortfolio] Page visible, refreshing data...');
        loadFromApi();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadFromApi]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadFromApi();
  }, [loadFromApi]);

  return {
    projects,
    reviews,
    statuses,
    profile,
    loading,
    source,
    error,
    refresh,
    isApi: source === 'api',
  };
}

export function useOwner() {
  const { profile } = usePortfolio();
  return {
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    headline: profile.headline,
    about: profile.about,
    linkedinUrl: profile.linkedinUrl,
  };
}