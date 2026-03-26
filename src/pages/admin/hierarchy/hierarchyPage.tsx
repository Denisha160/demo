import { useState, useMemo } from "react";
import {
    User,
    Plus,
    Search,
    ChevronRight,
    Home,
    Clock,
    Users,
    Edit2,
    Trash2,
    ArrowRight,
    Info,
    Calendar
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
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { useUsers } from "@/hooks/useUsers";

interface HierarchyNode {
    id: string;
    name: string;
    role: string;
    relation: string;
    parentId: string | null;
    children: string[];
    userId: string;
    createdAt: string;
}

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
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // New node form state
    const [selectedUserId, setSelectedUserId] = useState("");
    const [newNodeRelation, setNewNodeRelation] = useState("");

    const { data: usersResponse } = useUsers({ limit: 100 }, { enabled: isAddModalOpen });
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
    };

    const handleCreateNode = () => {
        const selectedUser = userOptions.find(u => u.value === selectedUserId);
        if (!selectedUser) return;

        const newId = `node-${Date.now()}`;
        const newNode: HierarchyNode = {
            id: newId,
            name: selectedUser.label,
            role: selectedUser.role,
            relation: newNodeRelation || "Connected Member",
            parentId: currentId,
            children: [],
            userId: selectedUserId,
            createdAt: new Date().toISOString()
        };

        setNodes(prev => ({
            ...prev,
            [newId]: newNode,
            [currentId]: {
                ...prev[currentId],
                children: [...prev[currentId].children, newId]
            }
        }));

        setIsAddModalOpen(false);
        setSelectedUserId("");
        setNewNodeRelation("");
    };

    return (
        <div className="w-full mx-auto space-y-4 animate-in fade-in duration-500 pb-10">
            {/* ── Header Area matching Kits style ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people in this node..."
                            className="h-9 pl-8 text-xs rounded-sm w-full sm:w-[250px] border-border/60 shadow-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    size="sm"
                    className="h-9 px-6 text-xs font-semibold rounded-sm gap-2"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add New User
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

            {/* ── Grid View Matching KitsPage Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-2">

                {currentChildren.map(node => (
                    <div
                        key={node.id}
                        className="group relative flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                        onClick={() => handleNavigate(node.id)}
                    >
                        {/* Decorative BG Icon */}
                        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <Users className="h-16 w-16 text-primary" />
                        </div>

                        <div className="p-5 flex-1 space-y-4">
                            {/* Badge & ID */}
                            <div className="flex items-start justify-between">
                                <Badge
                                    variant="outline"
                                    className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wider font-bold bg-primary/5 text-primary border-primary/10"
                                >
                                    {node.role}
                                </Badge>

                            </div>

                            {/* Identity Section */}
                            <div className="space-y-1">
                                <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                    {node.name}
                                </h3>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Joined {new Date(node.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Bottom Actions matching Kits style */}
                        <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/10 gap-1.5"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigate(node.id);
                                }}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                                Explore Team
                            </Button>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* ── Add New User Placeholder ── */}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex flex-col items-center justify-center gap-4 py-8 rounded-xl border-2 border-dashed border-border/60 bg-muted/5 transition-all hover:border-primary/40 hover:bg-primary/5 group min-h-[250px]"
                >
                    <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 border border-primary/10">
                        <Plus className="h-8 w-8 text-primary/30 group-hover:text-primary/60" />
                    </div>
                    <div className="flex flex-col items-center text-center px-6">
                        <h3 className="text-sm font-bold text-foreground tracking-tight">Add New User</h3>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">
                            Assign a new team member under <strong>{currentNode.name}</strong>
                        </p>
                    </div>
                </button>
            </div>

            {/* ── Creation Modal ── */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-xl border-border shadow-2xl p-0 overflow-hidden">
                    <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-primary font-bold">
                                <Plus className="h-5 w-5" />
                                Assign Employee
                            </DialogTitle>
                            <DialogDescription className="text-xs pt-1">
                                Create a relation under <strong>{currentNode.name}</strong>'s node.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="grid gap-6 p-6">
                        <div className="grid gap-2">
                            <Label htmlFor="user" className="text-xs font-bold text-foreground tracking-wide flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-muted-foreground" /> Select Employee
                            </Label>
                            <Combobox
                                options={userOptions}
                                value={selectedUserId}
                                onValueChange={setSelectedUserId}
                                placeholder="Search by name or email..."
                                className="h-10 w-full rounded-sm"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="relation" className="text-xs font-bold text-foreground tracking-wide flex items-center gap-1.5">
                                <Info className="h-3.5 w-3.5 text-muted-foreground" /> Relation / Description
                            </Label>
                            <Input
                                id="relation"
                                placeholder="e.g. Sales Executive, Direct Report"
                                value={newNodeRelation}
                                onChange={(e) => setNewNodeRelation(e.target.value)}
                                className="h-10 rounded-sm border-border/60 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="font-semibold text-xs h-9" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" className="font-bold text-xs px-6 h-9 rounded-sm gap-2" onClick={handleCreateNode}>
                            Save Hierarchy
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HierarchyPage;