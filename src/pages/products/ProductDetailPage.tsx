import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box, Activity, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Product } from "@/types/products";
import ProductOverviewTab from "./components/ProductOverviewTab";

const ProductDetailPage = () => {
    const { id, companyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = location.pathname.startsWith("/admin");
    const routePrefix = isAdmin ? "/admin" : `/${companyId}`;
    const isNew = id === "new";

    // Form State initialization
    const [productData, setProductData] = useState<Product>({
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

    const isLoading = false; // Add real hook later

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm border border-border shrink-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest text-primary flex items-center gap-2">
                            <Box className="w-4 h-4" />
                            {isNew ? "Create New Product" : "Product Detail Analytics"}
                        </h2>
                    </div>
                </div>
                {!isNew && (
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 rounded-sm text-xs font-semibold uppercase tracking-wider text-green-600 border-green-600/30 hover:bg-green-600/10">
                            <LogIn className="w-3.5 h-3.5 mr-1" /> Add Inventory
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 rounded-sm text-xs font-semibold uppercase tracking-wider text-red-600 border-red-600/30 hover:bg-red-600/10">
                            <LogOut className="w-3.5 h-3.5 mr-1" /> Deduct Inventory
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-4 overflow-y-hidden">
                <TabsList className="bg-transparent border-b border-border rounded-none h-11 w-full justify-start gap-6 p-0 overflow-x-auto">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all shrink-0">Overview</TabsTrigger>
                    {!isNew && (
                        <TabsTrigger value="transactions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all shrink-0 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" />
                            Transactions
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
                    <ProductOverviewTab
                        productData={productData}
                        setProductData={setProductData}
                        isNew={isNew}
                    />
                </TabsContent>

                {!isNew && (
                    <TabsContent value="transactions" className="space-y-4 animate-in fade-in-50 duration-300">
                        <div className="bg-card border border-border rounded-md p-8 text-center text-muted-foreground text-sm">
                            Transaction history will appear here.
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default ProductDetailPage;
