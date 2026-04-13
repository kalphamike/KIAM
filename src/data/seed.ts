import koraAvatar from "@/assets/avatars/kora.png";
import umwashopAvatar from "@/assets/avatars/umwashop.png";
import portfolioAvatar from "@/assets/avatars/portfolio.png";
import inboxAvatar from "@/assets/avatars/inbox.png";
import koraStatus from "@/assets/status/kora-case.jpg";
import umwashopStatus from "@/assets/status/umwashop-collection.jpg";
import portfolioStatus from "@/assets/status/portfolio-update.jpg";

const PROFILE_AVATAR = "https://raw.githubusercontent.com/kalphamike/KIAM/refs/heads/main/src/assets/avatars/me.jpeg";

export interface Project {
  aiInfo?: string;
  suggestions?: string[]; /* Additional field for AI */
  about?: string;
  id: string;
  title: string;
  avatarUrl: string;
  shortDescription: string;
  link: string;
  lastMessage: string;
  lastUpdated: string;
  unread?: number;
  techStack?: string[];
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

export const OWNER_PHONE = "+250781975565";
export const OWNER_NAME = "Alpha Michelange";
export const OWNER_EMAIL = "ishimwealpha@gmail.com";
export const OWNER_LOCATION = "Kigali, Rwanda";

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
    techStack: ["React", "Node.js", "PostgreSQL"],
    suggestions: ["What are the main features of KORA?", "How does KORA help improve productivity?"],
    about: "KORA is a personal coaching platform that helps individuals set goals, track progress, and receive personalized coaching sessions.",
    aiInfo: "KORA is a personal coaching platform for growth and productivity. Features: Personalized coaching sessions, progress tracking, goal setting, analytics dashboard, video calling. Tech stack: React, Node.js, PostgreSQL.",
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
    techStack: ["Next.js", "Stripe", "MongoDB"],
    suggestions: ["What products are available in UMWAShop?", "How does payment integration work in UMWAShop?"],
    about: "UMWAShop is an e‑commerce platform that showcases local artisans' products, offering a seamless shopping experience with integrated payments and vendor dashboards.",
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
    techStack: ["React", "TypeScript", "Tailwind"],
    suggestions: ["What projects are showcased in the portfolio?", "How can I view the case studies?"] ,
    about: "The Portfolio Overview compiles recent projects and case studies into a single showcase, highlighting achievements, technologies used, and outcomes.",
  },
  {
    id: "about",
    title: "Chat Guidance",
    avatarUrl: PROFILE_AVATAR,
    shortDescription: "Learn more about who I am",
    link: "",
    lastMessage: "Tap to view my profile",
    lastUpdated: "2026-04-10T10:00:00Z",
    unread: 0,
    techStack: [],
  },
  {
    id: "inbox",
    title: "Mike(Michelange)",
    avatarUrl: PROFILE_AVATAR,
    shortDescription: "Send me a message",
    link: "",
    lastMessage: "Let's chat!",
    lastUpdated: "2026-04-12T15:45:00Z",
    unread: 0,
    techStack: [],
  },
  {
    id: "fintrack",
    title: "FinTrack App",
    avatarUrl: umwashopAvatar,
    shortDescription: "Personal finance tracking with visual dashboards",
    link: "https://example.com/fintrack",
    lastMessage: "New dashboard released",
    lastUpdated: "2026-04-15T12:00:00Z",
    unread: 0,
    techStack: ["React Native", "Firebase", "D3.js"],
    suggestions: ["How can I track my expenses using FinTrack?", "What budgeting alerts does FinTrack provide?"],
    about: "FinTrack helps users track personal finances with visual dashboards, budgeting alerts, and savings goals to improve financial health.",
  },
  {
    id: "healthcare",
    title: "HealthCare Portal",
    avatarUrl: koraAvatar,
    shortDescription: "Patient management system for clinics",
    link: "https://example.com/healthcare",
    lastMessage: "HIPAA compliance completed",
    lastUpdated: "2026-04-08T09:00:00Z",
    unread: 0,
    techStack: ["Vue.js", "Python", "PostgreSQL"],
    about: "HealthCare Portal is a HIPAA‑compliant patient management system that streamlines records, appointments, billing, and analytics for clinics.",
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
      { id: "m-about-1", projectId: "about", sender: "site", text: `Hey ${visitorName}! 👋 Welcome to my portfolio!`, timestamp: "2026-04-10T10:01:00Z" },
      { id: "m-about-2", projectId: "about", sender: "site", text: "Let me show you around! This site is designed like a chat — pretty cool, right?", timestamp: "2026-04-10T10:02:00Z" },
      { id: "m-about-3", projectId: "about", sender: "site", text: "📱 On mobile, use the bottom tabs to switch between Chats, Status, and Profile.", timestamp: "2026-04-10T10:03:00Z" },
      { id: "m-about-4", projectId: "about", sender: "site", text: "💬 Chats tab — Browse my projects! Click any project to see details.", timestamp: "2026-04-10T10:04:00Z" },
      { id: "m-about-5", projectId: "about", sender: "site", text: "📸 Status tab — Check out my project updates and timeline!", timestamp: "2026-04-10T10:05:00Z" },
      { id: "m-about-6", projectId: "about", sender: "site", text: "👤 Profile tab — See my skills, experience, and what clients say about me.", timestamp: "2026-04-10T10:06:00Z" },
      { id: "m-about-7", projectId: "about", sender: "site", text: "💡 Pro tip: Click the chat icon in any project to ask the AI questions about that project!", timestamp: "2026-04-10T10:07:00Z" },
      { id: "m-about-8", projectId: "about", sender: "site", text: "🎯 Want to connect? Click on 'Mike' (the last chat) to send me a message!", timestamp: "2026-04-10T10:08:00Z" },
      { id: "m-about-9", projectId: "about", sender: "site", text: "Explore my projects and feel free to reach out. Happy to chat! 😊", timestamp: "2026-04-10T10:09:00Z" },
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
