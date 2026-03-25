import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Users, ChevronRight, Activity, Box, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/hooks/useUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { useLeads } from "@/hooks/useLeads";

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
];

const SalesPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: usersData, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    limit: 100,
  });
  const { data: allLeads = [] } = useLeads({ limit: 100 });

  const users: any[] = usersData?.items || [];
  const leads = allLeads as any[];

  const getUserLeads = (uid: string) => leads.filter((l) => l.assigned_to === uid);
  const getHot = (uid: string) => getUserLeads(uid).filter((l) => l.priority === "HOT").length;
  const getOpen = (uid: string) => getUserLeads(uid).filter((l) => !["CLOSED", "LOST"].includes(l.status_name?.toUpperCase() || "")).length;

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Sales Team
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {users.length} member{users.length !== 1 ? "s" : ""} · click to view their full lead activity
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Members", value: users.length, icon: Users, color: "text-primary bg-primary/10" },
          { label: "Total Leads", value: leads.length, icon: Box, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/30" },
          { label: "Hot Leads", value: leads.filter((l) => l.priority === "HOT").length, icon: TrendingUp, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/30" },
          { label: "Avg / Member", value: users.length ? Math.round(leads.length / users.length) : 0, icon: Activity, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-sm p-3 flex items-center gap-3">
            <div className={`h-8 w-8 rounded-sm flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold leading-none">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input className="pl-8 h-8 text-sm rounded-sm" placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-muted/40 rounded-sm animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((user, idx) => {
            const totalLeads = getUserLeads(user.id).length;
            const hotLeads = getHot(user.id);
            const openLeads = getOpen(user.id);
            const assignments: { company: string; role: string }[] = user.role_assignments ?? [];
            const gradient = GRADIENTS[idx % GRADIENTS.length];

            return (
              <button
                key={user.id}
                onClick={() => navigate(`/${companyId}/sales/${user.id}`)}
                className="group bg-card border border-border rounded-sm p-4 text-left hover:border-primary/40 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 space-y-3"
              >
                {/* Avatar + name */}
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{user.name}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                    {user.department && <p className="text-[10px] text-muted-foreground/70">{user.department}</p>}
                  </div>
                </div>

                {/* Roles */}
                {assignments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {assignments.slice(0, 2).map((a, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-medium truncate max-w-[110px]" title={`${a.company} · ${a.role}`}>
                        {a.role}
                      </span>
                    ))}
                    {assignments.length > 2 && <span className="text-[10px] text-muted-foreground">+{assignments.length - 2}</span>}
                  </div>
                )}

                {/* Lead stats */}
                <div className="flex items-center gap-3 border-t border-border/60 pt-2.5">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Box className="h-3 w-3 text-violet-500" />
                    <span><span className="font-semibold">{totalLeads}</span> <span className="text-muted-foreground">total</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <TrendingUp className="h-3 w-3 text-rose-500" />
                    <span><span className="font-semibold">{hotLeads}</span> <span className="text-muted-foreground">hot</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Activity className="h-3 w-3 text-emerald-500" />
                    <span><span className="font-semibold">{openLeads}</span> <span className="text-muted-foreground">open</span></span>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${user.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesPage;
