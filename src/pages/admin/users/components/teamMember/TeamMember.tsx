import { useState } from "react";
import { Plus, Search, User, Info, Trash2, Edit2, Mail, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import DataTable, { Column } from "@/components/DataTable";
import TeamMemberFormModal, { MemberFormData } from "./TeamMemberFormModal";
import { useUsers } from "@/hooks/useUsers";
import { useHierarchySearch, useCreateHierarchy, useUpdateHierarchy, useDeleteHierarchy } from "@/hooks/useHierarchy";

const TeamMember = ({ user_id }: { user_id: string }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any | null>(null);
    const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    // API Hooks
    const { data: hierarchyResponse, isLoading: listLoading } = useHierarchySearch(user_id);
    const subMembers = (hierarchyResponse as any)?.items || [];

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

    const handleOpenAdd = () => {
        setEditingMember(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (item: any) => {
        setEditingMember(item);
        setIsFormModalOpen(true);
    };

    const handleSaveMember = (data: MemberFormData) => {
        if (editingMember) {
            updateMutation.mutate({
                id: editingMember.id,
                parent_id: user_id,
                user_id: data.user_id,
                relationship_type: data.relationship_type
            }, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingMember(null);
                }
            });
        } else {
            createMutation.mutate({
                parent_id: user_id,
                user_id: data.user_id,
                relationship_type: data.relationship_type
            }, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
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
                        <p className="font-bold text-xs text-foreground truncate">
                            {item.user_name || item.name || "Unknown User"}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {item.user_employee_code || item.employee_code || "---"}
                        </p>
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
                    <span className="text-[11px] text-muted-foreground truncate">
                        {item.user_email || item.email || "---"}
                    </span>
                </div>
            )
        },
        {
            key: "role",
            header: "Relationship",
            render: (item) => (
                <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-primary/60" />
                    <span className="text-[11px] font-semibold text-primary italic">
                        {item.relationship_type || item.role || "Connected"}
                    </span>
                </div>
            )
        },
        {
            key: "joined",
            header: "Joined Date",
            render: (item) => (
                <span className="text-[11px] text-muted-foreground font-medium">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "---"}
                </span>
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
                    data={subMembers.filter((d: any) =>
                        (d.user_name || d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (d.user_email || d.email || "").toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    columns={columns}
                    pageSize={10}
                    isLoading={listLoading}
                />
            </div>

            {/* Form Modal for Add/Edit using the refined Modal-based component */}
            <TeamMemberFormModal
                open={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                editingMember={editingMember}
                onSave={handleSaveMember}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                userOptions={userOptions}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Remove Team Member?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <span className="font-bold text-foreground">"{memberToDelete?.user_name || memberToDelete?.name}"</span> from this team? This relationship will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
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