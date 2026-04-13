import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Phone, ExternalLink, Send, CheckCheck, Sparkles, Video, X, Calendar, Clock } from "lucide-react";
import type { Project, Message } from "@/data/seed";
import { getProjectMessages, OWNER_PHONE, OWNER_NAME } from "@/data/seed";
import { format } from "date-fns";
import ContactForm from "./ContactForm";
import { getAIResponse } from "@/lib/ai-chatbot";

interface ChatThreadProps {
  project: Project;
  visitorName: string;
  onBack: () => void;
  inboxMessages?: Message[];
  onSendInboxMessage?: (text: string) => void;
}

interface AIMessage {
  id: string;
  text: string;
  sender: "visitor" | "site";
}

const loadAIMessages = (projectId: string): AIMessage[] => {
  if (typeof window === "undefined") return [];
  const key = `ai_messages_${projectId}`;
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  return parsed.map((m: { id: string; text: string; sender: string }) => ({
    id: m.id,
    text: m.text,
    sender: m.sender as "visitor" | "site"
  }));
};

const saveAIMessages = (projectId: string, messages: AIMessage[]) => {
  if (typeof window === "undefined") return;
  const key = `ai_messages_${projectId}`;
  localStorage.setItem(key, JSON.stringify(messages));
};

const ChatThread = ({ project, visitorName, onBack, inboxMessages, onSendInboxMessage }: ChatThreadProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [aiMessages, setAIMessages] = useState<AIMessage[]>(() => loadAIMessages(project.id));
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const isInbox = project.id === "inbox";
  const isAbout = project.id === "about";
  const seedMessages = useMemo(() => getProjectMessages(project.id, visitorName), [project.id, visitorName]);
  const messages = isInbox ? (inboxMessages || []) : seedMessages;

  useEffect(() => {
    const restored = loadAIMessages(project.id);
    setAIMessages(restored);
  }, [project.id]);

  useEffect(() => {
    saveAIMessages(project.id, aiMessages);
  }, [project.id, aiMessages]);

  useEffect(() => {
    if (isAbout && seedMessages.length > 0) {
      const viewedKey = `about_viewed_${project.id}`;
      const hasViewed = typeof window !== "undefined" && localStorage.getItem(viewedKey) === "true";
      
      if (!hasViewed) {
        setVisibleMessages([]);
        setIsTyping(true);
        let delay = 500;
        seedMessages.forEach((msg) => {
          setTimeout(() => {
            setVisibleMessages(prev => {
              if (!prev.includes(msg.id)) {
                return [...prev, msg.id];
              }
              return prev;
            });
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 600);
          }, delay);
          delay += 1000;
        });
        localStorage.setItem(viewedKey, "true");
      } else {
        setVisibleMessages(seedMessages.map(m => m.id));
      }
    }
  }, [isAbout, project.id, seedMessages]);

  const aboutMessages = isAbout ? seedMessages.filter(m => visibleMessages.includes(m.id)) : messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, aiMessages.length, visibleMessages.length]);

  useEffect(() => {
    if (isInbox && messages.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, isInbox]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const userMsg: AIMessage = { id: `ai-${Date.now()}`, text: newMessage.trim(), sender: "visitor" };
    const newMessages = [...aiMessages, userMsg];
    setAIMessages(newMessages);
    saveAIMessages(project.id, newMessages);
    setNewMessage("");
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getAIResponse(project.id, userMsg.text);
      const replyMsg: AIMessage = { id: `ai-reply-${Date.now()}`, text: response, sender: "site" };
      const updatedMessages = [...newMessages, replyMsg];
      setAIMessages(updatedMessages);
      saveAIMessages(project.id, updatedMessages);
      setIsTyping(false);
    }, 3000);
  };

  const handleScheduleCall = () => {
    if (scheduledDate && scheduledTime) {
      const requestMsg = `📹 VIDEO CALL REQUEST\n\nDate: ${scheduledDate}\nTime: ${scheduledTime}\n\nFrom: ${visitorName}`;
      const whatsappUrl = `https://wa.me/${OWNER_PHONE.replace("+", "")}?text=${encodeURIComponent(requestMsg)}`;
      window.open(whatsappUrl, '_blank');
      
      const userMsg: AIMessage = { id: `ai-${Date.now()}`, text: requestMsg, sender: "visitor" };
      const newMessages = [...aiMessages, userMsg];
      setAIMessages(newMessages);
      saveAIMessages(project.id, newMessages);
      setIsTyping(true);
      setTimeout(() => {
        const replyMsg: AIMessage = { 
          id: `ai-reply-${Date.now()}`, 
          text: `Thanks! Your request for ${scheduledDate} at ${scheduledTime} has been sent. I'll confirm shortly! 🎥`, 
          sender: "site" 
        };
        const updatedMessages = [...newMessages, replyMsg];
        setAIMessages(updatedMessages);
        saveAIMessages(project.id, updatedMessages);
        setIsTyping(false);
        setShowVideoModal(false);
        setScheduledDate("");
        setScheduledTime("");
      }, 2000);
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

        {aboutMessages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 message-pop ${
                msg.sender === "visitor" ? "bubble-out" : "bubble-in"
              }`}
            >
              <p className="text-sm text-foreground">{msg.text}</p>
              <div className="mt-1 flex items-center justify-end gap-1">
                <p className="text-[10px] text-wa-timestamp">
                  {format(new Date(msg.timestamp), "HH:mm")}
                </p>
                {msg.sender === "site" && (
                  <CheckCheck className="h-3 w-3 text-primary" />
                )}
              </div>
            </div>
          </div>
        ))}

        {aiMessages.map((msg) => (
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
              {msg.sender === "site" && (
                <div className="mt-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] text-muted-foreground">AI</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mb-3 flex justify-start">
            <div className="bubble-in flex items-center gap-1 px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {isInbox && messages.length === 0 && aiMessages.length === 0 && !showContactForm && !showVideoModal && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Hey {visitorName}! 👋 Ask me anything about {OWNER_NAME}'s work, skills, or how to connect!
            </p>
          </div>
        )}

        {(isInbox || aiMessages.length > 0) && !showContactForm && !showVideoModal && (
          <div className="mb-3 flex flex-wrap gap-2 bounce-in">
<button
                onClick={() => setShowVideoModal(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                📹 Request direct contact
              </button>
            <button
              onClick={() => {
                const msg = "Hi! I'm interested in your services. Can you tell me more?";
                setNewMessage(msg);
              }}
              className="suggested-prompt"
            >
              💬 Get info
            </button>
            <button
              onClick={() => setShowContactForm(true)}
              className="suggested-prompt"
            >
              ✉️ Send message
            </button>
          </div>
        )}

        {showContactForm && (
          <div className="mx-auto mb-4 max-w-sm">
            <ContactForm onClose={() => setShowContactForm(false)} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border bg-card px-3 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isInbox ? `Ask about ${OWNER_NAME}... e.g., "What services do you offer?"` : `Ask about this project... e.g., "What features does ${project.title} have?"`}
          className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Type a message"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Request Direct Contact</h3>
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
                Request Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatThread;