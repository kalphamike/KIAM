import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/components/AdminAuth';
import {
  useProjects,
  useReviews,
  useStatuses,
  useProfile,
  useMessages,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useCreateStatus,
  useDeleteStatus,
  useUpdateProfile,
  useReplyToMessage,
  useDeleteMessage,
  QUERY_KEYS,
} from '@/hooks/useCMS';
import { supabase } from '@/lib/supabase';
import type { DbProject, DbReview, DbStatus, DbProfile, DbMessage } from '@/lib/supabase';
import { Plus, Trash2, Edit2, LogOut, Package, Star, BarChart2, MessageSquare, User, Save, X, Check, RefreshCw, Mail, Eye, Reply, Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

type Tab = 'projects' | 'reviews' | 'statuses' | 'messages' | 'ai' | 'profile';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function AdminDashboard() {
  const { loading: authLoading, configured, isDemo, isAuthenticated, logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews();
  const { data: statuses = [], isLoading: statusesLoading } = useStatuses();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useMessages();

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const createStatus = useCreateStatus();
  const deleteStatus = useDeleteStatus();
  const updateProfile = useUpdateProfile();
  const replyToMessage = useReplyToMessage();
  const deleteMessage = useDeleteMessage();

  const [selectedMessage, setSelectedMessage] = useState<DbMessage | null>(null);
  const [replyText, setReplyText] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<DbProject> | null>(null);
  const [editingReview, setEditingReview] = useState<Partial<DbReview> | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Partial<DbStatus> | null>(null);
  const [saving, setSaving] = useState(false);
  const [localProfile, setLocalProfile] = useState<Partial<DbProfile>>({});

  useEffect(() => {
    if (profile) {
      setLocalProfile(profile);
    }
  }, [profile]);

  const loading = projectsLoading || reviewsLoading || statusesLoading || profileLoading || messagesLoading;

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviews });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statuses });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
  };

  const handleAddProject = () => {
    setEditingProject({ 
      id: generateId(),
      title: '', 
      avatar_url: '', 
      short_description: '', 
      link: '', 
      last_message: 'New project', 
      last_updated: new Date().toISOString(),
      unread: 0,
      tech_stack: [],
    });
    setShowProjectModal(true);
  };

  const handleEditProject = (project: typeof projects[0]) => {
    setEditingProject({ 
      id: project.id,
      title: project.title,
      avatar_url: project.avatarUrl,
      short_description: project.shortDescription,
      link: project.link,
      last_message: project.lastMessage,
      last_updated: project.lastUpdated,
      unread: project.unread,
      tech_stack: project.techStack,
      about: project.about,
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    setSaving(true);
    
    try {
      if (projects.find(p => p.id === editingProject.id)) {
        await updateProject.mutateAsync({
          id: editingProject.id!,
          title: editingProject.title,
          avatar_url: editingProject.avatar_url,
          short_description: editingProject.short_description,
          link: editingProject.link,
          last_message: editingProject.last_message,
          unread: editingProject.unread,
          tech_stack: editingProject.tech_stack,
          about: editingProject.about,
        });
      } else {
        await createProject.mutateAsync(editingProject);
      }
      await handleSave();
    } catch (err) {
      console.error('Failed to save project:', err);
    }
    
    setShowProjectModal(false);
    setEditingProject(null);
    setSaving(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project?')) {
      setSaving(true);
      try {
        await deleteProject.mutateAsync(id);
        await handleSave();
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
      setSaving(false);
    }
  };

  const handleAddReview = () => {
    setEditingReview({ 
      id: generateId(),
      author_name: '', 
      author_photo: null, 
      rating: 5, 
      text: '', 
      time: 'Just now',
    });
    setShowReviewModal(true);
  };

  const handleEditReview = (review: typeof reviews[0]) => {
    setEditingReview({ 
      id: review.id,
      author_name: review.authorName,
      author_photo: review.authorPhoto,
      rating: review.rating,
      text: review.text,
      time: review.time,
    });
    setShowReviewModal(true);
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    setSaving(true);
    
    try {
      if (reviews.find(r => r.id === editingReview.id)) {
        await updateReview.mutateAsync({
          id: editingReview.id!,
          author_name: editingReview.author_name,
          author_photo: editingReview.author_photo,
          rating: editingReview.rating,
          text: editingReview.text,
          time: editingReview.time,
        });
      } else {
        await createReview.mutateAsync(editingReview);
      }
      await handleSave();
    } catch (err) {
      console.error('Failed to save review:', err);
    }
    
    setShowReviewModal(false);
    setEditingReview(null);
    setSaving(false);
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Delete this review?')) {
      setSaving(true);
      try {
        await deleteReview.mutateAsync(id);
        await handleSave();
      } catch (err) {
        console.error('Failed to delete review:', err);
      }
      setSaving(false);
    }
  };

  const handleAddStatus = () => {
    setEditingStatus({ 
      id: generateId(),
      project_id: '', 
      title: '', 
      media_url: '',
    });
    setShowStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!editingStatus) return;
    setSaving(true);
    
    try {
      await createStatus.mutateAsync(editingStatus);
      await handleSave();
      navigate('/');
    } catch (err) {
      console.error('Failed to save status:', err);
    }
    
    setShowStatusModal(false);
    setEditingStatus(null);
    setSaving(false);
  };

  const handleDeleteStatus = async (id: string) => {
    if (confirm('Delete this status?')) {
      setSaving(true);
      try {
        await deleteStatus.mutateAsync(id);
        await handleSave();
      } catch (err) {
        console.error('Failed to delete status:', err);
      }
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        id: 'main',
        name: localProfile.name,
        email: localProfile.email,
        phone: localProfile.phone,
        location: localProfile.location,
        headline: localProfile.headline,
        about: localProfile.about,
        linkedin_url: localProfile.linkedin_url,
      });
      await handleSave();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
    setSaving(false);
  };

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'statuses', label: 'Statuses', icon: BarChart2 },
    { id: 'messages', label: 'Messages', icon: Mail, badge: messages.filter(m => m.status === 'new').length },
    { id: 'ai', label: 'AI Responses', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-screen p-4 flex flex-col">
          <h1 className="text-xl font-bold text-foreground mb-6">Admin Panel</h1>
          <nav className="space-y-1 flex-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {(tab as { badge?: number }).badge ? (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {(tab as { badge?: number }).badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
          
          <div className="space-y-2 mt-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400 text-center">
              {isDemo ? '⚡ Demo Mode' : '🔗 API Connected'}
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" /> View Site
            </button>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: '100vh' }}>
          {saving && (
            <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Save className="h-4 w-4 animate-spin" /> Saving...
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Projects</h2>
                <button onClick={handleAddProject} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>
              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No projects yet. Click "Add Project" to create one.</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3">
                        <img src={project.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover bg-muted" />
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>
                          <p className="text-sm text-muted-foreground">{project.shortDescription}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditProject(project)} className="p-2 rounded hover:bg-muted">
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="p-2 rounded hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
                <button onClick={handleAddReview} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add Review
                </button>
              </div>
              <div className="space-y-2">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No reviews yet.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{review.authorName}</span>
                          <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditReview(review)} className="p-2 rounded hover:bg-muted">
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDeleteReview(review.id)} className="p-2 rounded hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'statuses' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Statuses</h2>
                <button onClick={handleAddStatus} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add Status
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {statuses.length === 0 ? (
                  <p className="col-span-3 text-muted-foreground text-center py-8">No statuses yet.</p>
                ) : (
                  statuses.map(status => (
                    <div key={status.id} className="rounded-lg border border-border overflow-hidden">
                      <img src={status.mediaUrl || '/placeholder.jpg'} alt="" className="w-full h-32 object-cover bg-muted" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Status'; }} />
                      <div className="p-2 flex items-center justify-between">
                        <p className="text-sm text-foreground truncate">{status.title}</p>
                        <button onClick={() => handleDeleteStatus(status.id)} className="p-1 hover:bg-destructive/10 rounded">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Visitor Messages</h2>
                <button onClick={() => refetchMessages()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
              </div>
              
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground/60">Messages from visitors will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`p-4 rounded-lg border bg-card ${
                        msg.status === 'new' ? 'border-primary shadow-sm' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{msg.visitor_name}</h3>
                            {msg.status === 'new' && (
                              <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">New</span>
                            )}
                            {msg.status === 'replied' && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Replied</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {msg.visitor_email} {msg.visitor_phone && `• ${msg.visitor_phone}`}
                          </p>
                          <p className="text-xs text-muted-foreground/60">{format(new Date(msg.created_at), 'PPp')}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => window.open(`https://wa.me/${msg.visitor_phone.replace('+', '')}`, '_blank')}
                            className="p-2 hover:bg-muted rounded-lg"
                            title="Reply via WhatsApp"
                          >
                            <Reply className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button 
                            onClick={() => deleteMessage.mutate(msg.id)}
                            className="p-2 hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      
                      {msg.admin_reply && (
                        <div className="bg-primary/10 rounded-lg p-3">
                          <p className="text-xs font-medium text-primary mb-1">Your Reply:</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{msg.admin_reply}</p>
                        </div>
                      )}
                      
                      {!msg.admin_reply && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type a reply..."
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                replyToMessage.mutate({ id: msg.id, reply: (e.target as HTMLInputElement).value });
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                              if (input?.value.trim()) {
                                replyToMessage.mutate({ id: msg.id, reply: input.value });
                                input.value = '';
                              }
                            }}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">AI Responses</h2>
              <p className="text-muted-foreground mb-4">AI responses are managed in code. Edit src/lib/ai-chatbot.ts to customize.</p>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Name *</label>
                  <input
                    type="text"
                    value={localProfile.name || ''}
                    onChange={e => setLocalProfile({ ...localProfile, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Headline / Title</label>
                  <input
                    type="text"
                    value={localProfile.headline || ''}
                    onChange={e => setLocalProfile({ ...localProfile, headline: e.target.value })}
                    placeholder="Full-Stack Developer"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">About</label>
                  <textarea
                    value={localProfile.about || ''}
                    onChange={e => setLocalProfile({ ...localProfile, about: e.target.value })}
                    placeholder="Tell visitors about yourself..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    value={localProfile.email || ''}
                    onChange={e => setLocalProfile({ ...localProfile, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Phone</label>
                  <input
                    type="text"
                    value={localProfile.phone || ''}
                    onChange={e => setLocalProfile({ ...localProfile, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Location</label>
                  <input
                    type="text"
                    value={localProfile.location || ''}
                    onChange={e => setLocalProfile({ ...localProfile, location: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={localProfile.linkedin_url || ''}
                    onChange={e => setLocalProfile({ ...localProfile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <button onClick={handleSaveProfile} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Save className="h-4 w-4" /> Save Profile
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={showProjectModal} onClose={() => { setShowProjectModal(false); setEditingProject(null); }} title={editingProject?.id && projects.find(p => p.id === editingProject?.id) ? 'Edit Project' : 'Add Project'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Title *</label>
            <input
              type="text"
              value={editingProject?.title || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Avatar URL *</label>
            <input
              type="text"
              value={editingProject?.avatar_url || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, avatar_url: e.target.value } : null)}
              placeholder="/avatars/project.png"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Short Description</label>
            <input
              type="text"
              value={editingProject?.short_description || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, short_description: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Project Link</label>
            <input
              type="text"
              value={editingProject?.link || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, link: e.target.value } : null)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Last Message</label>
            <input
              type="text"
              value={editingProject?.last_message || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, last_message: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Tech Stack (comma-separated)</label>
            <input
              type="text"
              value={(editingProject?.tech_stack || []).join(', ')}
              onChange={e => setEditingProject(prev => prev ? { ...prev, tech_stack: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : null)}
              placeholder="React, TypeScript, Node.js"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">About (AI)</label>
            <textarea
              value={editingProject?.about || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, about: e.target.value } : null)}
              placeholder="Detailed description for AI"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSaveProject} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Check className="h-4 w-4" /> Save
            </button>
            <button onClick={() => { setShowProjectModal(false); setEditingProject(null); }} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setEditingReview(null); }} title={editingReview?.id && reviews.find(r => r.id === editingReview?.id) ? 'Edit Review' : 'Add Review'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Name *</label>
            <input
              type="text"
              value={editingReview?.author_name || ''}
              onChange={e => setEditingReview(prev => prev ? { ...prev, author_name: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Rating</label>
            <select
              value={editingReview?.rating || 5}
              onChange={e => setEditingReview(prev => prev ? { ...prev, rating: parseInt(e.target.value) } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            >
              {[5,4,3,2,1].map(n => (
                <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Review Text</label>
            <textarea
              value={editingReview?.text || ''}
              onChange={e => setEditingReview(prev => prev ? { ...prev, text: e.target.value } : null)}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSaveReview} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Check className="h-4 w-4" /> Save
            </button>
            <button onClick={() => { setShowReviewModal(false); setEditingReview(null); }} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setEditingStatus(null); }} title="Add Status">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Title *</label>
            <input
              type="text"
              value={editingStatus?.title || ''}
              onChange={e => setEditingStatus(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Project</label>
            <select
              value={editingStatus?.project_id || ''}
              onChange={e => setEditingStatus(prev => prev ? { ...prev, project_id: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            >
              <option value="">Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Image URL</label>
            <input
              type="text"
              value={editingStatus?.media_url || ''}
              onChange={e => setEditingStatus(prev => prev ? { ...prev, media_url: e.target.value } : null)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSaveStatus} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Check className="h-4 w-4" /> Save
            </button>
            <button onClick={() => { setShowStatusModal(false); setEditingStatus(null); }} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
