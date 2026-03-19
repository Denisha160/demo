import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit, X } from "lucide-react";
import DataTable, { Column, SortDirection } from "@/components/DataTable";
import SourceModal from "./SourceModal";
import { useLeadSources, useUpdateLeadSource, useDeleteLeadSource } from "@/hooks/useLeadSource";
import { LeadSource, LeadSourcePayload } from "@/types/leadSource";
import StatusBadge from "@/components/StatusBadge";
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

const SourcePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);

    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey"));
    const [sortDirection, setSortDirection] = useState<SortDirection>(
        (searchParams.get("sortDirection") as SortDirection) || null
    );

    const hasFilters = Boolean(search || sortKey);

    const handleClearFilters = () => {
        setSearch("");
        setSortKey(null);
        setSortDirection(null);
        setPage(1);
    };

    // Synchronize states to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedSearch) next.set("search", debouncedSearch);
            else next.delete("search");
            if (page > 1) next.set("page", page.toString());
            else next.delete("page");
            if (limit !== 10) next.set("limit", limit.toString());
            else next.delete("limit");
            if (sortKey) next.set("sortKey", sortKey);
            else next.delete("sortKey");
            if (sortDirection) next.set("sortDirection", sortDirection);
            else next.delete("sortDirection");
            return next;
        }, { replace: true });
    }, [debouncedSearch, page, limit, sortKey, sortDirection, setSearchParams]);

    const { data: listResponse, isLoading } = useLeadSources({
        search: debouncedSearch.trim() || undefined,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        offset: (page - 1) * limit,
        limit,
    });

    const updateSourceMutation = useUpdateLeadSource();
    const { mutate: deleteSource, isPending: isDeleting } = useDeleteLeadSource();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<LeadSource | null>(null);
    const [sourceToDelete, setSourceToDelete] = useState<LeadSource | null>(null);

    const sources = listResponse?.items || [];
    const totalItems = listResponse?.pagination?.total || 0;

    const handleEdit = (sourceItem: LeadSource) => {
        setEditingSource(sourceItem);
        setIsModalOpen(true);
    };

    const handleSaveSource = (formData: LeadSourcePayload, setError: (field: any, err: any) => void) => {
        if (editingSource) {
            updateSourceMutation.mutate({ id: editingSource.id, ...formData }, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingSource(null);
                },
                onError: (error: any) => {
                    if (error?.code === 'validation_error' && error?.details?.body) {
                        Object.entries(error.details.body).forEach(([key, msg]) => {
                            setError(key as any, { type: 'server', message: msg as string });
                        });
                    }
                }
            });
        }
    };

    const columns: Column<LeadSource>[] = [
        {
            key: "name",
            header: "Name",
            sortable: true,
            className: "font-semibold",
        },
        {
            key: "display_order",
            header: "Display Order",
            sortable: true,
        },
        {
            key: "is_active",
            header: "Status",
            render: (item) => (
                <StatusBadge
                    status={item.is_active ? "Active" : "Inactive"}
                    variant={item.is_active ? "success" : "destructive"}
                />
            )
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) => (
                <div className="flex bg-transparent items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-sm"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-sm text-destructive"
                        onClick={() => setSourceToDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search Source..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[250px]"
                        />
                    </div>

                    {hasFilters && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Clear
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-md shadow-sm border border-border/50">
                <DataTable
                    columns={columns}
                    data={sources}
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

            {isModalOpen && (
                <SourceModal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                    }}
                    sourceData={editingSource}
                    onSave={handleSaveSource}
                    isSubmitting={updateSourceMutation.isPending}
                />
            )}

            <AlertDialog open={!!sourceToDelete} onOpenChange={(open) => !open && setSourceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the source "{sourceToDelete?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                if (sourceToDelete?.id) {
                                    deleteSource(sourceToDelete.id, {
                                        onSuccess: () => setSourceToDelete(null)
                                    });
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SourcePage;