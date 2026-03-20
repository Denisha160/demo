import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Layers, Package, Filter, X } from "lucide-react";
import { Product } from "@/types/products";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import { useBrandCombobox } from "@/hooks/useBrands";
import { Category } from "@/types/productCategories";
import { Brand } from "@/types/brand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Switch } from "@/components/ui/switch";

const ProductsPage = () => {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters and Pagination State
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);
    const [filterType, setFilterType] = useState<string>(searchParams.get("type") || "all");
    const [categoryIdFilter, setCategoryIdFilter] = useState<string>(searchParams.get("categoryId") || "");
    const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
    const [brandIdFilter, setBrandIdFilter] = useState<string>(searchParams.get("brandId") || "");
    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey") || "created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || "desc"
    );

    const isAdmin = location.pathname.startsWith("/admin");
    const routePrefix = isAdmin ? "/admin" : `/${companyId}`;

    const hasFilters = Boolean(
        search || filterType !== "all" || categoryIdFilter || statusFilter !== "all" || brandIdFilter || sortKey !== "created_at"
    );

    const handleClearFilters = () => {
        setSearch("");
        setFilterType("all");
        setCategoryIdFilter("");
        setStatusFilter("all");
        setBrandIdFilter("");
        setSortKey("created_at");
        setSortDirection("desc");
        setPage(1);
    };

    const [categorySearch, setCategorySearch] = useState('');
    const debouncedCategorySearch = useDebounce(categorySearch, 300);

    const [brandSearch, setBrandSearch] = useState('');
    const debouncedBrandSearch = useDebounce(brandSearch, 300);

    // Sync state to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedSearch) next.set("search", debouncedSearch); else next.delete("search");
            if (filterType !== "all") next.set("type", filterType); else next.delete("type");
            if (categoryIdFilter) next.set("categoryId", categoryIdFilter); else next.delete("categoryId");
            if (statusFilter !== "all") next.set("status", statusFilter); else next.delete("status");
            if (brandIdFilter) next.set("brandId", brandIdFilter); else next.delete("brandId");
            if (page > 1) next.set("page", page.toString()); else next.delete("page");
            if (limit !== 10) next.set("limit", limit.toString()); else next.delete("limit");
            if (sortKey) next.set("sortKey", sortKey); else next.delete("sortKey");
            if (sortDirection) next.set("sortDirection", sortDirection); else next.delete("sortDirection");
            return next;
        }, { replace: true });
    }, [debouncedSearch, filterType, categoryIdFilter, statusFilter, brandIdFilter, page, limit, sortKey, sortDirection, setSearchParams]);

    const { data: categories = [], isLoading: isLoadingCategories } = useCategoriesCombobox({
        type: 'sub',
        search: debouncedCategorySearch,
        combobox: true
    });

    const { data: brands = [], isLoading: isLoadingBrands } = useBrandCombobox({
        search: debouncedBrandSearch,
        combobox: true
    });

    const { data: listResponse, isLoading } = useProducts({
        search: debouncedSearch.trim() || undefined,
        type: filterType === "all" ? undefined : filterType,
        category_id: categoryIdFilter || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        brand_id: brandIdFilter || undefined,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        offset: (page - 1) * limit,
        limit,
    });

    const items = listResponse?.items || [];
    const totalItems = listResponse?.pagination?.total || 0;

    const { mutate: updateProduct } = useUpdateProduct();

    const handleStatusToggle = (product: Product) => {
        updateProduct({
            id: product.id,
            is_active: !product.is_active
        });
    };

    const columns: Column<Product>[] = [
        {
            key: "product_name",
            header: "Product Info",
            sortable: true,
            render: (item) => (
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`${routePrefix}/products/${item.id}`)}
                >
                    <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                        {item.product_type === 'FINISHED_GOOD' ? (
                            <Package className="h-4 w-4 group-hover:text-primary transition-colors" />
                        ) : (
                            <Layers className="h-4 w-4 group-hover:text-primary transition-colors" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.product_name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.code || "NO CODE"}</p>
                    </div>
                </div>
            )
        },
        {
            key: "product_type",
            header: "Type",
            sortable: true,
            render: (item) => <StatusBadge status={item.product_type.replace('_', ' ')} variant="info" />
        },
        {
            key: "category_name",
            header: "Category",
            render: (item) => <span className="text-sm">{item.category_name || "—"}</span>
        },
        {
            key: "brand_name",
            header: "Brand",
            render: (item) => <span className="text-sm">{item.brand_name || "—"}</span>
        },
        {
            key: "fragrance_name",
            header: "Fragrance",
            render: (item) => <span className="text-sm">{item.fragrance_name || "—"}</span>
        },
        {
            key: "base_unit",
            header: "Unit / Category",
            render: (item) => (
                <div className="text-sm">
                    <span className="font-medium">{item.base_unit}</span>
                    <span className="text-muted-foreground text-xs ml-1">({item.unit_category})</span>
                </div>
            )
        },
        {
            key: "stock",
            header: "Current Stock",
            render: (item) => (
                <div className="flex flex-col">
                    <span className={`font-semibold ${Number(item.stock) <= 0 ? 'text-destructive' : ''}`}>
                        {item.stock} {item.base_unit}
                    </span>
                </div>
            )
        },
        {
            key: "cost_price",
            header: "Price info",
            render: (item) => (
                <div className="text-[11px] leading-tight flex flex-col">
                    <span className="text-muted-foreground">CP: <span className="text-foreground font-medium">{item.cost_price || 0}</span></span>
                    <span className="text-muted-foreground">SP: <span className="text-foreground font-medium">{item.selling_price || 0}</span></span>
                </div>
            )
        },
        {
            key: "is_active",
            header: "Status",
            render: (item) => (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Switch
                        checked={item.is_active}
                        onCheckedChange={() => handleStatusToggle(item)}
                    />
                    <span className="text-[10px] font-medium text-muted-foreground">
                        {item.is_active ? "Active" : "Inactive"}
                    </span>
                </div>
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
                        <SelectTrigger className="w-[120px] h-8 text-xs rounded-sm">
                            <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                            <SelectItem value="SEMI_FINISHED">Semi Finished</SelectItem>
                            <SelectItem value="FINISHED_GOOD">Finished Good</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="w-[180px]">
                        <Combobox
                            options={categories.map((c: Category) => ({
                                value: c.id,
                                label: c.parent_name ? `${c.name} (${c.parent_name})` : c.name
                            }))}
                            value={categoryIdFilter}
                            onValueChange={(val) => {
                                setCategoryIdFilter(val);
                                setPage(1);
                                setCategorySearch('');
                            }}
                            searchValue={categorySearch}
                            onSearchChange={setCategorySearch}
                            placeholder={isLoadingCategories ? "Loading..." : "All Categories"}
                            searchPlaceholder="Search category..."
                            clearable
                            disabled={isLoadingCategories}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-[100px] h-8 text-xs rounded-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="w-[180px]">
                        <Combobox
                            options={brands.map((b: Brand) => ({
                                value: b.id,
                                label: b.name
                            }))}
                            value={brandIdFilter}
                            onValueChange={(val) => {
                                setBrandIdFilter(val);
                                setPage(1);
                                setBrandSearch('');
                            }}
                            searchValue={brandSearch}
                            onSearchChange={setBrandSearch}
                            placeholder={isLoadingBrands ? "Loading..." : "All Brands"}
                            searchPlaceholder="Search brand..."
                            clearable
                            disabled={isLoadingBrands}
                        />
                    </div>

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
                <Button size="sm" className="h-8 text-xs rounded-sm" onClick={() => navigate(`${routePrefix}/products/new`)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Product
                </Button>
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

export default ProductsPage;
