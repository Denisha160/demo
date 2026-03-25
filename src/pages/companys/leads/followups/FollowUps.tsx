import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAllFollowUps } from "@/hooks/useLeadFollowUps";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { useLeads } from "@/hooks/useLeads";

const STATUS_OPTIONS = [
  { value: "COMPLETED", label: "Completed" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "RESCHEDULED", label: "Rescheduled" },
  { value: "CANCELLED", label: "Cancelled" },
];

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
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get("status") || "";
  const leadId = searchParams.get("lead_id") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "15", 10);

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
  const setPage = (p: number) => updateParam("page", p);
  const setPageSize = (s: number) => updateParam("limit", s);

  const { data: leadsData = [] } = useLeads({ limit: 100 });
  const leadOptions = useMemo(() => {
    return leadsData.map((l: any) => ({
      value: l.id,
      label: l.name || l.title || "Unknown Lead",
    }));
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

  const { data: followups = [], isLoading } = useAllFollowUps(filters);

  const serverTotal =
    followups.length === pageSize
      ? page * pageSize + 1
      : (page - 1) * pageSize + followups.length;

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
      key: "scheduled_at",
      header: "Scheduled At",
      render: (item) => (
        <span className="text-sm">{formatDateTime(item.scheduled_at)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status || "PENDING"}
          variant={getStatusVariant(item.status || "")}
        />
      ),
    },
    {
      key: "follow_up_method",
      header: "Method",
      render: (item) => (
        <span className="text-sm">{item.follow_up_method || "-"}</span>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (item) => <span className="text-sm">{item.purpose || "-"}</span>,
    },
    {
      key: "assigned_to_name",
      header: "Assigned To",
      render: (item) => (
        <span className="text-sm">{item.assigned_to_name || "-"}</span>
      ),
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (item) => (
        <span className="max-w-xs line-clamp-2 text-xs text-muted-foreground">
          {item.remarks || "-"}
        </span>
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
              placeholder="Search follow ups..."
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
            data={followups}
            columns={columns}
            isLoading={isLoading}
            serverSide={true}
            serverTotal={serverTotal}
            serverPage={page}
            pageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={setPageSize}
            onRowClick={(item) =>
              navigate(`/companys/leads/${item.lead_id}?tab=follow-up`)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default FollowUps;
