import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ClipboardList,
  PersonStanding,
  Phone,
  Mail,
  Briefcase,
  AlertCircle,
  Activity,
  FileText,
} from "lucide-react";
import { useUser, useUserHierarchy } from "@/hooks/useUsers";
import { useState, useMemo, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/user";
import UserVisitsTab from "./tabs/UserVisitsTab";
import UserFollowUpsTab from "./tabs/UserFollowUpsTab";
import UserTasksTab from "./tabs/UserTasksTab";
import UserActivitiesTab from "./tabs/UserActivitiesTab";
import UserLeadsTab from "./tabs/UserLeadsTab";
import UserQuotationsTab from "./tabs/UserQuotationsTab";

const getInitials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

type TabKey = "leads" | "visits" | "followups" | "tasks" | "quotations" | "activity";
const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "leads", label: "Leads", icon: Briefcase },
  { key: "visits", label: "Visits", icon: MapPin },
  { key: "followups", label: "Follow-ups", icon: Clock },
  { key: "tasks", label: "Tasks", icon: ClipboardList },
  { key: "quotations", label: "Quotations", icon: FileText },
  { key: "activity", label: "Log", icon: Activity },
];

interface HierarchyNode {
  id: string;
  name: string;
  children?: HierarchyNode[];
}

const flattenHierarchy = (
  node: HierarchyNode,
  result: { value: string; label: string }[] = [],
) => {
  if (!node) return result;
  result.push({ value: node.id, label: node.name });
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: HierarchyNode) =>
      flattenHierarchy(child, result),
    );
  }
  return result;
};

const SalesMemberDetailPage = () => {
  const { companyId, userId, tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || "leads";

  const handleTabChange = (value: string) => {
    navigate(`/${companyId}/sales/${userId}/${value}`);
  };

  const { data: userData, isLoading: userLoading } = useUser(userId || "");
  const { data: hierarchyData, isLoading: hierarchyLoading } = useUserHierarchy(
    userId || "",
  );

  const [selectedUserId, setSelectedUserId] = useState<string>(userId || "");

  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  const user =
    (userData as any)?.data?.user ||
    (userData as any)?.user ||
    (userData as any)?.data ||
    (userData as User);

  const hierarchyOptions = useMemo(() => {
    if (!hierarchyData) return [];
    return flattenHierarchy(hierarchyData);
  }, [hierarchyData]);

  const selectedUserName = useMemo(() => {
    return hierarchyOptions.find((opt) => opt.value === selectedUserId)?.label;
  }, [hierarchyOptions, selectedUserId]);

  if (userLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-muted/40 rounded-sm" />
        <div className="h-32 bg-muted/40 rounded-sm" />
        <div className="h-[400px] bg-muted/40 rounded-sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <AlertCircle className="h-10 w-10 mb-2 opacity-30" />
        <p className="text-sm font-medium">Member not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-primary mt-2 underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/${companyId}/sales`)}
            className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Member Activity
            </h1>
            <p className="text-xs text-muted-foreground">
              Overall activity layout for{" "}
              <span className="font-medium text-foreground">
                {selectedUserName || user.name}
              </span>
            </p>
          </div>
        </div>

        {hierarchyOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Viewing:
            </span>
            <Combobox
              options={hierarchyOptions}
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              placeholder="Select user..."
              className="w-[200px]"
            />
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-sm p-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {user.image_url ? (
            <img
              src={user.image_url}
              alt={user.name}
              className="h-16 w-16 rounded-sm object-cover shrink-0 shadow border border-border"
            />
          ) : (
            <div className="h-16 w-16 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xl font-bold shrink-0 border border-primary/20 shadow-sm">
              {getInitials(user.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {user.name}
                </h2>
                {user.department && (
                  <p className="text-sm text-muted-foreground">
                    {user.department}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 text-xs px-2.5 py-1 rounded-sm font-medium ${user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone_number && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                  <span>{user.phone_number}</span>
                </div>
              )}
              {user.employee_code && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PersonStanding className="h-4 w-4 shrink-0 text-primary/60" />
                  <span>ID: {user.employee_code}</span>
                </div>
              )}
              {user.work_shift && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 shrink-0 text-primary/60" />
                  <span className="capitalize">{user.work_shift} shift</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full flex flex-col"
      >
        <TabsList className="flex flex-nowrap h-auto w-full justify-start bg-transparent border-b border-border rounded-none pb-0 mb-4 gap-1 px-2 overflow-x-auto custom-scrollbar">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold transition-all duration-200"
            >
              <t.icon className="h-4 w-4 mr-2" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500 px-2">
          <TabsContent value="leads" className="m-0 focus-visible:outline-none">
            <UserLeadsTab userId={selectedUserId} />
          </TabsContent>
          <TabsContent
            value="visits"
            className="m-0 focus-visible:outline-none"
          >
            <UserVisitsTab userId={selectedUserId} />
          </TabsContent>
          <TabsContent
            value="followups"
            className="m-0 focus-visible:outline-none"
          >
            <UserFollowUpsTab userId={selectedUserId} />
          </TabsContent>
          <TabsContent value="tasks" className="m-0 focus-visible:outline-none">
            <UserTasksTab userId={selectedUserId} />
          </TabsContent>
          <TabsContent
            value="quotations"
            className="m-0 focus-visible:outline-none"
          >
            <UserQuotationsTab userId={selectedUserId} />
          </TabsContent>
          <TabsContent
            value="activity"
            className="m-0 focus-visible:outline-none"
          >
            <UserActivitiesTab userId={selectedUserId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SalesMemberDetailPage;
