import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Hash, Scale, Ruler, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Product } from "@/types/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

// Strict Zod schema matching the SQL constraints
const productSchema = z.object({
    product_name: z.string().min(2, "Product name is required (min 2 characters)"),
    code: z.string().optional().nullable(),
    product_type: z.enum(["RAW_MATERIAL", "FINISHED_GOOD"]),
    is_brand: z.boolean(),
    unit_category: z.enum(["weight", "volume", "count"]),
    base_unit: z.enum(["kg", "g", "l", "ml", "pcs"]),

    // Numeric constraints > 0 matching CHECK (x > 0)
    weight: z.number().positive("Must be > 0").nullable().optional(),
    length: z.number().positive("Must be > 0").nullable().optional(),
    width: z.number().positive("Must be > 0").nullable().optional(),
    height: z.number().positive("Must be > 0").nullable().optional(),
    volume: z.number().positive("Must be > 0").nullable().optional(),
    cost_price: z.number().positive("Must be > 0").nullable().optional(),
    selling_price: z.number().positive("Must be > 0").nullable().optional(),

    hsn_code: z.string().optional().nullable(),
    shape: z.string().optional().nullable(),
    capacity: z.string().optional().nullable(),
    material: z.string().optional().nullable(),
}).refine(data => {
    // Mirror the SQL CHECK constraint for unit combinations
    if (data.unit_category === 'weight') return ['kg', 'g'].includes(data.base_unit);
    if (data.unit_category === 'volume') return ['l', 'ml'].includes(data.base_unit);
    if (data.unit_category === 'count') return data.base_unit === 'pcs';
    return false;
}, {
    message: "Invalid unit selected for the chosen category",
    path: ["base_unit"]
});

interface ProductOverviewTabProps {
    productData: Product;
    setProductData: (data: Product) => void;
    isNew: boolean;
}

const ProductOverviewTab = ({
    productData,
    setProductData,
    isNew
}: ProductOverviewTabProps) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field: keyof Product, value: unknown) => {
        setProductData({ ...productData, [field]: value });
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleNumberChange = (field: keyof Product, val: string) => {
        const num = parseFloat(val);
        handleChange(field, isNaN(num) ? null : num);
    };

    const handleSave = async () => {
        try {
            // Validate data
            productSchema.parse(productData);
            setErrors({});
            setIsSaving(true);

            // TODO: implement actual API request here
            await new Promise(resolve => setTimeout(resolve, 800)); // Mock wait

            toast.success(isNew ? "Product created successfully!" : "Product updated successfully!");
            setIsSaving(false);

            if (isNew) {
                // navigate to actual ID in real implementation
            }

        } catch (error) {
            setIsSaving(false);
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach(err => {
                    if (err.path[0]) {
                        fieldErrors[err.path[0].toString()] = err.message;
                    }
                });
                setErrors(fieldErrors);
                toast.error("Please correct the validation errors in the form");
            } else {
                toast.error("An unexpected error occurred while saving");
            }
        }
    };

    const getUnitOptions = () => {
        switch (productData.unit_category) {
            case "weight": return [{ label: "kg", value: "kg" }, { label: "g", value: "g" }];
            case "volume": return [{ label: "Liters (l)", value: "l" }, { label: "Milliliters (ml)", value: "ml" }];
            case "count": return [{ label: "Pieces (pcs)", value: "pcs" }];
            default: return [];
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-300">

            {/* Left/Main Column */}
            <div className="md:col-span-2 space-y-6">

                {/* Basic Information */}
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <Package className="h-4 w-4 text-primary" />
                            Basic Information
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="product_name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Product Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="product_name"
                                value={productData.product_name}
                                onChange={(e) => handleChange("product_name", e.target.value)}
                                className={`h-9 bg-background ${errors.product_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="Enter product name"
                            />
                            {errors.product_name && <p className="text-[10px] text-destructive font-medium">{errors.product_name}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Hash className="h-3 w-3" /> Item Code (SKU)
                            </Label>
                            <Input
                                id="code"
                                value={productData.code || ""}
                                onChange={(e) => handleChange("code", e.target.value)}
                                className={`h-9 bg-background ${errors.code ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="Enter SKU / Box code"
                            />
                            {errors.code && <p className="text-[10px] text-destructive font-medium">{errors.code}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Type</Label>
                            <Select value={productData.product_type} onValueChange={(v) => handleChange("product_type", v)}>
                                <SelectTrigger className="h-9 bg-background">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FINISHED_GOOD">Finished Good (Manufactured)</SelectItem>
                                    <SelectItem value="RAW_MATERIAL">Raw Material (Component)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5 flex flex-col justify-center pt-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_brand"
                                    checked={productData.is_brand}
                                    onCheckedChange={(val) => handleChange("is_brand", val)}
                                />
                                <Label htmlFor="is_brand" className="text-sm font-medium cursor-pointer">
                                    Flag as Brand Level Item
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Measurements & Units */}
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <Scale className="h-4 w-4 text-primary" />
                            Units & Dimensions
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unit Category</Label>
                            <Select
                                value={productData.unit_category}
                                onValueChange={(val) => {
                                    handleChange("unit_category", val);
                                    if (val === "weight") handleChange("base_unit", "kg");
                                    if (val === "volume") handleChange("base_unit", "l");
                                    if (val === "count") handleChange("base_unit", "pcs");
                                }}
                            >
                                <SelectTrigger className="h-9 bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="weight">Weight based</SelectItem>
                                    <SelectItem value="volume">Volume based</SelectItem>
                                    <SelectItem value="count">Count (Pieces)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Unit</Label>
                            <Select value={productData.base_unit} onValueChange={(v) => handleChange("base_unit", v)}>
                                <SelectTrigger className={`h-9 bg-background ${errors.base_unit ? 'border-destructive' : ''}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {getUnitOptions().map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.base_unit && <p className="text-[10px] text-destructive font-medium">{errors.base_unit}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="weight" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight</Label>
                            <Input
                                id="weight"
                                type="number"
                                step="any"
                                value={productData.weight?.toString() || ""}
                                onChange={(e) => handleNumberChange("weight", e.target.value)}
                                className={`h-9 bg-background ${errors.weight ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.weight && <p className="text-[10px] text-destructive font-medium">{errors.weight}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="length" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Ruler className="h-3 w-3" /> Length (cm)
                            </Label>
                            <Input
                                id="length"
                                type="number"
                                step="any"
                                value={productData.length?.toString() || ""}
                                onChange={(e) => handleNumberChange("length", e.target.value)}
                                className={`h-9 bg-background ${errors.length ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.length && <p className="text-[10px] text-destructive font-medium">{errors.length}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="width" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Width (cm)</Label>
                            <Input
                                id="width"
                                type="number"
                                step="any"
                                value={productData.width?.toString() || ""}
                                onChange={(e) => handleNumberChange("width", e.target.value)}
                                className={`h-9 bg-background ${errors.width ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.width && <p className="text-[10px] text-destructive font-medium">{errors.width}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="height" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Height (cm)</Label>
                            <Input
                                id="height"
                                type="number"
                                step="any"
                                value={productData.height?.toString() || ""}
                                onChange={(e) => handleNumberChange("height", e.target.value)}
                                className={`h-9 bg-background ${errors.height ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.height && <p className="text-[10px] text-destructive font-medium">{errors.height}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="min-w-[140px] rounded-sm uppercase tracking-wider text-xs font-bold"
                    >
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            isNew ? "Create Product" : "Save Changes"
                        )}
                    </Button>
                </div>
            </div>

            {/* Right Column: Pricing & Meta */}
            <div className="space-y-6">

                {/* Pricing & Classification */}
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <DollarSign className="h-4 w-4 text-primary" /> Pricing & Details
                        </h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="cost_price" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost Price</Label>
                            <Input
                                id="cost_price"
                                type="number"
                                step="any"
                                value={productData.cost_price?.toString() || ""}
                                onChange={(e) => handleNumberChange("cost_price", e.target.value)}
                                className={`h-9 bg-background ${errors.cost_price ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.cost_price && <p className="text-[10px] text-destructive font-medium">{errors.cost_price}</p>}
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="selling_price" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selling Price / MRP</Label>
                            <Input
                                id="selling_price"
                                type="number"
                                step="any"
                                value={productData.selling_price?.toString() || ""}
                                onChange={(e) => handleNumberChange("selling_price", e.target.value)}
                                className={`h-9 bg-background ${errors.selling_price ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                placeholder="0.00"
                            />
                            {errors.selling_price && <p className="text-[10px] text-destructive font-medium">{errors.selling_price}</p>}
                        </div>

                        <div className="my-4 h-px bg-border w-full" />

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="hsn_code" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HSN Code</Label>
                            <Input
                                id="hsn_code"
                                value={productData.hsn_code || ""}
                                onChange={(e) => handleChange("hsn_code", e.target.value)}
                                className="h-9 bg-background"
                                placeholder="Enter HSN"
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="shape" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shape / Form</Label>
                            <Input
                                id="shape"
                                value={productData.shape || ""}
                                onChange={(e) => handleChange("shape", e.target.value)}
                                className="h-9 bg-background"
                                placeholder="e.g. Round bottle, Powder"
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="capacity" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Capacity Indicator</Label>
                            <Input
                                id="capacity"
                                value={productData.capacity || ""}
                                onChange={(e) => handleChange("capacity", e.target.value)}
                                className="h-9 bg-background"
                                placeholder="e.g. 500ml or 2kg pack"
                            />
                        </div>

                        <div className="space-y-1.5 focus-within:text-primary transition-colors">
                            <Label htmlFor="material" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Construction Material</Label>
                            <Input
                                id="material"
                                value={productData.material || ""}
                                onChange={(e) => handleChange("material", e.target.value)}
                                className="h-9 bg-background"
                                placeholder="e.g. PET Plastic, Glass"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductOverviewTab;
