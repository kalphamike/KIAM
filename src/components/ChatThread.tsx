import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, ExternalLink, Send, Video, X, Calendar, Clock, Loader2 } from "lucide-react";
import type { Project, Message } from "@/data/seed";
import { OWNER_PHONE, OWNER_NAME } from "@/data/seed";
import { format, isAfter, subHours } from "date-fns";
import { useMessages, useCreateMessage, useDeleteOldMessages } from "@/hooks/useCMS";

interface ChatThreadProps {
  project: Project;
  visitorName: string;
  onBack: () => void;
  inboxMessages?: Message[];
  onSendInboxMessage?: (text: string) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "visitor" | "admin";
  timestamp: string;
  isReply?: boolean;
}

const ChatThread = ({ project, visitorName, onBack, inboxMessages }: ChatThreadProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const isInbox = project.id === "inbox";
  const isAbout = project.id === "about";
  
  const { data: dbMessages = [], isLoading: messagesLoading, refetch: refetchMessages } = useMessages();
  const createMessage = useCreateMessage();
  const deleteOldMessages = useDeleteOldMessages(24);

  useEffect(() => {
    deleteOldMessages.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myMessages = dbMessages
    .filter(m => m.visitor_name.toLowerCase() === visitorName.toLowerCase())
    .filter(m => {
      const msgDate = new Date(m.created_at);
      const cutoff = subHours(new Date(), 24);
      return isAfter(msgDate, cutoff);
    });
  
  const chatMessages: ChatMessage[] = myMessages.flatMap(m => {
    const messages: ChatMessage[] = [
      {
        id: m.id,
        text: m.message,
        sender: 'visitor' as const,
        timestamp: m.created_at,
      }
    ];
    if (m.admin_reply) {
      messages.push({
        id: `${m.id}-reply`,
        text: m.admin_reply,
        sender: 'admin' as const,
        timestamp: m.created_at,
        isReply: true,
      });
    }
    return messages;
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (isInbox) {
      const interval = setInterval(() => {
        refetchMessages();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [isInbox, refetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isInbox) return;
    
    try {
      await createMessage.mutateAsync({
        visitor_name: visitorName,
        visitor_email: '',
        visitor_phone: '',
        message: newMessage.trim(),
        status: 'new',
        admin_reply: null,
      });
      setNewMessage("");
      refetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleScheduleCall = () => {
    if (scheduledDate && scheduledTime) {
      const requestMsg = `📹 VIDEO CALL REQUEST\n\nDate: ${scheduledDate}\nTime: ${scheduledTime}\n\nFrom: ${visitorName}`;
      const whatsappUrl = `https://wa.me/${OWNER_PHONE.replace("+", "")}?text=${encodeURIComponent(requestMsg)}`;
      window.open(whatsappUrl, '_blank');
      setShowVideoModal(false);
      setScheduledDate("");
      setScheduledTime("");
    }
  };

  return (
    <div className="flex h-full flex-col slide-in-right">
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
        </div>
        <div className="flex items-center gap-2">
          {isInbox && (
            <button
              onClick={() => setShowVideoModal(true)}
              aria-label="Schedule Video Call"
              className="rounded-full p-2 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10"
            >
              <Video className="h-5 w-5" />
            </button>
          )}
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

      <div className="chat-pattern flex-1 overflow-y-auto px-3 py-4 scroll-dots">
        {project.link && !isInbox && !isAbout && (
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

        {isInbox && chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Hey {visitorName}! 👋 Start a conversation with {OWNER_NAME}. Send a message below!
            </p>
          </div>
        )}

        {isInbox && messagesLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 message-pop ${
                msg.sender === "visitor" ? "bubble-out" : "bubble-in"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm text-foreground">{msg.text}</p>
              <div className="mt-1 flex items-center justify-end gap-1">
                <p className="text-[10px] text-wa-timestamp">
                  {format(new Date(msg.timestamp), "HH:mm")}
                </p>
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-card px-3 py-2">
        {isInbox ? (
          <>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${OWNER_NAME}...`}
              className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Type a message"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || createMessage.isPending}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </>
        ) : (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Ask about this project... e.g., "What features does ${project.title} have?"`}
              className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="Type a message"
            />
            <a
              href={`https://wa.me/${OWNER_PHONE.replace("+", "")}?text=${encodeURIComponent(newMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </a>
          </>
        )}
      </form>

      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Schedule a Call</h3>
              <button onClick={() => setShowVideoModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Select Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Select Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <button
                onClick={handleScheduleCall}
                disabled={!scheduledDate || !scheduledTime}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Request Call via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;
