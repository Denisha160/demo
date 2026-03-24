import { useState, useEffect } from "react";
import {
  Search,
  Hash,
  Plus,
  Printer,
  Download,
  RefreshCw,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ChevronDown,
  X,
  Package,
  Box,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSerials } from "@/hooks/useSerials";
import { Serial, SerialStatus } from "@/types/serial";
import { format } from "date-fns";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useBatchesCombobox } from "@/hooks/useBatch";
import { Combobox } from "@/components/ui/combobox";

// ── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = ({
  label,
  value,
  icon,
  className = "",
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  className?: string;
  accent?: string;
}) => (
  <div
    className={`relative flex items-center gap-3 rounded-lg border border-border/60 bg-card p-4 shadow-sm overflow-hidden ${className}`}
  >
    {accent && (
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${accent}`}
      />
    )}
    <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 border border-border/60 ml-1">
      {icon}
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold text-foreground leading-tight">
        {value}
      </p>
    </div>
  </div>
);

const statusMap: Record<
  string,
  {
    label: string;
    variant: "success" | "secondary" | "destructive" | "warning" | "info";
  }
> = {
  in_stock: { label: "IN STOCK", variant: "success" },
  reserved: { label: "RESERVED", variant: "warning" },
  sold: { label: "SOLD", variant: "info" },
  returned: { label: "RETURNED", variant: "secondary" },
  damaged: { label: "DAMAGED", variant: "destructive" },
  lost: { label: "LOST", variant: "secondary" },
};

const SerialNumbersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get("status") || "all",
  );
  const [selectedBatchId, setSelectedBatchId] = useState(
    searchParams.get("batch_id") || "",
  );
  const [batchSearch, setBatchSearch] = useState("");
  const debouncedBatchSearch = useDebounce(batchSearch, 300);

  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "15", 10),
  );

  const { data: batches = [] } = useBatchesCombobox({
    search: debouncedBatchSearch || undefined,
    status: "active",
  });

  const hasFilters = Boolean(
    search || filterStatus !== "all" || selectedBatchId,
  );

  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setSelectedBatchId("");
    setPage(1);
  };

  // Sync URL params
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        if (filterStatus !== "all") next.set("status", filterStatus);
        else next.delete("status");
        if (selectedBatchId) next.set("batch_id", selectedBatchId);
        else next.delete("batch_id");
        if (page > 1) next.set("page", String(page));
        else next.delete("page");
        if (limit !== 15) next.set("limit", String(limit));
        else next.delete("limit");
        return next;
      },
      { replace: true },
    );
  }, [
    debouncedSearch,
    filterStatus,
    selectedBatchId,
    page,
    limit,
    setSearchParams,
  ]);

  const { data: serialsData, isLoading } = useSerials({
    search: debouncedSearch.trim() || undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    batch_id: selectedBatchId || undefined,
    offset: (page - 1) * limit,
    limit,
  });

  const serials = serialsData?.items || [];
  const total = serialsData?.pagination?.total || 0;

  // Derived summary counts (partial, typically backend should provide this)
  const inStockCount = serials.filter((s) => s.status === "in_stock").length; // Local approximation
  const damagedCount = serials.filter((s) => s.status === "damaged").length;

  const columns: Column<Serial>[] = [
    {
      key: "serial_number",
      header: "Serial #",
      className: "w-[200px]",
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
              <Hash className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold font-mono text-foreground">
              {item.serial_number}
            </p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
              {item.product_name}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "product_code",
      header: "Product Code",
      render: (item) => (
        <Badge
          variant="secondary"
          className="text-[10px] font-mono px-1.5 h-5 uppercase"
        >
          {item.product_code}
        </Badge>
      ),
    },
    {
      key: "batch_number",
      header: "Batch",
      render: (item) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Box className="h-3 w-3 shrink-0" />
          <span className="font-mono text-[10px]">{item.batch_number}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => {
        const config = statusMap[item.status] || {
          label: item.status,
          variant: "secondary",
        };
        return <StatusBadge status={config.label} variant={config.variant} />;
      },
    },
    {
      key: "location",
      header: "Location",
      render: (item) => (
        <span className="text-[10px] text-muted-foreground italic">
          {item.location || "N/A"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
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
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Serialized"
          value={total}
          icon={<Hash className="h-4.5 w-4.5 text-primary" />}
          accent="bg-primary"
        />
        <SummaryCard
          label="In Stock"
          value={inStockCount} // Local approx for demo
          icon={<CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />}
          accent="bg-emerald-500"
        />
        <SummaryCard
          label="Sold"
          value="—"
          icon={<ShoppingCart className="h-4.5 w-4.5 text-sky-500" />}
          accent="bg-sky-500"
        />
        <SummaryCard
          label="Damaged / Lost"
          value={damagedCount}
          icon={<AlertCircle className="h-4.5 w-4.5 text-rose-500" />}
          accent="bg-rose-500"
          className={
            damagedCount > 0
              ? "border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-900/10"
              : ""
          }
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Serial#, Product, Batch..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[260px]"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs rounded-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>

          <Combobox
            options={batches.map((b) => ({
              label: `${b.batch_number} - ${b.product_name}`,
              value: b.id,
            }))}
            value={selectedBatchId}
            onValueChange={(v) => {
              setSelectedBatchId(v);
              setPage(1);
            }}
            onSearchChange={setBatchSearch}
            placeholder="Filter by Batch"
            className="h-8 text-xs rounded-sm w-[180px]"
          />

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1 animate-in fade-in slide-in-from-left-2"
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedBatchId && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 text-xs rounded-sm gap-2 animate-in fade-in zoom-in-95"
              onClick={() => navigate(`generate?batch_id=${selectedBatchId}`)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Manage Batch
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
            onClick={() => navigate("generate")}
          >
            <Plus className="h-3.5 w-3.5" /> Generate Serials
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-sm gap-2"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      <div className="border border-border/60 rounded-sm shadow-sm overflow-hidden bg-card">
        <DataTable
          data={serials}
          columns={columns}
          isLoading={isLoading}
          enableSelection={true}
          serverSide
          serverPage={page}
          pageSize={limit}
          serverTotal={total}
          onServerPageChange={setPage}
          onServerPageSizeChange={(s) => {
            setLimit(s);
            setPage(1);
          }}
        />
      </div>

      {/* ── Bulk Actions ── */}
      <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-sm border border-dashed border-border/60 text-[10px] text-muted-foreground">
        <span className="font-bold uppercase px-2 py-0.5 bg-background rounded border border-border">
          Bulk Actions:
        </span>
        <Button
          variant="ghost"
          className="h-6 text-[10px] gap-1 hover:bg-background"
        >
          Change Status <ChevronDown className="h-3 w-3" />
        </Button>
        <Button variant="ghost" className="h-6 text-[10px] hover:bg-background">
          Print Labels
        </Button>
        <Button variant="ghost" className="h-6 text-[10px] hover:bg-background">
          Export
        </Button>
      </div>
    </div>
  );
};

export default SerialNumbersPage;
