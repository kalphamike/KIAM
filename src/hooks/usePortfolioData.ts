import { useState, useEffect } from 'react';
import { isConfigured, fetchProjects, fetchReviews, fetchStatuses, fetchAiResponses, fetchProfile, DbProject, DbReview, DbStatus, DbAiResponse, DbProfile } from '@/lib/supabase';
import { projects as staticProjects, OWNER_NAME, OWNER_EMAIL, OWNER_PHONE, OWNER_LOCATION, statusItems } from '@/data/seed';
import { googleReviews } from '@/data/google';

function mapDbToProject(db: DbProject) {
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
  };
}

function mapDbToReview(db: DbReview) {
  return {
    id: db.id,
    authorName: db.author_name,
    authorPhoto: db.author_photo,
    rating: db.rating,
    text: db.text,
    time: db.time,
  };
}

function mapDbToStatus(db: DbStatus) {
  return {
    id: db.id,
    projectId: db.project_id,
    title: db.title,
    mediaUrl: db.media_url,
    timestamp: db.timestamp,
  };
}

export function usePortfolioData() {
  const [projects, setProjects] = useState(staticProjects);
  const [reviews, setReviews] = useState(googleReviews);
  const [statuses, setStatuses] = useState(statusItems);
  const [aiResponses, setAiResponses] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState({
    name: OWNER_NAME,
    email: OWNER_EMAIL,
    phone: OWNER_PHONE,
    location: OWNER_LOCATION,
    linkedinUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'static'>('static');

  useEffect(() => {
    async function loadData() {
      if (!isConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const [dbProjects, dbReviews, dbStatuses, dbAiResponses, dbProfile] = await Promise.all([
          fetchProjects(),
          fetchReviews(),
          fetchStatuses(),
          fetchAiResponses(),
          fetchProfile(),
        ]);

        if (dbProjects.length > 0) {
          setProjects(dbProjects.map(mapDbToProject));
          setSource('api');
        }

        if (dbReviews.length > 0) {
          setReviews(dbReviews.map(mapDbToReview));
        }

        if (dbStatuses.length > 0) {
          setStatuses(dbStatuses.map(mapDbToStatus));
        }

        if (dbAiResponses.length > 0) {
          const responses: Record<string, string> = {};
          dbAiResponses.forEach(r => {
            responses[r.intent] = r.response;
          });
          setAiResponses(responses);
        }

        if (dbProfile) {
          setProfile({
            name: dbProfile.name || OWNER_NAME,
            email: dbProfile.email || OWNER_EMAIL,
            phone: dbProfile.phone || OWNER_PHONE,
            location: dbProfile.location || OWNER_LOCATION,
            linkedinUrl: dbProfile.linkedin_url || '',
          });
        }

        setSource('api');
      } catch (error) {
        console.log('Using static data (API unavailable)');
      }

      setLoading(false);
    }

    loadData();
  }, []);

  return {
    projects,
    reviews,
    statuses,
    aiResponses,
    profile,
    loading,
    source,
  };
}