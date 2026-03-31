import { useSystemHierarchy } from "@/hooks/useUsers";
import { Loader2, User, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface HierarchyNode {
  id: string;
  name: string;
  email: string;
  employee_code: string;
  image_url?: string;
  is_active: boolean;
  department?: string;
  children?: HierarchyNode[];
}

interface RecursiveNodeProps {
  node: HierarchyNode;
  level: number;
}

const RecursiveNode = ({ node, level }: RecursiveNodeProps) => {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first few levels
  const hasChildren = node.children && node.children.length > 0;
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/50 transition-all group cursor-pointer ${level === 0 ? "border-primary/50 bg-primary/5" : ""}`}
        onClick={() => navigate(`/admin/users/${node.id}`)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-1 hover:bg-accent rounded-sm transition-colors text-muted-foreground shrink-0"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 shrink-0" />
          )}

          <Avatar className="h-9 w-9 border border-primary/20 shrink-0 shadow-sm">
            <AvatarImage src={node.image_url} alt={node.name} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
              {node.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold truncate text-foreground group-hover:text-primary transition-colors">
                {node.name}
              </p>
              {!node.is_active && (
                <span
                  className="w-2 h-2 rounded-full bg-destructive animate-pulse"
                  title="Inactive"
                />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate uppercase tracking-[0.1em]">
              {node.employee_code}{" "}
              {node.department ? `| ${node.department}` : ""}
            </p>
          </div>
        </div>

        <div className="hidden md:block text-right shrink-0 pr-2">
          <p className="text-[10px] text-muted-foreground/60">{node.email}</p>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="relative ml-4 pl-4 border-l border-border/30 space-y-2 py-1">
          {node.children!.map((child) => (
            <RecursiveNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const SystemHierarchyView = ({ is_active }: { is_active?: boolean }) => {
  const {
    data: hierarchy,
    isLoading,
    error,
  } = useSystemHierarchy({ is_active });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Establishing Communication Lines...
        </p>
      </div>
    );
  }

  if (error || !hierarchy || hierarchy.length === 0) {
    return (
      <div className="p-12 text-center bg-card rounded-lg border border-border/50">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium text-foreground">
          Hierarchy mapping unavailable
        </p>
        <p className="text-xs text-muted-foreground mt-1 text-balance">
          {error
            ? "There was an error retrieving the organizational data."
            : "No hierarchy data found with current filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hierarchy.map((root: HierarchyNode) => (
          <div key={root.id} className="space-y-4">
            <div className="flex items-center gap-2 px-2 py-1 border-b border-primary/20 w-fit mb-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-black bg-primary/5 text-primary border-primary/20 tracking-tighter"
              >
                Root Organization
              </Badge>
            </div>
            <RecursiveNode node={root} level={0} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHierarchyView;
