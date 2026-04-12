import koraAvatar from "@/assets/avatars/kora.png";
import umwashopAvatar from "@/assets/avatars/umwashop.png";
import portfolioAvatar from "@/assets/avatars/portfolio.png";
import profileAvatar from "@/assets/avatars/profile.png";
import inboxAvatar from "@/assets/avatars/inbox.png";
import koraStatus from "@/assets/status/kora-case.jpg";
import umwashopStatus from "@/assets/status/umwashop-collection.jpg";
import portfolioStatus from "@/assets/status/portfolio-update.jpg";

export interface Project {
  id: string;
  title: string;
  avatarUrl: string;
  shortDescription: string;
  link: string;
  lastMessage: string;
  lastUpdated: string;
  unread?: number;
}

export interface Message {
  id: string;
  projectId: string | null;
  sender: "visitor" | "site";
  text: string;
  timestamp: string;
}

export interface StatusItem {
  id: string;
  projectId: string;
  title: string;
  mediaUrl: string;
  timestamp: string;
}

export const OWNER_PHONE = "+250780000000"; // Replace with actual number
export const OWNER_NAME = "Mike";

export const projects: Project[] = [
  {
    id: "kora",
    title: "KORA coaching",
    avatarUrl: koraAvatar,
    shortDescription: "Personal coaching platform for growth and productivity",
    link: "https://example.com/kora",
    lastMessage: "Case study published",
    lastUpdated: "2026-03-10T09:30:00Z",
    unread: 2,
  },
  {
    id: "umwashop",
    title: "UMWAShop",
    avatarUrl: umwashopAvatar,
    shortDescription: "Ecommerce demo for local artisans",
    link: "https://example.com/umwashop",
    lastMessage: "New product collection",
    lastUpdated: "2026-02-18T14:20:00Z",
    unread: 1,
  },
  {
    id: "portfolio",
    title: "Portfolio Overview",
    avatarUrl: portfolioAvatar,
    shortDescription: "Collection of recent projects and case studies",
    link: "https://example.com/portfolio",
    lastMessage: "Updated About section",
    lastUpdated: "2026-04-01T08:00:00Z",
    unread: 0,
  },
  {
    id: "about",
    title: "About Me",
    avatarUrl: profileAvatar,
    shortDescription: "Learn more about who I am",
    link: "",
    lastMessage: "Tap to view my profile",
    lastUpdated: "2026-04-10T10:00:00Z",
    unread: 0,
  },
  {
    id: "inbox",
    title: "Inbox",
    avatarUrl: inboxAvatar,
    shortDescription: "Send me a message",
    link: "",
    lastMessage: "Start a conversation…",
    lastUpdated: "2026-04-12T15:45:00Z",
    unread: 0,
  },
];

export const getProjectMessages = (projectId: string, visitorName: string): Message[] => {
  const base: Record<string, Message[]> = {
    kora: [
      { id: "m-kora-1", projectId: "kora", sender: "site", text: `Hi ${visitorName}, here's the project — tap the link to view.`, timestamp: "2026-03-10T09:31:00Z" },
      { id: "m-kora-2", projectId: "kora", sender: "site", text: "KORA is a personal coaching platform designed to help individuals achieve growth and productivity goals.", timestamp: "2026-03-10T09:32:00Z" },
      { id: "m-kora-3", projectId: "kora", sender: "site", text: "Case study published ✅", timestamp: "2026-03-10T09:33:00Z" },
    ],
    umwashop: [
      { id: "m-umwa-1", projectId: "umwashop", sender: "site", text: `Hi ${visitorName}, here's the project — tap the link to view.`, timestamp: "2026-02-18T14:21:00Z" },
      { id: "m-umwa-2", projectId: "umwashop", sender: "site", text: "UMWAShop connects local artisans with customers through a beautiful ecommerce experience.", timestamp: "2026-02-18T14:22:00Z" },
      { id: "m-umwa-3", projectId: "umwashop", sender: "site", text: "New product collection just dropped! 🎨", timestamp: "2026-02-18T14:23:00Z" },
    ],
    portfolio: [
      { id: "m-port-1", projectId: "portfolio", sender: "site", text: `Hi ${visitorName}, here's the project — tap the link to view.`, timestamp: "2026-04-01T08:01:00Z" },
      { id: "m-port-2", projectId: "portfolio", sender: "site", text: "This is a collection of all my recent projects and case studies.", timestamp: "2026-04-01T08:02:00Z" },
    ],
    about: [
      { id: "m-about-1", projectId: "about", sender: "site", text: `Hey ${visitorName}! 👋 I'm Mike — a developer, designer, and digital creator.`, timestamp: "2026-04-10T10:01:00Z" },
      { id: "m-about-2", projectId: "about", sender: "site", text: "I specialize in building beautiful, user-friendly web applications and digital products.", timestamp: "2026-04-10T10:02:00Z" },
      { id: "m-about-3", projectId: "about", sender: "site", text: "Skills: React, TypeScript, UI/UX Design, Node.js, Cloud Architecture, Digital Marketing", timestamp: "2026-04-10T10:03:00Z" },
    ],
  };
  return base[projectId] || [];
};

export const statusItems: StatusItem[] = [
  {
    id: "s1",
    projectId: "kora",
    title: "KORA coaching case study",
    mediaUrl: koraStatus,
    timestamp: "2026-03-10T09:30:00Z",
  },
  {
    id: "s2",
    projectId: "umwashop",
    title: "UMWAShop new collection",
    mediaUrl: umwashopStatus,
    timestamp: "2026-02-18T14:20:00Z",
  },
  {
    id: "s3",
    projectId: "portfolio",
    title: "Portfolio refresh",
    mediaUrl: portfolioStatus,
    timestamp: "2026-04-01T08:00:00Z",
  },
];
