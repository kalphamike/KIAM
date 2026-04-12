import profileAvatar from "@/assets/avatars/profile.png";
import { OWNER_PHONE, OWNER_NAME } from "@/data/seed";
import { Phone, Mail, Code2, Palette, Globe } from "lucide-react";

const ProfileView = () => (
  <div className="flex flex-col items-center px-6 py-8 fade-in">
    <img
      src={profileAvatar}
      alt={`${OWNER_NAME}'s profile`}
      className="mb-4 h-28 w-28 rounded-full object-cover shadow-lg"
      width={112}
      height={112}
    />
    <h2 className="text-2xl font-bold text-foreground">{OWNER_NAME}</h2>
    <p className="mb-6 text-sm text-muted-foreground">Developer · Designer · Creator</p>

    <div className="mb-6 max-w-sm text-center text-sm leading-relaxed text-foreground/80">
      I build beautiful, user-friendly web applications and digital products.
      Passionate about clean code, great UX, and solving real problems.
    </div>

    <div className="mb-8 flex flex-wrap justify-center gap-2">
      {[
        { icon: <Code2 className="h-3.5 w-3.5" />, label: "React & TypeScript" },
        { icon: <Palette className="h-3.5 w-3.5" />, label: "UI/UX Design" },
        { icon: <Globe className="h-3.5 w-3.5" />, label: "Cloud Architecture" },
      ].map((s) => (
        <span key={s.label} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
          {s.icon} {s.label}
        </span>
      ))}
    </div>

    <div className="flex gap-3">
      <a
        href={`https://wa.me/${OWNER_PHONE.replace("+", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Phone className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href="mailto:hello@example.com"
        className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90"
      >
        <Mail className="h-4 w-4" /> Email
      </a>
    </div>
  </div>
);

export default ProfileView;
