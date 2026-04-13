import { projects } from "@/data/seed";
import { format } from "date-fns";

const Timeline = () => {
  const sortedProjects = [...projects]
    .filter(p => p.id !== "inbox" && p.id !== "about")
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  return (
    <div className="px-4 py-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Project Timeline</h3>
      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
        <div className="space-y-6">
          {sortedProjects.map((project, index) => (
            <div key={project.id} className="relative flex gap-4">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <span className="text-xs font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-foreground">{project.title}</p>
                <p className="text-xs text-muted-foreground">{project.shortDescription}</p>
                <p className="mt-1 text-xs text-primary">{format(new Date(project.lastUpdated), "MMM d, yyyy")}</p>
                {project.techStack && project.techStack.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {project.techStack.map(tech => (
                      <span key={tech} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;