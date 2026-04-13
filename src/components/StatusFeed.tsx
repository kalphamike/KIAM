import { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { statusItems as defaultStatus, projects } from "@/data/seed";

interface StatusItem {
  id: string;
  projectId: string;
  title: string;
  mediaUrl: string;
  timestamp: string;
}

interface StatusFeedProps {
  statuses?: StatusItem[];
}

const STATUS_DURATION = 5000;

const StatusFeed = ({ statuses = defaultStatus }: StatusFeedProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const closeStatus = useCallback(() => {
    setActiveIndex(null);
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const advance = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      const next = prev + 1;
      if (next >= statuses.length) {
        closeStatus();
        return null;
      }
      setProgress(0);
      return next;
    });
  }, [closeStatus]);

  useEffect(() => {
    if (activeIndex === null) return;
    if (prefersReducedMotion.current) return;

    const interval = 50;
    const steps = STATUS_DURATION / interval;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      if (step >= steps) advance();
    }, interval);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeIndex, advance]);

  const getProjectAvatar = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.avatarUrl || "";

  return (
    <>
      {/* Avatar row */}
      <div className="flex gap-3 overflow-x-auto px-4 py-3 scroll-dots-h">
        {statuses.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { setActiveIndex(i); setProgress(0); }}
            className="flex shrink-0 flex-col items-center gap-1"
            aria-label={`View ${item.title} status`}
          >
            <div className="status-ring rounded-full">
              <img
                src={getProjectAvatar(item.projectId)}
                alt={item.title}
                className="h-14 w-14 rounded-full object-cover"
                loading="lazy"
                width={56}
                height={56}
              />
            </div>
            <span className="max-w-[60px] truncate text-[10px] text-muted-foreground">
              {projects.find((p) => p.id === item.projectId)?.title}
            </span>
          </button>
        ))}
      </div>

      {/* Full-screen modal */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-foreground"
          role="dialog"
          aria-label="Status viewer"
          onClick={advance}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeStatus();
            if (e.key === "ArrowRight") advance();
            if (e.key === "ArrowLeft") setActiveIndex((p) => (p !== null && p > 0 ? p - 1 : p));
          }}
          tabIndex={0}
        >
          {/* Progress bars */}
          <div className="flex gap-1 px-3 pt-3">
            {statuses.map((_, i) => (
              <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-primary-foreground/30">
                <div
                  className="h-full rounded-full bg-primary-foreground transition-none"
                  style={{
                    width: i < activeIndex ? "100%" : i === activeIndex ? `${progress}%` : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={getProjectAvatar(statuses[activeIndex].projectId)}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
              width={32}
              height={32}
            />
            <span className="flex-1 text-sm font-medium text-primary-foreground">
              {statuses[activeIndex].title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); closeStatus(); }}
              aria-label="Close status"
              className="text-primary-foreground/80"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Image */}
          <div className="flex flex-1 items-center justify-center px-2">
            <img
              src={statuses[activeIndex].mediaUrl}
              alt={statuses[activeIndex].title}
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StatusFeed;
