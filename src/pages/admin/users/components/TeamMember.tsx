import { useState } from "react";
import { Plus, Search, User, Info, Trash2, Edit2, Mail, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import DataTable, { Column } from "@/components/DataTable";
import { useUsers } from "@/hooks/useUsers";
import { useCreateHierarchy, useUpdateHierarchy, useDeleteHierarchy } from "@/hooks/useHierarchy";

const TeamMember = ({ user_id }: { user_id: string }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [relation, setRelation] = useState("");

    const { data: usersResponse } = useUsers({ limit: 100 });
    const users = (usersResponse as any)?.items || (usersResponse as any)?.data || [];
    const userOptions = Array.isArray(users) ? users.map((u: any) => ({
        value: u.id,
        label: u.name || u.email || "Unknown",
        role: u.role?.name || "Member",
    })) : [];

    const createMutation = useCreateHierarchy();
    const updateMutation = useUpdateHierarchy();
    const deleteMutation = useDeleteHierarchy();

    // Dummy data for now - enhanced with user_id for editing simulation
    const dummyData = [
        {
            id: "1",
            name: "Jigar Kalariya",
            email: "jigar@yopmail.com",
            role: "Sales Executive",
            joined: "2024-03-20",
            employee_code: "EMP001",
            user_id: "8f09462f-e93e-45cd-8eef-7a6d0bc88fb5"
        },
        {
            id: "2",
            name: "Denisha V",
            email: "denisha@yopmail.com",
            role: "Marketing Lead",
            joined: "2024-03-22",
            employee_code: "EMP002",
            user_id: "d9b167be-299a-4ee8-ada6-aa0fdeaf7ab5"
        },
    ];

    const handleOpenAdd = () => {
        setEditingMember(null);
        setSelectedUserId("");
        setRelation("");
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingMember(item);
        setSelectedUserId(item.user_id);
        setRelation(item.role);
        setIsFormModalOpen(true);
    };

    const handleSaveMember = () => {
        if (!selectedUserId) return;

        if (editingMember) {
            updateMutation.mutate({
                id: editingMember.id,
                user_id: selectedUserId,
                relationship_type: relation || "Connected Member"
            }, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingMember(null);
                }
            });
        } else {
            createMutation.mutate({
                parent_id: user_id,
                user_id: selectedUserId,
                relationship_type: relation || "Connected Member"
            }, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setSelectedUserId("");
                    setRelation("");
                }
            });
        }
    };

    const handleDelete = () => {
        if (!memberToDelete) return;
        deleteMutation.mutate(memberToDelete.id, {
            onSuccess: () => {
                setMemberToDelete(null);
            }
        });
    };

    const columns: Column<any>[] = [
        {
            key: "name",
            header: "Member Name",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="truncate">
                        <p className="font-bold text-xs text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">{item.employee_code}</p>
                    </div>
                </div>
            )
        },
        {
            key: "email",
            header: "Email",
            render: (item) => (
                <div className="flex items-center gap-1.5 min-w-[150px]">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground truncate">{item.email}</span>
                </div>
            )
        },
        {
            key: "role",
            header: "Relationship",
            render: (item) => (
                <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-primary/60" />
                    <span className="text-[11px] font-semibold text-primary italic">{item.role}</span>
                </div>
            )
        },
        {
            key: "joined",
            header: "Joined Date",
            render: (item) => (
                <span className="text-[11px] text-muted-foreground font-medium">{item.joined}</span>
            )
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (item) => (
                <div className="flex bg-transparent items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-sm" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-sm text-destructive" onClick={() => setMemberToDelete(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500 py-2">
            {/* Toolbar Area */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        placeholder="Quick search members..."
                        className="pl-9 h-9 text-xs rounded-md border-border/60 bg-background/50 focus:bg-background transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button size="sm" className="h-9 gap-2 font-bold px-4 rounded-md shadow-sm" onClick={handleOpenAdd}>
                    <Plus className="h-4 w-4" />
                    Add Team Member
                </Button>
            </div>

            {/* Table Area */}
            <div className="bg-card rounded-lg border border-border/40 overflow-hidden shadow-sm">
                <DataTable
                    data={dummyData.filter(d =>
                        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    columns={columns}
                    pageSize={5}
                />
            </div>

            {/* Form Modal for Add/Edit */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-xl border-border shadow-2xl">
                    <div className="bg-primary/5 px-6 py-5 border-b border-primary/10">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2.5 text-primary font-black text-lg uppercase tracking-tight">
                                {editingMember ? <Edit2 className="h-5 w-5 stroke-[3px]" /> : <Plus className="h-5 w-5 stroke-[3px]" />}
                                {editingMember ? "EDIT TEAM MEMBER" : "ADD TEAM MEMBER"}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-bold text-muted-foreground/80 mt-1 uppercase tracking-[0.1em]">
                                {editingMember ? `RE-ASSIGN OR RENAME RELATIONSHIP FOR ${editingMember.name}` : "ASSIGN A NEW USER TO REPORT TO THIS MANAGER"}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="grid gap-6 p-6">
                        <div className="grid gap-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                                <User className="h-3.5 w-3.5" /> Select Employee
                            </Label>
                            <Combobox
                                options={userOptions}
                                value={selectedUserId}
                                onValueChange={setSelectedUserId}
                                placeholder="Search by name or email..."
                                className="h-10 w-full shadow-sm"
                            />
                        </div>
                        <div className="grid gap-2.5">
                            <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                                <Info className="h-3.5 w-3.5" /> Relationship Type
                            </Label>
                            <Input
                                placeholder="e.g. Sales Executive, Lead Developer..."
                                value={relation}
                                onChange={(e) => setRelation(e.target.value)}
                                className="h-10 text-sm focus-visible:ring-primary/20 bg-muted/5"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="font-bold text-[11px] uppercase tracking-widest h-9 px-5 hover:bg-muted"
                            onClick={() => setIsFormModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="font-black text-[11px] uppercase tracking-widest h-9 px-6 rounded-md shadow-md gap-2"
                            onClick={handleSaveMember}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : (editingMember ? "Update Member" : "Add Member")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>

                        <AlertDialogTitle>
                            Remove Team Member?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <span className="font-bold text-foreground">"{memberToDelete?.name}"</span> from this team? This relationship will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Keep Member
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                        >
                            {deleteMutation.isPending ? "Removing..." : "Yes, Remove"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TeamMember;