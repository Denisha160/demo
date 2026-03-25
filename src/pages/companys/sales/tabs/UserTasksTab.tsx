import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { CalendarDays, ClipboardList, Search } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { useLeadTasks } from "@/hooks/useLeadTasks";

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "DONE": return "success";
    case "TODO": return "default";
    case "IN_PROGRESS": return "info";
    default: return "default";
  }
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "HIGH": return "destructive";
    case "MEDIUM": return "warning";
    case "LOW": return "success";
    default: return "default";
  }
};

interface UserTasksTabProps {
  userId: string;
}

const UserTasksTab = ({ userId }: UserTasksTabProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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

  const { data: tasks = [], isLoading } = useLeadTasks("all", {
    user_id: userId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    limit,
    offset: (page - 1) * limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const tasksArray = Array.isArray(tasks) ? tasks : [];
  const serverTotal = tasksArray.length === limit ? page * limit + 1 : (page - 1) * limit + tasksArray.length;

  const columns: Column<any>[] = [
    {
      key: "due_date",
      header: "Due Date",
      render: (item) => (
        <div className="flex items-start gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium text-foreground">{formatDateTime(item.due_date)}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Task Details",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground mr-1" />
            {item.title}
          </span>
          {item.lead_name && <span className="text-xs text-primary font-medium mt-1">Lead: {item.lead_name}</span>}
          <span className="line-clamp-2 text-xs text-muted-foreground">{item.description || "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status & Priority",
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.status.replace(/_/g, " ")} variant={getStatusVariant(item.status)} />
          <div className="mt-1">
            <StatusBadge status={item.priority.replace(/_/g, " ")} variant={getPriorityVariant(item.priority)} />
          </div>
        </div>
      ),
    },
    {
      key: "assigned",
      header: "Assignment",
      render: (item) => (
        <div className="flex flex-col text-[11px] text-muted-foreground">
          <span>Assigned to: <span className="text-foreground font-medium">{item.assigned_to_name || "-"}</span></span>
          <span className="mt-0.5">Created by: {item.created_by_name || "-"}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-2 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-[260px]" placeholder="Filter by due date" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="h-9 w-[260px] pl-9 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>
      <DataTable columns={columns} data={tasksArray} isLoading={isLoading} serverSide={true} serverPage={page} pageSize={limit} serverTotal={serverTotal} onServerPageChange={setPage} onServerPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }} />
    </div>
  );
};

export default UserTasksTab;
