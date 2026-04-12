import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/data/seed";

interface ChatListItemProps {
  project: Project;
  onClick: () => void;
  isActive?: boolean;
}

const ChatListItem = ({ project, onClick, isActive }: ChatListItemProps) => {
  const timeAgo = formatDistanceToNow(new Date(project.lastUpdated), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      aria-label={`Open ${project.title}`}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
        isActive ? "bg-muted" : ""
      }`}
    >
      <img
        src={project.avatarUrl}
        alt={project.title}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
        loading="lazy"
        width={48}
        height={48}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-semibold text-foreground">{project.title}</h3>
          <span className="shrink-0 text-xs text-wa-timestamp">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-sm text-muted-foreground">{project.lastMessage}</p>
          {project.unread && project.unread > 0 ? (
            <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-wa-unread text-[10px] font-bold text-primary-foreground">
              {project.unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export default ChatListItem;
