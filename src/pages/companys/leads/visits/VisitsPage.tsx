import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, CalendarDays, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAllVisits } from "@/hooks/useLeadVisits";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { useLeads } from "@/hooks/useLeads";

const STATUS_OPTIONS = [
    { value: "COMPLETED", label: "Completed" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "RESCHEDULED", label: "Rescheduled" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "MISSED", label: "Missed" },
    { value: "CHECKED_IN", label: "Checked In" },
    { value: "IN_PROGRESS", label: "In Progress" },
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
            return "info";
        case "CANCELLED":
        case "MISSED":
            return "destructive";
        case "CHECKED_IN":
        case "IN_PROGRESS":
            return "warning";
        default:
            return "default";
    }
};

const VisitsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const status = searchParams.get("status") || "";
    const leadId = searchParams.get("lead_id") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "15", 10);

    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
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
            { replace: true }
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
        return leadsData.map((l: any) => ({ value: l.id, label: l.name || l.title || "Unknown Lead" }));
    }, [leadsData]);

    console.log(leadsData);


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

    const { data: visits = [], isLoading } = useAllVisits(filters);

    // We infer the total assuming there's more data if the items equal pageSize
    const serverTotal = visits.length === pageSize ? page * pageSize + 1 : (page - 1) * pageSize + visits.length;

    const columns: Column<any>[] = [
        {
            key: "lead_name",
            header: "Lead name",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.lead_name || "-"}</span>

                </div>
            ),
        },
        {
            key: "scheduled_time",
            header: "Visit Date",
            render: (item) => (
                <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                        <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{formatDateTime(item.scheduled_time)}</span>
                        <span className="text-[11px] text-muted-foreground">Check in: {formatDateTime(item.actual_check_in)}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "title",
            header: "Visit Details",
            render: (item) => (
                <div className="flex items-start gap-3">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.visit_image_name || item.title}
                            className="h-12 w-12 rounded-md border border-border/60 object-cover"
                        />
                    ) : null}
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{item.title}</span>
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
                    <StatusBadge status={item.status?.replace(/_/g, " ") || "N/A"} variant={getStatusVariant(item.status || "")} />
                    {item.visit_type && (
                        <div className="text-[11px] capitalize text-muted-foreground">{item.visit_type.replace("_", " ")}</div>
                    )}
                </div>
            ),
        },
        {
            key: "contact_person_name",
            header: "Contact",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.contact_person_name || "-"}</span>
                    <span className="text-[11px] text-muted-foreground">{item.contact_person_designation || "-"}</span>
                    <span className="text-[11px] text-muted-foreground">{item.contact_person_phone || "-"}</span>
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
                        <span className="text-[11px] text-muted-foreground">Rating: {item.customer_rating || "-"}</span>
                    </div>
                </div>
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
                            placeholder="Search visits..."
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
                        data={visits}
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

export default VisitsPage;