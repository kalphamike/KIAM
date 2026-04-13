import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/components/AdminAuth';
import { projects as staticProjects, OWNER_NAME, OWNER_EMAIL, OWNER_PHONE, OWNER_LOCATION } from '@/data/seed';
import { googleReviews } from '@/data/google';
import type { Project } from '@/data/seed';
import type { GoogleReview } from '@/data/google';
import { db, generateId, type DbProfile, type StatusItem } from '@/lib/db';
import { isConfigured, saveProject, deleteProject as dbDeleteProject, saveReview, deleteReview as dbDeleteReview, saveProfileData, saveStatus, deleteStatus } from '@/lib/supabase';
import { Plus, Trash2, Edit2, LogOut, Package, Star, BarChart2, MessageSquare, User, Save, X, Check, RefreshCw } from 'lucide-react';

type Tab = 'projects' | 'reviews' | 'statuses' | 'ai' | 'profile';

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

export default function AdminDashboard() {
  const { loading: authLoading, configured, isDemo } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [profile, setProfile] = useState<DbProfile>({ id: 'main', name: OWNER_NAME, email: OWNER_EMAIL, phone: OWNER_PHONE, location: OWNER_LOCATION, headline: '', about: '', linkedin_url: '' });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingReview, setEditingReview] = useState<GoogleReview | null>(null);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load data from database
    const storedProjects = db.getProjects(staticProjects);
    const storedReviews = db.getReviews(googleReviews);
    const storedProfile = db.getProfile({ id: 'main', name: OWNER_NAME, email: OWNER_EMAIL, phone: OWNER_PHONE, location: OWNER_LOCATION });
    const storedStatuses = db.getStatuses([]);
    
    setProjects(storedProjects);
    setReviews(storedReviews);
    setProfile(storedProfile);
    setStatuses(storedStatuses);
    setLoading(false);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 500);
  };

  const handleSignOut = () => {
    navigate('/');
  };

  // Project handlers
  const handleAddProject = () => {
    setEditingProject({ id: '', title: '', avatarUrl: '', shortDescription: '', link: '', lastMessage: '', lastUpdated: new Date().toISOString(), unread: 0, techStack: [] });
    setShowProjectModal(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject({ ...project });
    setShowProjectModal(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject) return;
    
    const project: Project = {
      ...editingProject,
      id: editingProject.id || generateId(),
      lastUpdated: new Date().toISOString(),
    };

    const existing = projects.findIndex(p => p.id === project.id);
    let updated: Project[];
    
    if (existing >= 0) {
      updated = [...projects];
      updated[existing] = project;
    } else {
      updated = [...projects, project];
    }
    
    setProjects(updated);
    db.saveProjects(updated);
    
    // Sync to Supabase if configured
    if (isConfigured()) {
await saveProject({
          id: project.id,
          title: project.title,
          avatar_url: project.avatarUrl,
          short_description: project.shortDescription,
          link: project.link,
          last_message: project.lastMessage,
          last_updated: project.lastUpdated,
          unread: project.unread || 0,
          tech_stack: project.techStack || [],
          about: project.about,
          created_at: new Date().toISOString(),
        });
    }
    
    setShowProjectModal(false);
    setEditingProject(null);
    handleSave();
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project?')) {
      const updated = projects.filter(p => p.id !== id);
      setProjects(updated);
      db.saveProjects(updated);
      if (isConfigured()) {
        await dbDeleteProject(id);
      }
    }
  };

  // Review handlers
  const handleAddReview = () => {
    setEditingReview({ id: '', authorName: '', authorPhoto: null, rating: 5, text: '', time: 'Just now' });
    setShowReviewModal(true);
  };

  const handleEditReview = (review: GoogleReview) => {
    setEditingReview({ ...review });
    setShowReviewModal(true);
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;
    
    const review: GoogleReview = {
      ...editingReview,
      id: editingReview.id || generateId(),
    };

    const existing = reviews.findIndex(r => r.id === review.id);
    let updated: GoogleReview[];
    
    if (existing >= 0) {
      updated = [...reviews];
      updated[existing] = review;
    } else {
      updated = [review, ...reviews];
    }
    
    setReviews(updated);
    db.saveReviews(updated);
    
    if (isConfigured()) {
      await saveReview({
        id: review.id,
        author_name: review.authorName,
        author_photo: review.authorPhoto,
        rating: review.rating,
        text: review.text,
        time: review.time,
        created_at: new Date().toISOString(),
      });
    }
    
    setShowReviewModal(false);
    setEditingReview(null);
    handleSave();
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm('Delete this review?')) {
      const updated = reviews.filter(r => r.id !== id);
      setReviews(updated);
      db.saveReviews(updated);
      if (isConfigured()) {
        await dbDeleteReview(id);
      }
    }
  };

  // Status handlers
const handleSaveStatus = async () => {
      if (!editingStatus) return;
      const status: StatusItem = { ...editingStatus, id: editingStatus.id || generateId(), timestamp: new Date().toISOString() };
      const existing = statuses.findIndex(s => s.id === status.id);
      let updated: StatusItem[];
      if (existing >= 0) { updated = [...statuses]; updated[existing] = status; }
      else { updated = [...statuses, status]; }
      setStatuses(updated);
      db.saveStatuses(updated);
      if (isConfigured()) {
        await saveStatus({ id: status.id, project_id: status.projectId, title: status.title, media_url: status.mediaUrl, timestamp: status.timestamp });
      }
      setShowStatusModal(false);
      setEditingStatus(null);
      handleSave();
      // Navigate back to main site to see the new status
      navigate('/');
    };


  const handleDeleteStatus = async (id: string) => {
    if (confirm('Delete this status?')) {
      const updated = statuses.filter(s => s.id !== id);
      setStatuses(updated);
      db.saveStatuses(updated);
      if (isConfigured()) { await deleteStatus(id); }
    }
  };

  // Profile handler
  const handleSaveProfile = async () => {
    db.saveProfile(profile);
    if (isConfigured()) {
      await saveProfileData({
        id: 'main',
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        headline: profile.headline || '',
        about: profile.about || '',
        linkedin_url: profile.linkedin_url || '',
      });
    }
    handleSave();
  };

  // Reset data
  const handleReset = () => {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
      db.clear();
      setProjects(staticProjects);
      setReviews(googleReviews);
      setProfile({ id: 'main', name: OWNER_NAME, email: OWNER_EMAIL, phone: OWNER_PHONE, location: OWNER_LOCATION });
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen />;
  }

  const tabs = [
    { id: 'projects', label: 'Projects', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'statuses', label: 'Statuses', icon: BarChart2 },
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
              </button>
            ))}
          </nav>
          
          <div className="space-y-2 mt-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400 text-center">
              {isDemo ? '⚡ Demo Mode' : '🔗 API Connected'}
            </div>
            <button
              onClick={handleReset}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" /> Reset Data
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

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Projects</h2>
                <button onClick={handleAddProject} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add Project
                </button>
              </div>
              <div className="space-y-2">
                {projects.map(project => (
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
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
                <button onClick={handleAddReview} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add Review
                </button>
              </div>
              <div className="space-y-2">
                {reviews.map(review => (
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
                ))}
              </div>
            </div>
          )}

          {/* Statuses Tab */}
          {activeTab === 'statuses' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Statuses</h2>
                <button onClick={() => { setEditingStatus({ id: '', projectId: '', title: '', mediaUrl: '', timestamp: new Date().toISOString() }); setShowStatusModal(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="h-4 w-4" /> Add Status
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {statuses.map(status => (
                  <div key={status.id} className="rounded-lg border border-border overflow-hidden">
                    <img src={status.mediaUrl || '/placeholder.jpg'} alt="" className="w-full h-32 object-cover bg-muted" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Status'; }} />
                    <div className="p-2 flex items-center justify-between">
                      <p className="text-sm text-foreground truncate">{status.title}</p>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingStatus({ ...status }); setShowStatusModal(true); }} className="p-1 hover:bg-muted rounded">
                          <Edit2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <button onClick={() => handleDeleteStatus(status.id)} className="p-1 hover:bg-destructive/10 rounded">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {statuses.length === 0 && (
                  <p className="col-span-3 text-muted-foreground text-center py-8">No statuses yet. Add your first status!</p>
                )}
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">AI Responses</h2>
              <p className="text-muted-foreground mb-4">AI responses are managed in code. Edit src/lib/ai-chatbot.ts to customize.</p>
              <a href="https://github.com" target="_blank" className="text-primary hover:underline">View AI Chatbot Code →</a>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Profile</h2>
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Headline / Title</label>
                  <input
                    type="text"
                    value={profile.headline || ''}
                    onChange={e => setProfile({ ...profile, headline: e.target.value })}
                    placeholder="Full-Stack Developer"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">About</label>
                  <textarea
                    value={profile.about || ''}
                    onChange={e => setProfile({ ...profile, about: e.target.value })}
                    placeholder="Tell visitors about yourself..."
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Phone</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={profile.linkedin_url || ''}
                    onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })}
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

      {/* Project Modal */}
      <Modal isOpen={showProjectModal} onClose={() => { setShowProjectModal(false); setEditingProject(null); }} title={editingProject?.id ? 'Edit Project' : 'Add Project'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Title *</label>
            <input
              type="text"
              value={editingProject?.title || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Avatar URL *</label>
            <input
              type="text"
              value={editingProject?.avatarUrl || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, avatarUrl: e.target.value } : null)}
              placeholder="/avatars/project.png"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Short Description</label>
            <input
              type="text"
              value={editingProject?.shortDescription || ''}
              onChange={e => setEditingProject(prev => prev ? { ...prev, shortDescription: e.target.value } : null)}
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
               value={editingProject?.lastMessage || ''}
               onChange={e => setEditingProject(prev => prev ? { ...prev, lastMessage: e.target.value } : null)}
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

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setEditingReview(null); }} title={editingReview?.id ? 'Edit Review' : 'Add Review'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Name *</label>
            <input
              type="text"
              value={editingReview?.authorName || ''}
              onChange={e => setEditingReview(prev => prev ? { ...prev, authorName: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
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
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground resize-none"
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

      {/* Status Modal */}
      <Modal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setEditingStatus(null); }} title={editingStatus?.id ? 'Edit Status' : 'Add Status'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Title *</label>
            <input
              type="text"
              value={editingStatus?.title || ''}
              onChange={e => setEditingStatus(prev => prev ? { ...prev, title: e.target.value } : null)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">Project</label>
            <select
              value={editingStatus?.projectId || ''}
              onChange={e => setEditingStatus(prev => prev ? { ...prev, projectId: e.target.value } : null)}
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
              value={editingStatus?.mediaUrl || ''}
              onChange={e => setEditingStatus(prev => prev ? { ...prev, mediaUrl: e.target.value } : null)}
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