import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAllTasks } from "@/hooks/useLeadTasks";

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

  const filters = useMemo(() => {
    const f: any = {};
    if (searchTerm) f.search = searchTerm;
    return f;
  }, [searchTerm]);

  const { data: tasks = [], isLoading } = useAllTasks(filters);

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
        <div className="relative flex-1 sm:max-w-[300px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search tasks..."
            className="h-9 rounded-sm pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pt-2">
        <div className="h-full overflow-auto bg-card rounded-sm border border-border/40 shadow-sm">
          <DataTable
            data={tasks}
            columns={columns}
            pageSize={15}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;