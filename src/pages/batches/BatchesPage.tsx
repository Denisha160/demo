import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, Plus, X, FlaskConical,
    CalendarClock, AlertTriangle, CheckCircle2, PackageX, MapPin,
    Eye, Edit, Layers
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format, differenceInDays, isPast } from "date-fns";
import { useBatches } from "@/hooks/useBatch";
import { Batch } from "@/types/batch";
import BatchViewModal from "./components/BatchViewModal";

// ── Helpers ─────────────────────────────────────────────────────────────────

const getExpiryCell = (expiryDate: string | null) => {
    if (!expiryDate) return <span className="text-muted-foreground/50 text-xs italic">No expiry</span>;
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (isPast(new Date(expiryDate))) return <span className="text-xs text-destructive font-bold">Expired</span>;
    if (days <= 30) return (
        <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {days}d left
        </span>
    );
    return <span className="text-xs text-foreground">{format(new Date(expiryDate), "dd MMM yyyy")}</span>;
};

const getStockPercent = (remaining: number, initial: number) =>
    initial ? Math.min(100, Math.round((remaining / initial) * 100)) : 0;

// ── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
    label, value, icon, className = "", accent
}: {
    label: string; value: number | string; icon: React.ReactNode; className?: string; accent?: string;
}) => (
    <div className={`relative flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 shadow-sm overflow-hidden ${className}`}>
        {accent && <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${accent}`} />}
        <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 border border-border/60 ml-1">
            {icon}
        </div>
        <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        </div>
    </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const BatchesPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);
    const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "15", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey") || "created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || "desc"
    );

    const [viewBatchId, setViewBatchId] = useState<string | undefined>();

    const hasFilters = Boolean(search || filterStatus !== "all");

    const handleClearFilters = () => {
        setSearch("");
        setFilterStatus("all");
        setSortKey("created_at");
        setSortDirection("desc");
        setPage(1);
    };

    // Sync URL params
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedSearch) next.set("search", debouncedSearch); else next.delete("search");
            if (filterStatus !== "all") next.set("status", filterStatus); else next.delete("status");
            if (page > 1) next.set("page", String(page)); else next.delete("page");
            if (limit !== 15) next.set("limit", String(limit)); else next.delete("limit");
            if (sortKey) next.set("sortKey", sortKey); else next.delete("sortKey");
            if (sortDirection) next.set("sortDirection", sortDirection); else next.delete("sortDirection");
            return next;
        }, { replace: true });
    }, [debouncedSearch, filterStatus, page, limit, sortKey, sortDirection, setSearchParams]);

    const { data: listResponse, isLoading } = useBatches({
        search: debouncedSearch.trim() || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        offset: (page - 1) * limit,
        limit,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
    });

    const items = listResponse?.items || [];
    const totalItems = listResponse?.pagination?.total || 0;

    // Derived summary counts
    const activeBatches = items.filter((b) => b.status === "active").length;
    const nearExpiry = items.filter((b) => {
        if (!b.expiry_date || b.status !== "active") return false;
        const days = differenceInDays(new Date(b.expiry_date), new Date());
        return days >= 0 && days <= 30;
    }).length;
    const expiredCount = items.filter((b) => b.status === "expired" || (b.expiry_date && isPast(new Date(b.expiry_date)))).length;
    const depletedCount = items.filter((b) => b.status === "depleted").length;

    // ── Columns ──────────────────────────────────────────────────────────────

    const columns: Column<Batch>[] = [
        {
            key: "batch_number",
            header: "Batch",
            sortable: true,
            className: "w-[220px]",
            render: (item) => (
                <div className="flex items-center gap-2.5">
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="h-9 w-9 object-cover rounded-sm border border-border shrink-0"
                        />
                    ) : (
                        <div className="h-9 w-9 bg-primary/10 text-primary rounded-sm flex items-center justify-center shrink-0 border border-primary/20">
                            <FlaskConical className="h-4 w-4" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-xs font-bold font-mono text-foreground">{item.batch_number}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.product_name}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "product_code",
            header: "Product",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Layers className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-[10px] font-mono font-semibold bg-muted px-1.5 py-0.5 rounded uppercase">
                        {item.product_code}
                    </span>
                </div>
            ),
        },
        {
            key: "manufacturing_date",
            header: "Mfg. Date",
            sortable: true,
            render: (item) => (
                <span className="text-xs text-muted-foreground">
                    {format(new Date(item.manufacturing_date), "dd MMM yyyy")}
                </span>
            ),
        },
        {
            key: "expiry_date",
            header: "Expiry",
            sortable: true,
            render: (item) => getExpiryCell(item.expiry_date),
        },
        {
            key: "remaining_quantity",
            header: "Stock",
            sortable: true,
            className: "w-[140px]",
            render: (item) => {
                const pct = getStockPercent(Number(item.remaining_quantity), Number(item.initial_quantity));
                return (
                    <div className="space-y-1 min-w-[110px]">
                        <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-foreground">{Number(item.remaining_quantity).toLocaleString()}</span>
                            <span className="text-muted-foreground">/{Number(item.initial_quantity).toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${pct > 50 ? "bg-emerald-500" : pct > 15 ? "bg-amber-400" : "bg-destructive"}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <p className="text-[9px] text-muted-foreground text-right">{pct}%</p>
                    </div>
                );
            },
        },
        {
            key: "location",
            header: "Location",
            render: (item) => item.location ? (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate max-w-[100px]">{item.location}</span>
                </div>
            ) : <span className="text-[10px] text-muted-foreground/40 italic">—</span>,
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => {
                type SV = "success" | "secondary" | "destructive" | "warning" | "info";
                const vm: Record<string, SV> = { active: "success", expired: "destructive", depleted: "secondary", blocked: "warning", quarantine: "info" };
                return <StatusBadge status={item.status.charAt(0).toUpperCase() + item.status.slice(1)} variant={vm[item.status] ?? "info"} />;
            },
        },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="View Batch"
                        onClick={() => setViewBatchId(item.id)}
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Edit Batch"
                        onClick={() => navigate(`edit/${item.id}`)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard
                    label="Active Batches"
                    value={activeBatches}
                    icon={<CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />}
                    accent="bg-emerald-500"
                />
                <SummaryCard
                    label="Near Expiry (30d)"
                    value={nearExpiry}
                    icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                    accent={nearExpiry > 0 ? "bg-amber-400" : "bg-border"}
                    className={nearExpiry > 0 ? "border-amber-200 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-900/10" : ""}
                />
                <SummaryCard
                    label="Expired"
                    value={expiredCount}
                    icon={<CalendarClock className="h-4 w-4 text-destructive" />}
                    accent={expiredCount > 0 ? "bg-destructive" : "bg-border"}
                    className={expiredCount > 0 ? "border-destructive/20 bg-destructive/5" : ""}
                />
                <SummaryCard
                    label="Depleted"
                    value={depletedCount}
                    icon={<PackageX className="h-4 w-4 text-muted-foreground" />}
                    accent="bg-muted-foreground/30"
                />
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search batch #, product, location..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[240px]"
                        />
                    </div>

                    <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                        <SelectTrigger className="w-[130px] h-8 text-xs rounded-sm">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
                            >
                                <X className="h-3 w-3" /> Clear
                            </Button>
                        </div>
                    )}
                </div>

                <Button
                    size="sm"
                    className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
                    onClick={() => navigate("new")}
                >
                    <Plus className="h-4 w-4" />
                    New Batch
                </Button>
            </div>

            {/* ── Table ── */}
            <div className="border border-border/60 rounded-sm shadow-sm">
                <DataTable
                    data={items}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={limit}
                    serverSide={true}
                    serverTotal={totalItems}
                    serverPage={page}
                    serverSortKey={sortKey || undefined}
                    serverSortDirection={sortDirection}
                    onServerPageChange={setPage}
                    onServerPageSizeChange={(newSize) => { setLimit(newSize); setPage(1); }}
                    onServerSortChange={(key, direction) => { setSortKey(key); setSortDirection(direction); setPage(1); }}
                    onRowClick={(item) => setViewBatchId(item.id)}
                />
            </div>

            {/* ── View Modal ── */}
            <BatchViewModal
                open={!!viewBatchId}
                onClose={() => setViewBatchId(undefined)}
                batchId={viewBatchId}
                onEdit={(id) => navigate(`edit/${id}`)}
            />
        </div>
    );
};

export default BatchesPage;
