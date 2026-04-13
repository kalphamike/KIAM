import profileAvatar from "@/assets/avatars/profile.png";
import { Phone, Mail, MapPin, Briefcase, Globe, ArrowRight, Linkedin } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  headline?: string;
  about?: string;
  linkedinUrl?: string;
}

interface ProjectData {
  id: string;
  title: string;
  avatarUrl: string;
}

interface ReviewData {
  id: string;
  authorName: string;
  rating: number;
  text: string;
}

interface ProfileViewProps {
  profile?: ProfileData;
  reviews?: ReviewData[];
  projects?: ProjectData[];
  onSelectProject?: (projectId: string) => void;
}

const ProfileView = ({ profile, reviews = [], projects = [], onSelectProject }: ProfileViewProps) => {
  const name = profile?.name || "Your Name";
  const headline = profile?.headline || "Full-Stack Developer";
  const about = profile?.about || "";
  const phone = profile?.phone || "";
  const email = profile?.email || "";
  const location = profile?.location || "";
  const linkedinUrl = profile?.linkedinUrl || "";

  return (
    <div className="flex flex-col gap-4 px-2 py-6 -mx-2 fade-in">
      {/* WhatsApp-style Profile Header */}
      <div className="flex flex-col items-center rounded-xl bg-card p-6 shadow-sm">
        <div className="relative">
          <img
            src={profileAvatar}
            alt={`${name}'s profile`}
            className="h-32 w-32 rounded-full object-cover shadow-lg"
            width={128}
            height={128}
          />
          <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-card bg-green-500" />
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-foreground">{name}</h2>
        <p className="text-sm text-muted-foreground">{headline}</p>
        
        <div className="mt-4 flex gap-3">
          {phone && (
            <a
              href={`https://wa.me/${phone.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Phone className="h-4 w-4" />
              Message
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 rounded-full bg-muted px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#0077b5] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* About Section - WhatsApp style */}
      {about && (
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">About</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {about}
          </p>
        </div>
      )}

      {/* Media Section - Projects (scrollable) */}
      {projects.length > 0 && (
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Projects</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-dots-h">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject?.(project.id)}
                className="group relative shrink-0 w-28"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img
                    src={project.avatarUrl}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <p className="mt-1 text-xs text-center text-foreground truncate">{project.title}</p>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-lg transition-opacity">
                  <ArrowRight className="h-6 w-6 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-xl bg-card p-4 shadow-sm">
        <div className="space-y-4">
          {phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{phone}</p>
                <p className="text-xs text-muted-foreground">Mobile</p>
              </div>
            </div>
          )}
          
          {email && (
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{location}</p>
                <p className="text-xs text-muted-foreground">Location</p>
              </div>
            </div>
          )}
          
          {headline && (
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{headline}</p>
                <p className="text-xs text-muted-foreground">Professional Title</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews - from Supabase */}
      {reviews.length > 0 && (
        <div className="rounded-xl bg-card p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-foreground">Client Reviews</h3>
          <div className="space-y-3">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{review.authorName}</p>
                  <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
