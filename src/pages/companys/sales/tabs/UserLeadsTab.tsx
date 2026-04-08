import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { CalendarDays, Search, Briefcase, IndianRupee } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { useLeads } from "@/hooks/useLeads";
import { Deal } from "@/types/leads";

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

const formatCurrency = (value?: string | number) => {
  if (value === undefined || value === null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

interface UserLeadsTabProps {
  userId: string;
}

interface LeadsResponse {
  data: {
    items: Deal[];
    pagination: {
      total: number;
    };
  };
}

const UserLeadsTab = ({ userId }: UserLeadsTabProps) => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10", 10),
  );
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
      { replace: true },
    );
  }, [debouncedSearch, page, limit, setSearchParams]);

  const { data, isLoading } = useLeads<LeadsResponse>(
    {
      assigned_to: userId,
      start_date: dateRange?.from?.toISOString(),
      end_date: dateRange?.to?.toISOString(),
      limit,
      offset: (page - 1) * limit,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    (res) => res as LeadsResponse,
  );

  const leads = data?.data?.items || [];
  const total = data?.data?.pagination?.total || 0;

  const columns: Column<Deal>[] = [
    {
      key: "name",
      header: "Lead Details",
      render: (item: Deal) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground uppercase">
            {item.name || item.title}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {item.lead_number}
          </span>
        </div>
      ),
    },
    {
      key: "company_name",
      header: "Company",
      render: (item: Deal) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground/80">
            {item.company_name || item.company || "-"}
          </span>
        </div>
      ),
    },
    {
      key: "status_id",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status_name || "New"}
          color={item.status_color}
        />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <span
          className={`text-[10px] font-extrabold uppercase tracking-wide ${
            item.priority === "HOT"
              ? "text-rose-500"
              : item.priority === "WARM"
                ? "text-amber-500"
                : "text-blue-500"
          }`}
        >
          {item.priority || "COLD"}
        </span>
      ),
    },
    {
      key: "expected_revenue",
      header: "Exp. Revenue",
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
          <IndianRupee className="h-3 w-3" />
          {formatCurrency(item.expected_revenue)}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created Date",
      render: (item: Deal) => (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDateTime(item.created_at)}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-2 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <DatePickerWithRange
          date={dateRange}
          setDate={setDateRange}
          className="w-[260px]"
          placeholder="Filter by created date"
        />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="h-9 w-[260px] pl-9 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={leads}
        isLoading={isLoading}
        onRowClick={(item) => navigate(`/${companyId}/leads/${item.id}`)}
        serverSide={true}
        serverPage={page}
        pageSize={limit}
        serverTotal={total}
        onServerPageChange={setPage}
        onServerPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
      />
    </div>
  );
};

export default UserLeadsTab;
