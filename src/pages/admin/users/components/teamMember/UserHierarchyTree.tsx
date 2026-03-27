import React from "react";
import { User, Mail, Briefcase, ChevronRight, ChevronDown } from "lucide-react";

interface TreeNode {
    id: string;
    name: string;
    role: string;
    children: TreeNode[];
    email?: string;
    employeeCode?: string;
}

const dummyTreeData: TreeNode = {
    id: "1",
    name: "John Doe",
    role: "MD / CEO",
    email: "ceo@company.com",
    employeeCode: "CEO001",
    children: [
        {
            id: "2",
            name: "Sarah Smith",
            role: "Director - Operations",
            email: "ops.director@company.com",
            employeeCode: "DIR001",
            children: [
                {
                    id: "4",
                    name: "Michael Chen",
                    role: "GM - Manufacturing",
                    email: "gm.mfg@company.com",
                    employeeCode: "GM001",
                    children: [
                        {
                            id: "8",
                            name: "Robert Fox",
                            role: "Chief Plant Manager",
                            email: "plant.mgr@company.com",
                            employeeCode: "CPM001",
                            children: []
                        }
                    ]
                },
                {
                    id: "5",
                    name: "Emily White",
                    role: "GM - Quality",
                    email: "gm.quality@company.com",
                    employeeCode: "GM002",
                    children: []
                }
            ]
        },
        {
            id: "3",
            name: "David Wilson",
            role: "Director - Marketing",
            email: "mkt.director@company.com",
            employeeCode: "DIR002",
            children: [
                {
                    id: "6",
                    name: "Jessica Brown",
                    role: "GM - Sales",
                    email: "gm.sales@company.com",
                    employeeCode: "GM003",
                    children: []
                },
                {
                    id: "7",
                    name: "Kevin Lee",
                    role: "GM - CRM",
                    email: "gm.crm@company.com",
                    employeeCode: "GM004",
                    children: []
                }
            ]
        }
    ]
};

const TreeCard = ({ node }: { node: TreeNode }) => {
    return (
        <div className="relative flex flex-col items-center group">
            {/* The Node Card */}
            <div className="z-10 border border-border rounded-lg p-3 w-[220px] transition-all">
                <div className="flex flex-col gap-1 text-center">
                    <p className="text-[10px] uppercase tracking-widest font-black text-primary/70">{node.role}</p>
                    <h4 className="text-xs font-black text-foreground uppercase tracking-tight truncate">{node.name}</h4>
                    <div className="flex items-center justify-center gap-1.5 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Mail className="h-2.5 w-2.5" />
                        <span className="text-[9px] font-medium">{node.email}</span>
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
                <div className="w-px h-8 bg-border mt-0" />
            )}
        </div>
    );
};

const UserHierarchyTree = () => {
    return (
        <div className="w-full h-[calc(100vh-200px)] overflow-auto rounded-sm p-10 select-none">
            <div className="min-w-max flex flex-col items-center gap-8">
                {/* Recursive Tree Rendering */}
                <TreeNodeComponent node={dummyTreeData} isRoot />
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
                    background: hsl(var(--border));
                }
                .tree-branch::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    height: 1px;
                    background: hsl(var(--border));
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
                    {node.children.map((child, idx) => (
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
