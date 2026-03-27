import {
  User,
  Users,
  ChevronRight,
  Edit2,
  Trash2,
  Info,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HierarchyNode } from "./HierarchyTableView";

interface HierarchyGridViewProps {
  currentChildren: HierarchyNode[];
  nodes: Record<string, HierarchyNode>;
  onNavigate: (id: string) => void;
  onAdd: () => void;
}

export const HierarchyGridView = ({
  currentChildren,
  nodes,
  onNavigate,
  onAdd,
}: HierarchyGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2 animate-in fade-in duration-500">
      {currentChildren.map((node) => (
        <div
          key={node.id}
          className="group relative flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
          onClick={() => onNavigate(node.id)}
        >
          <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Users className="h-16 w-16 text-primary" />
          </div>
          <div className="p-5 flex-1 space-y-4">
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0 text-[10px] uppercase font-bold bg-primary/5 text-primary border-primary/10"
            >
              {node.role}
            </Badge>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {node.name}
              </h3>
            </div>
          </div>
          <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/10 gap-1.5"
            >
              <ChevronRight className="h-3.5 w-3.5" /> Explore
            </Button>
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex flex-col items-center justify-center gap-4 py-8 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 transition-all hover:bg-primary/5 group min-h-[200px]"
      >
        <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 border border-primary/10">
          <Plus className="h-6 w-6 text-primary/40 group-hover:text-primary/60" />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Add Member
        </p>
      </button>
    </div>
  );
};
