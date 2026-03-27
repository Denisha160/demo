import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Home,
    User,
    ArrowRight,
    Info,
    LayoutGrid,
    List,
    Loader2
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
import { 
    useHierarchySearch, 
    useCreateHierarchy, 
    useUpdateHierarchy, 
    useDeleteHierarchy 
} from "@/hooks/useHierarchy";

// Imported Components
import { HierarchyNode, HierarchyTableView } from "./HierarchyTableView";
import { HierarchyGridView } from "./HierarchyGridView";

const HierarchyPage = () => {
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

    // API Hooks
    const { data: hierarchyResponse, isLoading: idLoading } = useHierarchySearch({ limit: 1000 });
    const createMutation = useCreateHierarchy();
    const updateMutation = useUpdateHierarchy();
    const deleteMutation = useDeleteHierarchy();

    const nodes = useMemo(() => {
        const n: Record<string, HierarchyNode> = {
            root: {
                id: "root",
                name: "ORGANIZATION ROOT",
                role: "System Root",
                relation: "Top Level",
                parentId: null,
                children: [],
                userId: "root-sys",
                createdAt: new Date().toISOString()
            }
        };

        const rawData = (hierarchyResponse as any)?.data || (hierarchyResponse as any)?.items || [];
        const items = Array.isArray(rawData) ? rawData : [];

        // First pass: create nodes
        items.forEach((item: any) => {
            const nodeId = String(item.id);
            n[nodeId] = {
                id: nodeId,
                name: item.name || item.user?.name || item.email || item.relationship_type || "Member",
                role: item.role || item.user?.role?.name || item.relationship_type || "Member",
                relation: item.relationship_type || "",
                parentId: item.parent_id === null ? "root" : String(item.parent_id),
                children: [],
                userId: item.user_id,
                createdAt: item.created_at
            };
        });

        // Second pass: setup children and handle orphaned nodes
        items.forEach((item: any) => {
            const nodeId = String(item.id);
            const rawParentId = item.parent_id === null ? "root" : String(item.parent_id);
            
            // If the parent doesn't exist in our list, attach to virtual root
            if (!n[rawParentId]) {
                n[nodeId].parentId = "root";
                n["root"].children.push(nodeId);
            } else {
                n[rawParentId].children.push(nodeId);
            }
        });

        return n;
    }, [hierarchyResponse]);

    const currentNode = nodes[currentId] || nodes["root"];

    const currentChildren = useMemo(() => {
        if (!currentNode) return [];
        return currentNode.children
            .map(id => nodes[id])
            .filter(node => node && node.name.toLowerCase().includes(searchTerm.toLowerCase()));
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

    const handleCreateNode = async (parentId?: string) => {
        const targetParentId = parentId || currentId;
        const selectedUser = userOptions.find(u => u.value === selectedUserId);
        if (!selectedUser) return;

        const resp = hierarchyResponse as any;
        const isFirstTime = (resp?.data?.length === 0) || (resp?.items?.length === 0) || (!resp?.data && !resp?.items);

        const payload = isFirstTime 
            ? {
                parent_id: selectedUserId,
                user_id: null,
                relationship_type: newNodeRelation || "Root Relation"
            }
            : {
                parent_id: targetParentId === "root" ? null : targetParentId,
                user_id: selectedUserId,
                relationship_type: newNodeRelation || "Connected Member"
            };

        createMutation.mutate(payload, {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setInlineAddingToId(null);
                setSelectedUserId("");
                setNewNodeRelation("");
            }
        });
    };

    const handleDeleteNode = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleUpdateNode = (id: string, name: string, role: string, relation: string, userId: string) => {
        updateMutation.mutate({
            id,
            user_id: userId,
            relationship_type: relation
        });
    };

    return (
        <div className="w-full mx-auto space-y-4 animate-in fade-in duration-500 pb-10">
            {/* ── Header Area ── */}
            {idLoading && (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
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