import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tags } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CategoryModal from "./CategoryModal";
import { useCategories, useCreateCategory, useUpdateCategory, Category } from "@/hooks/useProductCategories";
import type { ProductCategory } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function toDisplay(c: Category): ProductCategory {
    return {
        id: c.id,
        name: c.name,
        type: c.parent_id ? "sub" : "main",
        mainCategoryId: c.parent_id ?? undefined,
        parent_id: c.parent_id,
    };
}

const ProductCategoriesPage = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [filterType, setFilterType] = useState<"All" | "main" | "sub">("All");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data: listResponse, isLoading } = useCategories({
        search: debouncedSearch.trim() || undefined,
        type: filterType === "All" ? undefined : filterType,
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
                const parent = categories.find((c) => c.id === item.mainCategoryId);
                return <span className="text-sm">{parent ? parent.name : "—"}</span>;
            },
        },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleEdit(item)}
                    >
                        Edit
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
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
                onServerPageChange={setPage}
                onServerPageSizeChange={(newSize) => {
                    setLimit(newSize);
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
        </div>
    );
};

export default ProductCategoriesPage;