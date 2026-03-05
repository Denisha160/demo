import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Layers, Package, Filter } from "lucide-react";
import { Product } from "@/types/products";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");

    const navigate = useNavigate();
    const { companyId } = useParams();
    const location = useLocation();

    // Determine the base route from context (either /admin or /:companyId)
    const isAdmin = location.pathname.startsWith("/admin");
    const routePrefix = isAdmin ? "/admin" : `/${companyId}`;

    const filtered = products.filter(p => {
        const matchesSearch = p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            (p.code && p.code.toLowerCase().includes(search.toLowerCase()));
        const matchesType = filterType === "All" || p.product_type === filterType;
        return matchesSearch && matchesType;
    });

    const columns: Column<Product>[] = [
        {
            key: "product_name",
            header: "Product Info",
            render: (item) => (
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => navigate(`${routePrefix}/products/${item.id}`)}
                >
                    <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                        {item.product_type === 'RAW_MATERIAL' ? <Layers className="h-4 w-4 group-hover:text-primary transition-colors" /> : <Package className="h-4 w-4 group-hover:text-primary transition-colors" />}
                    </div>
                    <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.product_name}</p>
                        <div className="flex items-center gap-2">
                            {item.code && <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.code}</p>}
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.base_unit}</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "product_type",
            header: "Type",
            render: (item) => <StatusBadge status={item.product_type.replace('_', ' ')} variant="info" />
        },
        {
            key: "is_active",
            header: "Status",
            render: (item) => <StatusBadge status={item.is_active ? "Active" : "Inactive"} variant={item.is_active ? "success" : "neutral"} />
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-56"
                        />
                    </div>
                </div>
                <Button size="sm" className="h-8 text-sm rounded-sm" onClick={() => navigate(`${routePrefix}/products/new`)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Product
                </Button>
            </div>

            <DataTable data={filtered} columns={columns} pageSize={10} />
        </div>
    );
};

export default ProductsPage;
