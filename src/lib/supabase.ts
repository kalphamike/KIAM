import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface DbProject {
  id: string;
  title: string;
  avatar_url: string;
  short_description: string;
  link: string;
  last_message: string;
  last_updated: string;
  unread: number;
  tech_stack: string[];
  about?: string;
  created_at: string;
}

export interface DbReview {
  id: string;
  author_name: string;
  author_photo: string | null;
  rating: number;
  text: string;
  time: string;
  created_at: string;
}

export interface DbStatus {
  id: string;
  project_id: string;
  title: string;
  media_url: string;
  timestamp: string;
}

export interface DbAiResponse {
  id: string;
  intent: string;
  response: string;
  category: string;
}

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  about: string;
  linkedin_url: string;
}

export interface DbMessage {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  admin_reply: string | null;
  created_at: string;
}

export const fetchProjects = async (): Promise<DbProject[]> => {
  if (!supabase) return [];
  console.log('[Supabase] Fetching projects...');
  const { data, error } = await supabase.from('projects').select('*').order('title');
  if (error) console.error('[Supabase] Fetch projects error:', error);
  else console.log('[Supabase] Projects fetched:', data?.length || 0, data?.map(p => p.title));
  return data || [];
};

export const fetchReviews = async (): Promise<DbReview[]> => {
  if (!supabase) return [];
  console.log('[Supabase] Fetching reviews...');
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
  if (error) console.error('[Supabase] Fetch reviews error:', error);
  else console.log('[Supabase] Reviews fetched:', data?.length || 0);
  return data || [];
};

export const fetchStatuses = async (): Promise<DbStatus[]> => {
  if (!supabase) return [];
  const { data } = await supabase.from('statuses').select('*').order('timestamp', { ascending: false });
  return data || [];
};

export const fetchAiResponses = async (): Promise<DbAiResponse[]> => {
  if (!supabase) return [];
  const { data } = await supabase.from('ai_responses').select('*');
  return data || [];
};

export const fetchProfile = async (): Promise<DbProfile | null> => {
  if (!supabase) return null;
  console.log('[Supabase] Fetching profile...');
  const { data, error } = await supabase.from('profile').select('*').limit(1).single();
  if (error) console.error('[Supabase] Fetch profile error:', error);
  else console.log('[Supabase] Profile fetched:', data?.name);
  return data;
};

export const isConfigured = () => !!supabase;

// Write functions for admin
export const saveProject = async (project: DbProject): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  console.log('[Supabase] Saving project:', project.id);
  const { error, data } = await supabase.from('projects').upsert(project, { onConflict: 'id' });
  if (error) console.error('[Supabase] Project save error:', error);
  else console.log('[Supabase] Project saved:', data);
  return { error: error as Error | null };
};

export const deleteProject = async (id: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  console.log('[Supabase] Deleting project:', id);
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) console.error('[Supabase] Delete error:', error);
  return { error: error as Error | null };
};

export const saveReview = async (review: DbReview): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  console.log('[Supabase] Saving review:', review.id);
  const { error, data } = await supabase.from('reviews').upsert(review, { onConflict: 'id' });
  if (error) console.error('[Supabase] Review save error:', error);
  else console.log('[Supabase] Review saved:', data);
  return { error: error as Error | null };
};

export const deleteReview = async (id: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  return { error: error as Error | null };
};

export const saveProfileData = async (profile: DbProfile): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  console.log('[Supabase] Saving profile:', profile.name);
  const { error, data } = await supabase.from('profile').upsert(profile, { onConflict: 'id' });
  if (error) console.error('[Supabase] Profile save error:', error);
  else console.log('[Supabase] Profile saved:', data);
  return { error: error as Error | null };
};

// Status functions
export const saveStatus = async (status: DbStatus): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  const { error } = await supabase.from('statuses').upsert(status, { onConflict: 'id' });
  return { error: error as Error | null };
};

export const deleteStatus = async (id: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  const { error } = await supabase.from('statuses').delete().eq('id', id);
  return { error: error as Error | null };
};

// Messages functions
export const fetchMessages = async (): Promise<DbMessage[]> => {
  if (!supabase) return [];
  console.log('[Supabase] Fetching messages...');
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) console.error('[Supabase] Fetch messages error:', error);
  else console.log('[Supabase] Messages fetched:', data?.length || 0);
  return data || [];
};

export const createMessage = async (message: Omit<DbMessage, 'id' | 'created_at'>): Promise<{ error: Error | null; data: DbMessage | null }> => {
  if (!supabase) return { error: new Error('Not configured'), data: null };
  console.log('[Supabase] Creating message from:', message.visitor_name);
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();
  if (error) console.error('[Supabase] Create message error:', error);
  else console.log('[Supabase] Message created:', data?.id);
  return { error: error as Error | null, data };
};

export const markMessageAsRead = async (id: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  const { error } = await supabase
    .from('messages')
    .update({ status: 'read' })
    .eq('id', id);
  return { error: error as Error | null };
};

export const replyToMessage = async (id: string, adminReply: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  console.log('[Supabase] Replying to message:', id);
  const { error } = await supabase
    .from('messages')
    .update({ 
      admin_reply: adminReply,
      status: 'replied' 
    })
    .eq('id', id);
  if (error) console.error('[Supabase] Reply error:', error);
  return { error: error as Error | null };
};

export const deleteMessage = async (id: string): Promise<{ error: Error | null }> => {
  if (!supabase) return { error: new Error('Not configured') };
  const { error } = await supabase.from('messages').delete().eq('id', id);
  return { error: error as Error | null };
};

export const deleteOldMessages = async (hoursOld: number = 24): Promise<{ error: Error | null; deleted: number }> => {
  if (!supabase) return { error: new Error('Not configured'), deleted: 0 };
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - hoursOld);
  
  const { error, count } = await supabase
    .from('messages')
    .delete()
    .lt('created_at', cutoffDate.toISOString());
  
  if (error) console.error('[Supabase] Delete old messages error:', error);
  else console.log('[Supabase] Deleted old messages:', count);
  
  return { error: error as Error | null, deleted: count || 0 };
};

export const getUnreadMessagesCount = async (): Promise<number> => {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');
  if (error) return 0;
  return count || 0;
};