import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tags, Edit, X, Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CategoryModal from "./CategoryModal";
import { useCategories, useCategoriesCombobox, useCreateCategory, useUpdateCategory, Category, useDeleteCategory } from "@/hooks/useProductCategories";
import type { ProductCategory } from "../../../types/productCategories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
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

function toDisplay(c: Category): ProductCategory {
    return {
        id: c.id,
        name: c.name,
        type: c.parent_id ? "sub" : "main",
        mainCategoryId: c.parent_id ?? undefined,
        parent_id: c.parent_id,
        parent_name: c.parent_name,
    };
}

const ProductCategoriesPage = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);
    const [filterType, setFilterType] = useState<"All" | "main" | "sub">(
        (searchParams.get("type") as "All" | "main" | "sub") || "All"
    );
    const [mainCategoryIdFilter, setMainCategoryIdFilter] = useState<string>(
        searchParams.get("mainCategory") || ""
    );
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey"));
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || null
    );

    const hasFilters = Boolean(
        search || filterType !== "All" || mainCategoryIdFilter || sortKey
    );

    const handleClearFilters = () => {
        setSearch("");
        setFilterType("All");
        setMainCategoryIdFilter("");
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

            if (filterType !== "All") next.set("type", filterType);
            else next.delete("type");

            if (mainCategoryIdFilter) next.set("mainCategory", mainCategoryIdFilter);
            else next.delete("mainCategory");

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
    }, [debouncedSearch, filterType, mainCategoryIdFilter, page, limit, sortKey, sortDirection, setSearchParams]);

    const { data: mainCategories = [], isLoading: isLoadingCombobox } = useCategoriesCombobox({ type: "main" });

    const { data: listResponse, isLoading } = useCategories({
        search: debouncedSearch.trim() || undefined,
        type: filterType === "All" ? undefined : filterType,
        parent_id: mainCategoryIdFilter || undefined,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        combobox: false,
        offset: (page - 1) * limit,
        limit,
    });

    const categories: ProductCategory[] = (listResponse?.items || []).map(toDisplay);
    const totalItems = listResponse?.pagination?.total || 0;

    const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
    const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
    const isPending = isCreating || isUpdating;

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<ProductCategory>>({ name: "", type: "sub" });
    const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);

    const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

    const handleCreateNew = () => {
        setFormData({ name: "", type: "sub" });
        setModalOpen(true);
    };

    const handleEdit = (category: ProductCategory) => {
        setFormData({ ...category });
        setModalOpen(true);
    };

    const handleRowClick = (category: ProductCategory) => {
        if (companyId) {
            navigate(`/${companyId}/product-categories/${category.id}`);
        } else {
            navigate(`/admin/product-categories/${category.id}`);
        }
    };

    const handleSave = () => {
        if (!formData.name?.trim()) return;

        const payload = {
            name: formData.name.trim(),
            parent_id: formData.type === "sub" ? (formData.mainCategoryId ?? null) : null,
        };

        if (formData.id) {
            // Edit
            updateCategory({ id: formData.id, ...payload }, { onSuccess: () => setModalOpen(false) });
        } else {
            // Create
            createCategory(payload, { onSuccess: () => setModalOpen(false) });
        }
    };

    const columns: Column<ProductCategory>[] = [
        {
            key: "name",
            header: "Category Name",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md">
                        <Tags className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                </div>
            ),
        },
        {
            key: "type",
            header: "Type",
            render: (item) => (
                <StatusBadge
                    status={item.type === "main" ? "Main" : "Sub"}
                    variant={item.type === "main" ? "success" : "info"}
                />
            ),
        },
        {
            key: "mainCategoryId",
            header: "Parent Category",
            render: (item) => {
                if (item.type === "main") return <span className="text-muted-foreground">-</span>;
                return <span className="text-sm">{item.parent_name || "—"}</span>;
            },
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
                            setCategoryToDelete(item);
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
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-56"
                        />
                    </div>

                    {/* Select dropdown for filter */}
                    <Select
                        value={filterType}
                        onValueChange={(value: "All" | "main" | "sub") => {
                            setFilterType(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[130px] h-8 text-sm rounded-sm">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Categories</SelectItem>
                            <SelectItem value="main">Main Categories</SelectItem>
                            <SelectItem value="sub">Sub Categories</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Main Category Filter Combobox (shows only when applicable) */}
                    {(filterType === "All" || filterType === "sub") && (
                        <div className="w-[200px] animate-in fade-in slide-in-from-left-2 duration-300">
                            <Combobox
                                options={mainCategories.map((c) => ({ value: c.id, label: c.name }))}
                                value={mainCategoryIdFilter}
                                onValueChange={(val) => {
                                    setMainCategoryIdFilter(val);
                                    setPage(1);
                                }}
                                placeholder={isLoadingCombobox ? "Loading..." : "Filter by Main Category"}
                                searchPlaceholder="Search main categories..."
                                clearable
                                disabled={isLoadingCombobox}
                            />
                        </div>
                    )}

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
                    Add Category
                </Button>
            </div>

            <DataTable
                data={categories}
                columns={columns}
                pageSize={limit}
                onRowClick={handleRowClick}
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

            <CategoryModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave}
                isPending={isPending}
                onEdit={handleEdit}
            />

            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the category "{categoryToDelete?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                if (categoryToDelete?.id) {
                                    deleteCategory(categoryToDelete.id, {
                                        onSuccess: () => setCategoryToDelete(null)
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

export default ProductCategoriesPage;