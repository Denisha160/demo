import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { CalendarDays, MapPin, Search } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { useLeadVisits } from "@/hooks/useLeadVisits";
import { Visit } from "../../leads/details/tabs/visits/VisitsModal";

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
    case "SCHEDULED": case "RESCHEDULED": return "info";
    case "CANCELLED": case "MISSED": return "destructive";
    case "CHECKED_IN": case "IN_PROGRESS": return "warning";
    default: return "default";
  }
};

interface UserVisitsTabProps {
  userId: string;
}

const UserVisitsTab = ({ userId }: UserVisitsTabProps) => {
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

  const { data: visits = [], isLoading } = useLeadVisits("all", {
    user_id: userId,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    limit,
    offset: (page - 1) * limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const visitsArray = Array.isArray(visits) ? visits : [];
  const serverTotal = visitsArray.length === limit ? page * limit + 1 : (page - 1) * limit + visitsArray.length;

  const columns: Column<Visit>[] = [
    {
      key: "scheduled_time",
      header: "Visit Date",
      render: (item) => (
        <div className="flex items-start gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium text-foreground">{formatDateTime(item.scheduled_time)}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Visit Details",
      render: (item: any) => (
        <div className="flex items-start gap-3">
          {item.image_url ? (
            <img src={item.image_url} alt={item.title} className="h-12 w-12 rounded-md border border-border/60 object-cover" />
          ) : null}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{item.title}</span>
            {item.lead_name && <span className="text-xs text-primary font-medium">Lead: {item.lead_name}</span>}
            <span className="line-clamp-2 text-[11px] text-muted-foreground">{item.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.status.replace(/_/g, " ")} variant={getStatusVariant(item.status)} />
          <div className="text-[11px] capitalize text-muted-foreground">{item.visit_type.replace("_", " ")}</div>
        </div>
      ),
    },
    {
      key: "contact_person_name",
      header: "Contact",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{item.contact_person_name || "-"}</span>
          <span className="text-[11px] text-muted-foreground">{item.contact_person_phone}</span>
        </div>
      ),
    },
    {
      key: "location_address",
      header: "Location",
      render: (item) => (
        <div className="flex max-w-xs items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="line-clamp-2 text-xs text-foreground">{item.location_address || "-"}</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-2 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-[260px]" placeholder="Filter by scheduled date" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search visits..." className="h-9 w-[260px] pl-9 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>
      <DataTable columns={columns} data={visitsArray} isLoading={isLoading} serverSide={true} serverPage={page} pageSize={limit} serverTotal={serverTotal} onServerPageChange={setPage} onServerPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }} />
    </div>
  );
};

export default UserVisitsTab;
