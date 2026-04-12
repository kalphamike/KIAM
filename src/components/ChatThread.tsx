import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, ExternalLink, Send } from "lucide-react";
import type { Project, Message } from "@/data/seed";
import { getProjectMessages, OWNER_PHONE } from "@/data/seed";
import { format } from "date-fns";

interface ChatThreadProps {
  project: Project;
  visitorName: string;
  onBack: () => void;
  inboxMessages?: Message[];
  onSendInboxMessage?: (text: string) => void;
}

const ChatThread = ({ project, visitorName, onBack, inboxMessages, onSendInboxMessage }: ChatThreadProps) => {
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const isInbox = project.id === "inbox";
  const seedMessages = getProjectMessages(project.id, visitorName);
  const messages = isInbox ? (inboxMessages || []) : seedMessages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendInboxMessage?.(newMessage.trim());
    setNewMessage("");
  };

  return (
    <div className="flex h-full flex-col slide-in-right">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-primary px-3 py-3">
        <button onClick={onBack} aria-label="Back" className="text-primary-foreground md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img
          src={project.avatarUrl}
          alt={project.title}
          className="h-10 w-10 rounded-full object-cover"
          width={40}
          height={40}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-primary-foreground">{project.title}</h2>
          <p className="truncate text-xs text-primary-foreground/70">{project.shortDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${OWNER_PHONE.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Call or WhatsApp"
            className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
          >
            <Phone className="h-5 w-5" />
          </a>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open project link"
              className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-pattern flex-1 overflow-y-auto px-3 py-4">
        {/* Project link card for non-inbox, non-about */}
        {project.link && (
          <div className="mx-auto mb-4 max-w-sm rounded-lg bg-card p-4 shadow-sm">
            <p className="mb-2 text-sm font-medium text-foreground">{project.title}</p>
            <p className="mb-3 text-xs text-muted-foreground">{project.shortDescription}</p>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              View Project <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 ${
                msg.sender === "visitor" ? "bubble-out" : "bubble-in"
              }`}
            >
              <p className="text-sm text-foreground">{msg.text}</p>
              <p className="mt-1 text-right text-[10px] text-wa-timestamp">
                {format(new Date(msg.timestamp), "HH:mm")}
              </p>
            </div>
          </div>
        ))}

        {isInbox && messages.length === 0 && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Send a message to start the conversation, {visitorName}!
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Composer for inbox */}
      {isInbox && (
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-card px-3 py-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message from ${visitorName}...`}
            className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Type a message"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* About profile section */}
      {project.id === "about" && (
        <div className="border-t border-border bg-card px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "UI/UX", "Node.js", "Cloud", "Marketing"].map((skill) => (
              <span key={skill} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;
