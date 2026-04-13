import { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr" | "es";

interface Translations {
  welcomeTitle: string;
  welcomeSubtitle: string;
  enterName: string;
  startChatting: string;
  portfolio: string;
  search: string;
  chats: string;
  status: string;
  profile: string;
  selectProject: string;
  pickChat: string;
  viewProject: string;
  message: string;
  send: string;
  yourName: string;
  yourEmail: string;
  yourMessage: string;
  sendMessage: string;
  sending: string;
  messageSent: string;
  skills: string;
  whatClientsSay: string;
  recentUpdates: string;
  noProjects: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcomeTitle: "Hi — welcome to my portfolio",
    welcomeSubtitle: "Enter your name to continue.",
    enterName: "Your name",
    startChatting: "Start Chatting",
    portfolio: "Portfolio",
    search: "Search projects...",
    chats: "Chats",
    status: "Status",
    profile: "Profile",
    selectProject: "Select a project to view",
    pickChat: "Hey, pick a chat from the left!",
    viewProject: "View Project",
    message: "Message",
    send: "Send",
    yourName: "Your name",
    yourEmail: "Your email",
    yourMessage: "Your message",
    sendMessage: "Send Message",
    sending: "Sending...",
    messageSent: "Message sent!",
    skills: "Skills",
    whatClientsSay: "What Clients Say",
    recentUpdates: "Recent updates",
    noProjects: "No projects found",
  },
  fr: {
    welcomeTitle: "Bienvenue sur mon portfolio",
    welcomeSubtitle: "Entrez votre nom pour continuer.",
    enterName: "Votre nom",
    startChatting: "Commencer",
    portfolio: "Portfolio",
    search: "Rechercher...",
    chats: "Discussions",
    status: "Statut",
    profile: "Profil",
    selectProject: "Sélectionnez un projet",
    pickChat: "Salut,选择一个对话吧！",
    viewProject: "Voir le projet",
    message: "Message",
    send: "Envoyer",
    yourName: "Votre nom",
    yourEmail: "Votre email",
    yourMessage: "Votre message",
    sendMessage: "Envoyer",
    sending: "Envoi...",
    messageSent: "Message envoyé!",
    skills: "Compétences",
    whatClientsSay: "Ce que disent les clients",
    recentUpdates: "Dernières mises à jour",
    noProjects: "Aucun projet trouvé",
  },
  es: {
    welcomeTitle: "Bienvenido a mi portafolio",
    welcomeSubtitle: "Ingresa tu nombre para continuar.",
    enterName: "Tu nombre",
    startChatting: "Comenzar",
    portfolio: "Portafolio",
    search: "Buscar proyectos...",
    chats: "Chats",
    status: "Estado",
    profile: "Perfil",
    selectProject: "Selecciona un proyecto",
    pickChat: "Hola, selecciona un chat de la izquierda!",
    viewProject: "Ver proyecto",
    message: "Mensaje",
    send: "Enviar",
    yourName: "Tu nombre",
    yourEmail: "Tu email",
    yourMessage: "Tu mensaje",
    sendMessage: "Enviar mensaje",
    sending: "Enviando...",
    messageSent: "Mensaje enviado!",
    skills: "Habilidades",
    whatClientsSay: "Lo que dicen los clientes",
    recentUpdates: "Actualizaciones recientes",
    noProjects: "No se encontraron proyectos",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language;
      return stored || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};