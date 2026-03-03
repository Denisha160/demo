import { Checkbox } from "@/components/ui/checkbox";
import { Shield, CheckCircle2, Circle } from "lucide-react";
import { UserDetailData } from "@/types/user";

interface PermissionsTabProps {
    userData: UserDetailData;
    setUserData: (data: UserDetailData) => void;
    userRole: string;
    setUserRole: (role: string) => void;
    initialRoles: { id: number | string; name: string; description: string }[];
}

const getRolePermissions = (roleName: string) => {
    return [
        {
            module: "Contacts",
            permissions: [
                { id: "contacts-read", label: "View Contacts", enabled: true },
                { id: "contacts-create", label: "Create Contacts", enabled: roleName === "Admin" || roleName === "Manager" },
                { id: "contacts-update", label: "Edit Contacts", enabled: roleName === "Admin" || roleName === "Manager" },
                { id: "contacts-delete", label: "Delete Contacts", enabled: roleName === "Admin" },
            ]
        },
        {
            module: "Leads",
            permissions: [
                { id: "leads-read", label: "View Leads", enabled: true },
                { id: "leads-create", label: "Create Leads", enabled: roleName === "Admin" || roleName === "Manager" || roleName === "User" || roleName === "Dealer" },
                { id: "leads-update", label: "Edit Leads", enabled: roleName === "Admin" || roleName === "Manager" },
                { id: "leads-delete", label: "Delete Leads", enabled: roleName === "Admin" },
            ]
        },
        {
            module: "Products",
            permissions: [
                { id: "products-read", label: "View Products", enabled: true },
                { id: "products-create", label: "Create Products", enabled: roleName === "Admin" },
                { id: "products-update", label: "Edit Products", enabled: roleName === "Admin" },
                { id: "products-delete", label: "Delete Products", enabled: roleName === "Admin" },
            ]
        },
        {
            module: "Users & Roles",
            permissions: [
                { id: "users-manage", label: "Manage Users", enabled: roleName === "Admin" || roleName === "HR" },
                { id: "roles-manage", label: "Manage Roles", enabled: roleName === "Admin" },
            ]
        }
    ];
};

const PermissionsTab = ({
    userData, setUserData, userRole, setUserRole, initialRoles
}: PermissionsTabProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles Selection */}
            <div className="space-y-4">
                <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Shield className="h-4 w-4 text-primary" /> Assign Role
                    </h3>
                    <div className="space-y-2">
                        {initialRoles.map((role) => {
                            const isSelected = role.name === userRole;
                            return (
                                <div
                                    key={role.id}
                                    onClick={() => {
                                        setUserRole(role.name);
                                        setUserData({ ...userData, role: role.name });
                                    }}
                                    className={`flex items-start gap-3 p-3 rounded-sm border cursor-pointer transition-all ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className="mt-0.5">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => {
                                                setUserRole(role.name);
                                                setUserData({ ...userData, role: role.name });
                                            }}
                                            className={isSelected ? 'bg-primary border-primary text-primary-foreground' : ''}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm font-bold leading-none ${isSelected ? "text-primary" : "text-foreground"}`}>
                                                {role.name}
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                                            {role.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Role Permissions Display */}
            <div className="lg:col-span-2 space-y-4">
                <div className="p-5 border border-border rounded-sm bg-card shadow-sm h-full">
                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Shield className="h-4 w-4 text-primary" /> Permissions for {userRole}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getRolePermissions(userRole).map((group) => (
                            <div key={group.module} className="border border-border rounded-sm bg-muted/10 overflow-hidden">
                                <div className="px-3 py-2 border-b border-border bg-muted/30">
                                    <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest">{group.module}</h4>
                                </div>
                                <div className="p-3 space-y-2">
                                    {group.permissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center gap-3 p-1.5 rounded-sm bg-background border border-border">
                                            {permission.enabled ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                            ) : (
                                                <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                                            )}
                                            <span className={`text-xs ${permission.enabled ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                                {permission.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsTab;
