import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isConfigured, fetchProjects, fetchReviews, fetchStatuses, fetchProfile, fetchAiResponses, fetchMessages, createMessage, markMessageAsRead, replyToMessage, deleteMessage } from '@/lib/supabase';
import type { DbProject, DbReview, DbStatus, DbProfile, DbAiResponse, DbMessage } from '@/lib/supabase';
import type { Project } from '@/data/seed';
import type { GoogleReview } from '@/data/google';

const QUERY_KEYS = {
  projects: ['projects'] as const,
  reviews: ['reviews'] as const,
  statuses: ['statuses'] as const,
  profile: ['profile'] as const,
  aiResponses: ['aiResponses'] as const,
  messages: ['messages'] as const,
};

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2);

function mapDbToProject(db: DbProject): Project {
  return {
    id: db.id,
    title: db.title,
    avatarUrl: db.avatar_url,
    shortDescription: db.short_description,
    link: db.link,
    lastMessage: db.last_message,
    lastUpdated: db.last_updated,
    unread: db.unread,
    techStack: db.tech_stack || [],
    about: db.about,
    suggestions: [],
    aiInfo: db.about,
  };
}

function mapDbToReview(db: DbReview): GoogleReview {
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

export function useProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.projects,
    queryFn: async () => {
      if (!isConfigured()) return [];
      const data = await fetchProjects();
      return data.map(mapDbToProject);
    },
    enabled: isConfigured(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useReviews() {
  return useQuery({
    queryKey: QUERY_KEYS.reviews,
    queryFn: async () => {
      if (!isConfigured()) return [];
      const data = await fetchReviews();
      return data.map(mapDbToReview);
    },
    enabled: isConfigured(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useStatuses() {
  return useQuery({
    queryKey: QUERY_KEYS.statuses,
    queryFn: async () => {
      if (!isConfigured()) return [];
      const data = await fetchStatuses();
      return data.map(mapDbToStatus);
    },
    enabled: isConfigured(),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      if (!isConfigured()) return null;
      return fetchProfile();
    },
    enabled: isConfigured(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useAiResponses() {
  return useQuery({
    queryKey: QUERY_KEYS.aiResponses,
    queryFn: async () => {
      if (!isConfigured()) return {};
      const data = await fetchAiResponses();
      const responses: Record<string, string> = {};
      data.forEach((r: DbAiResponse) => {
        responses[r.intent] = r.response;
      });
      return responses;
    },
    enabled: isConfigured(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: Partial<DbProject>) => {
      if (!supabase) throw new Error('Database not configured');
      const newProject: DbProject = {
        id: generateId(),
        title: project.title || 'Untitled',
        avatar_url: project.avatar_url || '',
        short_description: project.short_description || '',
        link: project.link || '',
        last_message: project.last_message || 'New project',
        last_updated: new Date().toISOString(),
        unread: 0,
        tech_stack: project.tech_stack || [],
        about: project.about,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('projects').insert(newProject);
      if (error) throw error;
      return newProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (project: Partial<DbProject> & { id: string }) => {
      if (!supabase) throw new Error('Database not configured');
      const { error } = await supabase
        .from('projects')
        .update({
          title: project.title,
          avatar_url: project.avatar_url,
          short_description: project.short_description,
          link: project.link,
          last_message: project.last_message,
          last_updated: new Date().toISOString(),
          unread: project.unread,
          tech_stack: project.tech_stack,
          about: project.about,
        })
        .eq('id', project.id);
      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Database not configured');
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: Partial<DbReview>) => {
      if (!supabase) throw new Error('Database not configured');
      const newReview: DbReview = {
        id: generateId(),
        author_name: review.author_name || 'Anonymous',
        author_photo: review.author_photo || null,
        rating: review.rating || 5,
        text: review.text || '',
        time: review.time || 'Just now',
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('reviews').insert(newReview);
      if (error) throw error;
      return newReview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (review: Partial<DbReview> & { id: string }) => {
      if (!supabase) throw new Error('Database not configured');
      const { error } = await supabase
        .from('reviews')
        .update({
          author_name: review.author_name,
          author_photo: review.author_photo,
          rating: review.rating,
          text: review.text,
          time: review.time,
        })
        .eq('id', review.id);
      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Database not configured');
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    },
  });
}

export function useCreateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status: Partial<DbStatus>) => {
      if (!supabase) throw new Error('Database not configured');
      const newStatus: DbStatus = {
        id: generateId(),
        project_id: status.project_id || '',
        title: status.title || '',
        media_url: status.media_url || '',
        timestamp: new Date().toISOString(),
      };
      const { error } = await supabase.from('statuses').insert(newStatus);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses });
    },
  });
}

export function useDeleteStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Database not configured');
      const { error } = await supabase.from('statuses').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<DbProfile>) => {
      if (!supabase) throw new Error('Database not configured');
      const { error } = await supabase
        .from('profile')
        .upsert({
          id: profile.id || 'main',
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          location: profile.location,
          headline: profile.headline,
          about: profile.about,
          linkedin_url: profile.linkedin_url,
        }, { onConflict: 'id' });
      if (error) throw error;
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
    },
  });
}

export function useMessages() {
  return useQuery({
    queryKey: QUERY_KEYS.messages,
    queryFn: async () => {
      if (!isConfigured()) return [];
      return fetchMessages();
    },
    enabled: isConfigured(),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: Omit<DbMessage, 'id' | 'created_at'>) => {
      if (!supabase) throw new Error('Database not configured');
      const { error, data } = await createMessage(message);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages });
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Database not configured');
      await markMessageAsRead(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages });
    },
  });
}

export function useReplyToMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      if (!supabase) throw new Error('Database not configured');
      await replyToMessage(id, reply);
      return { id, reply };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error('Database not configured');
      await deleteMessage(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages });
    },
  });
}

export { QUERY_KEYS };
