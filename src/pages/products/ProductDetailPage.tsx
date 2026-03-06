import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box, Activity, LogIn, LogOut, FileText, Package, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { Product } from "@/types/products";
import ProductOverviewTab from "./components/ProductOverviewTab";
import { useProduct } from "@/hooks/useProducts";
import { toast } from "react-toastify";

const ProductDetailPage = () => {
    const { id, companyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = location.pathname.startsWith("/admin");
    const routePrefix = isAdmin ? "/admin" : `/${companyId}`;
    const isNew = id === "new" || !id;

    // Fetch product data
    const { data: fetchedProduct, isLoading, error } = useProduct(isNew ? undefined : id);

    // Form State initialization
    const [productData, setProductData] = useState<Partial<Product>>({
        id: isNew ? crypto.randomUUID() : (id as string),
        code: "",
        product_name: "",
        category_id: null,
        product_type: "FINISHED_GOOD",
        is_brand: false,
        base_unit: "pcs",
        unit_category: "count",
        weight: null,
        length: null,
        width: null,
        height: null,
        volume: null,
        packaging_id: null,
        hsn_code: null,
        shape: null,
        capacity: null,
        material: null,
        cost_price: null,
        selling_price: null,
        is_active: true,
        metadata: {},
    });

    // Sync fetched data to local state
    useEffect(() => {
        if (fetchedProduct && !isNew) {
            setProductData(fetchedProduct);
        }
    }, [fetchedProduct, isNew]);

    if (error) {
        toast.error("Failed to load product details");
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm border border-border shrink-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest text-primary flex items-center gap-2">
                            <Box className="w-4 h-4" />
                            {isNew ? "Create New Product" : "Product Detail"}
                        </h2>
                    </div>
                </div>
                {!isNew && (
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Button size="sm" variant="outline" className="h-8 rounded-sm text-xs font-semibold uppercase tracking-wider text-blue-600 border-blue-600/30 hover:bg-blue-600/10">
                            <Activity className="w-3.5 h-3.5 mr-1" /> Transactions
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-2 animate-in fade-in-50 duration-300">
                <ProductOverviewTab
                    productData={productData}
                    setProductData={setProductData}
                    isNew={isNew}
                />
            </div>
        </div>
    );
};

export default ProductDetailPage;

