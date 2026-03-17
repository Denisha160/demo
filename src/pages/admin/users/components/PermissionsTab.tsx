import { useState, useEffect, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Circle, Building2, Save, Loader2 } from "lucide-react";
import { UserDetailData } from "@/types/user";
import { Company } from "@/types/company";
import { useCompanies } from "@/hooks/useCompanies";
import { useRoles, useAvailablePermissions } from "@/hooks/useRoles";
import { useUpdateUserPermissions } from "@/hooks/useUsers";

interface PermissionsTabProps {
    userData: UserDetailData;
    setUserData: (data: UserDetailData) => void;
    initialCompanyRoles: Record<string, string>;
    companyRoles: Record<string, string>;
    setCompanyRoles: (roles: Record<string, string>) => void;
}

const PermissionsTab = ({
    userData, setUserData, initialCompanyRoles, companyRoles, setCompanyRoles
}: PermissionsTabProps) => {
    // Fetch dynamic companies
    const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies();
    const companiesList = companiesData?.items || [];
    const dynamicCompanies = companiesList.map((c: Company) => c.display_name || c.legal_name);

    // State to track which company tab is currently being viewed
    const [activeCompany, setActiveCompany] = useState<string>("");

    // Fetch roles
    const { data: rolesData, isLoading: isLoadingRoles } = useRoles();
    const rolesList = rolesData?.items || [];

    // Fetch master permissions
    const { data: availablePermissions, isLoading: isLoadingPermissions } = useAvailablePermissions();

    // Set first company active automatically on load
    useEffect(() => {
        if (dynamicCompanies.length > 0 && !activeCompany) {
            setActiveCompany(dynamicCompanies[0]);
        }
    }, [dynamicCompanies, activeCompany]);

    const handleToggleCompany = (company: string, enabled: boolean) => {
        const newRoles = { ...companyRoles };
        if (enabled) {
            newRoles[company] = rolesList[0]?.name || "User"; // Assign default role
        } else {
            delete newRoles[company]; // Remove user from this company
        }
        setCompanyRoles(newRoles);
    };

    const handleRoleSelect = (company: string, roleName: string) => {
        setCompanyRoles({ ...companyRoles, [company]: roleName });
    };

    const selectedRoleName = companyRoles[activeCompany];
    const selectedRole = rolesList.find(r => r.name === selectedRoleName);
    const selectedPermsHash = selectedRole?.permissions?.join(',') || '';

    const updatePermissionsMutation = useUpdateUserPermissions();
    const isDirty = JSON.stringify(companyRoles) !== JSON.stringify(initialCompanyRoles);

    const handleSave = () => {
        const allocations: { company_id: string; role_id: string }[] = [];
        for (const [companyName, roleName] of Object.entries(companyRoles)) {
            const company = companiesList.find((c: Company) => (c.display_name || c.legal_name) === companyName);
            const role = rolesList.find(r => r.name === roleName);
            if (company && role) {
                allocations.push({ company_id: company.id, role_id: role.id });
            }
        }
        updatePermissionsMutation.mutate({ id: userData.id, allocations });
    };



    const groups = useMemo(() => {
        if (!availablePermissions) return [];
        const groupMap: Record<string, { id: string, label: string, enabled: boolean }[]> = {};
        const permsSet = new Set(selectedRole?.permissions || []);

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
                enabled: permsSet.has(perm)
            });
        });

        return Object.entries(groupMap).map(([module, permissions]) => ({
            module: module.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            permissions
        }));
    }, [availablePermissions, selectedRole?.permissions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Roles & Companies Selection */}
            <div className="space-y-4">
                <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Building2 className="h-4 w-4 text-primary" /> Companies & Roles
                    </h3>

                    {isLoadingCompanies || isLoadingRoles ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dynamicCompanies.map((company: string) => {
                                const isCompanyEnabled = !!companyRoles[company];
                                const isActiveTab = activeCompany === company;

                                return (
                                    <div
                                        key={company}
                                        className={`p-3 border rounded-sm transition-all ${isActiveTab ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border bg-background'
                                            }`}
                                    >
                                        {/* Company Toggle Header */}
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => setActiveCompany(company)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={isCompanyEnabled}
                                                    onCheckedChange={(checked) => handleToggleCompany(company, checked === true)}
                                                    onClick={(e) => e.stopPropagation()} // Prevent triggering the outer div click
                                                />
                                                <span className={`font-bold text-sm ${isActiveTab ? "text-primary" : "text-foreground"}`}>
                                                    {company}
                                                </span>
                                            </div>

                                            {companyRoles[company] !== initialCompanyRoles[company] && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSave();
                                                    }}
                                                    disabled={updatePermissionsMutation.isPending}
                                                    className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
                                                    title="Save Changes"
                                                >
                                                    {updatePermissionsMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                                </Button>
                                            )}
                                        </div>

                                        {/* Role Selection List (Only shows if company is clicked/active) */}
                                        {isActiveTab && (
                                            <div className="mt-4 pt-4 border-t border-border space-y-2">
                                                {!isCompanyEnabled ? (
                                                    <p className="text-xs text-muted-foreground pb-2">
                                                        Check the box above to assign a role in {company}.
                                                    </p>
                                                ) : rolesList.length === 0 ? (
                                                    <p className="text-xs text-muted-foreground pb-2">
                                                        No roles found. Please create roles first.
                                                    </p>
                                                ) : (
                                                    rolesList.map((role) => {
                                                        const isRoleSelected = companyRoles[company] === role.name;
                                                        return (
                                                            <div
                                                                key={role.id}
                                                                onClick={() => handleRoleSelect(company, role.name)}
                                                                className={`flex items-start gap-3 p-2.5 rounded-sm border cursor-pointer transition-all ${isRoleSelected
                                                                    ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                                                    : 'bg-background border-border hover:border-primary/50'
                                                                    }`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs font-bold leading-none ${isRoleSelected ? "text-primary-foreground" : "text-foreground"}`}>
                                                                        {role.name}
                                                                    </p>
                                                                </div>
                                                                {isRoleSelected && <CheckCircle2 className="h-3 w-3" />}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Permissions Display & Save Button */}
            <div className="lg:col-span-2 flex flex-col gap-2">
                <div className="p-5 border border-border rounded-sm bg-card shadow-sm flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Permissions for {activeCompany}
                        </h3>
                        <div className="flex items-center gap-3">
                            {companyRoles[activeCompany] && (
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary font-semibold rounded-sm">
                                    Role: {companyRoles[activeCompany]}
                                </span>
                            )}
                        </div>
                    </div>

                    {!companyRoles[activeCompany] ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm border border-dashed border-border rounded-sm bg-muted/10">
                            User is not assigned to {activeCompany}.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {isLoadingPermissions ? (
                                <div className="col-span-full flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                            ) : (
                                groups.map((group) => (
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
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PermissionsTab;