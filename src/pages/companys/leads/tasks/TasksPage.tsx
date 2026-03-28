import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAllTasks } from "@/hooks/useLeadTasks";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { useLeads } from "@/hooks/useLeads";
import { useCurrentUser } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "TODO", label: "To Do" },
  { value: "CANCELLED", label: "Cancelled" },
];

const formatDate = (value?: string) => {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "destructive";
    case "HIGH":
      return "warning";
    case "MEDIUM":
      return "info";
    case "LOW":
      return "success";
    default:
      return "default";
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
    case "IN_REVIEW":
      return "info";
    case "TODO":
      return "warning";
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
};

const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") || "";
  const leadId = searchParams.get("lead_id") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "15", 10);

  const assignedTo = searchParams.get("assigned_to") || "";
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  const updateParam = (key: string, value: string | number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, String(value));
        else next.delete(key);
        if (key !== "page" && key !== "limit") {
          next.set("page", "1");
        }
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateParam("search", debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const setStatus = (v: string) => updateParam("status", v);
  const setLeadId = (v: string) => updateParam("lead_id", v);
  const setAssignedTo = (v: string) => updateParam("assigned_to", v);
  const setPage = (p: number) => updateParam("page", p);
  const setPageSize = (s: number) => updateParam("limit", s);

  const clearFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const limit = prev.get("limit");
        if (limit) next.set("limit", limit);
        next.set("page", "1");
        return next;
      },
      { replace: true },
    );
    setSearchTerm("");
  };

  const { data: usersResponse } = useUsers({ limit: 100 });
  const users = (usersResponse as any)?.items || (usersResponse as any) || [];
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));
  const currentUser = useCurrentUser();
  const isRoot = !!currentUser?.is_root_user;

  const { data: leadsDataRaw = [] } = useLeads({ limit: 100 });
  const leadOptions = useMemo(() => {
    const leadsData = (leadsDataRaw as any)?.items || leadsDataRaw || [];
    return (leadsData as any[]).map((l: any) => ({
      value: l.id,
      label: l.name || l.title || "Unknown Lead",
    }));
  }, [leadsDataRaw]);

  const filters = useMemo(() => {
    const f: any = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
    if (debouncedSearch) f.search = debouncedSearch;
    if (status) f.status = status;
    if (leadId) f.lead_id = leadId;
    if (assignedTo) f.assigned_to = assignedTo;
    return f;
  }, [debouncedSearch, status, leadId, assignedTo, page, pageSize]);

  const { data: tasks = [], isLoading } = useAllTasks(filters);

  const serverTotal =
    tasks.length === pageSize
      ? page * pageSize + 1
      : (page - 1) * pageSize + tasks.length;

  const columns: Column<any>[] = [
    {
      key: "lead_name",
      header: "Lead name",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.lead_name || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Task",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.title}</span>
          <span className="line-clamp-1 text-[10px] text-muted-foreground">
            {item.description}
          </span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge
          status={item.priority?.toUpperCase() || "NORMAL"}
          variant={getPriorityVariant(item.priority || "NORMAL")}
        />
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (item) => (
        <span className="text-sm">
          {item.assigned_to_name || item.assigned_to || "Unassigned"}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item) => (
        <span className="text-sm">{formatDate(item.due_date)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status?.replace("_", " ").toUpperCase() || "PENDING"}
          variant={getStatusVariant(item.status || "TODO")}
        />
      ),
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="mx-auto flex h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in flex-col overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search tasks..."
              className="h-9 rounded-sm pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-[180px]">
            <Combobox
              options={STATUS_OPTIONS}
              value={status}
              onValueChange={setStatus}
              placeholder="Filter by status"
              clearable
            />
          </div>
          <div className="w-[200px]">
            <Combobox
              options={leadOptions}
              value={leadId}
              onValueChange={setLeadId}
              placeholder="Filter by lead"
              searchPlaceholder="Search leads..."
              clearable
            />
          </div>
          {isRoot && (
            <div className="w-[180px]">
              <Combobox
                options={userOptions}
                value={assignedTo}
                onValueChange={setAssignedTo}
                placeholder="All Users"
                clearable
              />
            </div>
          )}
          {(searchTerm || status || leadId || assignedTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-2 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pt-2">
        <div className="h-full overflow-auto bg-card rounded-sm border border-border/40 shadow-sm">
          <DataTable
            data={tasks}
            columns={columns}
            isLoading={isLoading}
            serverSide={true}
            serverTotal={serverTotal}
            serverPage={page}
            pageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={setPageSize}
            onRowClick={(item) =>
              navigate(`/companys/leads/${item.lead_id}?tab=tasks`)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
