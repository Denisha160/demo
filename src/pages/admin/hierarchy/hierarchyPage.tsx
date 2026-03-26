import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Home,
    User,
    ArrowRight,
    Info,
    LayoutGrid,
    List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Combobox } from "@/components/ui/combobox";
import { useUsers } from "@/hooks/useUsers";

// Imported Components
import { HierarchyNode, HierarchyTableView } from "./HierarchyTableView";
import { HierarchyGridView } from "./HierarchyGridView";

const DUMMY_DATA: Record<string, HierarchyNode> = {
    root: {
        id: "root",
        name: "ORGANIZATION ROOT",
        role: "Admin",
        relation: "Top Level",
        parentId: null,
        children: ["node-1"],
        userId: "root-sys",
        createdAt: new Date().toISOString()
    },
    "node-1": {
        id: "node-1",
        name: "ARMONIA SKY OWNER",
        role: "Managing Director",
        relation: "Reports to Board",
        parentId: "root",
        children: ["node-1-1", "node-1-2"],
        userId: "u-1",
        createdAt: new Date().toISOString()
    },
    "node-1-1": {
        id: "node-1-1",
        name: "John Doe",
        role: "Project Manager",
        relation: "Direct Report",
        parentId: "node-1",
        children: ["node-1-1-1"],
        userId: "u-2",
        createdAt: new Date().toISOString()
    },
    "node-1-2": {
        id: "node-1-2",
        name: "Jane Smith",
        role: "Sales Lead",
        relation: "Direct Report",
        parentId: "node-1",
        children: [],
        userId: "u-3",
        createdAt: new Date().toISOString()
    },
    "node-1-1-1": {
        id: "node-1-1-1",
        name: "Marketing Specialist",
        role: "Executive",
        relation: "Reporting to John",
        parentId: "node-1-1",
        children: [],
        userId: "u-4",
        createdAt: new Date().toISOString()
    }
};

const HierarchyPage = () => {
    const [nodes, setNodes] = useState<Record<string, HierarchyNode>>(DUMMY_DATA);
    const [currentId, setCurrentId] = useState<string>("root");
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [inlineAddingToId, setInlineAddingToId] = useState<string | null>(null);
    const [openAccordionIds, setOpenAccordionIds] = useState<string[]>([]);

    const [selectedUserId, setSelectedUserId] = useState("");
    const [newNodeRelation, setNewNodeRelation] = useState("");

    const { data: usersResponse } = useUsers({ limit: 100 }, { enabled: isAddModalOpen || !!inlineAddingToId });
    const users = (usersResponse as any)?.items || usersResponse || [];
    const userOptions = users.map((user: any) => ({
        value: user.id,
        label: user.name,
        role: user.role?.name || "Member"
    }));

    const currentNode = nodes[currentId];

    const currentChildren = useMemo(() => {
        return currentNode.children
            .map(id => nodes[id])
            .filter(node => node.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [currentNode, nodes, searchTerm]);

    const path = useMemo(() => {
        const p: HierarchyNode[] = [];
        let curr: HierarchyNode | null = currentNode;
        while (curr) {
            p.unshift(curr);
            curr = curr.parentId ? nodes[curr.parentId] : null;
        }
        return p;
    }, [currentNode, nodes]);

    const handleNavigate = (id: string) => {
        setCurrentId(id);
        setSearchTerm("");
        setInlineAddingToId(null);
    };

    const handleCreateNode = (parentId?: string) => {
        const targetParentId = parentId || currentId;
        const selectedUser = userOptions.find(u => u.value === selectedUserId);
        if (!selectedUser) return;

        const newId = `node-${Date.now()}`;
        const newNode: HierarchyNode = {
            id: newId,
            name: selectedUser.label,
            role: selectedUser.role,
            relation: newNodeRelation || "Connected Member",
            parentId: targetParentId,
            children: [],
            userId: selectedUserId,
            createdAt: new Date().toISOString()
        };

        setNodes(prev => ({
            ...prev,
            [newId]: newNode,
            [targetParentId]: {
                ...prev[targetParentId],
                children: [newId, ...prev[targetParentId].children]
            }
        }));

        setIsAddModalOpen(false);
        setInlineAddingToId(null);
        setSelectedUserId("");
        setNewNodeRelation("");
    };

    const handleDeleteNode = (id: string) => {
        setNodes(prev => {
            const next = { ...prev };
            const node = next[id];
            if (!node) return prev;
            if (node.parentId && next[node.parentId]) {
                next[node.parentId] = {
                    ...next[node.parentId],
                    children: next[node.parentId].children.filter(cid => cid !== id)
                };
            }
            delete next[id];
            return next;
        });
    };

    const handleUpdateNode = (id: string, name: string, role: string, relation: string, userId: string) => {
        setNodes(prev => ({
            ...prev,
            [id]: { ...prev[id], name, role, relation, userId }
        }));
    };

    return (
        <div className="w-full mx-auto space-y-4 animate-in fade-in duration-500 pb-10">
            {/* ── Header Area ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people..."
                            className="h-8 pl-8 text-xs rounded-sm w-full sm:w-[220px] border-border/60"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center bg-muted/30 p-1 rounded-sm border border-border h-8 shrink-0">
                        <Button
                            variant={viewMode === "cards" ? "default" : "ghost"}
                            size="icon"
                            className="h-6 w-6 rounded-sm p-0"
                            onClick={() => setViewMode("cards")}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="icon"
                            className="h-6 w-6 rounded-sm p-0"
                            onClick={() => setViewMode("table")}
                            title="Table View"
                        >
                            <List className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <Button
                    size="sm"
                    className="h-8 px-6 text-xs font-semibold rounded-sm gap-2"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Assign User
                </Button>
            </div>

            {/* ── Breadcrumbs ── */}
            <div className="px-1 flex items-center gap-2">
                <Home className="h-3.5 w-3.5 text-muted-foreground" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {path.map((node, index) => (
                            <div key={node.id} className="flex items-center">
                                <BreadcrumbItem>
                                    <button
                                        onClick={() => handleNavigate(node.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 text-[11px] font-bold tracking-tight uppercase transition-colors",
                                            index === path.length - 1
                                                ? "text-primary hover:text-primary/80"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {node.id === "root" ? "Start" : node.name}
                                    </button>
                                </BreadcrumbItem>
                                {index < path.length - 1 && <BreadcrumbSeparator className="mx-1.5" />}
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* ── Shared Content Switcher ── */}
            {viewMode === "cards" ? (
                <HierarchyGridView
                    currentChildren={currentChildren}
                    nodes={nodes}
                    onNavigate={handleNavigate}
                    onAdd={() => setIsAddModalOpen(true)}
                />
            ) : (
                <HierarchyTableView
                    currentChildren={currentChildren}
                    nodes={nodes}
                    userOptions={userOptions}
                    inlineAddingToId={inlineAddingToId}
                    openAccordionIds={openAccordionIds}
                    setOpenAccordionIds={setOpenAccordionIds}
                    onInlineAdd={(parentId) => {
                        setInlineAddingToId(parentId);
                        if (!openAccordionIds.includes(parentId)) {
                            setOpenAccordionIds(prev => [...prev, parentId]);
                        }
                    }}
                    onCancelInline={() => setInlineAddingToId(null)}
                    handleCreateNode={handleCreateNode}
                    selectedUserId={selectedUserId}
                    setSelectedUserId={setSelectedUserId}
                    newNodeRelation={newNodeRelation}
                    setNewNodeRelation={setNewNodeRelation}
                    onDelete={handleDeleteNode}
                    onUpdate={handleUpdateNode}
                    onAddGlobal={() => setIsAddModalOpen(true)}
                    currentNodeName={currentNode.name}
                />
            )}

            {/* ── Global Modal ── */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border-border shadow-2xl p-0 overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-primary font-bold"><Plus className="h-5 w-5" /> Assign Employee</DialogTitle>
                            <DialogDescription className="text-xs pt-1">Connect a user under <strong>{currentNode.name}</strong>.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="grid gap-6 p-6">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                                <User className="h-3.5 w-3.5" /> Select Employee
                            </Label>
                            <Combobox options={userOptions} value={selectedUserId} onValueChange={setSelectedUserId} placeholder="Search user..." className="h-10 w-full shadow-xs" />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                                <Info className="h-3.5 w-3.5" /> Relationship
                            </Label>
                            <Input placeholder="e.g. Sales Executive" value={newNodeRelation} onChange={e => setNewNodeRelation(e.target.value)} className="h-10" />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="font-semibold text-xs h-9" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button size="sm" className="font-bold text-xs px-6 h-9 rounded-sm gap-2" onClick={() => handleCreateNode()}>Save Relation<ArrowRight className="h-3.5 w-3.5" /></Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HierarchyPage;