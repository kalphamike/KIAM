import { projects, OWNER_PHONE } from "@/data/seed";
import { getLinkedInInfo } from "@/data/linkedin";

const linkedIn = getLinkedInInfo();

const ownerProfile = {
  name: linkedIn.name,
  title: linkedIn.headline,
  location: linkedIn.location,
  bio: linkedIn.about,
  mood: "Doing great! Thanks for asking. Just coding away in Kigali ☀️",
  
  social: {
    github: "https://github.com/ishimwealpha",
    linkedin: linkedIn.profileUrl,
    twitter: "https://twitter.com/ishimwealpha",
    instagram: "https://instagram.com/ishimwealpha",
    facebook: "https://facebook.com/ishimwealpha",
  },
  
  skills: linkedIn.skills.map((skill, index) => ({
    name: skill,
    level: 95 - (index * 3)
  })),
  
  experience: linkedIn.experience,
  education: linkedIn.education,
  
  services: [
    "Web Development",
    "Mobile App Development", 
    "UI/UX Design",
    "Technical Consulting",
    "Code Review",
    "Freelance Projects",
  ],
  
  contact: {
    whatsapp: `https://wa.me/${OWNER_PHONE.replace("+", "")}`,
    email: linkedIn.email,
  },
};

const projectDetails: Record<string, { description: string; features: string[]; techStack: string[]; result?: string }> = {
  kora: {
    description: "Personal coaching platform for growth and productivity",
    features: ["Personalized coaching sessions", "Progress tracking", "Goal setting", "Analytics dashboard", "Video calling"],
    techStack: ["React", "Node.js", "PostgreSQL", "WebRTC"],
    result: "Helped 500+ clients achieve goals",
  },
  umwashop: {
    description: "E-commerce platform for local artisans",
    features: ["Product catalog", "Payment integration", "Order management", "Vendor dashboard"],
    techStack: ["Next.js", "Stripe", "MongoDB"],
    result: "$50K revenue for artisans",
  },
  fintrack: {
    description: "Personal finance tracking app",
    features: ["Expense tracking", "Budget alerts", "Savings goals", "Visual reports"],
    techStack: ["React Native", "Firebase", "D3.js"],
    result: "20% avg savings increase",
  },
  healthcare: {
    description: "HIPAA-compliant patient management system",
    features: ["Patient records", "Appointment booking", "Billing", "Analytics"],
    techStack: ["Vue.js", "Python", "PostgreSQL"],
    result: "40% workload reduction",
  },
};

const naturalResponses: Record<string, string> = {
  "hi": `Hey there! 👋 How's it going?`,
  "hello": `Hi! 👋 Great to see you! What can I help you with?`,
  "hey": `Hey! 👋 What's up?`,
  "how are you": `${ownerProfile.mood}`,
  "how are you doing": `${ownerProfile.mood}`,
  "how r u": `${ownerProfile.mood}`,
  "wassup": `Not much! Just chilling here in the chat. You? 😄`,
  "what's up": `Hey! All good here. Working on some cool projects. What's on your mind?`,
  "good morning": `Good morning! ☀️ Hope you're having a great day!`,
  "good afternoon": `Good afternoon! 🌞 How's your day going?`,
  "good evening": `Good evening! 🌙 Ready to chat whenever you are.`,
  "good night": `Good night! 🌙 Sweet dreams! Don't hesitate to reach out anytime.`,
  "bye": `Bye for now! 👋 It was great chatting with you. Feel free to come back anytime!`,
  "goodbye": `Goodbye! 👋 Take care and hope to talk again soon!`,
  "see you": `See you! 👋 Come back anytime you want to chat!`,
  "thanks": `You're welcome! 😊 Happy to help!`,
  "thank you": `No problem! 😊 Anytime!`,
  "thx": `👍 Got you!`,
  "nice": `Glad you think so! 😄`,
  "cool": `😎 Right?`,
  "awesome": `Thanks! 🎉`,
  "amazing": `Aww thank you! 😊`,
  "wow": `I know right? 😄`,
  "ok": `👍 Sure thing!`,
  "okay": `👍 Got it!`,
  "yes": `👍 Great!`,
  "yeah": `👍 Awesome!`,
  "no": `No worries! 👍`,
  "maybe": `👍 Let me know if you decide!`,
  "sure": `👍 Sounds good!`,
  "lol": `😂 Glad I could make you laugh!`,
  "lmao": `😂 😂 Classic!`,
  "haha": `😄 Funny right?`,
  "haha yes": `😄 Love the energy!`,
  "okie": `👍 All good!`,
  "okkie": `👍 Gotcha!`,
  "alright": `👍 All right!`,
  "yep": `👍 Yup!`,
  "nope": `👍 Nope!`,
  "hbu": `I'm good! Just here helping out. You? 😊`,
  "how about you": `I'm doing great! Thanks for asking. 😊 What about you?`,
  "what are you doing": `Just hanging out in this chat, ready to help you with anything! 😄`,
  "are you real": `I'm an AI assistant for ${ownerProfile.name}'s portfolio, but I'm here to help with real questions! 😊`,
  "are you a bot": `Yep, I'm an AI! But I know a lot about ${ownerProfile.name}'s work. Ask me anything! 🤖`,
  "what is your name": `I'm the assistant for ${ownerProfile.name}'s portfolio! You can call me the Portfolio Bot 🤖`,
  "who created you": `I was built to help visitors learn about ${ownerProfile.name}'s work and skills!`,
};

function getNaturalResponse(question: string): string | null {
  const lower = question.toLowerCase().trim();
  
  if (naturalResponses[lower]) {
    return naturalResponses[lower];
  }
  
  for (const [key, value] of Object.entries(naturalResponses)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value;
    }
  }
  
  return null;
}

const faqResponses: Record<string, (question: string) => string> = {
  about: (q) => {
    if (q.includes("where") || q.includes("location") || q.includes("based")) {
      return `📍 I'm based in ${ownerProfile.location}. Beautiful country here in Rwanda!`;
    }
    if (q.includes("experience") || q.includes("years") || q.includes("time") || q.includes("work")) {
      return `💼 My Work Experience:\n\n${ownerProfile.experience.map(e => `• ${e.title} at ${e.company} (${e.duration})\n  ${e.description}`).join("\n\n")}`;
    }
    if (q.includes("education") || q.includes("school") || q.includes("degree") || q.includes("study")) {
      return `🎓 Education:\n\n${ownerProfile.education.map(e => `• ${e.degree} at ${e.school} (${e.year})`).join("\n")}`;
    }
    if (q.includes("linkedin")) {
      return `🔗 Check out my LinkedIn: ${linkedIn.profileUrl}`;
    }
    return `Hey! I'm ${ownerProfile.name} — ${ownerProfile.title}.\n\n${ownerProfile.bio}\n\nWhat about you?`;
  },
  
  skills: (q) => {
    return `🛠️ My Skills:\n\n${ownerProfile.skills.slice(0, 10).map(s => `• ${s.name}`).join("\n")}\n\nAnd more: Figma, PostgreSQL, MongoDB, Git, REST APIs!`;
  },
  
  services: (q) => {
    return `💼 What I Do:\n\n${ownerProfile.services.map(s => `• ${s}`).join("\n")}\n\nInterested in working together? Just ask!`;
  },
  
  contact: (q) => {
    return `📱 Let's Connect!\n\n• WhatsApp: ${ownerProfile.contact.whatsapp}\n• Email: ${ownerProfile.contact.email}\n\nOr just send a message here!`;
  },
  
  social: (q) => {
    return `🔗 Find Me Online:\n\n• LinkedIn: ${ownerProfile.social.linkedin}\n• GitHub: ${ownerProfile.social.github}\n• Twitter: ${ownerProfile.social.twitter}\n• Instagram: ${ownerProfile.social.instagram}`;
  },
  
  project: (q) => {
    const lower = q.toLowerCase();
    for (const [id, details] of Object.entries(projectDetails)) {
      if (lower.includes(id) || lower.includes(details.description.split(" ")[0].toLowerCase())) {
        return `📋 **${projects.find(p => p.id === id)?.title}**\n\n${details.description}\n\n✨ Features:\n${details.features.map(f => `• ${f}`).join("\n")}\n\n🛠️ ${details.techStack.join(", ")}${details.result ? `\n\n📈 ${details.result}` : ''}`;
      }
    }
    return `Some projects I've worked on:\n\n${Object.entries(projectDetails).map(([id, d]) => `• **${projects.find(p => p.id === id)?.title}**: ${d.description}`).join("\n\n")}\n\nWant details on any specific one?`;
  },
  
  hire: (q) => {
    return `✅ Yes, I'm open to projects!\n\nServices:\n${ownerProfile.services.map(s => `• ${s}`).join("\n")}\n\n📱 Contact:\n• WhatsApp: ${ownerProfile.contact.whatsapp}\n• Email: ${ownerProfile.contact.email}\n\nLet's build something cool! 🚀`;
  },
  
  pricing: (q) => {
    return `💰 Pricing depends on project scope. Let's discuss!\n\n📱 Chat with me:\n• WhatsApp: ${ownerProfile.contact.whatsapp}\n• Email: ${ownerProfile.contact.email}\n\nTell me about your project!`;
  },
  
  default: (q) => {
    return `I'm here to help! Ask me about:\n\n• Me & my background\n• My skills & tech stack\n• My projects\n• Services I offer\n• How to contact me\n• Social media links\n\nOr just chat! 😊`;
  },
};

function detectIntent(question: string): string {
  const lower = question.toLowerCase();
  
  if (lower.includes("who") || lower.includes("about") || lower.includes("yourself") || lower.includes("introduce")) return "about";
  if (lower.includes("skill") || lower.includes("tech") || lower.includes("know") || lower.includes("stack") || lower.includes("technology") || lower.includes("program")) return "skills";
  if (lower.includes("service") || lower.includes("offer") || lower.includes("do you do")) return "services";
  if (lower.includes("contact") || lower.includes("reach") || lower.includes("whatsapp") || lower.includes("email") || lower.includes("call") || lower.includes("phone")) return "contact";
  if (lower.includes("github") || lower.includes("linkedin") || lower.includes("twitter") || lower.includes("social") || lower.includes("instagram") || lower.includes("facebook")) return "social";
  if (lower.includes("project") || lower.includes("portfolio") || lower.includes("work") || lower.includes("built") || lower.includes("kora") || lower.includes("umwashop") || lower.includes("fintrack") || lower.includes("health")) return "project";
  if (lower.includes("hire") || lower.includes("available") || lower.includes("freelance") || lower.includes("job") || lower.includes("working") || lower.includes("book")) return "hire";
  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate") || lower.includes("fee") || lower.includes("budget")) return "pricing";
  
  return "default";
}

import type { Project } from "@/data/seed";
export function getAIResponse(projectId: string, question: string): string {
  const naturalResponse = getNaturalResponse(question);
  if (naturalResponse) {
    return naturalResponse;
  }
  
  // If specific project about/info request, return the project's AI field
  if (projectId !== "inbox") {
    const proj = projects.find((p: Project) => p.id === projectId);
    if (proj?.about) {
      const lower = question.toLowerCase();
      if (lower.includes("about") || lower.includes("description") || lower.includes("info")) {
        return proj.about;
      }
    }
  }
  if (projectId === "inbox") {
    const intent = detectIntent(question);
    const handler = faqResponses[intent] || faqResponses.default;
    return handler(question);
  }
  
  const details = projectDetails[projectId];
  if (!details) {
    return "Project not found. Check the Mike chat for general questions!";
  }
  
  const lower = question.toLowerCase();
  
  if (lower.includes("what") || lower.includes("describe") || lower.includes("about")) {
    return `📋 **${projects.find(p => p.id === projectId)?.title}**\n\n${details.description}\n\n✨ Features:\n${details.features.map(f => `• ${f}`).join("\n")}\n\n🛠️ ${details.techStack.join(", ")}${details.result ? `\n\n📈 ${details.result}` : ''}`;
  }
  
  if (lower.includes("feature")) {
    return `✨ **Features:**\n\n${details.features.map(f => `• ${f}`).join("\n")}`;
  }
  
  if (lower.includes("tech") || lower.includes("stack")) {
    return `🛠️ **Tech Stack:** ${details.techStack.join(", ")}`;
  }
  
  if (lower.includes("result") || lower.includes("outcome")) {
    return details.result ? `📈 **Results:** ${details.result}` : "No results data available yet.";
  }
  
  return `Ask me anything about this project! Or check the project link above.`;
}