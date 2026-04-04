import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Eye,
  LayoutGrid,
  List,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useKitList, useDeleteKit } from "@/hooks/useKits";
import { Kit } from "@/types/kits";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [filterStatus, setFilterStatus] = useState<string>(
    searchParams.get("status") || "all",
  );
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10", 10),
  );
  const [sortKey, setSortKey] = useState<string | null>(
    searchParams.get("sortKey") || "created_at",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
  );
  const [viewMode, setViewMode] = useState<"cards" | "table">(
    (searchParams.get("view") as "cards" | "table") || "cards",
  );

  // Modal state
  const [viewKitId, setViewKitId] = useState<string | undefined>();
  const [kitToDelete, setKitToDelete] = useState<Kit | null>(null);

  const hasFilters = Boolean(
    search || filterStatus !== "all" || sortKey !== "created_at",
  );

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setSortKey("created_at");
    setSortDirection("desc");
    setPage(1);
  };

  // Sync state to URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        if (filterStatus !== "all") next.set("status", filterStatus);
        else next.delete("status");
        if (page > 1) next.set("page", page.toString());
        else next.delete("page");
        if (limit !== 10) next.set("limit", limit.toString());
        else next.delete("limit");
        if (sortKey) next.set("sortKey", sortKey);
        else next.delete("sortKey");
        if (sortDirection) next.set("sortDirection", sortDirection);
        else next.delete("sortDirection");
        if (viewMode !== "cards") next.set("view", viewMode);
        else next.delete("view");
        return next;
      },
      { replace: true },
    );
  }, [
    debouncedSearch,
    filterStatus,
    page,
    limit,
    sortKey,
    sortDirection,
    viewMode,
    setSearchParams,
  ]);

  const { data: listResponse, isLoading } = useKitList({
    search: debouncedSearch.trim() || undefined,
    is_active:
      filterStatus === "active"
        ? true
        : filterStatus === "inactive"
          ? false
          : undefined,
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
          <div className="h-10 w-10 bg-muted/40 rounded-sm flex flex-col items-center justify-center shrink-0 border border-border/50 overflow-hidden group/img relative">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-110"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-1 text-center">
                <span className="text-[8px] font-black leading-none text-muted-foreground/40 uppercase tracking-tighter">
                  No Image
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {item.name}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate">
              {item.sku || "NO-SKU"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "total_items",
      header: "Components",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-semibold text-foreground">
          {item.total_items} Items
        </span>
      ),
    },
    {
      key: "kit_price",
      header: "Kit Price",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-bold text-primary font-mono">
          ₹
          {Number(item.kit_price || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={item.is_active ? "Active" : "Inactive"}
          variant={item.is_active ? "success" : "secondary"}
        />
      ),
    },
    {
      key: "created_at",
      header: "Created",
      sortable: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(item.created_at), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
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
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-2 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search kits or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[200px]"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs rounded-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
                <X className="h-3 w-3" />
                Clear
              </Button>
            </div>
          )}

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

        <Button
          size="sm"
          className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
          onClick={() => navigate("new")}
        >
          <Plus className="h-4 w-4" />
          Create Kit
        </Button>
      </div>

      {viewMode === "table" ? (
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
            onServerPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
            onServerSortChange={(key, direction) => {
              setSortKey(key);
              setSortDirection(direction);
              setPage(1);
            }}
            onRowClick={(item) => setViewKitId(item.id)}
          />
        </div>
      ) : (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="h-[240px] rounded-sm border border-border bg-card animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : items.length > 0 ? (
            <TooltipProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3">
                {items.map((kit) => (
                  <Card
                    key={kit.id}
                    className="group relative flex flex-col bg-white border border-border/60 rounded-sm shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer"
                    onClick={() => setViewKitId(kit.id)}
                  >
                    <div className="h-52 w-full bg-slate-50 relative overflow-hidden flex items-center justify-center group/img border-b border-slate-100">
                      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-6 h-6 rounded-sm backdrop-blur-md border border-white/20 flex items-center justify-center text-[10px] font-black shadow-sm ${kit.is_active ? "bg-emerald-500/90 text-white" : "bg-destructive/90 text-white"}`}
                            >
                              {kit.is_active ? "A" : "I"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{kit.is_active ? "Active" : "Inactive"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {kit.image_url ? (
                        <img
                          src={kit.image_url}
                          alt={kit.name}
                          className="h-full w-full object-contain transition-transform duration-700 group-hover/img:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </div>

                    <CardContent className="p-2 flex-1 flex flex-col justify-between gap-1.5 bg-white">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                          <span className="truncate max-w-[70px]">
                            {kit.sku || "NO-SKU"}
                          </span>
                        </div>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="font-black text-[14px] text-slate-800 tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                              {kit.name}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>{kit.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="space-y-1 border-t border-slate-50 mt-auto">
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="space-y-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="space-y-0.5 cursor-help">
                                  <p className="text-[8px] font-black uppercase text-slate-400">
                                    Items
                                  </p>
                                  <p className="text-[11px] font-black text-slate-800">
                                    {kit.total_items} Qty
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Total Items in Kit: {kit.total_items}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-right space-y-0.5 border-l border-slate-100 pl-2">
                            <p className="text-[8px] font-black uppercase text-slate-400">
                              Price
                            </p>
                            <p className="text-[11px] font-black font-mono text-primary truncate">
                              ₹{Number(kit.kit_price || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TooltipProvider>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-sm bg-muted/5">
              <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                No kits found
              </h3>
              <p className="text-sm text-muted-foreground max-w-[300px] text-center mt-1">
                {hasFilters
                  ? "No kits match your filters."
                  : "You haven't created any product kits yet."}
              </p>
              {hasFilters ? (
                <Button
                  variant="outline"
                  className="mt-6 gap-2"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4" /> Clear Filters
                </Button>
              ) : (
                <Button className="mt-6 gap-2" onClick={() => navigate("new")}>
                  <Plus className="h-4 w-4" /> Create First Kit
                </Button>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="h-9"
              >
                Previous
              </Button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
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
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="h-9"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <KitViewModal
        open={!!viewKitId}
        onClose={() => setViewKitId(undefined)}
        kitId={viewKitId}
        onEdit={(id) => navigate(`edit/${id}`)}
      />

      <AlertDialog
        open={!!kitToDelete}
        onOpenChange={(open) => !open && setKitToDelete(null)}
      >
        <AlertDialogContent className="rounded-sm border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2">
              Are you sure you want to delete the kit{" "}
              <strong>"{kitToDelete?.name}"</strong>? This will permanently
              remove the bundle configuration and all component links.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-sm border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (kitToDelete?.id) {
                  deleteKit(kitToDelete.id, {
                    onSuccess: () => setKitToDelete(null),
                  });
                }
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-sm"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete Kit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default KitsPage;
