import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Loader2, Plus, Search, Trash2 } from "lucide-react";
import PackageModal from "./components/PackageModal";
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
import { usePackages, useDeletePackage } from "@/hooks/usePackages";
import { useNavigate } from "react-router-dom";
import { PackageType, ApiErrorResponse } from "@/types/packages";
import { useSearchParams } from "react-router-dom";

const PackagesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters and Pagination State
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);

  const [filterType, setFilterType] = useState<string>(
    searchParams.get("type") || "All",
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<
    string | undefined
  >();
  const [packageToDelete, setPackageToDelete] = useState<PackageType | null>(
    null,
  );

  const handleEdit = (id: string) => {
    setSelectedPackageId(id);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPackageId(undefined);
    setIsModalOpen(true);
  };

  const hasFilters = Boolean(
    search || filterType !== "All" || sortKey !== "created_at",
  );

  const handleClearFilters = () => {
    setSearch("");
    setFilterType("All");
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
        if (filterType !== "All") next.set("type", filterType);
        else next.delete("type");
        if (page > 1) next.set("page", page.toString());
        else next.delete("page");
        if (limit !== 10) next.set("limit", limit.toString());
        else next.delete("limit");
        if (sortKey) next.set("sortKey", sortKey);
        else next.delete("sortKey");
        if (sortDirection) next.set("sortDirection", sortDirection);
        else next.delete("sortDirection");
        return next;
      },
      { replace: true },
    );
  }, [
    debouncedSearch,
    filterType,
    page,
    limit,
    sortKey,
    sortDirection,
    setSearchParams,
  ]);

  const { data: listResponse, isLoading } = usePackages({
    search: debouncedSearch.trim() || undefined,
    package_type: filterType === "All" ? undefined : filterType,
    sort_by: sortKey || undefined,
    sort_direction: sortDirection || undefined,
    offset: (page - 1) * limit,
    limit,
  });

  const items = listResponse?.items || [];
  const totalItems = listResponse?.pagination?.total || 0;

  const { mutate: deletePackage, isPending: isDeleting } = useDeletePackage();

  const columns: Column<PackageType>[] = [
    {
      key: "package_name",
      header: "Package Info",
      sortable: true,
      className: "w-[300px]",
      render: (item) => (
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item.id);
          }}
        >
          <div className="h-8 w-8 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20">
            <Plus className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {item.package_name}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
              {item.package_code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "package_type",
      header: "Type",
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.package_type || "N/A"} variant="info" />
      ),
    },
    {
      key: "dimensions",
      header: "Dimensions (cm)",
      render: (item) => (
        <p className="text-sm font-medium text-foreground">
          {item.length_cm} × {item.width_cm} × {item.height_cm}
        </p>
      ),
    },
    {
      key: "volume_cubic_cm",
      header: "Volume / CBM",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {Number(item.volume_cubic_cm).toLocaleString()} cm³
          </span>
          <span className="text-[10px] text-muted-foreground">
            CBM: {Number(item.cbm).toFixed(6)}
          </span>
        </div>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleEdit(item.id)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              setPackageToDelete(item);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name/code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 pl-7 text-sm rounded-sm w-full sm:w-[200px]"
            />
          </div>

          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[130px] h-8 text-sm rounded-sm">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="carton">Carton</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="bottle">Bottle</SelectItem>
              <SelectItem value="pouch">Pouch</SelectItem>
              <SelectItem value="pallet">Pallet</SelectItem>
              <SelectItem value="bag">Bag</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
        <Button
          size="sm"
          className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>

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
          onRowClick={(item) => handleEdit(item.id)}
        />
      </div>

      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageId={selectedPackageId}
      />

      <AlertDialog
        open={!!packageToDelete}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the package "
              {packageToDelete?.package_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (packageToDelete?.id) {
                  deletePackage(packageToDelete.id, {
                    onSuccess: () => {
                      setPackageToDelete(null);
                    },
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PackagesPage;
