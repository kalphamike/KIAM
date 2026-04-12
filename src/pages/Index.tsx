import { useState, useEffect, useCallback } from "react";
import { projects, type Message, OWNER_NAME } from "@/data/seed";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatListItem from "@/components/ChatListItem";
import ChatThread from "@/components/ChatThread";
import StatusFeed from "@/components/StatusFeed";
import BottomNav from "@/components/BottomNav";
import ProfileView from "@/components/ProfileView";
import { MessageCircle, Search } from "lucide-react";

type Tab = "chats" | "status" | "profile";

const Index = () => {
  const [visitorName, setVisitorName] = useState<string | null>(() =>
    sessionStorage.getItem("visitorName")
  );
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  const filteredProjects = searchQuery
    ? sortedProjects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedProjects;

  const selectedProject = projects.find((p) => p.id === activeProject);

  const renderChatList = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="bg-primary px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-foreground">
            {OWNER_NAME}'s Portfolio
          </h1>
          <MessageCircle className="h-5 w-5 text-primary-foreground/70" />
        </div>
        <div className="relative">
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
      </div>

      {/* Status row on chats tab */}
      {activeTab === "chats" && <StatusFeed />}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto bg-card">
        {filteredProjects.map((project) => (
          <ChatListItem
            key={project.id}
            project={project}
            isActive={activeProject === project.id}
            onClick={() => setActiveProject(project.id)}
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
            <div className="flex-1 overflow-y-auto bg-card">
              <StatusFeed />
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
            <div className="flex-1 overflow-y-auto bg-card">
              <ProfileView />
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
          <div className="flex h-full flex-col items-center justify-center bg-muted/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <MessageCircle className="h-8 w-8 text-secondary-foreground/50" />
            </div>
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Select a project to view
            </p>
            <p className="text-sm text-muted-foreground/70">
              Hey {visitorName}, pick a chat from the left!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
