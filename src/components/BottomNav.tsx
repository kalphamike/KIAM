import { MessageCircle, Circle, User } from "lucide-react";

type Tab = "chats" | "status" | "profile";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const BottomNav = ({ active, onChange }: BottomNavProps) => {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "chats", label: "Chats", icon: <MessageCircle className="h-5 w-5" /> },
    { id: "status", label: "Status", icon: <Circle className="h-5 w-5" /> },
    { id: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <nav className="flex border-t border-border bg-card" role="tablist" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
            active === tab.id
              ? "text-primary font-semibold"
              : "text-muted-foreground"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
