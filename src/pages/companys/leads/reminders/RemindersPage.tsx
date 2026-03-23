import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { useAllReminders } from "@/hooks/useLeadReminders";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { useLeads } from "@/hooks/useLeads";
import StatusBadge from "@/components/StatusBadge";

const formatReminderDateTime = (date: string, time: string) => {
    if (!date && !time) return "-";
    if (!date) return time;
    if (!time) return date;

    const parsed = new Date(`${date}T${time}`);
    if (Number.isNaN(parsed.getTime())) return `${date} ${time}`;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
};

const mapReminder = (reminder: any) => {
    const remindAt = reminder?.remind_at;
    let remindDate = reminder?.remind_date || "";
    let remindTime = reminder?.remind_time || "";

    if (remindAt) {
        const parsed = new Date(remindAt);
        if (!Number.isNaN(parsed.getTime())) {
            const year = parsed.getFullYear();
            const month = String(parsed.getMonth() + 1).padStart(2, "0");
            const day = String(parsed.getDate()).padStart(2, "0");
            const hours = String(parsed.getHours()).padStart(2, "0");
            const minutes = String(parsed.getMinutes()).padStart(2, "0");
            remindDate = remindDate || `${year}-${month}-${day}`;
            remindTime = remindTime || `${hours}:${minutes}`;
        }
    }

    return {
        ...reminder,
        remind_at: remindAt,
        remind_date: remindDate,
        remind_time: remindTime,
    };
};

const RemindersPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

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

    const setLeadId = (v: string) => updateParam("lead_id", v);
    const setPage = (p: number) => updateParam("page", p);
    const setPageSize = (s: number) => updateParam("limit", s);

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
        if (leadId) f.lead_id = leadId;
        return f;
    }, [debouncedSearch, leadId, page, pageSize]);

    const { data: rawReminders = [], isLoading } = useAllReminders(filters);
    const reminders = useMemo(() => rawReminders.map(mapReminder), [rawReminders]);

    const serverTotal = reminders.length === pageSize ? page * pageSize + 1 : (page - 1) * pageSize + reminders.length;

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
            key: "title",
            header: "Title",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                </div>
            ),
        },
        {
            key: "description",
            header: "Description",
            render: (item) => <span className="max-w-md line-clamp-2 text-xs text-muted-foreground">{item.description}</span>,
        },
        {
            key: "remind_date",
            header: "Reminder Date",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{formatReminderDateTime(item.remind_date, item.remind_time)}</span>
                    <span className="text-[11px] text-muted-foreground">{item.remind_date} at {item.remind_time}</span>
                </div>
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
                            placeholder="Search reminders..."
                            className="h-9 rounded-sm pl-9 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        data={reminders}
                        columns={columns}
                        isLoading={isLoading}
                        serverSide={true}
                        serverTotal={serverTotal}
                        serverPage={page}
                        pageSize={pageSize}
                        onServerPageChange={setPage}
                        onServerPageSizeChange={setPageSize}
                        onRowClick={(item) => navigate(`/companys/leads/${item.lead_id}?tab=reminders`)}
                    />
                </div>
            </div>
        </div>
    );
};

export default RemindersPage;