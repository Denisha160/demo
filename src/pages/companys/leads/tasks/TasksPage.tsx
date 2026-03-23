import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAllTasks } from "@/hooks/useLeadTasks";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { useLeads } from "@/hooks/useLeads";

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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [status, setStatus] = useState("");
  const [leadId, setLeadId] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { data: leadsData = [] } = useLeads({ limit: 100 });
  const leadOptions = useMemo(() => {
    return leadsData.map((l: any) => ({ value: l.id, label: l.name || l.title || "Unknown Lead" }));
  }, [leadsData]);

  const filters = useMemo(() => {
    const f: any = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
    if (debouncedSearch) f.search = debouncedSearch;
    if (status) f.status = status;
    if (leadId) f.lead_id = leadId;
    return f;
  }, [debouncedSearch, status, leadId, page, pageSize]);

  const { data: tasks = [], isLoading } = useAllTasks(filters);

  const serverTotal = tasks.length === pageSize ? page * pageSize + 1 : (page - 1) * pageSize + tasks.length;

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Task",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.title}</span>
          <span className="line-clamp-1 text-[10px] text-muted-foreground">{item.description}</span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge status={item.priority?.toUpperCase() || "NORMAL"} variant={getPriorityVariant(item.priority || "NORMAL")} />
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (item) => <span className="text-sm">{item.assigned_to_name || item.assigned_to || "Unassigned"}</span>,
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item) => <span className="text-sm">{formatDate(item.due_date)}</span>,
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
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;