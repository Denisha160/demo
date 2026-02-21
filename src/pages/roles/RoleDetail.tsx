import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Shield, CheckCircle2, Circle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
    id: string;
    label: string;
    enabled: boolean;
}

interface PermissionGroup {
    module: string;
    permissions: Permission[];
}

const initialGroups: PermissionGroup[] = [
    {
        module: "Contacts",
        permissions: [
            { id: "contacts-read", label: "View Contacts", enabled: true },
            { id: "contacts-create", label: "Create Contacts", enabled: true },
            { id: "contacts-update", label: "Edit Contacts", enabled: true },
            { id: "contacts-delete", label: "Delete Contacts", enabled: false },
        ]
    },
    {
        module: "Leads",
        permissions: [
            { id: "leads-read", label: "View Leads", enabled: true },
            { id: "leads-create", label: "Create Leads", enabled: true },
            { id: "leads-update", label: "Edit Leads", enabled: true },
            { id: "leads-delete", label: "Delete Leads", enabled: false },
        ]
    },
    {
        module: "Products",
        permissions: [
            { id: "products-read", label: "View Products", enabled: true },
            { id: "products-create", label: "Create Products", enabled: false },
            { id: "products-update", label: "Edit Products", enabled: false },
            { id: "products-delete", label: "Delete Products", enabled: false },
        ]
    },
    {
        module: "Users & Roles",
        permissions: [
            { id: "users-manage", label: "Manage Users", enabled: false },
            { id: "roles-manage", label: "Manage Roles", enabled: false },
        ]
    }
];

const RoleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<PermissionGroup[]>(initialGroups);

    const togglePermission = (groupId: number, permissionId: string) => {
        setGroups(groups.map((g, i) => {
            if (i === groupId) {
                return {
                    ...g,
                    permissions: g.permissions.map(p =>
                        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
                    )
                };
            }
            return g;
        }));
    };

    const handleSave = () => {
        // Logic to save permissions to backend
        alert("Permissions saved successfully!");
        navigate("/roles");
    };

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                        onClick={() => navigate("/roles")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-foreground leading-none truncate font-mono uppercase tracking-widest text-primary">Role Permissions</h2>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Configuring access for Role ID: {id || "N/A"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm" onClick={() => navigate("/roles")}>
                        Cancel
                    </Button>
                    <Button size="sm" className="h-8 text-xs rounded-sm gap-2" onClick={handleSave}>
                        <Save className="h-3.5 w-3.5" /> Save Permissions
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
                        </div>
                        <div className="p-4 space-y-2 flex-1">
                            {group.permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-2 rounded-sm hover:bg-muted/30 transition-colors cursor-pointer border border-transparent hover:border-border"
                                    onClick={() => togglePermission(groupIdx, permission.id)}
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
                                        onCheckedChange={() => togglePermission(groupIdx, permission.id)}
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
