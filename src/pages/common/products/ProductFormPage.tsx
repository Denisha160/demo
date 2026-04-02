import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Box,
  Package,
  Loader2,
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Trash2,
  Lock,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CategoryDrawer } from "@/components/Drawers/CategoryDrawer";
import { FragranceDrawer } from "@/components/Drawers/FragranceDrawer";
import { BrandDrawer } from "@/components/Drawers/BrandDrawer";
import AddProductPhotoModal from "@/pages/common/products/components/AddProductPhotoModal";
import PackageModal from "@/pages/common/packages/components/PackageModal";

import { Product, ProductCreatePayload } from "@/types/products";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProductPhoto,
} from "@/hooks/useProducts";
import { useCurrentUser } from "@/hooks/useAuth";
import { useCategoriesCombobox, Category } from "@/hooks/useProductCategories";
import { usePackagesCombobox } from "@/hooks/usePackages";
import { useBrandCombobox } from "@/hooks/useBrands";
import { useFragranceCombobox } from "@/hooks/useFragrances";
import { useDebounce } from "@/hooks/useDebounce";
import { useUploadProductPhoto } from "@/hooks/useProducts";

// Import extracted tab components
import { UnitsMeasurementsTab } from "./components/tabs/UnitsMeasurementsTab";
import { PackagingTab } from "./components/tabs/PackagingTab";
import { SpecificationsTab } from "./components/tabs/SpecificationsTab";
import { KitsTab } from "./components/tabs/KitsTab";
import { RecipesTab } from "./components/tabs/RecipesTab";

// --- Zod Validation Schema ---
const productSchema = z.object({
  product_name: z.string().min(2, "Product name is required (min 2 characters)"),
  secret_name: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  category_id: z.string().uuid("Please select a valid category").optional().nullable(),
  product_type: z.enum(["RAW_MATERIAL", "SEMI_FINISHED", "FINISHED_GOOD"]),
  is_brand: z.boolean().default(false),
  brand_id: z.string().uuid("Please select a valid brand").optional().nullable(),
  fragrance_id: z.string().uuid("Please select a valid fragrance").optional().nullable(),
  is_active: z.boolean().default(true),
  unit_category: z.enum(["weight", "volume", "count"]).default("count"),
  base_unit: z.enum(["kg", "g", "ltr", "ml", "pcs"]).default("pcs"),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  size_value: z.number().nullable().optional(),
  dimension_unit: z.enum(["mm", "cm", "m", "in", "ft"]).nullable().optional(),
  cost_price: z.number().nullable().optional(),
  selling_price: z.number().nullable().optional(),
  hsn_code: z.string().optional().nullable(),
  shape: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  packaging_id: z.string().uuid("Please select a valid package").optional().nullable(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductFormPage = () => {
  const { id, companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();

  const isAdmin = location.pathname.startsWith("/admin");
  const routePrefix = isAdmin ? "/admin" : `/${companyId}`;
  const isNew = id === "new" || !id;

  // --- Hooks & Data Fetching ---
  const { data: fetchedProduct, isLoading } = useProduct(isNew ? undefined : id);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: deletePhoto } = useDeleteProductPhoto();

  const isRoot = currentUser?.is_root_user || false;
  const isSaving = isCreating || isUpdating;

  // --- State Initialization ---
  const [activeTab, setActiveTab] = useState("measurements");
  const [showSecretInput, setShowSecretInput] = useState(false);
  const productNameRef = useRef<HTMLInputElement>(null);

  // UI states
  const [imagePreviews, setImagePreviews] = useState<{ id?: string; url: string }[]>([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isFragranceDrawerOpen, setIsFragranceDrawerOpen] = useState(false);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const { mutateAsync: uploadPhoto } = useUploadProductPhoto();

  // Combobox search states
  const [categorySearch, setCategorySearch] = useState("");
  const debouncedCategorySearch = useDebounce(categorySearch, 300);
  const [packageSearch, setPackageSearch] = useState("");
  const debouncedPackageSearch = useDebounce(packageSearch, 300);
  const [brandSearch, setBrandSearch] = useState("");
  const debouncedBrandSearch = useDebounce(brandSearch, 300);
  const [fragranceSearch, setFragranceSearch] = useState("");
  const debouncedFragranceSearch = useDebounce(fragranceSearch, 300);

  // Metadata States
  const [metaColors, setMetaColors] = useState<string[]>([""]);
  const [metaFeatures, setMetaFeatures] = useState<string[]>([""]);
  const [metaParams, setMetaParams] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [metaAttributes, setMetaAttributes] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);

  // React Hook Form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_name: "",
      product_type: "FINISHED_GOOD",
      is_brand: false,
      base_unit: "pcs",
      unit_category: "count",
      is_active: true,
      category_id: null,
      brand_id: null,
      fragrance_id: null,
      packaging_id: null,
    },
  });

  // Fetch combobox options
  const { data: fetchedCategories } = useCategoriesCombobox({ type: "sub", search: debouncedCategorySearch });
  const { data: fetchedPackages } = usePackagesCombobox({ search: debouncedPackageSearch.trim() || undefined });
  const { data: fetchedBrands } = useBrandCombobox({ search: debouncedBrandSearch, status: "active" });
  const { data: fetchedFragrances } = useFragranceCombobox({ search: debouncedFragranceSearch, status: "active" });

  const categoryOptions = ((fetchedCategories as Category[]) || []).map((cat) => ({
    label: cat.parent_name ? `${cat.name} (${cat.parent_name})` : cat.name,
    value: cat.id,
  }));
  const packageOptions = ((fetchedPackages as any[]) || []).map((pkg) => ({
    label: pkg.package_code ? `${pkg.package_name} (${pkg.package_code})` : pkg.package_name,
    value: pkg.id,
  }));
  const brandOptions = ((fetchedBrands as any[]) || []).map((b) => ({ label: b.name, value: b.id }));
  const fragranceOptions = ((fetchedFragrances as any[]) || []).map((f) => ({ label: f.name, value: f.id }));

  // --- Sync fetched data ---
  useEffect(() => {
    if (fetchedProduct && !isNew) {
      form.reset({
        ...fetchedProduct,
        category_id: fetchedProduct.category_id || null,
        brand_id: fetchedProduct.brand_id || null,
        fragrance_id: fetchedProduct.fragrance_id || null,
        packaging_id: fetchedProduct.packaging_id || null,
        secret_name: fetchedProduct.secret_name || (fetchedProduct.metadata?.secret_name as string) || null,
      });

      const meta = fetchedProduct.metadata || {};
      setMetaColors(Array.isArray(meta.colors) && meta.colors.length > 0 ? meta.colors.map(String) : [""]);
      setMetaFeatures(Array.isArray(meta.features) && meta.features.length > 0 ? meta.features.map(String) : [""]);
      setMetaParams(meta.parameters ? Object.entries(meta.parameters).map(([k, v]) => ({ key: k, value: String(v) })) : [{ key: "", value: "" }]);
      setMetaAttributes(meta.attributes ? Object.entries(meta.attributes).map(([k, v]) => ({ key: k, value: String(v) })) : [{ key: "", value: "" }]);

      if (fetchedProduct.images && Array.isArray(fetchedProduct.images)) {
        setImagePreviews(fetchedProduct.images.map((img: any) => ({
          id: img.id,
          url: img.image?.url || img.image_url?.url || img.url || ""
        })).filter(x => x.url));
      }
      if (fetchedProduct.secret_name || fetchedProduct.metadata?.secret_name) setShowSecretInput(true);
    }
  }, [fetchedProduct, isNew, form]);

  const onSubmit = (values: ProductFormValues) => {
    const buildObject = (arr: { key: string; value: string }[]) =>
      arr.reduce((acc, curr) => {
        const k = curr.key.trim();
        const v = curr.value.trim();
        if (k && v) acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    const parameters = buildObject(metaParams);
    const attributes = buildObject(metaAttributes);
    const colors = metaColors.map(c => c.trim()).filter(Boolean);
    const features = metaFeatures.map(f => f.trim()).filter(Boolean);

    const payload = {
      ...values,
      metadata: {
        ...(values.secret_name && { secret_name: values.secret_name }),
        ...(colors.length > 0 && { colors }),
        ...(features.length > 0 && { features }),
        ...(Object.keys(parameters).length > 0 && { parameters }),
        ...(Object.keys(attributes).length > 0 && { attributes }),
      },
    };

    const onError = (error: any) => {
      if (error?.details?.body) {
        Object.entries(error.details.body).forEach(([key, msg]) => {
          form.setError(key as any, { message: msg as string });
        });
      } else if (error?.code === "duplicate_key_value") {
        const msg = error.message || "A duplicate record exists.";
        if (msg.toLowerCase().includes("product name")) form.setError("product_name", { message: msg });
        else if (msg.toLowerCase().includes("product_code")) form.setError("code", { message: msg });
        else toast.error(msg);
      } else {
        toast.error(error?.message || "An unexpected error occurred.");
      }
    };

    if (isNew) {
      createProduct(payload as unknown as ProductCreatePayload, {
        onSuccess: () => navigate(`${routePrefix}/products`),
        onError,
      });
    } else {
      updateProduct({ ...payload, id: id! }, {
        onSuccess: () => toast.success("Product updated successfully"),
        onError,
      });
    }
  };

  const comboboxes = {
    category: { options: categoryOptions, search: categorySearch, setSearch: setCategorySearch },
    fragrance: { options: fragranceOptions, search: fragranceSearch, setSearch: setFragranceSearch },
    brand: { options: brandOptions, search: brandSearch, setSearch: setBrandSearch },
    package: { options: packageOptions, search: packageSearch, setSearch: setPackageSearch },
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center h-64 space-y-4"><Loader2 className="animate-spin h-8 w-8 text-primary" /><p className="text-muted-foreground">Loading product details...</p></div>;

  return (
    <div className="w-full mx-auto space-y-4 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm border border-border shrink-0" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="min-w-0"><h2 className="text-sm font-bold text-primary leading-none truncate uppercase tracking-widest flex items-center gap-2"><Box className="w-4 h-4" />{isNew ? "Create New Product" : "Product Detail"}</h2></div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 border border-border rounded-lg bg-card shadow-sm space-y-6 animate-in fade-in-50 duration-300">
          {/* Top Section: Basic Info & Images */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
            {/* Basic Info Section (7 Cols) */}
            <div className="xl:col-span-7 space-y-4 border border-border/50 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Name & Category */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="product_name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Product Name</FormLabel>
                          {isRoot && (
                            <Button type="button" variant="ghost" size="sm" className={`h-5 px-1.5 text-[9px] gap-1 hover:bg-primary/10 ${showSecretInput ? "text-primary" : "text-muted-foreground"}`} onClick={() => setShowSecretInput(!showSecretInput)}>
                              <Lock className="h-2.5 w-2.5" />{showSecretInput ? "Hide Secret" : "Add Secret"}
                            </Button>
                          )}
                        </div>
                        <FormControl><Input ref={productNameRef} {...field} placeholder="Enter product name" className="text-sm h-10" /></FormControl>
                        <FormMessage className="text-[10px]" />
                        {isRoot && showSecretInput && (
                          <FormField
                            control={form.control}
                            name="secret_name"
                            render={({ field: sField }) => (
                              <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                                <Label className="text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Secret Name</Label>
                                <Input {...sField} value={sField.value || ""} placeholder="Backend/Secret name" className="text-sm h-10 mt-1 border-primary/30" />
                              </div>
                            )}
                          />
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Category</FormLabel>
                        <Combobox
                          options={comboboxes.category.options}
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          placeholder="Select category..."
                          className="h-10"
                          searchValue={categorySearch}
                          onSearchChange={setCategorySearch}
                        />
                        <Button type="button" variant="ghost" size="sm" className="h-6 px-1 text-[10px] text-primary hover:text-primary hover:bg-primary/5 mt-0.5 gap-1" onClick={() => setIsCategoryDrawerOpen(true)}>
                          <Plus className="h-3 w-3" /> Add New Category
                        </Button>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Column 2: Code & BrandItem/HSN */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Product Code</FormLabel>
                        <FormControl><Input {...field} value={field.value || ""} placeholder="DEMO" className="text-sm h-10" /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_brand"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Brand Item</FormLabel>
                          <RadioGroup onValueChange={(val) => field.onChange(val === "yes")} value={field.value ? "yes" : "no"} className="flex items-center gap-3 h-10">
                            <div className="flex items-center space-x-1.5"><RadioGroupItem value="yes" id="brand-yes" /><Label htmlFor="brand-yes" className="text-sm cursor-pointer font-medium m-0">Yes</Label></div>
                            <div className="flex items-center space-x-1.5"><RadioGroupItem value="no" id="brand-no" /><Label htmlFor="brand-no" className="text-sm cursor-pointer font-medium m-0">No</Label></div>
                          </RadioGroup>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hsn_code"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">HSN Code</FormLabel>
                          <FormControl><Input {...field} value={field.value || ""} placeholder="e.g. 3401.19" className="text-sm h-10" /></FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Column 3: Type & Fragrance/Brand */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="product_type"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Product Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="text-sm h-10"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="FINISHED_GOOD" className="text-xs">Finished Good</SelectItem>
                            <SelectItem value="SEMI_FINISHED" className="text-xs">Semi Finished</SelectItem>
                            <SelectItem value="RAW_MATERIAL" className="text-xs">Raw Material</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="fragrance_id"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Fragrance</FormLabel>
                          <Combobox
                            options={comboboxes.fragrance.options}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select fragrance..."
                            className="h-10"
                            searchValue={fragranceSearch}
                            onSearchChange={setFragranceSearch}
                          />
                          <Button type="button" variant="ghost" size="sm" className="h-6 px-1 text-[10px] text-primary hover:text-primary hover:bg-primary/5 mt-0.5 gap-1" onClick={() => setIsFragranceDrawerOpen(true)}>
                            <Plus className="h-3 w-3" /> Add New Fragrance
                          </Button>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="brand_id"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Brand</FormLabel>
                          <Combobox
                            options={comboboxes.brand.options}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select brand..."
                            className="h-10"
                            searchValue={brandSearch}
                            onSearchChange={setBrandSearch}
                            disabled={!form.watch("is_brand")}
                          />
                          <Button type="button" variant="ghost" size="sm" className="h-6 px-1 text-[10px] text-primary hover:text-primary hover:bg-primary/5 mt-0.5 gap-1" onClick={() => setIsBrandDrawerOpen(true)}>
                            <Plus className="h-3 w-3" /> Add New Brand
                          </Button>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Grid underneath basic grid */}
              <div className="pt-4 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <FormField
                  control={form.control}
                  name="cost_price"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-primary uppercase tracking-wide">Cost Price</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">₹</span>
                        <Input type="number" step="any" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} className="text-sm h-10 pl-7" placeholder="0.00" />
                      </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selling_price"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[10px] font-bold text-primary uppercase tracking-wide">Selling Price</FormLabel>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">₹</span>
                        <Input type="number" step="any" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : Number(e.target.value))} className="text-sm h-10 pl-7" placeholder="0.00" />
                      </div>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sidebar Photo Area (3 Cols) */}
            <div className="xl:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Product Images</h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase tracking-wider gap-2 px-3 border-border hover:bg-primary/5 text-foreground disabled:opacity-50"
                    onClick={() => setIsPhotoModalOpen(true)}
                    disabled={isSaving}
                  >
                    <UploadCloud className="h-3.5 w-3.5" /> Add Photos
                  </Button>
                </div>
              </div>

              <div className="border-2 border-dashed border-border/60 rounded-md p-4 bg-muted/5 min-h-[220px] flex flex-col items-center justify-center relative group">
                {imagePreviews.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-20" />
                    <p className="text-[11px] font-medium">No images uploaded yet</p>
                    <p className="text-[9px] uppercase tracking-tighter opacity-60">JPG, PNG, WEBP · AUTO-COMPRESSED</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col gap-4">
                    <div className="relative aspect-video w-full rounded-sm overflow-hidden bg-card border border-border shadow-sm">
                      <img
                        src={imagePreviews[Math.min(slideIdx, imagePreviews.length - 1)].url}
                        alt="Product Photo"
                        className="w-full h-full object-cover cursor-zoom-in"
                        onClick={() => setLightboxIndex(Math.min(slideIdx, imagePreviews.length - 1))}
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {Math.min(slideIdx, imagePreviews.length - 1) + 1} / {imagePreviews.length}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = Math.min(slideIdx, imagePreviews.length - 1);
                          if (imagePreviews[idx].id) deletePhoto({ productId: id!, imageId: imagePreviews[idx].id! });
                          setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                          if (idx > 0) setSlideIdx(idx - 1);
                        }}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-destructive text-white rounded-full p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Carousel Dots */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imagePreviews.map((_, i) => (
                          <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${i === slideIdx ? "bg-primary w-3" : "bg-white/50"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] text-center font-bold text-muted-foreground uppercase tracking-[0.15em]">JPG, PNG, WEBP · AUTO-COMPRESSED</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Width Tabs Section */}
          <div className="mt-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap h-auto w-full justify-start bg-transparent border-b border-border rounded-none pb-0 mb-8 gap-1">
                <TabsTrigger value="measurements" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold">Units & Measurements</TabsTrigger>
                {form.watch("product_type") !== "RAW_MATERIAL" && (
                  <TabsTrigger value="packaging" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold">Packaging</TabsTrigger>
                )}
                <TabsTrigger value="specifications" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold">Specifications</TabsTrigger>
                {form.watch("product_type") !== "RAW_MATERIAL" && (
                  <>
                    <TabsTrigger value="kits" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold">Kits</TabsTrigger>
                    <TabsTrigger value="recipes" className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold">Recipes</TabsTrigger>
                  </>
                )}
              </TabsList>

              <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                <TabsContent value="measurements" className="m-0 focus-visible:outline-none">
                  <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
                    <span className="text-lg">⚖️</span>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">Units & Measurements</h3>
                  </div>
                  <UnitsMeasurementsTab form={form} />
                </TabsContent>

                <TabsContent value="packaging" className="m-0 focus-visible:outline-none">
                  <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
                    <span className="text-lg">📦</span>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">Packaging</h3>
                  </div>
                  <PackagingTab form={form} comboboxes={comboboxes} packageModal={{ setOpen: setIsPackageModalOpen }} />
                </TabsContent>

                <TabsContent value="specifications" className="m-0 focus-visible:outline-none">
                  <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
                    <span className="text-lg">⚙️</span>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">Specifications</h3>
                  </div>
                  <SpecificationsTab metadata={{ metaColors, setMetaColors, metaFeatures, setMetaFeatures, metaParams, setMetaParams, metaAttrs: metaAttributes, setMetaAttrs: setMetaAttributes }} />
                </TabsContent>

                <TabsContent value="kits" className="m-0 focus-visible:outline-none">
                  <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
                    <span className="text-lg">🧩</span>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">Kits</h3>
                  </div>
                  <KitsTab productId={id} productType={form.watch("product_type")} isNew={isNew} />
                </TabsContent>

                <TabsContent value="recipes" className="m-0 focus-visible:outline-none">
                  <div className="flex items-center gap-2 mb-6 border-b border-border/40 pb-3">
                    <span className="text-lg">🧪</span>
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-[0.2em]">Recipes</h3>
                  </div>
                  <RecipesTab productId={id} productType={form.watch("product_type")} isNew={isNew} sellingPrice={Number(form.watch("selling_price") || 0)} />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="pt-6 mt-12 border-t border-border/50 flex justify-end gap-3 items-center">
            <Button type="button" variant="outline" size="sm" className="text-sm px-6 h-10 font-bold uppercase tracking-wider" onClick={() => navigate(-1)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" size="sm" className="text-sm px-8 h-10 font-bold uppercase tracking-wider shadow-lg shadow-primary/20" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSaving ? "Saving..." : isNew ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>

      <CategoryDrawer open={isCategoryDrawerOpen} onOpenChange={setIsCategoryDrawerOpen} />
      <FragranceDrawer open={isFragranceDrawerOpen} onOpenChange={setIsFragranceDrawerOpen} />
      <BrandDrawer open={isBrandDrawerOpen} onOpenChange={setIsBrandDrawerOpen} />

      {/* Modals & Drawers */}
      <AddProductPhotoModal
        product={{
          id: id || "",
          name: form.getValues("product_name") || fetchedProduct?.product_name || "",
        }}
        open={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSuccess={() => {
          setIsPhotoModalOpen(false);
        }}
      />

      <PackageModal isOpen={isPackageModalOpen} onClose={() => setIsPackageModalOpen(false)} />

      {/* Lightbox placeholder (if needed, but slideIdx handles it mostly) */}
    </div>
  );
};

export default ProductFormPage;
