import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Layers, Package, Filter } from "lucide-react";
import ProductModal from "./ProductModal";
import { Product, ProductType, Variant } from "./types";

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        type: "raw_material",
        base_unit: "kg",
        variants: [{ id: "v-1", variant_name: "Default", sku: "", weight_volume: 1, unit: "kg", cost_price: 0, selling_price: 0 }],
        bom: []
    });

    const productTypes: (ProductType | "All")[] = ["All", "raw_material", "finished_good", "branded_product", "unbranded_product"];
    const unitOptions = ["kg", "g", "liter", "ml", "pcs", "box"];

    const addVariant = () => {
        const newVariant: Variant = {
            id: `v-${Date.now()}`,
            variant_name: "",
            sku: "",
            weight_volume: 1,
            unit: formData.base_unit || "kg",
            cost_price: 0,
            selling_price: 0
        };
        setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
    };

    const removeVariant = (id: string) => {
        setFormData({ ...formData, variants: formData.variants?.filter(v => v.id !== id) });
    };

    const addBOMItem = () => {
        setFormData({
            ...formData,
            bom: [...(formData.bom || []), { component_variant_id: "", quantity_required: 1 }]
        });
    };

    const saveProduct = () => {
        const newProduct = {
            ...formData,
            id: crypto.randomUUID(),
            is_active: true,
        } as Product;
        setProducts([...products, newProduct]);
        setModalOpen(false);
    };

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "All" || p.type === filterType;
        return matchesSearch && matchesType;
    });

    const columns: Column<Product>[] = [
        {
            key: "name",
            header: "Product Info",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md">
                        {item.type === 'raw_material' ? <Layers className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.base_unit}</p>
                    </div>
                </div>
            )
        },
        {
            key: "type",
            header: "Type",
            render: (item) => <StatusBadge status={item.type.replace('_', ' ')} variant="info" />
        },
        {
            key: "variants",
            header: "SKUs",
            render: (item) => <span className="text-xs font-mono">{item.variants.length} Variants</span>
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-56"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        {productTypes.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterType(s)}
                                className={`px-2 py-1 text-sm rounded-sm transition-colors ${filterType === s
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <Button size="sm" className="h-8 text-sm rounded-sm" onClick={() => setModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Product
                </Button>
            </div>

            <DataTable data={filtered} columns={columns} pageSize={10} />

            <ProductModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                saveProduct={saveProduct}
                productTypes={productTypes}
                unitOptions={unitOptions}
                addVariant={addVariant}
                removeVariant={removeVariant}
                addBOMItem={addBOMItem}
                products={products}
            />
        </div>
    );
};

export default ProductsPage;
