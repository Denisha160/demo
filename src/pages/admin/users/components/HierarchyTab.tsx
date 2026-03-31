import { useUserHierarchy } from "@/hooks/useUsers";
import { Loader2, User, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
}

const TreeNode = ({ node, level }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-all group ${level === 0 ? "border-primary/50 bg-primary/5" : ""}`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-accent rounded-sm transition-colors text-muted-foreground mr-1"
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-1" />
          )}

          <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
            <AvatarImage src={node.image_url} alt={node.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {node.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                {node.name}
              </p>
              <Badge
                variant={node.is_active ? "default" : "secondary"}
                className="text-[9px] h-4 px-1 uppercase tracking-tighter"
              >
                {node.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate uppercase tracking-widest font-medium">
              {node.employee_code} • {node.department || "No Department"}
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right shrink-0">
          <p className="text-[10px] text-muted-foreground truncate">
            {node.email}
          </p>
          {level === 0 && (
            <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
              Primary User
            </span>
          )}
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-2 relative ml-5 border-l border-border/50 pl-2">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={0} /> // Reset level for relative margin, or use actual level
          ))}
        </div>
      )}
    </div>
  );
};

// Adjusted TreeNode to handle absolute level for visualization
const RecursiveNode = ({ node, level }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/50 transition-all group ${level === 0 ? "border-primary/50 bg-primary/10" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
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

const HierarchyTab = ({ user_id }: { user_id: string }) => {
  const { data: hierarchy, isLoading, error } = useUserHierarchy(user_id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Mapping Hierarchy...
        </p>
      </div>
    );
  }

  if (error || !hierarchy) {
    return (
      <div className="p-8 text-center bg-card rounded-lg border border-border/50">
        <User className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium text-foreground">
          Hierarchy information unavailable
        </p>
        <p className="text-xs text-muted-foreground mt-1 text-balance">
          Could not retrieve the reporting structure for this user.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
            Organization Chart
          </h3>
          <p className="text-[10px] text-muted-foreground mt-1">
            Displaying the management hierarchy down from this user.
          </p>
        </div>
      </div>

      <div className="p-1">
        <RecursiveNode node={hierarchy} level={0} />
      </div>
    </div>
  );
};

export default HierarchyTab;
