import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { CalendarDays, Clock, Search, Phone, Mail, User } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { useLeadFollowUps } from "@/hooks/useLeadFollowUps";

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED": return "success";
    case "PENDING": return "warning";
    default: return "default";
  }
};

const getMethodIcon = (method: string) => {
  switch (method) {
    case "CALL": return <Phone className="h-3.5 w-3.5" />;
    case "EMAIL": return <Mail className="h-3.5 w-3.5" />;
    case "IN_PERSON": return <User className="h-3.5 w-3.5" />;
    default: return <Clock className="h-3.5 w-3.5" />;
  }
};

interface UserFollowUpsTabProps {
  userId: string;
}

const UserFollowUpsTab = ({ userId }: UserFollowUpsTabProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        if (page > 1) next.set("page", page.toString());
        else next.delete("page");
        if (limit !== 10) next.set("limit", limit.toString());
        else next.delete("limit");
        return next;
      },
      { replace: true }
    );
  }, [debouncedSearch, page, limit, setSearchParams]);

  const { data: followups = [], isLoading } = useLeadFollowUps("all", {
    user_id: userId,
    limit,
    offset: (page - 1) * limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const followupsArray = Array.isArray(followups) ? followups : [];
  const serverTotal = followupsArray.length === limit ? page * limit + 1 : (page - 1) * limit + followupsArray.length;

  const columns: Column<any>[] = [
    {
      key: "scheduled_at",
      header: "Follow-up Date",
      render: (item) => (
        <div className="flex items-start gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium text-foreground">{formatDateTime(item.scheduled_at)}</span>
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Purpose / Lead",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{item.purpose || "Follow-up"}</span>
          {item.lead_name && <span className="text-xs text-primary font-medium">Lead: {item.lead_name}</span>}
          <span className="line-clamp-2 text-xs text-muted-foreground">{item.remarks || "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.status.replace(/_/g, " ")} variant={getStatusVariant(item.status)} />
        </div>
      ),
    },
    {
      key: "follow_up_method",
      header: "Method",
      render: (item) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          {getMethodIcon(item.follow_up_method)}
          <span className="text-[11px] capitalize">{item.follow_up_method?.replace(/_/g, " ").toLowerCase() || "Unknown"}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-2 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search follow-ups..." className="h-9 w-[260px] pl-9 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>
      <DataTable columns={columns} data={followupsArray} isLoading={isLoading} serverSide={true} serverPage={page} pageSize={limit} serverTotal={serverTotal} onServerPageChange={setPage} onServerPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }} />
    </div>
  );
};

export default UserFollowUpsTab;
