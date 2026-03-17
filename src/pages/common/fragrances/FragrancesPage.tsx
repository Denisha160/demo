import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tags, Edit, X, Trash2, Wind } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import FragranceModal from "./components/FragranceModal";
import { useFragranceList, useCreateFragrance, useUpdateFragrance, useDeleteFragrance } from "@/hooks/useFragrances";
import type { Fragrance } from "@/types/fragrance";
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

const FragrancesPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey"));
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || null
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

    const { data: listResponse, isLoading } = useFragranceList({
        search: debouncedSearch.trim() || undefined,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        offset: (page - 1) * limit,
        limit,
    });

    const fragrances = listResponse?.items || [];
    const totalItems = listResponse?.pagination?.total || 0;

    const { mutateAsync: createFragrance, isPending: isCreating } = useCreateFragrance();
    const { mutateAsync: updateFragrance, isPending: isUpdating } = useUpdateFragrance();
    const { mutate: deleteFragrance, isPending: isDeleting } = useDeleteFragrance();
    const isPending = isCreating || isUpdating;

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Fragrance>>({ name: "", description: "", is_active: true });
    const [fragranceToDelete, setFragranceToDelete] = useState<Fragrance | null>(null);

    const handleCreateNew = () => {
        setFormData({ name: "", description: "", is_active: true });
        setModalOpen(true);
    };

    const handleEdit = (fragrance: Fragrance) => {
        setFormData({ ...fragrance });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name?.trim()) return;

        const payload = {
            name: formData.name.trim(),
            description: formData.description?.trim() || null,
            is_active: formData.is_active ?? true,
        };

        if (formData.id) {
            await updateFragrance({ id: formData.id, ...payload });
        } else {
            await createFragrance(payload);
        }
        setModalOpen(false);
    };

    const columns: Column<Fragrance>[] = [
        {
            key: "name",
            header: "Fragrance Name",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md">
                        <Wind className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <span className="font-medium text-sm block">{item.name}</span>
                        {item.description && (
                            <span className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "is_active",
            header: "Status",
            render: (item) => (
                <StatusBadge
                    status={item.is_active ? "Active" : "Inactive"}
                    variant={item.is_active ? "success" : "secondary"}
                />
            ),
        },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFragranceToDelete(item);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search fragrances..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-56"
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

                <Button size="sm" className="h-8 text-sm rounded-sm" onClick={handleCreateNew}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Fragrance
                </Button>
            </div>

            <DataTable
                data={fragrances}
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

            <FragranceModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isPending={isPending}
            />

            <AlertDialog open={!!fragranceToDelete} onOpenChange={(open) => !open && setFragranceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the fragrance "{fragranceToDelete?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                if (fragranceToDelete?.id) {
                                    deleteFragrance(fragranceToDelete.id, {
                                        onSuccess: () => setFragranceToDelete(null)
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

export default FragrancesPage;
