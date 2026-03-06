import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { z } from "zod";
import {
    Package, Scale, Ruler, DollarSign, Loader2,
    Image as ImageIcon, UploadCloud, X, Layers, Tags, Box,
    Settings, Plus, Trash2, Shield, FolderTree, Barcode, PackageCheck
} from "lucide-react";
import { Product, ProductCreatePayload } from "@/types/products";
import { Combobox } from "@/components/ui/combobox";
import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import { useCreateProduct } from "@/hooks/useProducts";
import { ApiErrorResponse } from "@/types/user";

const ProductInput = ({
    label,
    value,
    error,
    isEditing = true,
    onChange,
    placeholder,
    type = "text",
    className = "",
    prefix,
}: {
    label: string;
    value: string | number;
    error?: string;
    isEditing?: boolean;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    prefix?: React.ReactNode;
}) => (
    <div className={`space-y-2 ${className}`}>
        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
        </Label>
        <div className={prefix ? "relative input-group" : ""}>
            {prefix && <span className="input-icon">{prefix}</span>}
            <Input
                type={type}
                step={type === "number" ? "any" : undefined}
                value={value?.toString() || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`text-sm ${error ? 'input-error border-destructive focus-visible:ring-destructive' : ''}`}
                disabled={!isEditing}
            />
        </div>
        {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
    </div>
);

// Strict Zod schema matching SQL constraints
const productSchema = z.object({
    product_name: z.string().min(2, "Product name is required (min 2 characters)"),
    code: z.string().optional().nullable(),
    category_id: z.string().uuid("Please select a valid category").optional().nullable(),
    packaging_id: z.string().uuid("Please select a valid packaging").optional().nullable(),
    product_type: z.enum(["RAW_MATERIAL", "FINISHED_GOOD"]),
    is_brand: z.boolean(),
    is_active: z.boolean().default(true),

    unit_category: z.enum(["weight", "volume", "count"]),
    base_unit: z.enum(["kg", "g", "l", "ml", "pcs"]),

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
    manufacturer: z.string().optional().nullable(),
    brand_name: z.string().optional().nullable(),
    country_of_origin: z.string().optional().nullable(),

    min_stock_level: z.number().min(0, "Min stock must be >= 0").nullable().optional(),
    max_stock_level: z.number().min(0, "Max stock must be >= 0").nullable().optional(),
    reorder_point: z.number().min(0, "Reorder point must be >= 0").nullable().optional(),

    shelf_life_days: z.number().min(0, "Shelf life must be >= 0").nullable().optional(),
    storage_conditions: z.string().optional().nullable(),
    is_perishable: z.boolean().default(false),
}).refine(data => {
    if (data.unit_category === 'weight') return ['kg', 'g'].includes(data.base_unit);
    if (data.unit_category === 'volume') return ['l', 'ml'].includes(data.base_unit);
    if (data.unit_category === 'count') return data.base_unit === 'pcs';
    return false;
}, {
    message: "Invalid unit selected for the chosen category",
    path: ["base_unit"]
});

interface ProductOverviewTabProps {
    productData: Partial<Product>;
    setProductData: React.Dispatch<React.SetStateAction<Partial<Product>>> | ((data: Partial<Product>) => void);
    isNew?: boolean;
    categories?: Array<{ id: string; name: string }>;
    packagingOptions?: Array<{ id: string; name: string }>;
    onSavingChange?: (isSaving: boolean) => void;
}

export interface ProductOverviewTabRef {
    save: () => void;
    reset: () => void;
}

const ProductOverviewTab = forwardRef<ProductOverviewTabRef, ProductOverviewTabProps>(({
    productData,
    setProductData,
    isNew = false,
    categories = [],
    packagingOptions = [],
    onSavingChange
}, ref) => {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const { data: fetchedCategories = [] } = useCategoriesCombobox();
    const categoryOptions = fetchedCategories.map(cat => ({
        label: cat.name,
        value: cat.id
    }));

    // Mock Options if none provided
    const mockCategories = categories.length > 0 ? categories : [
        { id: "c1234567-89ab-cdef-0123-456789abcdef", name: "Toiletries" },
        { id: "d1234567-89ab-cdef-0123-456789abcdef", name: "Linens" }
    ];

    const mockPackages = packagingOptions.length > 0 ? packagingOptions : [
        { id: "p1234567-89ab-cdef-0123-456789abcdef", name: "Standard Carton Box" },
        { id: "q1234567-89ab-cdef-0123-456789abcdef", name: "500ml Glass Bottle" }
    ];

    const { mutate: createProduct, isPending: isSaving } = useCreateProduct();

    useEffect(() => {
        onSavingChange?.(isSaving);
    }, [isSaving, onSavingChange]);

    // Parse existing metadata cleanly
    const getInitialMetadata = useCallback(() => {
        const meta = (productData?.metadata || {}) as {
            colors?: unknown[];
            features?: unknown[];
            parameters?: Record<string, unknown>;
            attributes?: Record<string, unknown>;
        };

        const colors = Array.isArray(meta.colors) && meta.colors.length > 0 ? meta.colors.map(String) : [''];
        const features = Array.isArray(meta.features) && meta.features.length > 0 ? meta.features.map(String) : [''];

        const params = meta.parameters && Object.keys(meta.parameters).length > 0
            ? Object.entries(meta.parameters).map(([k, v]) => ({ key: k, value: String(v) }))
            : [{ key: '', value: '' }];

        const attrs = meta.attributes && Object.keys(meta.attributes).length > 0
            ? Object.entries(meta.attributes).map(([k, v]) => ({ key: k, value: String(v) }))
            : [{ key: '', value: '' }];

        return { colors, features, params, attrs };
    }, [productData?.metadata]);

    // Lazy initialize to prevent recalculating on every render
    const [metaColors, setMetaColors] = useState<string[]>(() => getInitialMetadata().colors);
    const [metaFeatures, setMetaFeatures] = useState<string[]>(() => getInitialMetadata().features);
    const [metaParams, setMetaParams] = useState<{ key: string, value: string }[]>(() => getInitialMetadata().params);
    const [metaAttrs, setMetaAttrs] = useState<{ key: string, value: string }[]>(() => getInitialMetadata().attrs);

    const handleChange = (field: string, value: unknown) => {
        if (typeof setProductData === 'function' && setProductData.length === 1) {
            // This branch handles the case where setProductData is a direct setter function
            setProductData({ ...productData, [field]: value });
        } else {
            // This branch handles the case where setProductData is a React.Dispatch function
            (setProductData as React.Dispatch<React.SetStateAction<Partial<Product>>>)(
                (prev) => ({ ...prev, [field]: value })
            );
        }
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
        if (apiError) setApiError(null);
    };

    const handleNumberChange = (field: string, val: string) => {
        const num = val === '' ? null : parseFloat(val);
        handleChange(field, isNaN(num as number) ? null : num);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            } else {
                toast.error(`${file.name} is not an image file`);
            }
        });
    };

    const removeImage = (indexToRemove: number) => {
        setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Generic Array & Object handlers for Specifications
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

    const handleReset = useCallback(() => {
        setErrors({});
        setApiError(null);
        const initial = getInitialMetadata();
        setMetaColors(initial.colors);
        setMetaFeatures(initial.features);
        setMetaParams(initial.params);
        setMetaAttrs(initial.attrs);
        setImagePreviews([]);
    }, [getInitialMetadata]);

    useImperativeHandle(ref, () => ({
        save: () => handleSave(),
        reset: handleReset
    }));

    const handleSave = () => {
        try {
            const validData = productSchema.parse({
                ...productData,
                weight: productData.weight ? Number(productData.weight) : null,
                length: productData.length ? Number(productData.length) : null,
                width: productData.width ? Number(productData.width) : null,
                height: productData.height ? Number(productData.height) : null,
                volume: productData.volume ? Number(productData.volume) : null,
                cost_price: productData.cost_price ? Number(productData.cost_price) : null,
                selling_price: productData.selling_price ? Number(productData.selling_price) : null,
            });

            setErrors({});
            setApiError(null);

            const buildObject = (arr: { key: string, value: string }[]) => arr.reduce((acc, curr) => {
                const k = curr.key.trim();
                const v = curr.value.trim();
                if (k && v) acc[k] = v;
                return acc;
            }, {} as Record<string, string>);

            const parameters = buildObject(metaParams);
            const attributes = buildObject(metaAttrs);
            const finalColors = metaColors.map(c => c.trim()).filter(Boolean);
            const finalFeatures = metaFeatures.map(f => f.trim()).filter(Boolean);

            const payload: ProductCreatePayload = {
                ...validData,
                metadata: {
                    ...(finalColors.length > 0 && { colors: finalColors }),
                    ...(finalFeatures.length > 0 && { features: finalFeatures }),
                    ...(Object.keys(parameters).length > 0 && { parameters }),
                    ...(Object.keys(attributes).length > 0 && { attributes })
                },
                image_urls: imagePreviews
            };

            if (isNew) {
                createProduct(payload, {
                    onSuccess: () => {
                        toast.success("Product created successfully!");
                        handleReset(); // Optionally clear form if needed or let parent handle routing off
                    },
                    onError: (error: unknown) => {
                        const err = error as ApiErrorResponse;
                        const errorData = (err?.details || err?.response?.data || err || {}) as ApiErrorResponse;

                        if (errorData?.code === "validation_error" && errorData.details?.body) {
                            setErrors(errorData.details.body);
                            toast.error("Please correct the validation errors.");
                        } else if (errorData?.code === "duplicate_key_value") {
                            const msg = errorData.message || "A duplicate record exists.";
                            setApiError(msg);

                            // Map custom backend postgres constraints directly to specific input fields
                            if (msg.toLowerCase().includes("product name")) {
                                setErrors(prev => ({ ...prev, product_name: msg }));
                            } else if (msg.toLowerCase().includes("product_code")) {
                                setErrors(prev => ({ ...prev, code: msg }));
                            } else if (msg.toLowerCase().includes("hsn_code")) {
                                setErrors(prev => ({ ...prev, hsn_code: msg }));
                            }
                        } else if (errorData?.message) {
                            setApiError(errorData.message);
                            toast.error(errorData.message);
                        } else {
                            setApiError("An unexpected error occurred while saving.");
                            toast.error("Failed to create product.");
                        }
                    }
                });
            } else {
                // Update Path handled separately later
                toast.info("Update product functionality pending.");
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach(err => {
                    if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
                });
                setErrors(fieldErrors);
                toast.error("Please correct the highlighted errors.");
            } else {
                setApiError("An unexpected exception occurred.");
            }
        }
    };

    return (
        <div className="p-4 border border-border rounded-lg bg-card shadow-sm space-y-6">

            {apiError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <p className="text-sm font-medium text-destructive">{apiError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Basic Information */}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProductInput
                            label="Product Name"
                            value={productData.product_name ?? ""}
                            error={errors.product_name}
                            onChange={(val) => handleChange("product_name", val)}
                            placeholder="Enter product name"
                        />
                        <ProductInput
                            label="Product Code"
                            value={productData.code ?? ""}
                            error={errors.code}
                            onChange={(val) => handleChange("code", val)}
                            placeholder="Auto or Manual"
                        />

                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Product Type</Label>
                            <Select
                                value={productData.product_type || "FINISHED_GOOD"}
                                onValueChange={(v) => handleChange("product_type", v)}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FINISHED_GOOD" className="text-xs">Finished Good</SelectItem>
                                    <SelectItem value="RAW_MATERIAL" className="text-xs">Raw Material</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                                Category
                            </Label>
                            <Combobox
                                options={categoryOptions.length > 0 ? categoryOptions : mockCategories.map(c => ({ label: c.name, value: c.id }))}
                                value={productData.category_id ?? ""}
                                onValueChange={(v) => handleChange("category_id", v)}
                                placeholder="Select category..."
                                searchPlaceholder="Search category..."
                                emptyText="No categories found."
                                className={`h-10 ${errors.category_id ? 'border-destructive' : ''}`}
                                clearable
                            />
                            {errors.category_id && <p className="text-[10px] text-destructive mt-1">{errors.category_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Brand Item</Label>
                                <RadioGroup
                                    value={productData.is_brand ? "yes" : "no"}
                                    onValueChange={(val) => handleChange("is_brand", val === "yes")}
                                    className="flex items-center gap-4 h-10"
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
                                label="HSN Code"
                                value={productData.hsn_code ?? ""}
                                error={errors.hsn_code}
                                onChange={(val) => handleChange("hsn_code", val)}
                                placeholder="e.g. 3401.19"
                            />
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="xl:col-span-1 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Product Images</h3>
                    </div>
                    <div className="border border-dashed border-border rounded-lg p-4 bg-muted/10 min-h-[180px] flex flex-col items-start h-[calc(100%-2.25rem)]">
                        <div className="flex flex-wrap gap-3 mb-3 flex-1 w-full overflow-y-auto content-start">
                            {imagePreviews.map((url, idx) => (
                                <div key={idx} className="relative w-[72px] h-[72px] group rounded-md overflow-hidden border bg-background shadow-sm">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="cursor-pointer w-[72px] h-[72px] border border-dashed border-muted-foreground/40 rounded-md flex flex-col items-center justify-center gap-1 bg-background hover:bg-muted/50 transition-colors">
                                <UploadCloud className="w-5 h-5 text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground font-medium">Upload</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-auto w-full pt-3 border-t border-border/50 text-center">Supported formats: JPG, PNG, WebP</p>
                    </div>
                </div>
            </div>

            {/* Units & Measurements */}
            <div className="pt-6 border-t border-border/50">
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
                                handleChange("base_unit", v);
                                if (v === "kg" || v === "g") handleChange("unit_category", "weight");
                                if (v === "l" || v === "ml") handleChange("unit_category", "volume");
                                if (v === "pcs") handleChange("unit_category", "count");
                            }}
                        >
                            <SelectTrigger className={`text-sm ${errors.base_unit ? 'input-error' : ''}`}>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kg" className="text-xs">Kilogram (kg)</SelectItem>
                                <SelectItem value="g" className="text-xs">Gram (g)</SelectItem>
                                <SelectItem value="l" className="text-xs">Liter (l)</SelectItem>
                                <SelectItem value="ml" className="text-xs">Milliliter (ml)</SelectItem>
                                <SelectItem value="pcs" className="text-xs">Pieces (pcs)</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.base_unit && <p className="text-[10px] text-destructive mt-1">{errors.base_unit}</p>}
                    </div>

                    <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Unit Category</Label>
                        <Select
                            value={productData.unit_category || "count"}
                            onValueChange={(val) => handleChange("unit_category", val)}
                            disabled
                        >
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
                            type="number"
                            value={productData.weight ?? ""}
                            error={errors.weight}
                            onChange={(val) => handleNumberChange("weight", val)}
                            placeholder="0.00"
                            className="lg:col-span-1"
                        />
                    )}

                    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            Dimensions (L × W × H) <span className="text-muted-foreground font-normal lowercase">(cm)</span>
                        </Label>
                        <div className="flex items-center gap-1.5">
                            <Input
                                className="text-sm text-center px-2 flex-1 min-w-0"
                                type="number"
                                step="any"
                                value={productData.length ?? ""}
                                onChange={(e) => handleNumberChange("length", e.target.value)}
                                placeholder="L"
                                title="Length (cm)"
                            />
                            <span className="text-muted-foreground text-[10px] shrink-0">×</span>
                            <Input
                                className="text-sm text-center px-2 flex-1 min-w-0"
                                type="number"
                                step="any"
                                value={productData.width ?? ""}
                                onChange={(e) => handleNumberChange("width", e.target.value)}
                                placeholder="W"
                                title="Width (cm)"
                            />
                            <span className="text-muted-foreground text-[10px] shrink-0">×</span>
                            <Input
                                className="text-sm text-center px-2 flex-1 min-w-0"
                                type="number"
                                step="any"
                                value={productData.height ?? ""}
                                onChange={(e) => handleNumberChange("height", e.target.value)}
                                placeholder="H"
                                title="Height (cm)"
                            />
                        </div>
                    </div>
                    <ProductInput
                        label="Volume (cm³)"
                        type="number"
                        value={productData.volume ?? ""}
                        error={errors.volume}
                        onChange={(val) => handleNumberChange("volume", val)}
                        placeholder="0.00"
                        className="lg:col-span-1"
                    />
                </div>
            </div>

            {/* Packaging & Logistics */}
            {productData.product_type === "FINISHED_GOOD" && (
                <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <PackageCheck className="h-4 w-4 text-primary" />
                        <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Packaging</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Packaging Type</Label>
                            <Select
                                value={productData.packaging_id ?? ""}
                                onValueChange={(v) => handleChange("packaging_id", v)}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockPackages.map(pkg => (
                                        <SelectItem key={pkg.id} value={pkg.id} className="text-xs">{pkg.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <ProductInput
                            label="Shape/Form"
                            value={productData.shape ?? ""}
                            onChange={(val) => handleChange("shape", val)}
                            placeholder="e.g. Round"
                        />
                        <ProductInput
                            label="Material"
                            value={productData.material ?? ""}
                            onChange={(val) => handleChange("material", val)}
                            placeholder="e.g. Glass"
                        />
                        <ProductInput
                            label="Capacity"
                            value={productData.capacity ?? ""}
                            onChange={(val) => handleChange("capacity", val)}
                            placeholder="e.g. 500ml"
                        />
                    </div>
                </div>
            )}

            {/* Pricing */}
            <div className="pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Pricing & Tax Info</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <ProductInput
                        label="Cost Price"
                        type="number"
                        prefix="₹"
                        value={productData.cost_price ?? ""}
                        error={errors.cost_price}
                        onChange={(val) => handleNumberChange("cost_price", val)}
                        placeholder="0.00"
                    />
                    <ProductInput
                        label="Selling Price"
                        type="number"
                        prefix="₹"
                        value={productData.selling_price ?? ""}
                        error={errors.selling_price}
                        onChange={(val) => handleNumberChange("selling_price", val)}
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Specifications */}
            <div className="pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Specifications</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <Input
                                        value={color}
                                        onChange={(e) => updateArrayState(setMetaColors, idx, e.target.value)}
                                        placeholder="e.g. White, Red, Blue"
                                        className="text-sm flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button" variant="ghost" size="icon"
                                        onClick={() => removeArrayState(setMetaColors, idx)}
                                        className="text-muted-foreground hover:text-destructive shrink-0"
                                        disabled={metaColors.length === 1 && !color}
                                    >
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
                                    <Input
                                        value={feature}
                                        onChange={(e) => updateArrayState(setMetaFeatures, idx, e.target.value)}
                                        placeholder="e.g. Eco-friendly, Water-resistant"
                                        className="text-sm flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button" variant="ghost" size="icon"
                                        onClick={() => removeArrayState(setMetaFeatures, idx)}
                                        className="text-muted-foreground hover:text-destructive shrink-0"
                                        disabled={metaFeatures.length === 1 && !feature}
                                    >
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
                                    <Input
                                        value={param.key}
                                        onChange={(e) => updateObjectState(setMetaParams, idx, 'key', e.target.value)}
                                        placeholder="Key (e.g. Wattage)"
                                        className="text-sm flex-1 min-w-0"
                                    />
                                    <Input
                                        value={param.value}
                                        onChange={(e) => updateObjectState(setMetaParams, idx, 'value', e.target.value)}
                                        placeholder="Value (e.g. 100W)"
                                        className="text-sm flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button" variant="ghost" size="icon"
                                        onClick={() => removeObjectState(setMetaParams, idx)}
                                        className="text-muted-foreground hover:text-destructive shrink-0"
                                        disabled={metaParams.length === 1 && !param.key && !param.value}
                                    >
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
                                    <Input
                                        value={attr.key}
                                        onChange={(e) => updateObjectState(setMetaAttrs, idx, 'key', e.target.value)}
                                        placeholder="Key (e.g. Material)"
                                        className="text-sm flex-1 min-w-0"
                                    />
                                    <Input
                                        value={attr.value}
                                        onChange={(e) => updateObjectState(setMetaAttrs, idx, 'value', e.target.value)}
                                        placeholder="Value (e.g. Cotton)"
                                        className="text-sm flex-1 min-w-0"
                                    />
                                    <Button
                                        type="button" variant="ghost" size="icon"
                                        onClick={() => removeObjectState(setMetaAttrs, idx)}
                                        className="text-muted-foreground hover:text-destructive shrink-0"
                                        disabled={metaAttrs.length === 1 && !attr.key && !attr.value}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-border/50 flex justify-between gap-4 items-center">
                <div className="text-xs font-medium">
                    {Object.keys(errors).length > 0 && (
                        <span className="text-destructive flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                            {Object.keys(errors).length} field(s) need attention
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-sm rounded-md gap-2 px-4 font-medium"
                        onClick={handleReset}
                        disabled={isSaving}
                    >
                        Reset Form
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="text-sm rounded-md gap-2 px-4 font-medium"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isSaving ? "Saving..." : (isNew ? "Create Product" : "Save Changes")}
                    </Button>
                </div>
            </div>
        </div>
    );
});

ProductOverviewTab.displayName = "ProductOverviewTab";

export default ProductOverviewTab;