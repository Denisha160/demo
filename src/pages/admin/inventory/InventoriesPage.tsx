import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, History, Box, LayoutGrid, X } from "lucide-react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useInventories } from "@/hooks/useInventory";
import { Inventory } from "@/types/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const InventoriesPage = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = location.pathname.startsWith("/admin");
  const routePrefix = isAdmin ? "/admin" : `/${companyId}`;

  // Filters and Pagination State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [filterType, setFilterType] = useState<string>(searchParams.get("type") || "all");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
  const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey") || "name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    (searchParams.get("sortDirection") as "asc" | "desc") || "asc"
  );

  const hasFilters = Boolean(search || filterType !== "all");

  const handleClearFilters = () => {
    setSearch("");
    setFilterType("all");
    setPage(1);
    setSortKey("name");
    setSortDirection("asc");
  };

  // Sync state to URL
  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debouncedSearch) next.set("search", debouncedSearch); else next.delete("search");
      if (filterType !== "all") next.set("type", filterType); else next.delete("type");
      if (page > 1) next.set("page", page.toString()); else next.delete("page");
      if (limit !== 10) next.set("limit", limit.toString()); else next.delete("limit");
      if (sortKey) next.set("sortKey", sortKey); else next.delete("sortKey");
      if (sortDirection) next.set("sortDirection", sortDirection); else next.delete("sortDirection");
      return next;
    }, { replace: true });
  }, [debouncedSearch, filterType, page, limit, sortKey, sortDirection, setSearchParams]);

  const { data: listResponse, isLoading } = useInventories({
    search: debouncedSearch.trim() || undefined,
    type: filterType === "all" ? undefined : (filterType as "PRODUCT" | "KIT"),
    sort_by: (sortKey as "name" | "code" | "stock" | "created_at") || undefined,
    sort_direction: sortDirection || undefined,
    offset: (page - 1) * limit,
    limit,
  });

  const items = listResponse?.items || [];
  const totalItems = listResponse?.pagination?.total || 0;

  const columns: Column<Inventory>[] = [
    {
      key: "name",
      header: "Item Info",
      sortable: true,
      render: (item) => (
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(`${routePrefix}/inventory/${item.inventory_type.toLowerCase()}/${item.product_id || item.kit_id}`)}
        >
          <div className="p-2 bg-muted rounded-md text-muted-foreground group-hover:bg-primary/10 transition-colors">
            {item.inventory_type === 'PRODUCT' ? <Box className="h-4 w-4 group-hover:text-primary transition-colors" /> : <LayoutGrid className="h-4 w-4 group-hover:text-primary transition-colors" />}
          </div>
          <div>
            <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.name}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.code || "NO CODE"}</p>
          </div>
        </div>
      )
    },
    {
      key: "inventory_type",
      header: "Type",
      render: (item) => <StatusBadge status={item.inventory_type} variant={item.inventory_type === 'PRODUCT' ? 'info' : 'warning'} />
    },
    {
      key: "location",
      header: "Location",
      render: (item) => <span className="text-sm">{item.location || "—"}</span>
    },
    {
      key: "stock",
      header: "Current Stock",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className={`font-semibold ${Number(item.stock) <= Number(item.min_stock) ? 'text-destructive' : 'text-primary'}`}>
            {item.stock} {item.base_unit || ''}
          </span>
          {item.min_stock > 0 && (
            <span className="text-[10px] text-muted-foreground">Min: {item.min_stock}</span>
          )}
        </div>
      )
    },
    {
      key: "total_in",
      header: "Total In/Out",
      render: (item) => (
        <div className="text-[11px] leading-tight flex flex-col">
          <span className="text-muted-foreground">In: <span className="text-emerald-600 font-medium">+{item.total_in || 0}</span></span>
          <span className="text-muted-foreground">Out: <span className="text-rose-600 font-medium">-{item.total_out || 0}</span></span>
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => navigate(`${routePrefix}/inventory/${item.inventory_type.toLowerCase()}/${item.product_id || item.kit_id}`)}
          title="Transaction History"
        >
          <History className="h-4 w-4 text-muted-foreground" />
        </Button>
      )
    }
  ];

  return (
    <div className="w-full mx-auto space-y-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name/code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-7 text-xs rounded-sm w-full sm:w-48"
            />
          </div>

          <Select value={filterType} onValueChange={(val) => { setFilterType(val); setPage(1); }}>
            <SelectTrigger className="w-[130px] h-8 text-xs rounded-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PRODUCT">Products</SelectItem>
              <SelectItem value="KIT">Kits</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={items}
        columns={columns}
        pageSize={limit}
        isLoading={isLoading}
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
      />
    </div>
  );
};

export default InventoriesPage;