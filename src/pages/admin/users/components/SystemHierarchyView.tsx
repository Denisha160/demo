import React from "react";
import { Mail, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSystemHierarchy } from "@/hooks/useUsers";

interface HierarchyNode {
  id: string;
  name: string;
  email: string;
  employee_code: string;
  image_url?: string;
  is_active: boolean;
  department?: string;
  level: number;
  children?: HierarchyNode[];
}

interface RecursiveNodeProps {
  node: HierarchyNode;
}
interface SystemHierarchyViewProps {
  is_active?: boolean;
}

const TreeCard = ({
  node,
  onClick,
}: {
  node: HierarchyNode;
  onClick: (node: HierarchyNode) => void;
}) => {
  const reports = node.children?.length || 0;
  const roleLabel = node.department;

  return (
    <div
      className="relative flex flex-col items-center group cursor-pointer"
      onClick={() => onClick(node)}
    >
      <div className="z-10 border border-border rounded-lg p-3 w-[220px] bg-card/60 shadow-sm transition-all">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border border-primary/20 overflow-hidden mb-1">
            {node.image_url ? (
              <img
                src={node.image_url}
                alt={node.name}
                className="h-full w-full object-cover"
              />
            ) : node.name ? (
              node.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            ) : (
              "?"
            )}
          </div>
          <p className="text-[9px] uppercase tracking-widest font-black text-primary/70">
            {roleLabel}
          </p>
          <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate w-full">
            {node.name || "Unnamed"}
          </h4>
          <div className="flex items-center justify-center gap-1.5 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
            <Mail className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground truncate max-w-[150px]">
              {node.email || "Email not set"}
            </span>
          </div>
        </div>
      </div>

      {reports > 0 && (
        <div className="relative flex flex-col items-center">
          <div className="w-[2px] h-8 bg-black mt-0" />
        </div>
      )}
    </div>
  );
};

const TreeNodeComponent = ({
  node,
  onClick,
}: {
  node: HierarchyNode;
  onClick: (node: HierarchyNode) => void;
}) => {
  const children = node.children || [];

  return (
    <div className="flex flex-col items-center shrink-0">
      <TreeCard node={node} onClick={onClick} />

      {children.length > 0 && (
        <div className="relative flex mt-0  tree-children">
          {children.map((child) => (
            <div
              key={child.id}
              className="relative flex flex-col items-center tree-branch pt-4 px-2"
            >
              <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-black z-10" />
              <TreeNodeComponent node={child} onClick={onClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SystemHierarchyView = ({ is_active }: SystemHierarchyViewProps) => {
  const { data, isLoading, error } = useSystemHierarchy({ is_active });
  const navigate = useNavigate();

  const handleNodeClick = (node: HierarchyNode) => {
    navigate(`${node.id}`);
  };
  const roots: HierarchyNode[] = React.useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Loading hierarchy
        </p>
      </div>
    );
  }

  if (error || roots.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
        <p>No hierarchy information available.</p>
        <p className="text-xs">
          Try adjusting the filters or refresh the page.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto rounded-sm p-8 select-none">
      <div className="min-w-max flex flex-col items-center gap-10">
        {roots.map((node) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            onClick={handleNodeClick}
          />
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
              .tree-children::before {
                  content: '';
                  position: absolute;
                  top: -16px;
                  left: 50%;
                  width: 2px;
                  height: 18px;
                  background: black;
                  transform: translateX(-50%);
              }
              .tree-branch::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  height: 2px;
                  background: black;
                  width: 100%;
              }
              .tree-branch::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 50%;
                  width: 2px;
                  height: 16px;
                  background: black;
                  transform: translateX(-50%);
              }
              .tree-branch:first-child::before {
                  left: 50%;
                  width: 50%;
              }
              .tree-branch:last-child::before {
                  left: 0;
                  width: 50%;
              }
              .tree-branch:only-child::before {
                  display: none;
              }
          `,
        }}
      />
    </div>
  );
};

export default SystemHierarchyView;
