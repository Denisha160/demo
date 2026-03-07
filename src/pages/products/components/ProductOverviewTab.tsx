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
    Settings, Plus, Trash2, Shield, FolderTree, Barcode, PackageCheck,
    ChevronLeft, ChevronRight, ZoomIn
} from "lucide-react";
import { Product, ProductCreatePayload } from "@/types/products";
import { Combobox } from "@/components/ui/combobox";
import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import { usePackagesCombobox } from "@/hooks/usePackages";
import { PackageType } from "@/types/packages";
import { useCreateProduct, useUpdateProduct, useDeleteProductPhoto } from "@/hooks/useProducts";
import AddProductPhotoModal from "@/pages/products/components/AddProductPhotoModal";
import { ApiErrorResponse } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";

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
    category_id: z.preprocess((val) => val === '' ? null : val, z.string().uuid("Please select a valid category").optional().nullable()),
    product_type: z.enum(["RAW_MATERIAL", "FINISHED_GOOD"]),
    is_brand: z.boolean(),
    is_active: z.boolean().default(true),

    unit_category: z.enum(["weight", "volume", "count"]),
    base_unit: z.enum(["kg", "g", "l", "ml", "pcs"]),

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
    brand_name: z.string().optional().nullable(),
    country_of_origin: z.string().optional().nullable(),

    min_stock_level: z.number().min(0, "Min stock must be >= 0").nullable().optional(),
    max_stock_level: z.number().min(0, "Max stock must be >= 0").nullable().optional(),
    reorder_point: z.number().min(0, "Reorder point must be >= 0").nullable().optional(),

    shelf_life_days: z.number().min(0, "Shelf life must be >= 0").nullable().optional(),
    storage_conditions: z.string().optional().nullable(),
    packaging_id: z.string().uuid("Please select a valid package").optional().nullable(),
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
    const [imagePreviews, setImagePreviews] = useState<{ id?: string; url: string }[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [slideIdx, setSlideIdx] = useState(0);

    const [categorySearch, setCategorySearch] = useState('');
    const debouncedCategorySearch = useDebounce(categorySearch, 300);

    const { data: fetchedCategories = [] } = useCategoriesCombobox({
        type: 'sub',
        search: debouncedCategorySearch
    });
    const categoryOptions = fetchedCategories.map((cat: { id: string, name: string, parent_name?: string }) => ({
        label: cat.parent_name ? `${cat.name} (${cat.parent_name})` : cat.name,
        value: cat.id
    }));

    const [packageSearch, setPackageSearch] = useState('');
    const debouncedPackageSearch = useDebounce(packageSearch, 300);

    const { data: fetchedPackages = [] } = usePackagesCombobox({
        search: debouncedPackageSearch.trim() || undefined
    });

    const packageOptions = fetchedPackages.map((pkg: PackageType) => ({
        label: pkg.package_code ? `${pkg.package_name} (${pkg.package_code})` : pkg.package_name,
        value: pkg.id
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

    const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
    const { mutate: deletePhoto } = useDeleteProductPhoto();
    const isSaving = isCreating || isUpdating;

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

    // Sync state when productData updates from parent fetch
    useEffect(() => {
        if (!isNew && productData?.id) {
            const initial = getInitialMetadata();
            setMetaColors(initial.colors);
            setMetaFeatures(initial.features);
            setMetaParams(initial.params);
            setMetaAttrs(initial.attrs);
        }
    }, [productData?.id, getInitialMetadata, isNew]);

    const handleChange = (field: string, value: unknown) => {
        if (typeof setProductData === 'function') {
            const updater = setProductData as React.Dispatch<React.SetStateAction<Partial<Product>>>;
            updater((prev) => ({ ...prev, [field]: value }));
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

    // Init images from fetched data
    useEffect(() => {
        if (!isNew && productData?.images && Array.isArray(productData.images)) {
            const initialPreviews = productData.images
                .map((img: { id?: string; image_url?: { url?: string }; url?: string; image?: { url?: string } }) => ({
                    id: img?.id,
                    url: img?.image?.url || img?.image_url?.url || img?.url || '',
                }))
                .filter((x) => x.url);
            setImagePreviews(initialPreviews);
        }
    }, [productData?.images, isNew]);

    const handleDeletePhoto = (imageId: string | undefined, index: number) => {
        if (imageId && productData.id) {
            deletePhoto({ productId: productData.id as string, imageId });
        }
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleReset = useCallback(() => {
        setErrors({});
        setApiError(null);
        const initial = getInitialMetadata();
        setMetaColors(initial.colors);
        setMetaFeatures(initial.features);
        setMetaParams(initial.params);
        setMetaAttrs(initial.attrs);

        if (!isNew && productData?.images && Array.isArray(productData.images)) {
            const initialPreviews = productData.images
                .map((img: { id?: string; image_url?: { url?: string }; url?: string; image?: { url?: string } }) => ({
                    id: img?.id,
                    url: img?.image?.url || img?.image_url?.url || img?.url || '',
                }))
                .filter((x) => x.url);
            setImagePreviews(initialPreviews);
        } else {
            setImagePreviews([]);
        }
    }, [getInitialMetadata, isNew, productData?.images]);

    useImperativeHandle(ref, () => ({
        save: () => handleSave(),
        reset: handleReset
    }));

    const handleSave = () => {
        try {
            const validData = productSchema.parse({
                ...productData,
                category_id: productData.category_id || null,
                packaging_id: productData.packaging_id || null,
                weight: productData.weight ? Number(productData.weight) : null,
                length: productData.length ? Number(productData.length) : null,
                width: productData.width ? Number(productData.width) : null,
                height: productData.height ? Number(productData.height) : null,
                size_value: productData.size_value ? Number(productData.size_value) : null,
                dimension_unit: productData.dimension_unit || null,
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

            const payload = {
                ...validData,
                metadata: {
                    ...(finalColors.length > 0 && { colors: finalColors }),
                    ...(finalFeatures.length > 0 && { features: finalFeatures }),
                    ...(Object.keys(parameters).length > 0 && { parameters }),
                    ...(Object.keys(attributes).length > 0 && { attributes })
                },
            } as unknown as ProductCreatePayload;

            if (isNew) {
                createProduct(payload, {
                    onSuccess: () => {
                        handleReset(); // Optionally clear form if needed or let parent handle routing off
                    },
                    onError: (error: unknown) => {
                        const err = error as ApiErrorResponse;
                        const errorData = (err?.details || err?.response?.data || err || {}) as ApiErrorResponse;

                        if (errorData?.code === "validation_error" && errorData.details?.body) {
                            setErrors(errorData.details.body);
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
                        } else {
                            setApiError("An unexpected error occurred while saving.");
                        }
                    }
                });
            } else {
                const updatePayload = {
                    ...validData,
                    id: productData.id as string,
                    metadata: {
                        ...(finalColors.length > 0 && { colors: finalColors }),
                        ...(finalFeatures.length > 0 && { features: finalFeatures }),
                        ...(Object.keys(parameters).length > 0 && { parameters }),
                        ...(Object.keys(attributes).length > 0 && { attributes })
                    },
                };

                updateProduct(updatePayload, {
                    onError: (error: unknown) => {
                        const err = error as ApiErrorResponse;
                        const errorData = (err?.details || err?.response?.data || err || {}) as ApiErrorResponse;

                        if (errorData?.code === "validation_error" && errorData.details?.body) {
                            setErrors(errorData.details.body);
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
                        } else {
                            setApiError("An unexpected error occurred while updating.");
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Zod Validation Error:", error);
            if (error instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                error.errors.forEach(err => {
                    if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
                });
                console.log("Extracted Field Errors:", fieldErrors);
                setErrors(fieldErrors);
                const errorCount = Object.keys(fieldErrors).length;
                toast.error(`Please correct the ${errorCount} highlighted error${errorCount === 1 ? '' : 's'}.`);
            } else {
                setApiError("An unexpected exception occurred.");
            }
        }
    };

    return (
        <div className="p-4 border border-border rounded-lg bg-card shadow-sm space-y-2">

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                                searchValue={categorySearch}
                                onSearchChange={setCategorySearch}
                            />
                            {errors.category_id && <p className="text-[10px] text-destructive mt-1">{errors.category_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Brand Item</Label>
                                <RadioGroup
                                    value={productData.is_brand ? "yes" : "no"}
                                    onValueChange={(val) => handleChange("is_brand", val === "yes")}
                                    className="flex items-center gap-2 h-10"
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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-primary" />
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Product Images</h3>
                        </div>
                        {!isNew && productData.id && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs rounded-sm"
                                onClick={() => setIsPhotoModalOpen(true)}
                            >
                                <UploadCloud className="h-3 w-3 mr-1" />
                                Add Photos
                            </Button>
                        )}
                    </div>
                    <div className="border border-dashed border-border rounded-lg p-4 bg-muted/10 min-h-[180px] flex flex-col items-start h-[calc(100%-2.25rem)]">
                        {imagePreviews.length === 0 ? (
                            <div className="flex flex-col items-center justify-center w-full h-full flex-1 gap-2 text-muted-foreground">
                                <ImageIcon className="h-8 w-8 opacity-30" />
                                <p className="text-xs">
                                    {isNew ? 'Save the product first to add images' : 'No images yet'}
                                </p>
                                {!isNew && productData.id && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs rounded-sm mt-1"
                                        onClick={() => setIsPhotoModalOpen(true)}
                                    >
                                        <UploadCloud className="h-3 w-3 mr-1" />
                                        Upload first image
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col w-full gap-2 flex-1">
                                {/* Main image viewer */}
                                <div className="relative w-full rounded-md overflow-hidden bg-muted/20 border border-border group cursor-zoom-in" style={{ minHeight: 160 }}>
                                    <img
                                        src={imagePreviews[Math.min(slideIdx, imagePreviews.length - 1)].url}
                                        alt={`Product image ${Math.min(slideIdx, imagePreviews.length - 1) + 1}`}
                                        className="w-full object-cover"
                                        style={{ minHeight: 160, maxHeight: 200 }}
                                        onClick={() => setLightboxIndex(Math.min(slideIdx, imagePreviews.length - 1))}
                                    />
                                    {/* Counter badge */}
                                    <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full pointer-events-none">
                                        {Math.min(slideIdx, imagePreviews.length - 1) + 1} / {imagePreviews.length}
                                    </span>
                                    {/* Delete */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const idx = Math.min(slideIdx, imagePreviews.length - 1);
                                            handleDeletePhoto(imagePreviews[idx].id, idx);
                                            if (idx > 0) setSlideIdx(idx - 1);
                                        }}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                    {/* Zoom hint */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                                        <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-60 transition-opacity" />
                                    </div>
                                    {/* Prev / Next arrows */}
                                    {imagePreviews.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setSlideIdx(i => (i - 1 + imagePreviews.length) % imagePreviews.length); }}
                                                className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setSlideIdx(i => (i + 1) % imagePreviews.length); }}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                                {/* Dot strip */}
                                {imagePreviews.length > 1 && (
                                    <div className="flex items-center justify-center gap-1.5">
                                        {imagePreviews.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setSlideIdx(i)}
                                                className={`rounded-full transition-all ${i === Math.min(slideIdx, imagePreviews.length - 1) ? 'bg-primary w-3 h-1.5' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60 w-1.5 h-1.5'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-auto w-full pt-3 border-t border-border/50 text-center">JPG, PNG, WebP · Auto-compressed on upload</p>
                    </div>
                </div>
            </div>

            {/* Units & Measurements */}
            <div className="pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 mb-4">
                    <Scale className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Units & Measurements</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 items-start">
                    <div className="space-y-2 lg:col-span-1">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Base Unit</Label>
                        <Select
                            value={productData.base_unit || "pcs"}
                            onValueChange={(v) => {
                                const category = (v === "kg" || v === "g") ? "weight" : (v === "l" || v === "ml") ? "volume" : "count";

                                if (typeof setProductData === 'function') {
                                    const updater = setProductData as React.Dispatch<React.SetStateAction<Partial<Product>>>;
                                    updater((prev) => ({
                                        ...prev,
                                        base_unit: v as "kg" | "g" | "l" | "ml" | "pcs",
                                        unit_category: category as "weight" | "volume" | "count"
                                    }));
                                }

                                // Clear errors for both
                                setErrors(prev => {
                                    const next = { ...prev };
                                    delete next.base_unit;
                                    delete next.unit_category;
                                    return next;
                                });
                                if (apiError) setApiError(null);
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

                    {/* Length, Width, Height Group */}
                    <div className="lg:col-span-3 flex items-end gap-2">
                        <ProductInput
                            label={`Length (${productData.dimension_unit || "cm"})`}
                            type="number"
                            value={productData.length ?? ""}
                            onChange={(val) => handleNumberChange("length", val)}
                            placeholder="0.00"
                            className="flex-1"
                        />
                        <div className="pb-3 text-muted-foreground font-medium select-none">×</div>
                        <ProductInput
                            label={`Width (${productData.dimension_unit || "cm"})`}
                            type="number"
                            value={productData.width ?? ""}
                            onChange={(val) => handleNumberChange("width", val)}
                            placeholder="0.00"
                            className="flex-1"
                        />
                        <div className="pb-3 text-muted-foreground font-medium select-none">×</div>
                        <ProductInput
                            label={`Height (${productData.dimension_unit || "cm"})`}
                            type="number"
                            value={productData.height ?? ""}
                            onChange={(val) => handleNumberChange("height", val)}
                            placeholder="0.00"
                            className="flex-1"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Dimension Unit</Label>
                        <Select
                            value={productData.dimension_unit || "cm"}
                            onValueChange={(val) => handleChange("dimension_unit", val)}
                        >
                            <SelectTrigger className="h-9 text-sm">
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

                    <ProductInput
                        label="Size Value"
                        type="number"
                        value={productData.size_value ?? ""}
                        onChange={(val) => handleNumberChange("size_value", val)}
                        placeholder="e.g. 500"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Packaging Type</Label>
                            <Combobox
                                options={packageOptions.length > 0 ? packageOptions : (packagingOptions.length > 0 ? packagingOptions.map(p => ({ label: p.name, value: p.id })) : [])}
                                value={productData.packaging_id ?? ""}
                                onValueChange={(v) => handleChange("packaging_id", v)}
                                placeholder="Select format..."
                                searchPlaceholder="Search package..."
                                emptyText="No packages found."
                                className={`h-10 ${errors.packaging_id ? 'border-destructive' : ''}`}
                                clearable
                                searchValue={packageSearch}
                                onSearchChange={setPackageSearch}
                            />
                            {errors.packaging_id && <p className="text-[10px] text-destructive mt-1">{errors.packaging_id}</p>}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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
            <div className="pt-6 border-t border-border/50 flex justify-between gap-2 items-center">
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

            {!isNew && productData.id && (
                <AddProductPhotoModal
                    product={{ id: productData.id as string, name: productData.product_name as string }}
                    open={isPhotoModalOpen}
                    onClose={() => setIsPhotoModalOpen(false)}
                    onSuccess={() => setIsPhotoModalOpen(false)}
                />
            )}

            {/* Lightbox / image carousel overlay */}
            {lightboxIndex !== null && imagePreviews.length > 0 && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm"
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Prev button */}
                    {imagePreviews.length > 1 && (
                        <button
                            type="button"
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i - 1 + imagePreviews.length) % imagePreviews.length : null); }}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={imagePreviews[lightboxIndex].url}
                            alt={`Product image ${lightboxIndex + 1}`}
                            className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl"
                        />
                        {/* Counter + close row */}
                        <div className="flex items-center gap-4">
                            {imagePreviews.length > 1 && (
                                <>
                                    {/* Dot indicators */}
                                    <div className="flex items-center gap-1.5">
                                        {imagePreviews.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setLightboxIndex(i)}
                                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-white/70 text-xs">{lightboxIndex + 1} / {imagePreviews.length}</span>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={() => setLightboxIndex(null)}
                                className="bg-white/10 hover:bg-white/25 text-white rounded-full p-1.5 transition-colors ml-auto"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Next button */}
                    {imagePreviews.length > 1 && (
                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/25 text-white rounded-full p-2 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i + 1) % imagePreviews.length : null); }}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

ProductOverviewTab.displayName = "ProductOverviewTab";

export default ProductOverviewTab;