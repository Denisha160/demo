import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAllFollowUps } from "@/hooks/useLeadFollowUps";

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
    case "COMPLETED":
      return "success";
    case "SCHEDULED":
    case "RESCHEDULED":
      return "warning";
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
};

const FollowUps = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filters = useMemo(() => {
    const f: any = {};
    if (searchTerm) f.search = searchTerm;
    return f;
  }, [searchTerm]);

  const { data: followups = [], isLoading } = useAllFollowUps(filters);

  const columns: Column<any>[] = [
    {
      key: "scheduled_at",
      header: "Scheduled At",
      render: (item) => <span className="text-sm">{formatDateTime(item.scheduled_at)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status || "PENDING"} variant={getStatusVariant(item.status || "")} />,
    },
    {
      key: "follow_up_method",
      header: "Method",
      render: (item) => <span className="text-sm">{item.follow_up_method || "-"}</span>,
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (item) => <span className="text-sm">{item.purpose || "-"}</span>,
    },
    {
      key: "assigned_to_name",
      header: "Assigned To",
      render: (item) => <span className="text-sm">{item.assigned_to_name || "-"}</span>,
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (item) => <span className="max-w-xs line-clamp-2 text-xs text-muted-foreground">{item.remarks || "-"}</span>,
    },
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in flex-col overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-[300px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search follow ups..."
            className="h-9 rounded-sm pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pt-2">
        <div className="h-full overflow-auto bg-card rounded-sm border border-border/40 shadow-sm">
          <DataTable
            data={followups}
            columns={columns}
            pageSize={15}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default FollowUps;
