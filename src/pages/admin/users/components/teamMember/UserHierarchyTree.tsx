import React, { useMemo } from "react";
import { User, Mail, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { useAllHierarchy } from "@/hooks/useHierarchy";

interface TreeNode {
    id: string;
    name: string;
    role: string;
    children: TreeNode[];
    email?: string;
    employeeCode?: string;
}

const TreeCard = ({ node }: { node: TreeNode }) => {
    return (
        <div className="relative flex flex-col items-center group">
            {/* The Node Card */}
            <div className="z-10 border border-primary/20 bg-background rounded-lg p-3 w-[220px] transition-all hover:border-primary shadow-sm hover:shadow-md">
                <div className="flex flex-col gap-1 text-center">
                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/70 truncate">{node.role}</p>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate">{node.name}</h4>
                    <div className="flex items-center justify-center gap-1.5 mt-1 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                        <Mail className="h-2.5 w-2.5 shrink-0" />
                        <span className="text-[9px] font-medium truncate">{node.email || "---"}</span>
                    </div>
                </div>

                {node.children.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-dashed border-border flex items-center justify-center gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{node.children.length} Reports</span>
                    </div>
                )}
            </div>

            {/* Vertical Line to Children */}
            {node.children.length > 0 && (
                <div className="w-px h-8 bg-primary/20 mt-0" />
            )}
        </div>
    );
};

const UserHierarchyTree = () => {
    const { data: allItems, isLoading, isError } = useAllHierarchy();

    const treeData = useMemo(() => {
        const items = allItems as any[];
        if (!items || items.length === 0) return null;

        const nodeMap: Record<string, TreeNode> = {};
        
        // Group by user_id
        items.forEach((item: any) => {
            const userId = item.user_id || item.parent_id; // For root rows, sometimes user_id is null
            if (!userId) return;

            nodeMap[userId] = {
                id: userId,
                name: item.user_name || item.parent_name || "Unknown",
                role: item.relationship_type || "Member",
                email: item.user_email || item.parent_email || "",
                employeeCode: item.user_employee_code || item.parent_employee_code || "",
                children: []
            };
        });

        const roots: TreeNode[] = [];
        const userIdsUsedAsChildren = new Set<string>();

        items.forEach((item: any) => {
            const childId = item.user_id;
            const parentId = item.parent_id;

            if (childId && parentId && nodeMap[parentId] && nodeMap[childId]) {
                if (childId !== parentId) {
                    nodeMap[parentId].children.push(nodeMap[childId]);
                    userIdsUsedAsChildren.add(childId);
                }
            }
        });

        // Any node that wasn't someone's child is a root
        Object.keys(nodeMap).forEach(userId => {
            if (!userIdsUsedAsChildren.has(userId)) {
                roots.push(nodeMap[userId]);
            }
        });

        return roots;
    }, [allItems]);

    if (isLoading) {
        return (
            <div className="w-full h-[calc(100vh-250px)] flex flex-col items-center justify-center gap-3 animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Building Organization Map...</p>
            </div>
        );
    }

    if (isError || !treeData || treeData.length === 0) {
        return (
            <div className="w-full h-[calc(100vh-250px)] flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <AlertCircle className="h-8 w-8 opacity-20" />
                <p className="text-xs font-medium uppercase tracking-widest">No hierarchy data available</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-220px)] overflow-auto rounded-sm p-10 select-none custom-scrollbar bg-muted/5 border border-border/40">
            <div className="min-w-max flex flex-col items-center gap-8">
                {treeData.map(root => (
                    <TreeNodeComponent key={root.id} node={root} isRoot />
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .tree-children::before {
                    content: '';
                    position: absolute;
                    top: -16px;
                    left: 50%;
                    width: 1px;
                    height: 16px;
                    background: hsl(var(--primary) / 0.2);
                }
                .tree-branch::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    height: 1px;
                    background: hsl(var(--primary) / 0.2);
                    width: 50%;
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
                .tree-branch:not(:first-child):not(:last-child)::before {
                    left: 0;
                    width: 100%;
                }
            `}} />
        </div>
    );
};

const TreeNodeComponent = ({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) => {
    return (
        <div className="flex flex-col items-center shrink-0">
            <TreeCard node={node} />

            {node.children.length > 0 && (
                <div className="relative flex gap-6 mt-0 pt-4 tree-children">
                    {node.children.map((child) => (
                        <div key={child.id} className="relative flex flex-col items-center tree-branch pt-4">
                            <TreeNodeComponent node={child} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserHierarchyTree;
