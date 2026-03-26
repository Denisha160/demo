import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Shield,
  CheckCircle2,
  Circle,
  Loader2,
  Package,
  Users,
  Warehouse,
  Briefcase,
  Key,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useRoleDetails,
  useAvailablePermissions,
  useUpdateRole,
} from "@/hooks/useRoles";
import { toast } from "react-toastify";

interface Permission {
  id: string;
  label: string;
  enabled: boolean;
}

interface PermissionGroup {
  module: string;
  moduleKey: string;
  permissions: Permission[];
}

interface Category {
  label: string;
  icon: React.ReactNode;
  moduleKeys: string[]; // use "__other__" to catch all remaining
}

const CATEGORIES: Category[] = [
  {
    label: "Leads",
    icon: <Briefcase className="h-3.5 w-3.5" />,
    moduleKeys: [
      "lead",
      "lead-status",
      "lead-source",
      "lead-contact",
      "lead-followup",
      "lead-task",
      "lead-visit",
      "lead-attachment",
      "lead-reminder",
      "lead-activity",
      "lead-tag",
      "lead-interested-product",
      "lead-verification",
    ],
  },
  {
    label: "Products",
    icon: <Package className="h-3.5 w-3.5" />,
    moduleKeys: [
      "product",
      "product-category",
      "product-brand",
      "product-fragrance",
      "product-package",
      "product-kit",
      "product-bom",
      "product-interested",
      "product-image",
    ],
  },
  {
    label: "Inventory",
    icon: <Warehouse className="h-3.5 w-3.5" />,
    moduleKeys: ["inventory", "inventory-batch", "inventory-serial"],
  },
  {
    label: "Users & Roles",
    icon: <Users className="h-3.5 w-3.5" />,
    moduleKeys: ["user", "role"],
  },
  {
    label: "Other",
    icon: <Key className="h-3.5 w-3.5" />,
    moduleKeys: ["__other__"],
  },
];

const ALL_KNOWN_KEYS = new Set(
  CATEGORIES.flatMap((c) => c.moduleKeys).filter((k) => k !== "__other__"),
);

const RoleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: role, isLoading: roleLoading } = useRoleDetails(id);
  const { data: availablePermissions, isLoading: permsLoading } =
    useAvailablePermissions();
  const updateRoleMutation = useUpdateRole();

  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role?.permissions) {
      setSelectedPerms(new Set(role.permissions));
    }
  }, [role]);

  const allGroups: PermissionGroup[] = useMemo(() => {
    if (!availablePermissions) return [];
    const groupMap: Record<string, Permission[]> = {};

    availablePermissions.forEach((perm: string) => {
      const parts = perm.split(".");
      const moduleKey = parts[0] || "misc";
      const action = parts[1] || perm;

      if (!groupMap[moduleKey]) groupMap[moduleKey] = [];

      const formattedModule = moduleKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      groupMap[moduleKey].push({
        id: perm,
        label: `${action.charAt(0).toUpperCase() + action.slice(1)} ${formattedModule}`,
        enabled: selectedPerms.has(perm),
      });
    });

    return Object.entries(groupMap).map(([moduleKey, permissions]) => ({
      module: moduleKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      moduleKey,
      permissions,
    }));
  }, [availablePermissions, selectedPerms]);

  // Build ordered list of { category, groups[] } for rendering
  const sections = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const groups = allGroups.filter((g) =>
        cat.moduleKeys.includes("__other__")
          ? !ALL_KNOWN_KEYS.has(g.moduleKey)
          : cat.moduleKeys.includes(g.moduleKey),
      );
      return { ...cat, groups };
    }).filter((s) => s.groups.length > 0);
  }, [allGroups]);

  const togglePermission = (permissionId: string) => {
    setSelectedPerms((prev) => {
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
    setSelectedPerms((prev) => {
      const newSet = new Set(prev);
      permissions.forEach((p) => {
        if (select) {
          newSet.add(p.id);
        } else {
          newSet.delete(p.id);
        }
      });
      return newSet;
    });
  };

  const toggleCategorySelection = (
    groups: PermissionGroup[],
    select: boolean,
  ) => {
    const allPerms = groups.flatMap((g) => g.permissions);
    toggleGroupSelection(allPerms, select);
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateRoleMutation.mutateAsync({
        id,
        permissions: Array.from(selectedPerms),
      });
      // Show toast instead of navigating away
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Failed to save permissions", error);
      toast.error("Failed to update permissions");
    }
  };

  if (roleLoading || permsLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading permissions...
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-4 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
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
              <h2 className="text-sm font-bold leading-none truncate font-mono uppercase tracking-widest text-primary">
                Role Permissions
              </h2>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs rounded-sm"
            onClick={() => toggleAll(true)}
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs rounded-sm"
            onClick={() => toggleAll(false)}
          >
            Uncheck All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-sm ml-2"
            onClick={() => navigate(-1)}
          >
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

      {/* Permissions — grouped by category */}
      <div className="space-y-6">
        {sections.map((section) => {
          const totalInCat = section.groups.flatMap(
            (g) => g.permissions,
          ).length;
          const selectedInCat = section.groups
            .flatMap((g) => g.permissions)
            .filter((p) => p.enabled).length;

          return (
            <div key={section.label}>
              {/* Category heading */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{section.icon}</span>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    {section.label}
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                    {selectedInCat}/{totalInCat} selected
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-muted-foreground"
                    onClick={() =>
                      toggleCategorySelection(section.groups, true)
                    }
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-muted-foreground"
                    onClick={() =>
                      toggleCategorySelection(section.groups, false)
                    }
                  >
                    None
                  </Button>
                </div>
              </div>

              {/* Module cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {section.groups.map((group) => (
                  <div
                    key={group.moduleKey}
                    className="border border-border rounded-sm bg-card overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                          {group.module}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {group.permissions.filter((p) => p.enabled).length}/
                          {group.permissions.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() =>
                            toggleGroupSelection(group.permissions, true)
                          }
                        >
                          All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2"
                          onClick={() =>
                            toggleGroupSelection(group.permissions, false)
                          }
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 flex-1">
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
                            <span
                              className={`text-sm ${permission.enabled ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                            >
                              {permission.label}
                            </span>
                          </div>
                          <Checkbox
                            checked={permission.enabled}
                            onCheckedChange={() =>
                              togglePermission(permission.id)
                            }
                            className="rounded-sm border-muted-foreground/30 data-[state=checked]:bg-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border border-dashed border-border rounded-sm bg-primary/5">
        <p className="text-[10px] text-muted-foreground leading-relaxed text-center italic">
          Note: Changes to role permissions will take effect for all assigned
          users upon their next session initialization.
        </p>
      </div>
    </div>
  );
};

export default RoleDetail;
