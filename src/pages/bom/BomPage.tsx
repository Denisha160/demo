import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Eye, Search, Trash2, Package } from "lucide-react";
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
import { useBOMList, useDeleteBOM } from "@/hooks/useBom";
import { Bom } from "@/types/bom";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import BomModal from "./components/BomModal";

const BomPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters and Pagination State
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);

    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey") || "last_used_date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || "desc"
    );

    const [bomToDelete, setBomToDelete] = useState<Bom | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [selectedFinishedProductId, setSelectedFinishedProductId] = useState<string>("");

    const handleEdit = (id: string) => {
        setSelectedFinishedProductId(id);
        setIsViewOnly(false);
        setIsModalOpen(true);
    };
    const handleView = (id: string) => {
        setSelectedFinishedProductId(id);
        setIsViewOnly(true);
        setIsModalOpen(true);
    };
    const handleCreate = () => {
        setSelectedFinishedProductId("");
        setIsViewOnly(false);
        setIsModalOpen(true);
    };

    const hasFilters = Boolean(search || sortKey !== "last_used_date");

    const handleClearFilters = () => {
        setSearch("");
        setSortKey("last_used_date");
        setSortDirection("desc");
        setPage(1);
    };

    // Sync state to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedSearch) next.set("search", debouncedSearch); else next.delete("search");
            if (page > 1) next.set("page", page.toString()); else next.delete("page");
            if (limit !== 10) next.set("limit", limit.toString()); else next.delete("limit");
            if (sortKey) next.set("sortKey", sortKey); else next.delete("sortKey");
            if (sortDirection) next.set("sortDirection", sortDirection); else next.delete("sortDirection");
            return next;
        }, { replace: true });
    }, [debouncedSearch, page, limit, sortKey, sortDirection, setSearchParams]);

    const { data: listResponse, isLoading } = useBOMList({
        search: debouncedSearch.trim() || undefined,
        grouped: true,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        offset: (page - 1) * limit,
        limit,
    });

    const items = listResponse?.items || [];
    const totalItems = listResponse?.pagination?.total || 0;

    const { mutate: deleteBOM, isPending: isDeleting } = useDeleteBOM();

    const columns: Column<Bom>[] = [
        {
            key: "finished_product_name",
            header: "Finished Good",
            sortable: true,
            className: "w-[300px]",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/5 rounded-md flex items-center justify-center border border-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.finished_product_name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recipe Ref: {item.finished_product_id.split('-')[0]}</p>
                    </div>
                </div>
            )
        },
        {
            key: "total_materials",
            header: "Raw Materials",
            sortable: true,
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.total_materials} Items</span>
                </div>
            )
        },
        {
            key: "total_cost",
            header: "Estimated Cost",
            sortable: true,
            render: (item) => (
                <p className="text-sm font-semibold text-foreground">
                    ₹{Number(item.total_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            )
        },
        {
            key: "last_used_date",
            header: "Last Used",
            sortable: true,
            render: (item) => (
                <p className="text-xs text-muted-foreground">
                    {item.last_used_date ? format(new Date(item.last_used_date), "dd MMM yyyy") : "N/A"}
                </p>
            )
        },
        {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (item) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Edit Recipe"
                        onClick={() => handleEdit(item.finished_product_id)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                        onClick={() => setBomToDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search by product..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-[200px]"
                        />
                    </div>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            Clear
                        </Button>
                    )}
                </div>
                <Button size="sm" className="h-8 text-xs rounded-sm gap-2" onClick={handleCreate}>
                    Add Recipe
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm">
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
                    onRowClick={(item) => handleView(item.finished_product_id)}
                />
            </div>

            <AlertDialog open={!!bomToDelete} onOpenChange={(open) => !open && setBomToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the recipe for "{bomToDelete?.finished_product_name}".
                            All raw material links for this product will be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                if (bomToDelete?.finished_product_id) {
                                    deleteBOM(bomToDelete.finished_product_id, {
                                        onSuccess: () => {
                                            setBomToDelete(null);
                                        }
                                    });
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete Recipe"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <BomModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsViewOnly(false);
                }}
                finishedProductId={selectedFinishedProductId}
                isViewOnly={isViewOnly}
            />
        </div>
    );
};

export default BomPage;
