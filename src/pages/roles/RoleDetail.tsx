import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Shield, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoleDetails, useAvailablePermissions, useUpdateRole } from "@/hooks/useRoles";
import { toast } from "react-toastify";

interface Permission {
    id: string;
    label: string;
    enabled: boolean;
}

interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

const RoleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: role, isLoading: roleLoading } = useRoleDetails(id);
    const { data: availablePermissions, isLoading: permsLoading } = useAvailablePermissions();
    const updateRoleMutation = useUpdateRole();

    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (role?.permissions) {
            setSelectedPerms(new Set(role.permissions));
        }
    }, [role]);

    const groups: PermissionGroup[] = useMemo(() => {
        if (!availablePermissions) return [];
        const groupMap: Record<string, Permission[]> = {};

        availablePermissions.forEach((perm: string) => {
            const parts = perm.split('.');
            const moduleName = parts[0] || 'Misc';
            const action = parts[1] || perm;

            if (!groupMap[moduleName]) {
                groupMap[moduleName] = [];
            }

            const formattedModule = moduleName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            groupMap[moduleName].push({
                id: perm,
                label: `${action.charAt(0).toUpperCase() + action.slice(1)} ${formattedModule}`,
                enabled: selectedPerms.has(perm)
            });
        });

        return Object.entries(groupMap).map(([module, permissions]) => ({
            module: module.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            permissions
        }));
    }, [availablePermissions, selectedPerms]);

    const togglePermission = (permissionId: string) => {
        setSelectedPerms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId);
            } else {
                newSet.add(permissionId);
            }
            return newSet;
        });
    };

    const toggleAll = (select: boolean) => {
        if (select && availablePermissions) {
            setSelectedPerms(new Set(availablePermissions));
        } else {
            setSelectedPerms(new Set());
        }
    };

    const toggleGroupSelection = (permissions: Permission[], select: boolean) => {
        setSelectedPerms(prev => {
            const newSet = new Set(prev);
            permissions.forEach(p => {
                if (select) {
                    newSet.add(p.id);
                } else {
                    newSet.delete(p.id);
                }
            });
            return newSet;
        });
    };

    const handleSave = async () => {
        if (!id) return;
        try {
            await updateRoleMutation.mutateAsync({
                id,
                permissions: Array.from(selectedPerms)
            });
            // Show toast instead of navigating away
            toast.success("Permissions updated successfully");
        } catch (error) {
            console.error("Failed to save permissions", error);
            toast.error("Failed to update permissions");
        }
    };

    if (roleLoading || permsLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading permissions...</div>;
    }

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground leading-none truncate font-mono uppercase tracking-widest text-primary">Role Permissions</h2>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs rounded-sm" onClick={() => toggleAll(true)}>
                        Select All
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs rounded-sm" onClick={() => toggleAll(false)}>
                        Uncheck All
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm ml-2" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button 
                        size="sm" 
                        className="h-8 text-xs rounded-sm gap-2" 
                        onClick={handleSave}
                        disabled={updateRoleMutation.isPending}
                    >
                        {updateRoleMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        {updateRoleMutation.isPending ? "Saving..." : "Save Permissions"}
                    </Button>
                </div>
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group, groupIdx) => (
                    <div key={group.module} className="border border-border rounded-sm bg-card overflow-hidden shadow-sm flex flex-col">
                        <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">{group.module}</h3>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => toggleGroupSelection(group.permissions, true)}
                                >
                                    All
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] px-2"
                                    onClick={() => toggleGroupSelection(group.permissions, false)}
                                >
                                    None
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 space-y-2 flex-1">
                            {group.permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-2 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border"
                                    onClick={() => togglePermission(permission.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {permission.enabled ? (
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className={`text-sm ${permission.enabled ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                            {permission.label}
                                        </span>
                                    </div>
                                    <Checkbox
                                        checked={permission.enabled}
                                        onCheckedChange={() => togglePermission(permission.id)}
                                        className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border border-dashed border-border rounded-sm bg-primary/5">
                <p className="text-[10px] text-muted-foreground leading-relaxed text-center italic">
                    Note: Changes to role permissions will take effect for all assigned users upon their next session initialization.
                </p>
            </div>
        </div>
    );
};

export default RoleDetail;