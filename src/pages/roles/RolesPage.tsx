import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, Trash2, Shield } from "lucide-react";
import RoleModal from "./RoleModal";
import { useNavigate } from "react-router-dom";

import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/useRoles";
import { Role } from "@/types/Role";
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

const RolesPage = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useRoles();
    const roles: Role[] = data?.items || [];
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const filtered = roles.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = async (roleData: Partial<Role>) => {
        try {
            if (selectedRole) {
                await updateRoleMutation.mutateAsync({ id: selectedRole.id, ...roleData });
            } else {
                await createRoleMutation.mutateAsync(roleData);
            }
            setModalOpen(false);
            setSelectedRole(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteError(null);
        try {
            await deleteRoleMutation.mutateAsync(id);
            setRoleToDelete(null);
        } catch (error: unknown) {
            console.error(error);
            const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete role";
            setDeleteError(msg);
        }
    };

    const columns: Column<Role>[] = [
        {
            key: "name",
            header: "Role Name",
            render: (item) => (
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`${item.id}`)}
                >
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-sm flex items-center justify-center border border-primary/20 shrink-0">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground leading-none">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[200px]">{item.description}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "users_count",
            header: "Members",
            render: (item) => (
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">{item.users_count}</span>
                    <span className="text-[11px] text-muted-foreground">users</span>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: () => <StatusBadge status="Active" variant="success" />
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-[120px] text-right",
            render: (item) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`${item.id}`)} title="Manage Permissions">
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)} title="Edit Role">
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setRoleToDelete(item)} title="Delete Role">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search roles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-64"
                        />
                    </div>
                </div>
                <Button size="sm" className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none" onClick={() => { setSelectedRole(null); setModalOpen(true); }}>
                    <Plus className="h-3.5 w-3.5" /> Add Role
                </Button>
            </div>

            <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
                <DataTable data={filtered} columns={columns} />
            </div>

            <RoleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                role={selectedRole}
            />

            <AlertDialog
                open={!!roleToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setRoleToDelete(null);
                        setDeleteError(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the role "{roleToDelete?.name}".
                            This might affect users currently assigned to it.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteRoleMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleteRoleMutation.isPending}
                            onClick={(e) => {
                                e.preventDefault();
                                if (roleToDelete?.id) {
                                    handleDelete(roleToDelete.id);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteRoleMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RolesPage;
