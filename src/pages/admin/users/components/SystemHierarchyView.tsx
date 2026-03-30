import { useSystemHierarchy } from "@/hooks/useUsers";
import { Loader2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const TreeNode = ({ node }: RecursiveNodeProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center justify-center py-3 px-4 rounded-[4px] bg-[#d2dae2] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow cursor-pointer min-w-[140px] max-w-[220px]"
      onClick={() => navigate(`/admin/users/${node.id}`)}
    >
      <div className="font-sans font-bold text-[14px] text-[#111] text-center w-full truncate" title={node.name}>
        {node.name}
      </div>

      <div className="flex flex-col items-center mt-1 space-y-0.5">
        {node.department && (
          <div className="text-[11px] text-[#333] font-medium text-center truncate w-full" title={node.department}>
            {node.department}
          </div>
        )}
        {node.employee_code && (
          <div className="text-[10px] text-[#555] font-mono tracking-tight bg-white/40 px-1.5 py-0.5 rounded-sm">
            {node.employee_code}
          </div>
        )}
        {node.email && (
          <div className="text-[10px] text-[#666] text-center truncate w-full mt-1" title={node.email}>
            {node.email}
          </div>
        )}
      </div>
    </div>
  );
};

const RecursiveNode = ({ node }: RecursiveNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <TreeNode node={node} />

      {hasChildren && (
        <div className="flex flex-col items-center mt-0 w-full relative">
          {/* Main vertical line from parent */}
          <div className="w-[3px] h-6 bg-[#1a1a1a]"></div>

          <div className="flex relative items-start">
            {/* Horizontal Connection bar spanning from first child center to last child center */}
            {node.children!.length > 1 && (
              <div
                className="absolute top-0 h-[3px] bg-[#1a1a1a]"
                style={{
                  left: `calc(50% / ${node.children!.length})`,
                  right: `calc(50% / ${node.children!.length})`
                }}
              />
            )}

            <div className="flex">
              {node.children!.map((child, index) => (
                <div key={child.id} className="relative flex flex-col items-center pt-[0px] px-6">

                  {/* Inner vertical drop down to node */}
                  <div className="relative flex flex-col items-center">
                    {/* Vertical dropdown line */}
                    <div className="w-[3px] h-6 bg-[#1a1a1a]" />

                    {/* Downward Arrow Triangle */}
                    <div className="absolute bottom-0 translate-y-[90%] left-1/2 -translate-x-1/2 w-0 h-0 
                                    border-l-[6px] border-l-transparent 
                                    border-r-[6px] border-r-transparent 
                                    border-t-[8px] border-t-[#1a1a1a] z-10"
                    />
                  </div>

                  {/* Spacer for Arrow */}
                  <div className="h-4"></div>

                  <RecursiveNode node={child} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SystemHierarchyView = ({ is_active }: { is_active?: boolean }) => {
  const { data: hierarchyData, isLoading, error } = useSystemHierarchy({ is_active });

  const hierarchy: HierarchyNode[] = Array.isArray(hierarchyData)
    ? hierarchyData
    : (hierarchyData as any)?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#111]" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#111]">
          Establishing Communication Lines...
        </p>
      </div>
    );
  }

  if (error || !hierarchy || hierarchy.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border border-border/50">
        <User className="h-12 w-12 text-[#111] mx-auto mb-4 opacity-20" />
        <p className="text-sm font-medium text-[#111]">Hierarchy mapping unavailable</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center flex-wrap pt-12 pb-24 overflow-auto min-h-[600px] bg-[#fbfbfb] font-sans">
      {hierarchy.map((root: HierarchyNode) => (
        <RecursiveNode key={root.id} node={root} />
      ))}
    </div>
  );
};

export default SystemHierarchyView;
