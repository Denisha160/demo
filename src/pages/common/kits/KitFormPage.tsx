import { useState, useEffect, useRef, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Trash2,
  Search,
  Loader2,
  Info,
  CheckCircle2,
  ArrowLeft,
  Layers,
  Box,
  Save,
  X,
  Image as ImageIcon,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { useKitDetails, useCreateKit, useUpdateKit } from "@/hooks/useKits";
import { useProductsCombobox } from "@/hooks/useProducts";
import { usePackagesCombobox } from "@/hooks/usePackages";
import { useDebounce } from "@/hooks/useDebounce";
import { KitCreatePayload, KitUpdatePayload } from "@/types/kits";
import PackageModal from "@/pages/common/packages/components/PackageModal";

const ProductInput = forwardRef<
  HTMLInputElement,
  {
    label: string;
    value: string | number;
    error?: string;
    isEditing?: boolean;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    className?: string;
    prefix?: React.ReactNode;
  }
>(
  (
    {
      label,
      value,
      error,
      isEditing = true,
      onChange,
      placeholder,
      type = "text",
      className = "",
      prefix,
    },
    ref,
  ) => (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <div className={prefix ? "relative" : ""}>
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          ref={ref}
          type={type}
          step={type === "number" ? "any" : undefined}
          value={value?.toString() || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`h-8 text-sm rounded-sm ${prefix ? "pl-8" : ""} ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          disabled={!isEditing}
        />
      </div>
      {error && (
        <p className="text-[10px] text-destructive mt-0.5 ml-0.5">{error}</p>
      )}
    </div>
  ),
);

ProductInput.displayName = "ProductInput";

// Schema matches backend requirements
const kitSchema = z.object({
  name: z.string().min(2, "Kit name is required"),
  sku: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  kit_price: z.number().nullable().optional(),
  packaging_id: z.string().uuid().optional().nullable(),
  kit_image: z.any().optional().nullable(),
  items: z
    .array(
      z.object({
        finished_product_id: z.string().min(1, "Product selection is required"),
        product_name: z.string().optional(),
        quantity_per_kit: z.number().positive("Quantity must be > 0"),
        unit: z.string().optional(),
        price: z.number().optional(),
        image_url: z.string().optional().nullable(),
      }),
    )
    .min(1, "At least one product is required in the kit"),
});

type KitFormData = z.infer<typeof kitSchema>;

const KitFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const kitNameRef = useRef<HTMLInputElement>(null);

  // Data Hooks
  const { data: kitDetails, isLoading: isLoadingDetails } = useKitDetails(id);
  const { mutate: createKit, isPending: isCreating } = useCreateKit();
  const { mutate: updateKit, isPending: isUpdating } = useUpdateKit();

  const [kitImage, setKitImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selectors State
  const [fgSearch, setFgSearch] = useState("");
  const debouncedFgSearch = useDebounce(fgSearch, 300);
  const { data: products = [] } = useProductsCombobox({
    type: "FINISHED_GOOD",
    status: "active",
    search: debouncedFgSearch.trim() || undefined,
  });

  const { data: filterPackages = [] } = usePackagesCombobox();

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<KitFormData>({
    resolver: zodResolver(kitSchema),
    defaultValues: {
      name: "",
      sku: "",
      is_active: true,
      kit_price: 0,
      kit_image: null,
      items: [],
    },
  });

  const items = watch("items") || [];
  const is_active = watch("is_active");

  useEffect(() => {
    const timer = setTimeout(() => {
      kitNameRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Initialize/Reset form
  useEffect(() => {
    if (id && kitDetails) {
      reset({
        name: kitDetails.name,
        sku: kitDetails.sku,
        is_active: kitDetails.is_active,
        kit_price: kitDetails.kit_price,
        packaging_id: kitDetails.packaging_id,
        items: kitDetails.items.map((item) => ({
          finished_product_id: item.finished_product_id,
          product_name: item.finished_product_name,
          quantity_per_kit: item.quantity_per_kit,
          unit: "pcs",
          price: item.price || 0,
          image_url: item.image_url,
        })),
        image_url: kitDetails.image_url,
      });
      setKitImage(
        kitDetails.image_url ||
          kitDetails.kit_image_url ||
          kitDetails.kit_image ||
          null,
      );
      setSelectedFile(null);
    }
  }, [id, kitDetails, reset]);

  // Helper to calculate and set the default Kit Selling Price automatically
  const updateKitPrice = (currentItems: KitFormData["items"]) => {
    const newTotal = currentItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity_per_kit || 0),
      0,
    );
    setValue("kit_price", parseFloat(newTotal.toFixed(2)), {
      shouldDirty: true,
    });
  };

  // Handle adding items to kit
  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Check if already in list
    const existingIdx = items.findIndex(
      (item) => item.finished_product_id === productId,
    );
    if (existingIdx > -1) {
      const updatedItems = [...items];
      updatedItems[existingIdx].quantity_per_kit += 1;
      setValue("items", updatedItems, { shouldDirty: true });
      updateKitPrice(updatedItems);
      toast.info("Quantity updated for existing item");
      return;
    }

    const newItem = {
      finished_product_id: productId,
      product_name: product.product_name,
      quantity_per_kit: 1,
      unit: product.base_unit || "pcs",
      price: product.selling_price || 0,
      image_url: product.image_url,
    };

    const updatedItems = [...items, newItem];
    setValue("items", updatedItems, { shouldDirty: true });
    updateKitPrice(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setValue("items", updatedItems, { shouldDirty: true });
    updateKitPrice(updatedItems);
  };

  const handleQuantityChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const updatedItems = [...items];
    updatedItems[index].quantity_per_kit = num;
    setValue("items", updatedItems, { shouldDirty: true });
    updateKitPrice(updatedItems);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setKitImage(previewUrl);
  };

  const totalValue = items.reduce((sum, item) => {
    return sum + (item.price || 0) * (item.quantity_per_kit || 0);
  }, 0);

  const onSubmit = (data: KitFormData) => {
    // Explicitly map payload to satisfy strict TypeScript hook requirements
    const payload = {
      name: data.name,
      sku: data.sku || undefined,
      is_active: data.is_active,
      kit_price: data.kit_price,
      packaging_id: data.packaging_id || null,
      kit_image: selectedFile || undefined,
      image_url: kitDetails?.image_url || undefined,
      items: data.items.map((i) => ({
        finished_product_id: i.finished_product_id,
        quantity_per_kit: i.quantity_per_kit,
      })),
    };

    if (isEditing) {
      updateKit({ id: id as string, ...payload } as KitUpdatePayload, {
        onSuccess: () => {
          navigate(-1);
        },
      });
    } else {
      createKit(payload as KitCreatePayload, {
        onSuccess: () => {
          navigate(-1);
        },
      });
    }
  };

  if (id && isLoadingDetails) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm border border-border shrink-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-sm font-bold leading-none truncate uppercase tracking-widest text-primary flex items-center gap-2">
              <Box className="w-4 h-4" />
              {isEditing ? "Edit Kit" : "Create New Kit"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-sm text-xs font-semibold uppercase tracking-wider gap-1.5"
            onClick={() => navigate(-1)}
            disabled={isCreating || isUpdating}
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="h-8 rounded-sm text-xs font-semibold uppercase tracking-wider gap-1.5"
            onClick={handleSubmit(onSubmit)}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isCreating || isUpdating
              ? isEditing
                ? "Updating..."
                : "Saving..."
              : isEditing
                ? "Update Kit"
                : "Save Kit"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Left Side: Form Fields */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                Kit Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <ProductInput
                ref={kitNameRef}
                label="Kit Name"
                value={watch("name")}
                error={errors.name?.message}
                onChange={(val) => setValue("name", val, { shouldDirty: true })}
                placeholder="e.g. Deluxe Morning Set"
              />

              <ProductInput
                label="SKU / Kit Code"
                value={watch("sku") || ""}
                error={errors.sku?.message}
                onChange={(val) => setValue("sku", val, { shouldDirty: true })}
                placeholder="Unique identifier"
              />

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Packaging
                </Label>
                <Combobox
                  options={filterPackages.map((pkg) => ({
                    label: pkg.package_name,
                    value: pkg.id,
                  }))}
                  value={watch("packaging_id") || ""}
                  onValueChange={(val) =>
                    setValue("packaging_id", val, { shouldDirty: true })
                  }
                  placeholder="Select packaging..."
                  className="h-8 text-xs rounded-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 gap-1"
                  onClick={() => setIsPackageModalOpen(true)}
                >
                  <Plus className="h-3 w-3" /> Add New Package
                </Button>
              </div>

              <div className="pt-1 px-1">
                <Label className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">
                  Market Sum Value:{" "}
                  <span className="text-foreground ml-1">
                    ₹
                    {totalValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Kit Status
              </Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={is_active ? "default" : "outline"}
                  size="sm"
                  className={`h-8 flex-1 text-xs rounded-sm gap-2 ${is_active ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                  onClick={() =>
                    setValue("is_active", true, { shouldDirty: true })
                  }
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Button>
                <Button
                  type="button"
                  variant={!is_active ? "destructive" : "outline"}
                  size="sm"
                  className="h-8 flex-1 text-xs rounded-sm gap-2"
                  onClick={() =>
                    setValue("is_active", false, { shouldDirty: true })
                  }
                >
                  <Package className="h-3 w-3" />
                  Inactive
                </Button>
              </div>
            </div>
          </div>

          {/* Kit Image Upload (Product Style) */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  Kit Image
                </h3>
              </div>
            </div>

            <div className="border border-dashed border-border rounded-lg p-4 bg-muted/10 flex flex-col items-center justify-center min-h-[160px] relative group">
              {kitImage ? (
                <div
                  className="relative w-full aspect-video rounded-md overflow-hidden bg-muted/20 border border-border cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={kitImage}
                    alt="Kit Preview"
                    className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Change Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-4">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                  <p className="text-[11px] font-medium">No image uploaded</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] uppercase font-bold tracking-tight rounded-sm mt-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCreating || isUpdating}
                  >
                    <UploadCloud className="h-3 w-3 mr-1.5" /> Select Image
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            <p className="text-[9px] text-muted-foreground text-center uppercase tracking-tighter opacity-70">
              JPG, PNG, WebP · High Resolution Recommended
            </p>
          </div>
        </div>

        {/* Right Side: Component Selector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden min-h-[400px] flex flex-col">
            <div className="p-5 border-b border-border bg-muted/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Included Products
                  </h3>
                </div>
                <div className="relative w-full sm:w-[300px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Combobox
                    options={products.map((p) => ({
                      label: `${p.product_name} (${p.code})`,
                      value: p.id,
                    }))}
                    value=""
                    onValueChange={handleAddProduct}
                    placeholder="Find products to add..."
                    searchPlaceholder="Search product name or SKU..."
                    className="h-8 pl-9 text-xs"
                    searchValue={fgSearch}
                    onSearchChange={setFgSearch}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground sticky top-0 bg-background border-b border-border z-10">
                  <tr>
                    <th className="px-5 py-3 text-left">Product Name</th>
                    <th className="px-5 py-3 text-center w-[120px]">
                      Quantity
                    </th>
                    <th className="px-5 py-3 text-center w-[100px]">Unit</th>
                    <th className="px-5 py-3 text-right w-[150px]">
                      Est. Value
                    </th>
                    <th className="px-5 py-3 text-center w-[80px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b border-border">
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-20 text-center text-muted-foreground italic"
                      >
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <Package className="h-8 w-8" />
                          <p className="text-xs">
                            No products selected yet. Use the search bar above
                            to add items.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-muted/10 transition-colors group"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-10 h-10 object-cover rounded-sm border border-border"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center border border-border shrink-0">
                                <Package className="w-5 h-5 opacity-20" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground text-xs">
                                {item.product_name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                #
                                {item.finished_product_id
                                  .split("-")[0]
                                  .toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Input
                            type="number"
                            value={item.quantity_per_kit || ""}
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            className="h-8 text-center text-xs rounded-sm bg-background/50 border-primary/20 focus:ring-primary/20"
                            placeholder="0"
                            min="1"
                          />
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-bold rounded-sm h-5 px-1.5 uppercase bg-muted text-muted-foreground border-border"
                          >
                            {item.unit || "pcs"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-primary text-xs">
                              ₹
                              {(
                                (item.price || 0) * (item.quantity_per_kit || 0)
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-[9px] text-muted-foreground italic">
                              ₹{(item.price || 0).toFixed(2)} / unit
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {items.length > 0 && (
              <div className="p-5 bg-muted/10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-muted-foreground font-medium">
                  Total Items:{" "}
                  <span className="text-foreground font-bold">
                    {items.reduce(
                      (sum, i) => sum + (Number(i.quantity_per_kit) || 0),
                      0,
                    )}{" "}
                    Units
                  </span>{" "}
                  Across{" "}
                  <span className="text-foreground font-bold">
                    {items.length} Products
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Kit Selling Price
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={watch("kit_price") || ""}
                      onChange={(e) =>
                        setValue("kit_price", parseFloat(e.target.value) || 0, {
                          shouldDirty: true,
                        })
                      }
                      className="h-9 pl-7 pr-3 text-right text-lg font-bold font-mono text-emerald-600 border-emerald-500/30 bg-emerald-500/5 focus-visible:ring-emerald-500/20 w-[150px] rounded-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {errors.items && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive text-xs flex items-center gap-3 font-semibold">
          <Plus className="h-4 w-4 rotate-45" />
          {errors.items.message}
        </div>
      )}

      <PackageModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />
    </div>
  );
};

export default KitFormPage;
