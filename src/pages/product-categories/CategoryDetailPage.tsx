import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Box, Search, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Combobox } from "@/components/ui/combobox";
import { ProductCategory } from "../../types/productCategories";
import { Product } from "@/types/products";
import { useCategoryDetails, useUpdateCategory } from "@/hooks/useProductCategories";
import CategoryModal from "./CategoryModal";

const CategoryDetailPage = () => {
    const { id, companyId } = useParams<{ id: string; companyId?: string }>();
    const navigate = useNavigate();
    const { data: detailsData, isLoading } = useCategoryDetails(id);

    // Derived state from API response
    const category = detailsData?.category as ProductCategory | undefined;

    const subCategories = useMemo(() =>
        (detailsData?.subCategories || []) as ProductCategory[],
        [detailsData?.subCategories]);

    const allProducts = useMemo(() =>
        (detailsData?.products || []) as (Product & { categoryId: string })[],
        [detailsData?.products]);

    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<ProductCategory>>({});

    const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

    const handleEditClick = () => {
        if (category) {
            setEditFormData({
                id: category.id,
                name: category.name,
                type: category.type as "main" | "sub",
                mainCategoryId: category.mainCategoryId
            });
            setIsEditModalOpen(true);
        }
    };

    const handleSaveCategory = () => {
        if (!editFormData.name?.trim() || !editFormData.type || !category) return;

        const payload = {
            id: category.id,
            name: editFormData.name.trim(),
            parent_id: editFormData.type === "sub" ? (editFormData.mainCategoryId ?? null) : null,
        };

        updateCategory(payload as ProductCategory, {
            onSuccess: () => {
                setIsEditModalOpen(false);
            }
        });
    };

    const filteredProducts = useMemo(() => {
        if (!category) return [];

        if (category.type === 'sub') {
            return allProducts.filter(p => p.categoryId === category.id);
        }

        // If it's a main category
        if (selectedSubCategory !== "all") {
            return allProducts.filter(p => p.categoryId === selectedSubCategory);
        }

        // Return all products that belong to any subcategory of this main category
        const subCatIds = subCategories.map(c => c.id);
        const filteredByCat = allProducts.filter(p => subCatIds.includes(p.categoryId));

        if (!debouncedSearchQuery.trim()) {
            return filteredByCat;
        }

        return filteredByCat.filter(p => p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));

    }, [category, selectedSubCategory, subCategories, debouncedSearchQuery, allProducts]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading category details...</p>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                <p className="text-muted-foreground">Category not found</p>
                <Button onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    const columns: Column<Product & { categoryId: string }>[] = [
        {
            key: "name",
            header: "Product Name",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md">
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                </div>
            )
        },
        {
            key: "type",
            header: "Product Type",
            render: (item) => <StatusBadge status={item.type.replace('_', ' ')} variant="info" />
        },
        {
            key: "categoryId",
            header: "Sub Category",
            render: (item) => {
                const subCat = subCategories.find(c => c.id === item.categoryId);
                return <span className="text-sm">{subCat ? subCat.name : category.name}</span>;
            }
        }
    ];

    const mainCategory = category.type === 'sub' && category.mainCategoryId
        ? { name: "Main Category" } // ToDo: include parent_name from the backend if required later
        : null;

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            {/* Header Section */}
            <div className="flex items-center border-b border-border pb-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 rounded-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{category.name}</h1>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={handleEditClick}>
                                <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                            </Button>
                            <StatusBadge status={category.type === 'main' ? 'Main Category' : 'Sub Category'} variant="default" />
                        </div>
                        {category.type === 'sub' && mainCategory && (
                            <p className="text-sm text-muted-foreground mt-1">Part of {mainCategory.name}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Controls (Search & Filter) */}
            <div className="flex flex-col sm:flex-row items-end justify-start gap-3 w-full">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-8 text-sm rounded-sm bg-background"
                    />
                </div>
                {category.type === 'main' && subCategories.length > 0 && (
                    <Combobox
                        options={[
                            { value: "all", label: "All Sub Categories" },
                            ...subCategories.map(s => ({ value: s.id, label: s.name }))
                        ]}
                        value={selectedSubCategory}
                        onValueChange={setSelectedSubCategory}
                        placeholder="Filter by Sub Category"
                        searchPlaceholder="Search sub categories..."
                        className="w-full sm:w-[200px]"
                    />
                )}
            </div>

            {/* Products Table */}
            <div>
                <DataTable
                    data={filteredProducts}
                    columns={columns}
                    pageSize={10}
                />
            </div>

            <CategoryModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                formData={editFormData}
                setFormData={setEditFormData}
                onSave={handleSaveCategory}
                isPending={isUpdating}
            />
        </div>
    );
};

export default CategoryDetailPage;