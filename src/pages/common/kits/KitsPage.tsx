import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Edit, Eye, LayoutGrid, List, Loader2, Package,
    Plus, Search, Trash2, X, Info
} from "lucide-react";
import {
    useKitList,
    useDeleteKit
} from "@/hooks/useKits";
import { Kit } from "@/types/kits";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import KitViewModal from "./KitViewModal";

const KitsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters and Pagination State
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);
    const [filterStatus, setFilterStatus] = useState<string>(searchParams.get("status") || "all");
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey") || "created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || "desc"
    );
    const [viewMode, setViewMode] = useState<"cards" | "table">((searchParams.get("view") as "cards" | "table") || "cards");

    // Modal state
    const [viewKitId, setViewKitId] = useState<string | undefined>();
    const [kitToDelete, setKitToDelete] = useState<Kit | null>(null);

    const hasFilters = Boolean(search || filterStatus !== "all" || sortKey !== "created_at");

    const handleClearFilters = () => {
        setSearch("");
        setFilterStatus("all");
        setSortKey("created_at");
        setSortDirection("desc");
        setPage(1);
    };

    // Sync state to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedSearch) next.set("search", debouncedSearch); else next.delete("search");
            if (filterStatus !== "all") next.set("status", filterStatus); else next.delete("status");
            if (page > 1) next.set("page", page.toString()); else next.delete("page");
            if (limit !== 10) next.set("limit", limit.toString()); else next.delete("limit");
            if (sortKey) next.set("sortKey", sortKey); else next.delete("sortKey");
            if (sortDirection) next.set("sortDirection", sortDirection); else next.delete("sortDirection");
            if (viewMode !== "cards") next.set("view", viewMode); else next.delete("view");
            return next;
        }, { replace: true });
    }, [debouncedSearch, filterStatus, page, limit, sortKey, sortDirection, viewMode, setSearchParams]);

    const { data: listResponse, isLoading } = useKitList({
        search: debouncedSearch.trim() || undefined,
        is_active: filterStatus === "active" ? true : filterStatus === "inactive" ? false : undefined,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        offset: (page - 1) * limit,
        limit,
    });

    const items = listResponse?.items || [];
    const totalItems = listResponse?.pagination?.total || 0;
    const totalPages = Math.ceil(totalItems / limit);

    const { mutate: deleteKit, isPending: isDeleting } = useDeleteKit();

    // --- DataTable columns ---
    const columns: Column<Kit>[] = [
        {
            key: "name",
            header: "Kit Info",
            sortable: true,
            className: "w-[280px]",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20">
                        <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate">{item.sku || "NO-SKU"}</p>
                    </div>
                </div>
            )
        },
        {
            key: "total_items",
            header: "Components",
            sortable: true,
            render: (item) => (
                <span className="text-sm font-semibold text-foreground">{item.total_items} Items</span>
            )
        },
        {
            key: "kit_price",
            header: "Kit Price",
            sortable: true,
            render: (item) => (
                <span className="text-sm font-bold text-primary font-mono">
                    ₹{Number(item.kit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            )
        },
        {
            key: "is_active",
            header: "Status",
            sortable: true,
            render: (item) => <StatusBadge status={item.is_active ? "Active" : "Inactive"} variant={item.is_active ? "success" : "secondary"} />
        },
        {
            key: "created_at",
            header: "Created",
            sortable: true,
            render: (item) => (
                <span className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "dd MMM yyyy")}
                </span>
            )
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
                        title="View Kit"
                        onClick={() => setViewKitId(item.id)}
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Edit Kit"
                        onClick={() => navigate(`edit/${item.id}`)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete Kit"
                        onClick={() => setKitToDelete(item)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in pb-10">

            {/* ── Header bar (PackagesPage style) ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search kits or SKU..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[200px]"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                        <SelectTrigger className="w-[120px] h-8 text-xs rounded-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear filters */}
                    {hasFilters && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
                            >
                                <X className="h-3 w-3" />
                                Clear
                            </Button>
                        </div>
                    )}

                    {/* View toggle */}
                    <div className="flex items-center bg-muted/30 p-1 rounded-sm border border-border h-8 shrink-0">
                        <Button
                            variant={viewMode === "cards" ? "default" : "ghost"}
                            size="icon"
                            className="h-6 w-6 rounded-sm p-0"
                            onClick={() => setViewMode("cards")}
                            title="Card View"
                        >
                            <LayoutGrid className="h-3 w-3" />
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="icon"
                            className="h-6 w-6 rounded-sm p-0"
                            onClick={() => setViewMode("table")}
                            title="Table View"
                        >
                            <List className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Create button */}
                <Button
                    size="sm"
                    className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
                    onClick={() => navigate("new")}
                >
                    <Plus className="h-4 w-4" />
                    Create Kit
                </Button>
            </div>

            {/* ── Table View ── */}
            {viewMode === "table" && (
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
                        onRowClick={(item) => setViewKitId(item.id)}
                    />
                </div>
            )}

            {/* ── Card View ── */}
            {viewMode === "cards" && (
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-[200px] rounded-xl border border-border bg-card animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {items.map((kit) => (
                                <div
                                    key={kit.id}
                                    className="group relative flex flex-col bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                                    onClick={() => setViewKitId(kit.id)}
                                >
                                    {/* Decorative BG */}
                                    <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                                        <Package className="h-16 w-16" />
                                    </div>

                                    <div className="p-5 flex-1 space-y-4">
                                        {/* Status + SKU */}
                                        <div className="flex items-start justify-between">
                                            <Badge variant={kit.is_active ? "success" : "secondary"} className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wider font-bold">
                                                {kit.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                {kit.sku || "NO-SKU"}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                {kit.name}
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                <Info className="h-3 w-3" />
                                                Created {format(new Date(kit.created_at), "dd MMM yyyy")}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
                                                <p className="text-[9px] text-muted-foreground uppercase font-semibold">Components</p>
                                                <p className="text-sm font-bold text-foreground">{kit.total_items} Items</p>
                                            </div>
                                            <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
                                                <p className="text-[9px] text-primary/70 uppercase font-semibold">Kit Price</p>
                                                <p className="text-sm font-bold text-primary">
                                                    ₹{Number(kit.kit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions footer */}
                                    <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-[11px] font-semibold text-primary hover:bg-primary/10 gap-1.5"
                                            onClick={(e) => { e.stopPropagation(); setViewKitId(kit.id); }}
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Kit
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                title="Edit Kit"
                                                onClick={(e) => { e.stopPropagation(); navigate(`edit/${kit.id}`); }}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                title="Delete Kit"
                                                onClick={(e) => { e.stopPropagation(); setKitToDelete(kit); }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Card view pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-9">
                                    Previous
                                </Button>
                                {[...Array(Math.min(totalPages, 7))].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={page === i + 1 ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setPage(i + 1)}
                                        className="h-9 w-9 p-0"
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="h-9">
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                        <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                            <Package className="h-8 w-8 text-primary/40" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No kits found</h3>
                        <p className="text-sm text-muted-foreground max-w-[300px] text-center mt-1">
                            {hasFilters ? "No kits match your filters." : "You haven't created any product kits yet."}
                        </p>
                        {hasFilters ? (
                            <Button variant="outline" className="mt-6 gap-2" onClick={handleClearFilters}>
                                <X className="h-4 w-4" /> Clear Filters
                            </Button>
                        ) : (
                            <Button className="mt-6 gap-2" onClick={() => navigate("new")}>
                                <Plus className="h-4 w-4" /> Create First Kit
                            </Button>
                        )}
                    </div>
                )
            )}

            <KitViewModal
                open={!!viewKitId}
                onClose={() => setViewKitId(undefined)}
                kitId={viewKitId}
                onEdit={(id) => navigate(`edit/${id}`)}
            />

            <AlertDialog open={!!kitToDelete} onOpenChange={(open) => !open && setKitToDelete(null)}>
                <AlertDialogContent className="rounded-xl border-border shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm pt-2">
                            Are you sure you want to delete the kit <strong>"{kitToDelete?.name}"</strong>?
                            This will permanently remove the bundle configuration and all component links.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel disabled={isDeleting} className="rounded-md border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                if (kitToDelete?.id) {
                                    deleteKit(kitToDelete.id, {
                                        onSuccess: () => setKitToDelete(null)
                                    });
                                }
                            }}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Kit"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default KitsPage;
