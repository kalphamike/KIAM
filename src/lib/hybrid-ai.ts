import type { Project } from "@/data/seed";
import { OWNER_NAME, OWNER_PHONE } from "@/data/seed";

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  about: string;
  techStack: string[];
  link: string;
}

const JINA_READER_URL = "https://r.jina.ai/https://";

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(`${JINA_READER_URL}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Failed to fetch");
    const text = await response.text();
    return text.slice(0, 4000);
  } catch (error) {
    console.error("Failed to scrape website:", error);
    return "";
  }
}

function generateContextualResponse(question: string, projectInfo: ProjectInfo): string {
  const lower = question.toLowerCase();

  if (lower.includes("about") || lower.includes("what is") || lower.includes("description") || lower.includes("tell me")) {
    return projectInfo.about || projectInfo.description || "No detailed description available for this project.";
  }

  if (lower.includes("feature") || lower.includes("what can") || lower.includes("what does")) {
    if (projectInfo.about) {
      return `✨ **${projectInfo.title} Features:**\n\nThis project includes:\n${projectInfo.about.split('. ').slice(0, 5).map(s => `• ${s.trim()}`).join('\n')}`;
    }
    return "Check the project description above or visit the website for feature details.";
  }

  if (lower.includes("tech") || lower.includes("technology") || lower.includes("stack") || lower.includes("built with") || lower.includes("language")) {
    if (projectInfo.techStack && projectInfo.techStack.length > 0) {
      return `🛠️ **Tech Stack:**\n\n${projectInfo.techStack.map(t => `• ${t}`).join('\n')}`;
    }
    return "Tech stack information not available for this project.";
  }

  if (lower.includes("link") || lower.includes("website") || lower.includes("url") || lower.includes("live")) {
    if (projectInfo.link) {
      return `🔗 **Project Link:**\n\n${projectInfo.link}\n\nVisit the website to learn more!`;
    }
    return "No project link available.";
  }

  if (lower.includes("contact") || lower.includes("hire") || lower.includes("price") || lower.includes("cost") || lower.includes("available")) {
    return `📱 **Interested in similar work?**\n\nContact ${OWNER_NAME} directly:\n• WhatsApp: wa.me/${OWNER_PHONE.replace("+", "")}\n\nOr ask about this project in the chat!`;
  }

  return `I'd be happy to help! You can:\n\n• Visit the project: ${projectInfo.link || "Link not available"}\n• Ask specific questions about features or tech\n• Contact ${OWNER_NAME} for more details`;
}

export async function getHybridAIResponse(
  projectId: string,
  question: string,
  projects: Project[]
): Promise<{ response: string; source: "about" | "scrape" | "fallback" }> {
  const project = projects.find(p => p.id === projectId);

  if (projectId === "inbox") {
    return {
      response: `Hi! 👋 I'm here to help. You can ask me about:\n\n• ${OWNER_NAME}'s projects\n• Technology stack\n• How to contact\n\nOr check the projects above and click on any to learn more!`,
      source: "fallback"
    };
  }

  if (!project) {
    return {
      response: "Project not found. Try checking the projects list!",
      source: "fallback"
    };
  }

  const projectInfo: ProjectInfo = {
    id: project.id,
    title: project.title,
    description: project.shortDescription || "",
    about: project.about || "",
    techStack: project.techStack || [],
    link: project.link || "",
  };

  if (projectInfo.about && projectInfo.about.length > 20) {
    return {
      response: generateContextualResponse(question, projectInfo),
      source: "about"
    };
  }

  if (projectInfo.link && !projectInfo.link.includes("example.com")) {
    const scrapedContent = await scrapeWebsite(projectInfo.link);
    
    if (scrapedContent) {
      const combinedAbout = `${projectInfo.description}. ${scrapedContent}`;
      const enrichedProjectInfo = { ...projectInfo, about: combinedAbout };
      return {
        response: generateContextualResponse(question, enrichedProjectInfo),
        source: "scrape"
      };
    }
  }

  if (projectInfo.description) {
    return {
      response: `📋 **${projectInfo.title}**\n\n${projectInfo.description}\n\n${projectInfo.techStack.length > 0 ? `🛠️ Tech: ${projectInfo.techStack.join(", ")}` : ""}\n\n${projectInfo.link ? `🔗 ${projectInfo.link}` : ""}`,
      source: "fallback"
    };
  }

  return {
    response: `I'd love to tell you more about ${projectInfo.title}! Unfortunately, detailed information isn't available yet.\n\n• ${projectInfo.link ? `Check it out: ${projectInfo.link}` : "No link available"}\n• Or contact ${OWNER_NAME} directly!`,
    source: "fallback"
  };
}

export function getSimpleAIResponse(question: string): string {
  const lower = question.toLowerCase();

  const greetings = ["hi", "hello", "hey", "howdy", "sup"];
  if (greetings.some(g => lower.includes(g))) {
    return `Hey there! 👋 How can I help you today?\n\nAsk me about projects, technologies, or how to get in touch with ${OWNER_NAME}!`;
  }

  const thanks = ["thank", "thanks", "thx", "appreciate"];
  if (thanks.some(t => lower.includes(t))) {
    return "You're welcome! 😊 Happy to help. Feel free to ask more questions!";
  }

  if (lower.includes("who") || lower.includes("about you") || lower.includes("yourself")) {
    return `I'm an AI assistant for ${OWNER_NAME}'s portfolio! I can help you learn about projects and technologies. What would you like to know?`;
  }

  if (lower.includes("project")) {
    return `Great question! Check out the projects above - click on any project to learn more about it!\n\nOr visit the project links for full details.`;
  }

  return `I can help you learn about:\n\n• Projects & their features\n• Technologies used\n• How to get in touch\n\nWhat would you like to know? 😊`;
}
