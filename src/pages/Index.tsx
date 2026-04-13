import { useState, useEffect, useCallback } from "react";
import { projects as staticProjects, type Message } from "@/data/seed";
import profileAvatar from "@/assets/avatars/profile.png";
import { usePortfolio } from "@/hooks/usePortfolio";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatListItem from "@/components/ChatListItem";
import ChatThread from "@/components/ChatThread";
import StatusFeed from "@/components/StatusFeed";
import Timeline from "@/components/Timeline";
import BottomNav from "@/components/BottomNav";
import ProfileView from "@/components/ProfileView";
import { MessageCircle, Search } from "lucide-react";

type Tab = "chats" | "status" | "profile";

const Index = () => {
  const { projects, profile, reviews, statuses, loading: portfolioLoading, source, isApi, refresh } = usePortfolio();
  
  // Debug: Log when source changes
  useEffect(() => {
    console.log('[Index] Source:', source, 'Projects:', projects.length, 'API:', isApi);
  }, [source, projects, isApi]);

  const [visitorName, setVisitorName] = useState<string | null>(() =>
    sessionStorage.getItem("visitorName")
  );
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [inboxMessages, setInboxMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("inboxMessages");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [techFilter, setTechFilter] = useState<string | null>(null);
  const [aboutChatViewed, setAboutChatViewed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aboutChatViewed") === "true";
    }
    return false;
  });
  const [viewedChats, setViewedChats] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("viewedChats");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
    return new Set();
  });
  const [newReplies, setNewReplies] = useState<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem("inboxMessages", JSON.stringify(inboxMessages));
  }, [inboxMessages]);

  useEffect(() => {
    localStorage.setItem("aboutChatViewed", String(aboutChatViewed));
  }, [aboutChatViewed]);

  useEffect(() => {
    localStorage.setItem("viewedChats", JSON.stringify([...viewedChats]));
  }, [viewedChats]);

  useEffect(() => {
    const checkNewReplies = () => {
      const replies: Record<string, number> = {};
      projects.forEach(p => {
        const replyTime = localStorage.getItem(`new_reply_${p.id}`);
        if (replyTime) {
          const viewedTime = parseInt(localStorage.getItem(`viewed_${p.id}`) || "0");
          if (parseInt(replyTime) > viewedTime) {
            replies[p.id] = 1;
          }
        }
      });
      setNewReplies(replies);
    };
    
    checkNewReplies();
    const interval = setInterval(checkNewReplies, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectProject = (projectId: string) => {
    setActiveProject(projectId);
    if (projectId === "about") {
      setAboutChatViewed(true);
    }
    setViewedChats(prev => new Set([...prev, projectId]));
    localStorage.setItem(`viewed_${projectId}`, Date.now().toString());
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("visitorAnalytics");
      const analytics = stored ? JSON.parse(stored) : { visits: 0, lastVisit: null };
      analytics.visits += 1;
      analytics.lastVisit = new Date().toISOString();
      sessionStorage.setItem("visitorAnalytics", JSON.stringify(analytics));
    }
  }, []);

  const handleEnter = useCallback((name: string) => {
    sessionStorage.setItem("visitorName", name);
    setVisitorName(name);
  }, []);

  const handleSendInboxMessage = useCallback(
    (text: string) => {
      const msg: Message = {
        id: `inbox-${Date.now()}`,
        projectId: "inbox",
        sender: "visitor",
        text,
        timestamp: new Date().toISOString(),
      };
      setInboxMessages((prev) => [...prev, msg]);

      // Auto-reply from site
      setTimeout(() => {
        setInboxMessages((prev) => [
          ...prev,
          {
            id: `inbox-reply-${Date.now()}`,
            projectId: "inbox",
            sender: "site",
            text: `Thanks ${visitorName}! I'll get back to you soon. 🙏`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 1500);
    },
    [visitorName]
  );

  if (!visitorName) {
    return <WelcomeScreen onEnter={handleEnter} />;
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const aIsUnviewed = !viewedChats.has(a.id) && a.id !== "inbox";
    const bIsUnviewed = !viewedChats.has(b.id) && b.id !== "inbox";
    if (aIsUnviewed && !bIsUnviewed) return -1;
    if (!aIsUnviewed && bIsUnviewed) return 1;
    if (a.id === "about" && !aboutChatViewed) return -1;
    if (b.id === "about" && !aboutChatViewed) return 1;
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  const getUnreadCount = (projectId: string): number => {
    if (projectId === "about" && !aboutChatViewed) return 1;
    if (!viewedChats.has(projectId) && projectId !== "inbox") return 1;
    if (newReplies[projectId]) return 1;
    return 0;
  };

  const filteredProjects = sortedProjects.filter((p) => {
    const matchesSearch = searchQuery
      ? p.title.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesTech = techFilter
      ? p.techStack?.includes(techFilter)
      : true;
    return matchesSearch && matchesTech;
  });

  const techStacks = Array.from(
    new Set(projects.flatMap((p) => p.techStack || []))
  ).sort();

  const selectedProject = projects.find((p) => p.id === activeProject);

  const renderChatList = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-foreground">
            {profile.name}'s Portfolio
          </h1>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary-foreground/70" />
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            aria-label="Search projects"
            className="w-full rounded-lg bg-primary-foreground/15 py-2 pl-10 pr-4 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary-foreground/30"
          />
        </div>
        {techStacks.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-dots-h">
            <button
              onClick={() => setTechFilter(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                techFilter === null
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/15 text-primary-foreground/80 hover:bg-primary-foreground/25"
              }`}
            >
              All
            </button>
            {techStacks.map((tech) => (
              <button
                key={tech}
                onClick={() => setTechFilter(tech === techFilter ? null : tech)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  techFilter === tech
                    ? "bg-primary-foreground text-primary"
                    : "bg-primary-foreground/15 text-primary-foreground/80 hover:bg-primary-foreground/25"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status row on chats tab */}
      {activeTab === "chats" && <StatusFeed statuses={statuses} />}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-card scroll-dots">
        {filteredProjects.map((project) => (
          <ChatListItem
            key={project.id}
            project={project}
            isActive={activeProject === project.id}
            unread={getUnreadCount(project.id)}
            onClick={() => handleSelectProject(project.id)}
          />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "status":
        return (
          <div className="flex h-full flex-col">
            <div className="bg-primary px-4 py-4">
              <h1 className="text-xl font-bold text-primary-foreground">Status</h1>
            </div>
            <div className="flex-1 overflow-y-auto bg-card scroll-dots">
              <StatusFeed statuses={statuses} />
              <Timeline />
              <div className="px-4 py-6">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent updates
                </h3>
                {projects
                  .filter((p) => p.id !== "inbox" && p.id !== "about")
                  .map((p) => (
                    <div key={p.id} className="mb-3 flex items-center gap-3">
                      <img
                        src={p.avatarUrl}
                        alt={p.title}
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                        width={40}
                        height={40}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.lastMessage}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="flex h-full flex-col">
            <div className="bg-primary px-4 py-4">
              <h1 className="text-xl font-bold text-primary-foreground">Profile</h1>
            </div>
            <div className="flex-1 overflow-y-auto bg-card scroll-dots">
              <ProfileView 
              profile={profile} 
              reviews={reviews.map(r => ({ id: r.id, authorName: r.authorName, rating: r.rating, text: r.text }))}
              onSelectProject={(projectId) => {
                setActiveProject(projectId);
                setActiveTab("chats");
              }} />
            </div>
          </div>
        );
      default:
        return renderChatList();
    }
  };

  // Desktop two-column layout
  return (
    <div className="flex h-screen bg-muted">
      {/* Left panel - always visible on desktop, hidden when chat is open on mobile */}
      <div
        className={`flex h-full w-full flex-col border-r border-border md:w-[380px] md:shrink-0 ${
          activeProject ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
        <BottomNav active={activeTab} onChange={(t) => { setActiveTab(t); setActiveProject(null); }} />
      </div>

      {/* Right panel - chat thread */}
      <div
        className={`h-full flex-1 ${
          activeProject ? "flex flex-col" : "hidden md:flex md:flex-col"
        }`}
      >
        {selectedProject ? (
          <ChatThread
            project={selectedProject}
            visitorName={visitorName}
            onBack={() => setActiveProject(null)}
            inboxMessages={inboxMessages}
            onSendInboxMessage={handleSendInboxMessage}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-card custom-scroll overflow-y-auto">
            <div className="flex w-full max-w-md flex-col items-center p-8">
              <img
                src={profileAvatar}
                alt={`${profile.name}'s profile`}
                className="h-24 w-24 rounded-full object-cover shadow-lg"
                width={96}
                height={96}
              />
              <h2 className="mt-4 text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">Online</p>
              
              <div className="mt-6 w-full space-y-3 max-w-md">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm text-foreground">{profile.headline || "Available for projects"}</p>
                </div>
                
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{profile.phone}</p>
                </div>
                
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{profile.email}</p>
                </div>
                
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm text-foreground">{profile.location}</p>
                </div>
              </div>
               
              <p className="mt-6 text-sm text-muted-foreground">
                Hey {visitorName}, pick a chat from the left!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
