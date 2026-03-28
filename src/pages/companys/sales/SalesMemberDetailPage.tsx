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
} from "lucide-react";
import { useUser, useUserHierarchy } from "@/hooks/useUsers";
import { useState, useMemo, useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { User } from "@/types/user";
import UserVisitsTab from "./tabs/UserVisitsTab";
import UserFollowUpsTab from "./tabs/UserFollowUpsTab";
import UserTasksTab from "./tabs/UserTasksTab";
import UserActivitiesTab from "./tabs/UserActivitiesTab";

const getInitials = (name: string) =>
  (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
];

type TabKey = "visits" | "followups" | "tasks" | "activity";
const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "visits", label: "Visits", icon: MapPin },
  { key: "followups", label: "Follow-ups", icon: Clock },
  { key: "tasks", label: "Tasks", icon: ClipboardList },
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
  const activeTabClass = tab || "visits";

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

  const colorIdx = (user?.name || "").charCodeAt(0) % GRADIENTS.length;

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
          <div
            className={`h-16 w-16 rounded-full bg-gradient-to-br ${GRADIENTS[colorIdx]} flex items-center justify-center text-white text-xl font-bold shrink-0 shadow`}
          >
            {getInitials(user.name)}
          </div>
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

      <div className="bg-card border border-border rounded-sm shadow-sm flex flex-col">
        <div className="flex border-b border-border bg-muted/10 px-2 pt-2 overflow-x-auto custom-scrollbar">
          {TABS.map((t) => (
            <Link
              key={t.key}
              to={`/${companyId}/sales/${userId}/${t.key}`}
              className={`flex items-center whitespace-nowrap gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTabClass === t.key
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-sm"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Link>
          ))}
        </div>

        {/* Tab Content */}
        {activeTabClass === "visits" && (
          <UserVisitsTab userId={selectedUserId} />
        )}
        {activeTabClass === "followups" && (
          <UserFollowUpsTab userId={selectedUserId} />
        )}
        {activeTabClass === "tasks" && (
          <UserTasksTab userId={selectedUserId} />
        )}
        {activeTabClass === "activity" && (
          <UserActivitiesTab userId={selectedUserId} />
        )}
      </div>
    </div>
  );
};

export default SalesMemberDetailPage;
