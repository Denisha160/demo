import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import {
    ArrowLeft, Box, Package, Loader2, DollarSign, Tags, Shield,
    Image as ImageIcon, UploadCloud, X, Plus, Trash2, Activity,
    ChevronLeft, ChevronRight, ZoomIn, Scale, Settings, Layers, PackageCheck
} from "lucide-react";
import { CategoryDrawer } from "@/components/Drawers/CategoryDrawer";
import { FragranceDrawer } from "@/components/Drawers/FragranceDrawer";
import { BrandDrawer } from "@/components/Drawers/BrandDrawer";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddProductPhotoModal from "@/pages/common/products/components/AddProductPhotoModal";
import KitViewModal from "@/pages/common/kits/KitViewModal";
import { Badge } from "@/components/ui/badge";

import { Product, ProductCreatePayload } from "@/types/products";
import { PackageType } from "@/types/packages";
import { Brand } from "@/types/brand";
import { Fragrance } from "@/types/fragrance";
import { ApiErrorResponse } from "@/types/user";

import { useProduct, useCreateProduct, useUpdateProduct, useDeleteProductPhoto } from "@/hooks/useProducts";
import { useCategoriesCombobox, Category } from "@/hooks/useProductCategories";
import { usePackagesCombobox } from "@/hooks/usePackages";
import { useBrandCombobox } from "@/hooks/useBrands";
import { useFragranceCombobox } from "@/hooks/useFragrances";
import { useKitList, useKitsByProduct, useAssociateProductToKit, useDisassociateProductFromKit } from "@/hooks/useKits";
import { useBOMDetails } from "@/hooks/useBom";
import { useDebounce } from "@/hooks/useDebounce";
import DataTable, { Column } from "@/components/DataTable";
import { Kit, KitItem, KitMembership } from "@/types/kits";
import BomModal from "@/pages/common/bom/components/BomModal";
import PackageModal from "@/pages/common/packages/components/PackageModal";

// --- Shared Reusable Components & Helpers ---

const ProductInput = ({
    label, value, error, isEditing = true, onChange, placeholder, type = "text", className = "", prefix,
}: {
    label: string; value: string | number | null; error?: string; isEditing?: boolean;
    onChange: (val: string) => void; placeholder?: string; type?: string; className?: string; prefix?: React.ReactNode;
}) => (
    <div className={`space-y-2 ${className}`}>
        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
        </Label>
        <div className={prefix ? "relative input-group" : ""}>
            {prefix && <span className="input-icon">{prefix}</span>}
            <Input
                type={type} step={type === "number" ? "any" : undefined}
                value={value?.toString() || ""} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`text-sm ${error ? 'input-error border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={!isEditing}
            />
        </div>
        {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
    </div>
);

// Array & Object handlers for Specifications
const updateArrayState = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, val: T) => {
    setter(prev => prev.map((item, i) => (i === index ? val : item)));
};
const removeArrayState = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    setter(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : [''] as unknown as T[]);
};
const updateObjectState = <T extends Record<string, unknown>>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, field: keyof T, val: T[keyof T]) => {
    setter(prev => prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
};
const removeObjectState = <T extends Record<string, unknown>>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) => {
    setter(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ key: '', value: '' }] as unknown as T[]);
};

// --- Zod Validation Schema ---
const productSchema = z.object({
    product_name: z.string().min(2, "Product name is required (min 2 characters)"),
    code: z.string().optional().nullable(),
    category_id: z.preprocess((val) => val === '' ? null : val, z.string().uuid("Please select a valid category").optional().nullable()),
    product_type: z.enum(["RAW_MATERIAL", "FINISHED_GOOD"]),
    is_brand: z.boolean(),
    brand_id: z.string().uuid("Please select a valid brand").optional().nullable(),
    fragrance_id: z.string().uuid("Please select a valid fragrance").optional().nullable(),
    is_active: z.boolean().default(true),

    unit_category: z.enum(["weight", "volume", "count"]),
    base_unit: z.enum(["kg", "g", "ltr", "ml", "pcs"]),

    weight: z.number().positive("Must be > 0").nullable().optional(),
    length: z.number().positive("Must be > 0").nullable().optional(),
    width: z.number().positive("Must be > 0").nullable().optional(),
    height: z.number().positive("Must be > 0").nullable().optional(),
    size_value: z.number().positive("Must be > 0").nullable().optional(),
    dimension_unit: z.enum(["mm", "cm", "m", "in", "ft"]).nullable().optional(),

    cost_price: z.number().positive("Must be > 0").nullable().optional(),
    selling_price: z.number().positive("Must be > 0").nullable().optional(),

    hsn_code: z.string().optional().nullable(),
    shape: z.string().optional().nullable(),
    capacity: z.string().optional().nullable(),
    material: z.string().optional().nullable(),
    manufacturer: z.string().optional().nullable(),
    country_of_origin: z.string().optional().nullable(),

    min_stock_level: z.number().min(0, "Min stock must be >= 0").nullable().optional(),
    max_stock_level: z.number().min(0, "Max stock must be >= 0").nullable().optional(),
    reorder_point: z.number().min(0, "Reorder point must be >= 0").nullable().optional(),

    shelf_life_days: z.number().min(0, "Shelf life must be >= 0").nullable().optional(),
    storage_conditions: z.string().optional().nullable(),
    packaging_id: z.string().uuid("Please select a valid package").optional().nullable(),
}).refine(data => {
    if (data.unit_category === 'weight') return ['kg', 'g'].includes(data.base_unit);
    if (data.unit_category === 'volume') return ['ltr', 'ml'].includes(data.base_unit);
    if (data.unit_category === 'count') return data.base_unit === 'pcs';
    return false;
}, {
    message: "Invalid unit selected for the chosen category",
    path: ["base_unit"]
});

// --- Tab Interfaces & Components ---

interface ProductTabProps {
    productData: Partial<Product>;
    errors: Record<string, string>;
    apiError: string | null;
    isNew: boolean;
    setProductData: React.Dispatch<React.SetStateAction<Partial<Product>>>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    setApiError: React.Dispatch<React.SetStateAction<string | null>>;
    handleChange: (field: string, value: unknown) => void;
    handleNumberChange: (field: string, val: string) => void;
    comboboxes: {
        category: { options: { label: string, value: string }[], search: string, setSearch: (v: string) => void };
        package: { options: { label: string, value: string }[], search: string, setSearch: (v: string) => void };
        brand: { options: { label: string, value: string }[], search: string, setSearch: (v: string) => void };
        fragrance: { options: { label: string, value: string }[], search: string, setSearch: (v: string) => void };
    };
    images: {
        previews: { id?: string; url: string }[];
        slideIdx: number;
        setSlideIdx: React.Dispatch<React.SetStateAction<number>>;
        deletePhoto: (id: string | undefined, idx: number) => void;
        openModal: () => void;
        setLightboxIndex: React.Dispatch<React.SetStateAction<number | null>>;
    };
    metadata: {
        metaColors: string[]; setMetaColors: (val: string[]) => void;
        metaFeatures: string[]; setMetaFeatures: (val: string[]) => void;
        metaParams: { key: string, value: string }[]; setMetaParams: (val: { key: string, value: string }[]) => void;
        metaAttrs: { key: string, value: string }[]; setMetaAttrs: (val: { key: string, value: string }[]) => void;
    },
    drawers?: {
        category: { open: boolean, setOpen: (v: boolean) => void };
        fragrance: { open: boolean, setOpen: (v: boolean) => void };
        brand: { open: boolean, setOpen: (v: boolean) => void };
    };
    packageModal?: { open: boolean, setOpen: (v: boolean) => void };
}

const BasicInfoTab = ({ productData, errors, apiError, isNew, handleChange, comboboxes, drawers }: ProductTabProps) => (
    <div className="p-1 space-y-4">
        <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <ProductInput
                label="Product Name" value={productData.product_name ?? ""}
                error={errors.product_name} onChange={(val) => handleChange("product_name", val)} placeholder="Enter product name"
            />
            <ProductInput
                label="Product Code" value={productData.code ?? ""}
                error={errors.code} onChange={(val) => handleChange("code", val)} placeholder="Auto or Manual"
            />

            <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Product Type</Label>
                <Select value={productData.product_type || "FINISHED_GOOD"} onValueChange={(v) => handleChange("product_type", v)}>
                    <SelectTrigger className="text-sm h-9">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FINISHED_GOOD" className="text-xs">Finished Good</SelectItem>
                        <SelectItem value="RAW_MATERIAL" className="text-xs">Raw Material</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
                <Combobox
                    options={comboboxes.category.options} value={productData.category_id ?? ""}
                    onValueChange={(v) => handleChange("category_id", v)} placeholder="Select category..."
                    searchPlaceholder="Search category..." emptyText="No categories found."
                    className={`h-9 ${errors.category_id ? 'border-destructive' : ''}`}
                    clearable searchValue={comboboxes.category.search} onSearchChange={comboboxes.category.setSearch}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 gap-1"
                    onClick={() => drawers?.category.setOpen(true)}
                >
                    <Plus className="h-3 w-3" /> Add New Category
                </Button>
                {errors.category_id && <p className="text-[10px] text-destructive mt-1">{errors.category_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Brand Item</Label>
                    <RadioGroup
                        value={productData.is_brand ? "yes" : "no"}
                        onValueChange={(val) => handleChange("is_brand", val === "yes")}
                        className="flex items-center gap-2 h-9"
                    >
                        <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="yes" id="brand-yes" />
                            <Label htmlFor="brand-yes" className="text-sm cursor-pointer font-medium m-0">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <RadioGroupItem value="no" id="brand-no" />
                            <Label htmlFor="brand-no" className="text-sm cursor-pointer font-medium m-0">No</Label>
                        </div>
                    </RadioGroup>
                </div>

                <ProductInput
                    label="HSN Code" value={productData.hsn_code ?? ""}
                    error={errors.hsn_code} onChange={(val) => handleChange("hsn_code", val)} placeholder="e.g. 3401.19"
                    className="flex-1"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Fragrance</Label>
                    <Combobox
                        options={comboboxes.fragrance.options} value={productData.fragrance_id ?? ""}
                        onValueChange={(v) => handleChange("fragrance_id", v)} placeholder="Select fragrance..."
                        searchPlaceholder="Search fragrance..." emptyText="No fragrances found."
                        className={`h-9 ${errors.fragrance_id ? 'border-destructive' : ''}`}
                        clearable searchValue={comboboxes.fragrance.search} onSearchChange={comboboxes.fragrance.setSearch}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 gap-1"
                        onClick={() => drawers?.fragrance.setOpen(true)}
                    >
                        <Plus className="h-3 w-3" /> Add New Fragrance
                    </Button>
                    {errors.fragrance_id && <p className="text-[10px] text-destructive mt-1">{errors.fragrance_id}</p>}
                </div>
                {productData.is_brand && (
                    <div className="space-y-2">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Brand</Label>
                        <Combobox
                            options={comboboxes.brand.options} value={productData.brand_id ?? ""}
                            onValueChange={(v) => handleChange("brand_id", v)} placeholder="Select brand..."
                            searchPlaceholder="Search brand..." emptyText="No brands found."
                            className={`h-9 ${errors.brand_id ? 'border-destructive' : ''}`}
                            clearable searchValue={comboboxes.brand.search} onSearchChange={comboboxes.brand.setSearch}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 gap-1"
                            onClick={() => drawers?.brand.setOpen(true)}
                        >
                            <Plus className="h-3 w-3" /> Add New Brand
                        </Button>
                        {errors.brand_id && <p className="text-[10px] text-destructive mt-1">{errors.brand_id}</p>}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const UnitsMeasurementsTab = ({ productData, errors, handleChange, handleNumberChange, setProductData, setErrors, setApiError }: ProductTabProps) => (
    <div className="space-y-4 p-1">
        <div className="flex items-center gap-2 mb-4">
            <Scale className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Units & Measurements</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
            <div className="space-y-2 lg:col-span-1">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Base Unit</Label>
                <Select
                    value={productData.base_unit || "pcs"}
                    onValueChange={(v) => {
                        const category = (v === "kg" || v === "g") ? "weight" : (v === "ltr" || v === "ml") ? "volume" : "count";
                        setProductData((prev) => ({ ...prev, base_unit: v as "kg" | "g" | "ltr" | "ml" | "pcs", unit_category: category as "weight" | "volume" | "count" }));
                        setErrors(prev => { const next = { ...prev }; delete next.base_unit; delete next.unit_category; return next; });
                        setApiError(null);
                    }}
                >
                    <SelectTrigger className={`text-sm ${errors.base_unit ? 'input-error border-destructive' : ''}`}>
                        <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="kg" className="text-xs">Kilogram (kg)</SelectItem>
                        <SelectItem value="g" className="text-xs">Gram (g)</SelectItem>
                        <SelectItem value="ltr" className="text-xs">Liter (ltr)</SelectItem>
                        <SelectItem value="ml" className="text-xs">Milliliter (ml)</SelectItem>
                        <SelectItem value="pcs" className="text-xs">Pieces (pcs)</SelectItem>
                    </SelectContent>
                </Select>
                {errors.base_unit && <p className="text-[10px] text-destructive mt-1">{errors.base_unit}</p>}
            </div>

            <div className="space-y-2 lg:col-span-1">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Unit Category</Label>
                <Select value={productData.unit_category || "count"} disabled>
                    <SelectTrigger className="text-sm bg-muted/50 cursor-not-allowed">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weight" className="text-xs">Weight</SelectItem>
                        <SelectItem value="volume" className="text-xs">Volume</SelectItem>
                        <SelectItem value="count" className="text-xs">Count (Pieces)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {productData.unit_category === 'weight' && (
                <ProductInput
                    label={`Weight ${productData.base_unit !== 'kg' && productData.base_unit !== 'g' ? `(${productData.base_unit || ''})` : ''}`}
                    type="number" value={productData.weight ?? ""} error={errors.weight}
                    onChange={(val) => handleNumberChange("weight", val)} placeholder="0.00" className="lg:col-span-1"
                />
            )}

            {/* Merged Dimensions Input */}
            <div className="lg:col-span-3 space-y-2">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Dimensions (L × W × H)
                </Label>

                <div className="flex items-center gap-2">
                    {/* Length */}
                    <Input
                        type="number"
                        step="any"
                        value={productData.length?.toString() || ""}
                        onChange={(e) => handleNumberChange("length", e.target.value)}
                        placeholder="L"
                        className="text-sm"
                    />

                    <span className="text-muted-foreground text-sm">×</span>

                    {/* Width */}
                    <Input
                        type="number"
                        step="any"
                        value={productData.width?.toString() || ""}
                        onChange={(e) => handleNumberChange("width", e.target.value)}
                        placeholder="W"
                        className="text-sm"
                    />

                    <span className="text-muted-foreground text-sm">×</span>

                    {/* Height */}
                    <Input
                        type="number"
                        step="any"
                        value={productData.height?.toString() || ""}
                        onChange={(e) => handleNumberChange("height", e.target.value)}
                        placeholder="H"
                        className="text-sm"
                    />

                    {/* Unit */}
                    <Select
                        value={productData.dimension_unit || "cm"}
                        onValueChange={(val) => handleChange("dimension_unit", val)}
                    >
                        <SelectTrigger className="h-9 text-sm w-[90px]">
                            <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mm" className="text-xs">mm</SelectItem>
                            <SelectItem value="cm" className="text-xs">cm</SelectItem>
                            <SelectItem value="m" className="text-xs">m</SelectItem>
                            <SelectItem value="in" className="text-xs">in</SelectItem>
                            <SelectItem value="ft" className="text-xs">ft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <ProductInput
                label="Size Value" type="number" value={productData.size_value ?? ""}
                onChange={(val) => handleNumberChange("size_value", val)} placeholder="e.g. 500"
            />
        </div>
    </div>
);

const PackagingTab = ({ productData, errors, handleChange, comboboxes, packageModal }: ProductTabProps) => {
    if (productData.product_type !== "FINISHED_GOOD") {
        return (
            <div className="p-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                Packaging settings are only available for Finished Goods.
            </div>
        );
    }
    return (
        <div className="space-y-4 p-1">
            <div className="flex items-center gap-2 mb-4">
                <PackageCheck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Packaging</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Packaging Type</Label>
                    <Combobox
                        options={comboboxes.package.options} value={productData.packaging_id ?? ""}
                        onValueChange={(v) => handleChange("packaging_id", v)} placeholder="Select format..."
                        searchPlaceholder="Search package..." emptyText="No packages found."
                        className={`h-10 ${errors.packaging_id ? 'border-destructive' : ''}`}
                        clearable searchValue={comboboxes.package.search} onSearchChange={comboboxes.package.setSearch}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 gap-1"
                        onClick={() => packageModal?.setOpen(true)}
                    >
                        <Plus className="h-3 w-3" /> Add New Package
                    </Button>
                    {errors.packaging_id && <p className="text-[10px] text-destructive mt-1">{errors.packaging_id}</p>}
                </div>
                <ProductInput label="Shape/Form" value={productData.shape ?? ""} onChange={(val) => handleChange("shape", val)} placeholder="e.g. Round" />
                <ProductInput label="Material" value={productData.material ?? ""} onChange={(val) => handleChange("material", val)} placeholder="e.g. Glass" />
                <ProductInput label="Capacity" value={productData.capacity ?? ""} onChange={(val) => handleChange("capacity", val)} placeholder="e.g. 500ml" />
            </div>
        </div>
    );
};

const PricingTab = ({ productData, errors, handleNumberChange }: ProductTabProps) => (
    <div className="space-y-4 p-1">
        <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Pricing & Tax Info</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <ProductInput
                label="Cost Price" type="number" prefix="₹" value={productData.cost_price ?? ""}
                error={errors.cost_price} onChange={(val) => handleNumberChange("cost_price", val)} placeholder="0.00"
            />
            <ProductInput
                label="Selling Price" type="number" prefix="₹" value={productData.selling_price ?? ""}
                error={errors.selling_price} onChange={(val) => handleNumberChange("selling_price", val)} placeholder="0.00"
            />
        </div>
    </div>
);

const SpecificationsTab = ({ metadata }: ProductTabProps) => {
    const { metaColors, setMetaColors, metaFeatures, setMetaFeatures, metaParams, setMetaParams, metaAttrs, setMetaAttrs } = metadata;
    return (
        <div className="space-y-4 p-1">
            <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Specifications</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Colors */}
                <div className="bg-muted/30 p-4 rounded-md border flex flex-col gap-3">
                    <div className="flex justify-between items-center w-full">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
                            <Tags className="h-3 w-3" /> Available Colors
                        </Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setMetaColors([...metaColors, ''])} className="h-6 px-2 text-[10px] uppercase tracking-wider">
                            <Plus className="w-3 h-3 mr-1" /> Add Color
                        </Button>
                    </div>
                    <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
                        {metaColors.map((color, idx) => (
                            <div key={`color-${idx}`} className="flex gap-2 items-center w-full">
                                <Input value={color} onChange={(e) => updateArrayState(setMetaColors, idx, e.target.value)} placeholder="e.g. White, Red, Blue" className="text-sm flex-1 min-w-0" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayState(setMetaColors, idx)} className="text-muted-foreground hover:text-destructive shrink-0" disabled={metaColors.length === 1 && !color}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="bg-muted/30 p-4 rounded-md border flex flex-col gap-3">
                    <div className="flex justify-between items-center w-full">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
                            <Shield className="h-3 w-3" /> Key Features
                        </Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setMetaFeatures([...metaFeatures, ''])} className="h-6 px-2 text-[10px] uppercase tracking-wider">
                            <Plus className="w-3 h-3 mr-1" /> Add Feature
                        </Button>
                    </div>
                    <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
                        {metaFeatures.map((feature, idx) => (
                            <div key={`feature-${idx}`} className="flex gap-2 items-center w-full">
                                <Input value={feature} onChange={(e) => updateArrayState(setMetaFeatures, idx, e.target.value)} placeholder="e.g. Eco-friendly, Water-resistant" className="text-sm flex-1 min-w-0" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayState(setMetaFeatures, idx)} className="text-muted-foreground hover:text-destructive shrink-0" disabled={metaFeatures.length === 1 && !feature}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parameters */}
                <div className="bg-muted/30 p-4 rounded-md border flex flex-col gap-3">
                    <div className="flex justify-between items-center w-full">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
                            <Layers className="h-3 w-3" /> Parameters
                        </Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setMetaParams([...metaParams, { key: '', value: '' }])} className="h-6 px-2 text-[10px] uppercase tracking-wider">
                            <Plus className="w-3 h-3 mr-1" /> Add Parameter
                        </Button>
                    </div>
                    <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
                        {metaParams.map((param, idx) => (
                            <div key={idx} className="flex gap-2 items-center w-full">
                                <Input value={param.key} onChange={(e) => updateObjectState(setMetaParams, idx, 'key', e.target.value)} placeholder="Key (e.g. Wattage)" className="text-sm flex-1 min-w-0" />
                                <Input value={param.value} onChange={(e) => updateObjectState(setMetaParams, idx, 'value', e.target.value)} placeholder="Value (e.g. 100W)" className="text-sm flex-1 min-w-0" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeObjectState(setMetaParams, idx)} className="text-muted-foreground hover:text-destructive shrink-0" disabled={metaParams.length === 1 && !param.key && !param.value}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attributes */}
                <div className="bg-muted/30 p-4 rounded-md border flex flex-col gap-3">
                    <div className="flex justify-between items-center w-full">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1 m-0">
                            <Box className="h-3 w-3" /> Attributes
                        </Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => setMetaAttrs([...metaAttrs, { key: '', value: '' }])} className="h-6 px-2 text-[10px] uppercase tracking-wider">
                            <Plus className="w-3 h-3 mr-1" /> Add Attribute
                        </Button>
                    </div>
                    <div className="space-y-2 flex-1 max-h-48 overflow-y-auto pr-2">
                        {metaAttrs.map((attr, idx) => (
                            <div key={idx} className="flex gap-2 items-center w-full">
                                <Input value={attr.key} onChange={(e) => updateObjectState(setMetaAttrs, idx, 'key', e.target.value)} placeholder="Key (e.g. Material)" className="text-sm flex-1 min-w-0" />
                                <Input value={attr.value} onChange={(e) => updateObjectState(setMetaAttrs, idx, 'value', e.target.value)} placeholder="Value (e.g. Cotton)" className="text-sm flex-1 min-w-0" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeObjectState(setMetaAttrs, idx)} className="text-muted-foreground hover:text-destructive shrink-0" disabled={metaAttrs.length === 1 && !attr.key && !attr.value}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const KitsTab = ({ productId, productType, isNew }: { productId?: string; productType?: string, isNew: boolean }) => {
    const [kitSearch, setKitSearch] = useState("");
    const debouncedKitSearch = useDebounce(kitSearch, 300);
    const [selectedKitId, setSelectedKitId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("1");
    const [viewKitId, setViewKitId] = useState<string | undefined>();

    const { data: kitsByProduct = [], isLoading: isLoadingAssoc } = useKitsByProduct(isNew ? undefined : productId);
    const { data: allKitsData } = useKitList({ search: debouncedKitSearch, combobox: true });
    const { mutate: associate, isPending: isAssociating } = useAssociateProductToKit();
    const { mutate: disassociate, isPending: isDisassociating } = useDisassociateProductFromKit();

    const allKitsOptions = (allKitsData?.items || []).map((k: Kit) => ({
        label: k.sku ? `${k.name} (${k.sku})` : k.name,
        value: k.id,
    }));

    const handleAdd = () => {
        const qty = parseFloat(quantity);
        if (!selectedKitId || !productId || isNaN(qty) || qty <= 0) return;
        associate({ kit_id: selectedKitId, product_id: productId, quantity_per_kit: qty }, {
            onSuccess: () => {
                setSelectedKitId("");
                setQuantity("1");
            },
        });
    };

    const columns: Column<KitMembership>[] = [
        {
            key: "name",
            header: "Kit Information",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-primary/10 text-primary rounded flex items-center justify-center shrink-0 border border-primary/20">
                        <Package className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate">{item.sku || "NO-SKU"}</p>
                    </div>
                </div>
            )
        },
        {
            key: "quantity_per_kit",
            header: "Qty / Kit",
            className: "w-[120px]",
            render: (item) => (
                <span className="text-xs font-bold font-mono text-primary">
                    {item.quantity_per_kit}
                </span>
            )
        },
        {
            key: "id",
            header: "",
            className: "w-[80px] text-right",
            render: (item) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => disassociate({ kit_id: item.id!, product_id: productId! })}
                        disabled={isDisassociating}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    if (isNew) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border transition-all hover:bg-muted/20">
                <Box className="h-8 w-8 text-primary opacity-40 mb-3" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Save Product First</h3>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Kits can only be associated once the product record is created. Please save your changes and return to this tab.
                </p>
            </div>
        );
    }

    if (productType !== "FINISHED_GOOD") {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border">
                <Layers className="h-8 w-8 text-muted-foreground opacity-30 mb-3" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Kits Unavailable</h3>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Only <span className="text-primary font-bold">Finished Goods</span> can be bundled into kits. Raw materials should be managed via Recipes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section with Stats */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 h-8">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.1em]">Product Kit Memberships</h3>
                </div>
                {!isLoadingAssoc && kitsByProduct.length > 0 && (
                    <Badge variant="outline" className="h-5 text-[9px] font-bold uppercase tracking-wider rounded-md border-primary/20 bg-primary/5 text-primary">
                        {kitsByProduct.length} {kitsByProduct.length === 1 ? 'Association' : 'Associations'}
                    </Badge>
                )}
            </div>

            {/* Quick Add Section */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-card border border-border/80 rounded-xl shadow-sm p-4 space-y-4">
                    <div className="flex flex-col lg:flex-row items-end gap-3">
                        <div className="flex-[3] w-full space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">Find Kit to Join</Label>
                            <Combobox
                                options={allKitsOptions}
                                value={selectedKitId}
                                onValueChange={setSelectedKitId}
                                placeholder="Search kits or SKU..."
                                searchValue={kitSearch}
                                onSearchChange={setKitSearch}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="flex-1 w-full lg:w-[120px] space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">Qty / Kit</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="1.00"
                                    className="h-9 text-xs font-mono pr-7"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground uppercase">Unit</span>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={!selectedKitId || isAssociating}
                            className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 group transition-all"
                        >
                            {isAssociating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />}
                            <span className="text-xs font-bold uppercase tracking-wider">Add Association</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-primary rounded-full"></div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Kit Memberships</span>
                </div>
                <div className="rounded-xl border border-border/60 overflow-hidden shadow-inner bg-muted/5">
                    <DataTable
                        data={kitsByProduct}
                        columns={columns}
                        isLoading={isLoadingAssoc}
                        pageSize={5}
                        onRowClick={(item) => setViewKitId(item.id)}
                    />
                </div>
            </div>

            <KitViewModal
                open={!!viewKitId}
                onClose={() => setViewKitId(undefined)}
                kitId={viewKitId}
            />
        </div>
    );
};

const RecipesTab = ({ productId, productType, isNew, sellingPrice }: { productId?: string; productType?: string; isNew: boolean; sellingPrice: number }) => {
    const [isBomModalOpen, setIsBomModalOpen] = useState(false);
    const { data: bom, isLoading } = useBOMDetails(isNew ? undefined : productId);

    if (isNew) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border transition-all hover:bg-muted/20">
                <Box className="h-8 w-8 text-primary opacity-40 mb-3" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Save Product First</h3>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Recipes can only be defined once the product record is created. Please save your changes and return to this tab.
                </p>
            </div>
        );
    }

    if (productType !== "FINISHED_GOOD") {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border">
                <Activity className="h-8 w-8 text-muted-foreground opacity-30 mb-3" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Recipes Unavailable</h3>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                    Recipes are only applicable to <span className="text-primary font-bold">Finished Goods</span>. Raw materials are used as components within recipes.
                </p>
            </div>
        );
    }

    const totalCost = bom?.raw_materials?.reduce((sum, m) => sum + (m.raw_quantity * (m.cost_price || 0)), 0) || 0;
    const profit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 h-8">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-[0.1em]">Manufacturing Formulation</h3>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBomModalOpen(true)}
                    className="h-7 text-[10px] font-bold uppercase tracking-wider border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                >
                    {bom ? "Manage Recipe" : "Create Recipe"}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : !bom || !bom.raw_materials || bom.raw_materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/5 rounded-xl border border-dashed border-border group hover:bg-muted/10 transition-all cursor-pointer" onClick={() => setIsBomModalOpen(true)}>
                    <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6 text-primary/40" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Recipe Defined</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                        This finished good doesn't have a Bill of Materials yet. Click to define the raw materials required for production.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base Material Cost</p>
                            <p className="text-xl font-bold font-mono text-primary">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/60 space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selling Price</p>
                            <p className="text-xl font-bold font-mono text-foreground">₹{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className={`p-4 rounded-xl border space-y-1 ${profit >= 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-destructive/5 border-destructive/10'}`}>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                                Est. Margin ({margin.toFixed(1)}%)
                            </p>
                            <p className={`text-xl font-bold font-mono ${profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                                {profit >= 0 ? '+' : ''}₹{profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Ingredient Table */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-1 w-6 bg-primary rounded-full"></div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Formula Ingredients</span>
                        </div>
                        <div className="rounded-xl border border-border/60 overflow-hidden shadow-inner bg-card">
                            <table className="w-full text-xs">
                                <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/60">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left">Material</th>
                                        <th className="px-4 py-2.5 text-center w-[120px]">Quantity</th>
                                        <th className="px-4 py-2.5 text-right w-[150px]">Cost Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {bom.raw_materials.map((m) => (
                                        <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded bg-primary/5 flex items-center justify-center border border-primary/10">
                                                        <Box className="h-3 w-3 text-primary/60" />
                                                    </div>
                                                    <span className="font-semibold text-foreground">{m.raw_product}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="secondary" className="font-mono text-[10px] font-bold">
                                                    {m.raw_quantity} {m.raw_unit}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-primary/80">
                                                ₹{(m.raw_quantity * (m.cost_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <BomModal
                isOpen={isBomModalOpen}
                onClose={() => setIsBomModalOpen(false)}
                bomId={productId}
            />
        </div>
    );
};


// --- Main Form Component ---
const ProductFormPage = () => {
    const { id, companyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = location.pathname.startsWith("/admin");
    const routePrefix = isAdmin ? "/admin" : `/${companyId}`;
    const isNew = id === "new" || !id;

    // --- Hooks & Data Fetching ---
    const { data: fetchedProduct, isLoading, error: fetchError } = useProduct(isNew ? undefined : id);
    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const { mutate: deletePhoto } = useDeleteProductPhoto();
    const isSaving = isCreating || isUpdating;

    // --- State Initialization ---
    const [productData, setProductData] = useState<Partial<Product>>({
        id: isNew ? crypto.randomUUID() : (id as string),
        code: "", product_name: "", category_id: null, product_type: "FINISHED_GOOD",
        is_brand: false, base_unit: "pcs", unit_category: "count",
        weight: null, length: null, width: null, height: null, size_value: null,
        packaging_id: null, hsn_code: null, shape: null, capacity: null, material: null,
        cost_price: null, selling_price: null, is_active: true, metadata: {},
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("measurements");

    // UI states
    const [imagePreviews, setImagePreviews] = useState<{ id?: string; url: string }[]>([]);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
    const [isFragranceDrawerOpen, setIsFragranceDrawerOpen] = useState(false);
    const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [slideIdx, setSlideIdx] = useState(0);

    // Combobox search states
    const [categorySearch, setCategorySearch] = useState('');
    const debouncedCategorySearch = useDebounce(categorySearch, 300);
    const [packageSearch, setPackageSearch] = useState('');
    const debouncedPackageSearch = useDebounce(packageSearch, 300);
    const [brandSearch, setBrandSearch] = useState('');
    const debouncedBrandSearch = useDebounce(brandSearch, 300);
    const [fragranceSearch, setFragranceSearch] = useState('');
    const debouncedFragranceSearch = useDebounce(fragranceSearch, 300);

    // Fetch combobox options
    const { data: fetchedCategories = [] } = useCategoriesCombobox({ type: 'sub', search: debouncedCategorySearch });
    const { data: fetchedPackages = [] } = usePackagesCombobox({ search: debouncedPackageSearch.trim() || undefined });
    const { data: fetchedBrands = [] } = useBrandCombobox({ search: debouncedBrandSearch, status: 'active' });
    const { data: fetchedFragrances = [] } = useFragranceCombobox({ search: debouncedFragranceSearch, status: 'active' });

    const categoryOptions = fetchedCategories.map((cat: Category) => ({
        label: cat.parent_name ? `${cat.name} (${cat.parent_name})` : cat.name,
        value: cat.id
    }));
    const packageOptions = fetchedPackages.map((pkg: PackageType) => ({
        label: pkg.package_code ? `${pkg.package_name} (${pkg.package_code})` : pkg.package_name,
        value: pkg.id
    }));
    const brandOptions = fetchedBrands.map((b: Brand) => ({ label: b.name, value: b.id }));
    const fragranceOptions = fetchedFragrances.map((f: Fragrance) => ({ label: f.name, value: f.id }));

    // Metadata Handlers
    const getInitialMetadata = useCallback((dataToParse: Partial<Product>) => {
        const meta = (dataToParse?.metadata || {});
        return {
            colors: Array.isArray(meta.colors) && meta.colors.length > 0 ? meta.colors.map(String) : [''],
            features: Array.isArray(meta.features) && meta.features.length > 0 ? meta.features.map(String) : [''],
            params: meta.parameters && Object.keys(meta.parameters).length > 0
                ? Object.entries(meta.parameters).map(([k, v]) => ({ key: k, value: String(v) }))
                : [{ key: '', value: '' }],
            attrs: meta.attributes && Object.keys(meta.attributes).length > 0
                ? Object.entries(meta.attributes).map(([k, v]) => ({ key: k, value: String(v) }))
                : [{ key: '', value: '' }]
        };
    }, []);

    const [metaColors, setMetaColors] = useState<string[]>(() => getInitialMetadata({}).colors);
    const [metaFeatures, setMetaFeatures] = useState<string[]>(() => getInitialMetadata({}).features);
    const [metaParams, setMetaParams] = useState<{ key: string, value: string }[]>(() => getInitialMetadata({}).params);
    const [metaAttrs, setMetaAttrs] = useState<{ key: string, value: string }[]>(() => getInitialMetadata({}).attrs);

    // --- Effects ---
    useEffect(() => {
        if (fetchError) toast.error("Failed to load product details");
    }, [fetchError]);

    // Sync fetched data to local state
    useEffect(() => {
        if (fetchedProduct && !isNew) {
            setProductData(fetchedProduct);
            const initial = getInitialMetadata(fetchedProduct);
            setMetaColors(initial.colors);
            setMetaFeatures(initial.features);
            setMetaParams(initial.params);
            setMetaAttrs(initial.attrs);

            if (fetchedProduct.images && Array.isArray(fetchedProduct.images)) {
                const initialPreviews = fetchedProduct.images
                    .map((img) => ({
                        id: img?.id,
                        url: img?.image?.url || img?.image_url?.url || img?.url || '',
                    }))
                    .filter((x) => x.url);
                setImagePreviews(initialPreviews);
            }
        }
    }, [fetchedProduct, isNew, getInitialMetadata]);

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? (i + 1) % imagePreviews.length : null);
            if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? (i - 1 + imagePreviews.length) % imagePreviews.length : null);
            if (e.key === 'Escape') setLightboxIndex(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightboxIndex, imagePreviews.length]);

    // --- Form Handlers ---
    const handleChange = (field: string, value: unknown) => {
        setProductData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const updated = { ...prev }; delete updated[field]; return updated; });
        }
        if (apiError) setApiError(null);
    };

    const handleNumberChange = (field: string, val: string) => {
        const num = val === '' ? null : parseFloat(val);
        handleChange(field, isNaN(num as number) ? null : num);
    };

    const handleDeletePhoto = (imageId: string | undefined, index: number) => {
        if (imageId && productData.id) {
            deletePhoto({ productId: productData.id as string, imageId });
        }
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleReset = useCallback(() => {
        setErrors({}); setApiError(null);
        if (fetchedProduct && !isNew) {
            setProductData(fetchedProduct);
            const initial = getInitialMetadata(fetchedProduct);
            setMetaColors(initial.colors); setMetaFeatures(initial.features);
            setMetaParams(initial.params); setMetaAttrs(initial.attrs);

            if (fetchedProduct.images && Array.isArray(fetchedProduct.images)) {
                const initialPreviews = fetchedProduct.images
                    .map((img) => ({ id: img?.id, url: img?.image?.url || img?.image_url?.url || img?.url || '' }))
                    .filter((x) => x.url);
                setImagePreviews(initialPreviews);
            }
        } else {
            setProductData({
                id: crypto.randomUUID(), product_type: "FINISHED_GOOD",
                base_unit: "pcs", unit_category: "count", is_active: true,
            });
            setMetaColors(['']); setMetaFeatures(['']);
            setMetaParams([{ key: '', value: '' }]); setMetaAttrs([{ key: '', value: '' }]);
            setImagePreviews([]);
        }
    }, [fetchedProduct, isNew, getInitialMetadata]);

    const handleSave = () => {
        try {
            const validData = productSchema.parse({
                ...productData,
                category_id: productData.category_id || null, packaging_id: productData.packaging_id || null,
                weight: productData.weight ? Number(productData.weight) : null,
                length: productData.length ? Number(productData.length) : null,
                width: productData.width ? Number(productData.width) : null,
                height: productData.height ? Number(productData.height) : null,
                size_value: productData.size_value ? Number(productData.size_value) : null,
                dimension_unit: productData.dimension_unit || null,
                brand_id: productData.brand_id || null, fragrance_id: productData.fragrance_id || null,
                cost_price: productData.cost_price ? Number(productData.cost_price) : null,
                selling_price: productData.selling_price ? Number(productData.selling_price) : null,
            });

            setErrors({}); setApiError(null);

            const buildObject = (arr: { key: string, value: string }[]) => arr.reduce((acc, curr) => {
                const k = curr.key.trim(); const v = curr.value.trim();
                if (k && v) acc[k] = v; return acc;
            }, {} as Record<string, string>);

            const parameters = buildObject(metaParams);
            const attributes = buildObject(metaAttrs);
            const finalColors = metaColors.map(c => c.trim()).filter(Boolean);
            const finalFeatures = metaFeatures.map(f => f.trim()).filter(Boolean);

            const payload = {
                ...validData,
                metadata: {
                    ...(finalColors.length > 0 && { colors: finalColors }),
                    ...(finalFeatures.length > 0 && { features: finalFeatures }),
                    ...(Object.keys(parameters).length > 0 && { parameters }),
                    ...(Object.keys(attributes).length > 0 && { attributes })
                },
            };

            const onErrorHandler = (error: unknown) => {
                const err = error as ApiErrorResponse;
                const errorData = (err?.details || err?.response?.data || err || {}) as ApiErrorResponse;

                if (errorData?.code === "validation_error" && errorData.details?.body) {
                    setErrors(errorData.details.body);
                } else if (errorData?.code === "duplicate_key_value") {
                    const msg = errorData.message || "A duplicate record exists.";
                    setApiError(msg);
                    if (msg.toLowerCase().includes("product name")) setErrors(prev => ({ ...prev, product_name: msg }));
                    else if (msg.toLowerCase().includes("product_code")) setErrors(prev => ({ ...prev, code: msg }));
                    else if (msg.toLowerCase().includes("hsn_code")) setErrors(prev => ({ ...prev, hsn_code: msg }));
                } else if (errorData?.message) {
                    setApiError(errorData.message);
                } else {
                    setApiError("An unexpected error occurred while saving.");
                }
            };

            if (isNew) {
                createProduct(payload as unknown as ProductCreatePayload, {
                    onSuccess: () => navigate(`${routePrefix}/products`),
                    onError: onErrorHandler
                });
            } else {
                updateProduct({ ...payload, id: productData.id as string }, {
                    onError: onErrorHandler
                });
            }
        } catch (error) {
            console.error("Zod Validation Error:", error);
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach(err => { if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message; });
                setErrors(fieldErrors);

                // Switch to Measurements tab if errors are there
                if (fieldErrors.base_unit || fieldErrors.weight) {
                    setActiveTab("measurements");
                }

                const errorCount = Object.keys(fieldErrors).length;
                toast.error(`Please correct the ${errorCount} highlighted error${errorCount === 1 ? '' : 's'}.`);
            } else {
                setApiError("An unexpected exception occurred.");
            }
        }
    };

    // Props Bundle Object
    const tabProps: ProductTabProps = {
        productData, errors, apiError, isNew, setProductData, setErrors, setApiError, handleChange, handleNumberChange,
        comboboxes: {
            category: { options: categoryOptions, search: categorySearch, setSearch: setCategorySearch },
            package: { options: packageOptions, search: packageSearch, setSearch: setPackageSearch },
            brand: { options: brandOptions, search: brandSearch, setSearch: setBrandSearch },
            fragrance: { options: fragranceOptions, search: fragranceSearch, setSearch: setFragranceSearch },
        },
        images: {
            previews: imagePreviews, slideIdx, setSlideIdx,
            deletePhoto: handleDeletePhoto, openModal: () => setIsPhotoModalOpen(true), setLightboxIndex
        },
        metadata: {
            metaColors, setMetaColors, metaFeatures, setMetaFeatures,
            metaParams, setMetaParams, metaAttrs, setMetaAttrs
        },
        drawers: {
            category: { open: isCategoryDrawerOpen, setOpen: setIsCategoryDrawerOpen },
            fragrance: { open: isFragranceDrawerOpen, setOpen: setIsFragranceDrawerOpen },
            brand: { open: isBrandDrawerOpen, setOpen: setIsBrandDrawerOpen },
        },
        packageModal: { open: isPackageModalOpen, setOpen: setIsPackageModalOpen }
    };

    // --- Render ---
    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
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
            </div>

            {/* Content Body */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading product details...</p>
                </div>
            ) : (
                <div className="p-4 border border-border rounded-lg bg-card shadow-sm space-y-6 animate-in fade-in-50 duration-300">

                    {/* Basic Information - Always visible */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2">
                            <BasicInfoTab {...tabProps} />
                        </div>

                        {/* Image Section */}
                        <div className="xl:col-span-1 space-y-4 pt-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-primary" />
                                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Product Images</h3>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-sm" onClick={tabProps.images.openModal}>
                                    <UploadCloud className="h-3 w-3 mr-1" />
                                    Add Photos
                                </Button>
                            </div>

                            <div className="border border-dashed border-border rounded-lg p-4 bg-muted/10 min-h-[180px] flex flex-col items-start">
                                {tabProps.images.previews.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center w-full h-full flex-1 gap-2 text-muted-foreground py-8">
                                        <ImageIcon className="h-8 w-8 opacity-30" />
                                        <p className="text-xs">No images uploaded yet</p>
                                        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs rounded-sm mt-1" onClick={tabProps.images.openModal}>
                                            <UploadCloud className="h-3 w-3 mr-1" /> Upload first image
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col w-full gap-2 flex-1">
                                        <div className="relative w-full rounded-md overflow-hidden bg-muted/20 border border-border group cursor-zoom-in" style={{ minHeight: 160 }}>
                                            <img
                                                src={tabProps.images.previews[Math.min(tabProps.images.slideIdx, tabProps.images.previews.length - 1)].url}
                                                alt={`Product image ${Math.min(tabProps.images.slideIdx, tabProps.images.previews.length - 1) + 1}`}
                                                className="w-full object-cover"
                                                style={{ minHeight: 160, maxHeight: 200 }}
                                                onClick={() => tabProps.images.setLightboxIndex(Math.min(tabProps.images.slideIdx, tabProps.images.previews.length - 1))}
                                            />
                                            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full pointer-events-none">
                                                {Math.min(tabProps.images.slideIdx, tabProps.images.previews.length - 1) + 1} / {tabProps.images.previews.length}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const idx = Math.min(tabProps.images.slideIdx, tabProps.images.previews.length - 1);
                                                    tabProps.images.deletePhoto(tabProps.images.previews[idx].id, idx);
                                                    if (idx > 0) tabProps.images.setSlideIdx(idx - 1);
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                                <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-60 transition-opacity" />
                                            </div>
                                            {tabProps.images.previews.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); tabProps.images.setSlideIdx(i => (i - 1 + tabProps.images.previews.length) % tabProps.images.previews.length); }}
                                                        className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); tabProps.images.setSlideIdx(i => (i + 1) % tabProps.images.previews.length); }}
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {tabProps.images.previews.length > 1 && (
                                            <div className="flex items-center justify-center gap-1.5">
                                                {tabProps.images.previews.map((_, i) => (
                                                    <button
                                                        key={i} type="button" onClick={() => tabProps.images.setSlideIdx(i)}
                                                        className={`rounded-full transition-all ${i === Math.min(tabProps.images.slideIdx, tabProps.images.previews.length - 1) ? 'bg-primary w-3 h-1.5' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60 w-1.5 h-1.5'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-4 w-full pt-3 border-t border-border/50 text-center uppercase tracking-tighter">JPG, PNG, WebP · Auto-compressed</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Section - Starts after Basic Information */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="flex flex-wrap h-auto w-full justify-start bg-transparent border-b border-border rounded-none pb-0 mb-6 gap-2">
                            <TabsTrigger value="measurements" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold">
                                Units & Measurements
                                {errors.base_unit || errors.weight ? <span className="ml-2 h-2 w-2 rounded-full bg-destructive" /> : null}
                            </TabsTrigger>
                            <TabsTrigger value="packaging" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold">
                                Packaging
                                {errors.packaging_id ? <span className="ml-2 h-2 w-2 rounded-full bg-destructive" /> : null}
                            </TabsTrigger>
                            <TabsTrigger value="pricing" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold">
                                Pricing & Tax
                                {errors.cost_price || errors.selling_price ? <span className="ml-2 h-2 w-2 rounded-full bg-destructive" /> : null}
                            </TabsTrigger>
                            <TabsTrigger value="specifications" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold">
                                Specifications
                            </TabsTrigger>
                            <TabsTrigger value="kits" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold">
                                Kits
                            </TabsTrigger>
                            <TabsTrigger value="recipes" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-4 py-2 text-xs uppercase tracking-wider font-semibold">
                                Recipes
                            </TabsTrigger>
                        </TabsList>

                        <div className="min-h-[300px]">
                            <TabsContent value="measurements" className="m-0"><UnitsMeasurementsTab {...tabProps} /></TabsContent>
                            <TabsContent value="packaging" className="m-0"><PackagingTab {...tabProps} /></TabsContent>
                            <TabsContent value="pricing" className="m-0"><PricingTab {...tabProps} /></TabsContent>
                            <TabsContent value="specifications" className="m-0"><SpecificationsTab {...tabProps} /></TabsContent>
                            <TabsContent value="kits" className="m-0"><KitsTab productId={productData.id} productType={productData.product_type} isNew={isNew} /></TabsContent>
                            <TabsContent value="recipes" className="m-0"><RecipesTab productId={productData.id} productType={productData.product_type} isNew={isNew} sellingPrice={Number(productData.selling_price || 0)} /></TabsContent>
                        </div>
                    </Tabs>

                    {/* Form Actions (Global outside tabs) */}
                    <div className="pt-6 mt-6 border-t border-border/50 flex justify-between gap-2 items-center">
                        <div className="text-xs font-medium">
                            {Object.keys(errors).length > 0 && (
                                <span className="text-destructive flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                    {Object.keys(errors).length} field(s) need attention across tabs
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" size="sm" className="text-sm rounded-md gap-2 px-4 font-medium" onClick={handleReset} disabled={isSaving}>
                                Reset Form
                            </Button>
                            <Button type="button" size="sm" className="text-sm rounded-md gap-2 px-4 font-medium" onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isSaving ? "Saving..." : (isNew ? "Create Product" : "Save Changes")}
                            </Button>
                        </div>
                    </div>

                    {/* Modals & Drawers */}
                    {productData.id && (
                        <AddProductPhotoModal
                            product={{ id: productData.id as string, name: productData.product_name as string }}
                            open={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} onSuccess={() => setIsPhotoModalOpen(false)}
                        />
                    )}

                    <CategoryDrawer open={isCategoryDrawerOpen} onOpenChange={setIsCategoryDrawerOpen} />
                    <FragranceDrawer open={isFragranceDrawerOpen} onOpenChange={setIsFragranceDrawerOpen} />
                    <BrandDrawer open={isBrandDrawerOpen} onOpenChange={setIsBrandDrawerOpen} />

                    <PackageModal
                        isOpen={isPackageModalOpen}
                        onClose={() => setIsPackageModalOpen(false)}
                    />

                    {/* Lightbox Overlay */}
                    {lightboxIndex !== null && imagePreviews.length > 0 && (
                        <div
                            className="fixed inset-0 flex items-center justify-center"
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                width: '100vw',
                                height: '100vh',
                                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                backdropFilter: 'blur(8px)',
                                zIndex: 999999,
                                margin: 0,
                                padding: 0
                            }}
                            onClick={() => setLightboxIndex(null)}
                        >
                            {/* Left Navigation Button */}
                            {imagePreviews.length > 1 && (
                                <button
                                    type="button"
                                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all hover:scale-110"
                                    style={{ zIndex: 1000000 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(i => i !== null ? (i - 1 + imagePreviews.length) % imagePreviews.length : null);
                                    }}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </button>
                            )}

                            {/* Close Button - Top Right */}
                            <button
                                type="button"
                                onClick={() => setLightboxIndex(null)}
                                className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all hover:scale-110"
                                style={{ zIndex: 1000000 }}
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {/* Image Container */}
                            <div
                                className="relative flex flex-col items-center justify-center gap-4"
                                style={{
                                    maxWidth: '95vw',
                                    maxHeight: '95vh',
                                    width: '100%',
                                    height: '100%'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Image */}
                                <img
                                    src={imagePreviews[lightboxIndex].url}
                                    alt={`Product image ${lightboxIndex + 1}`}
                                    style={{
                                        maxWidth: '90vw',
                                        maxHeight: '80vh',
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        borderRadius: '0.5rem',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                                    }}
                                />

                                {/* Image Counter and Indicators */}
                                {imagePreviews.length > 1 && (
                                    <div className="flex flex-col items-center gap-3 mt-4">
                                        {/* Dot Indicators */}
                                        <div className="flex items-center gap-2">
                                            {imagePreviews.map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setLightboxIndex(i)}
                                                    style={{
                                                        transition: 'all 0.2s',
                                                        width: i === lightboxIndex ? '1.5rem' : '0.5rem',
                                                        height: '0.5rem',
                                                        backgroundColor: i === lightboxIndex ? 'white' : 'rgba(255, 255, 255, 0.4)',
                                                        borderRadius: '9999px',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (i !== lightboxIndex) {
                                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (i !== lightboxIndex) {
                                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        {/* Counter */}
                                        <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {lightboxIndex + 1} / {imagePreviews.length}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right Navigation Button */}
                            {imagePreviews.length > 1 && (
                                <button
                                    type="button"
                                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all hover:scale-110"
                                    style={{ zIndex: 1000000 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex(i => i !== null ? (i + 1) % imagePreviews.length : null);
                                    }}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductFormPage;