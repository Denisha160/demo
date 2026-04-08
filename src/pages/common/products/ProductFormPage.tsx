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
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
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
import { Switch } from "@/components/ui/switch";

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
  product_name: z
    .string()
    .min(2, "Product name is required (min 2 characters)"),
  secret_name: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
  category_id: z
    .string()
    .uuid("Please select a valid category")
    .optional()
    .nullable(),
  product_type: z.enum(["RAW_MATERIAL", "SEMI_FINISHED", "FINISHED_GOOD"]),
  is_brand: z.boolean().default(false),
  brand_id: z
    .string()
    .uuid("Please select a valid brand")
    .optional()
    .nullable(),
  fragrance_id: z
    .string()
    .uuid("Please select a valid fragrance")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
  unit_category: z.enum(["weight", "volume", "count"]).default("count"),
  base_unit: z.enum(["kg", "g", "ltr", "ml", "pcs"]).default("pcs"),
  weight: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  size_value: z.number().nullable().optional(),
  dimension_unit: z.enum(["mm", "cm", "m", "in", "ft"]).nullable().optional(),
  cost_price: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cost price is required"),
  selling_price: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Selling price is required"),
  hsn_code: z.string().optional().nullable(),
  shape: z.string().optional().nullable(),
  capacity: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  packaging_id: z
    .string()
    .uuid("Please select a valid package")
    .optional()
    .nullable(),
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
  const {
    data: fetchedProduct,
    isLoading,
    refetch,
  } = useProduct(isNew ? undefined : id);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const {
    mutate: updateProduct,
    mutateAsync: updateProductAsync,
    isPending: isUpdating,
  } = useUpdateProduct();
  const { mutate: deletePhoto } = useDeleteProductPhoto();

  const isRoot = currentUser?.is_root_user || false;
  const isSaving = isCreating || isUpdating;

  const [isEditing, setIsEditing] = useState(
    isNew || location.pathname.includes("/edit"),
  );
  const [activeTab, setActiveTab] = useState("measurements");
  const [showSecretInput, setShowSecretInput] = useState(false);
  const productNameRef = useRef<HTMLInputElement>(null);

  // UI states
  const [imagePreviews, setImagePreviews] = useState<
    { id?: string; url: string }[]
  >([]);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isFragranceDrawerOpen, setIsFragranceDrawerOpen] = useState(false);
  const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const { mutateAsync: uploadPhoto } = useUploadProductPhoto();

  const tabProps = {
    images: {
      previews: imagePreviews,
      openModal: () => setIsPhotoModalOpen(true),
      slideIdx,
      setSlideIdx,
      setLightboxIndex,
      deletePhoto: (imageId: string | undefined, idx: number) => {
        if (imageId) deletePhoto({ productId: id!, imageId });
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
      },
    },
  };

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
  const [metaParams, setMetaParams] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  const [metaAttributes, setMetaAttributes] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);

  const handleStatusChange = async (active: boolean) => {
    if (!id) return;
    try {
      await updateProductAsync({
        id,
        is_active: active,
      });
    } catch (error) {
      form.setValue("is_active", !active);
    }
  };

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
  const { data: fetchedCategories } = useCategoriesCombobox({
    type: "sub",
    search: debouncedCategorySearch,
  });
  const { data: fetchedPackages } = usePackagesCombobox({
    search: debouncedPackageSearch.trim() || undefined,
  });
  const { data: fetchedBrands } = useBrandCombobox({
    search: debouncedBrandSearch,
    status: "active",
  });
  const { data: fetchedFragrances } = useFragranceCombobox({
    search: debouncedFragranceSearch,
    status: "active",
  });

  const categoryOptions = ((fetchedCategories as Category[]) || []).map(
    (cat) => ({
      label: cat.parent_name ? `${cat.name} (${cat.parent_name})` : cat.name,
      value: cat.id,
    }),
  );
  const packageOptions = ((fetchedPackages as any[]) || []).map((pkg) => ({
    label: pkg.package_code
      ? `${pkg.package_name} (${pkg.package_code})`
      : pkg.package_name,
    value: pkg.id,
  }));
  const brandOptions = ((fetchedBrands as any[]) || []).map((b) => ({
    label: b.name,
    value: b.id,
  }));
  const fragranceOptions = ((fetchedFragrances as any[]) || []).map((f) => ({
    label: f.name,
    value: f.id,
  }));

  // --- Sync fetched data ---
  useEffect(() => {
    if (fetchedProduct && !isNew) {
      form.reset({
        ...fetchedProduct,
        category_id: fetchedProduct.category_id || null,
        brand_id: fetchedProduct.brand_id || null,
        fragrance_id: fetchedProduct.fragrance_id || null,
        packaging_id: fetchedProduct.packaging_id || null,
        secret_name:
          fetchedProduct.secret_name ||
          (fetchedProduct.metadata?.secret_name as string) ||
          null,
      });

      const meta = fetchedProduct.metadata || {};
      setMetaColors(
        Array.isArray(meta.colors) && meta.colors.length > 0
          ? meta.colors.map(String)
          : [""],
      );
      setMetaFeatures(
        Array.isArray(meta.features) && meta.features.length > 0
          ? meta.features.map(String)
          : [""],
      );
      setMetaParams(
        meta.parameters
          ? Object.entries(meta.parameters).map(([k, v]) => ({
              key: k,
              value: String(v),
            }))
          : [{ key: "", value: "" }],
      );
      setMetaAttributes(
        meta.attributes
          ? Object.entries(meta.attributes).map(([k, v]) => ({
              key: k,
              value: String(v),
            }))
          : [{ key: "", value: "" }],
      );

      if (fetchedProduct.images && Array.isArray(fetchedProduct.images)) {
        setImagePreviews(
          fetchedProduct.images
            .map((img: any) => ({
              id: img.id,
              url: img.image?.url || img.image_url?.url || img.url || "",
            }))
            .filter((x) => x.url),
        );
      }
      if (fetchedProduct.secret_name || fetchedProduct.metadata?.secret_name)
        setShowSecretInput(true);
    }
  }, [fetchedProduct, isNew, form]);

  const onSubmit = (values: ProductFormValues) => {
    const buildObject = (arr: { key: string; value: string }[]) =>
      arr.reduce(
        (acc, curr) => {
          const k = curr.key.trim();
          const v = curr.value.trim();
          if (k && v) acc[k] = v;
          return acc;
        },
        {} as Record<string, string>,
      );

    const parameters = buildObject(metaParams);
    const attributes = buildObject(metaAttributes);
    const colors = metaColors.map((c) => c.trim()).filter(Boolean);
    const features = metaFeatures.map((f) => f.trim()).filter(Boolean);

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
        if (msg.toLowerCase().includes("product name"))
          form.setError("product_name", { message: msg });
        else if (msg.toLowerCase().includes("product_code"))
          form.setError("code", { message: msg });
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
      updateProduct(
        { ...payload, id: id! },
        {
          onSuccess: () => {
            setIsEditing(false);
            refetch();
          },
          onError,
        },
      );
    }
  };

  const comboboxes = {
    category: {
      options: categoryOptions,
      search: categorySearch,
      setSearch: setCategorySearch,
    },
    fragrance: {
      options: fragranceOptions,
      search: fragranceSearch,
      setSearch: setFragranceSearch,
    },
    brand: {
      options: brandOptions,
      search: brandSearch,
      setSearch: setBrandSearch,
    },
    package: {
      options: packageOptions,
      search: packageSearch,
      setSearch: setPackageSearch,
    },
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-2">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in overflow-hidden">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-10 border-b border-border transition-all duration-200 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div className="flex items-center">
            <button
              className="p-1.5 hover:bg-muted rounded-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-black text-foreground uppercase tracking-tighter">
                  {isNew ? "Create New Product" : "Edit Product Record"}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isNew && (
              <div className="flex items-center gap-3 bg-muted/20 px-3 py-1.5 rounded-sm border border-border/50">
                <Label
                  htmlFor="product-status"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1"
                >
                  {form.watch("is_active") ? "Active" : "Inactive"}
                </Label>
                <Switch
                  id="product-status"
                  checked={form.watch("is_active")}
                  onCheckedChange={(checked) => {
                    form.setValue("is_active", checked, {
                      shouldDirty: true,
                    });
                    if (!isEditing) {
                      handleStatusChange(checked);
                    }
                  }}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            )}

            {!isNew && !isEditing ? (
              <Button
                type="button"
                className="h-8 text-xs rounded-sm"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Product
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => (isNew ? navigate(-1) : setIsEditing(false))}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="product-form"
                  className="h-8 text-xs rounded-sm"
                  size="sm"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  {isSaving
                    ? "Saving..."
                    : isNew
                      ? "Create Product"
                      : "Update Changes"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto">
        <Form {...form}>
          <form id="product-form" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Top Section: Basic Info & Images */}
            <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
              {/* Basic Info Section (7 Cols) */}
              <div className="xl:col-span-7 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Name & Category */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="product_name"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                              Product Name
                            </FormLabel>
                            {isRoot && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={`h-5 px-1.5 text-[9px] gap-1 hover:bg-primary/10 ${showSecretInput ? "text-primary" : "text-muted-foreground"}`}
                                onClick={() =>
                                  setShowSecretInput(!showSecretInput)
                                }
                              >
                                <Lock className="h-2.5 w-2.5" />
                                {showSecretInput ? "Hide Secret" : "Add Secret"}
                              </Button>
                            )}
                          </div>
                          <FormControl>
                            <Input
                              ref={productNameRef}
                              {...field}
                              placeholder="Enter product name"
                              autoFocus={true}
                              className="text-sm"
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                          {isRoot && showSecretInput && (
                            <FormField
                              control={form.control}
                              name="secret_name"
                              render={({ field: sField }) => (
                                <div className="mt-2 animate-in slide-in-from-top-1 duration-200">
                                  <Label className="text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                                    <Lock className="h-2.5 w-2.5" /> Secret Name
                                  </Label>
                                  <Input
                                    {...sField}
                                    value={sField.value || ""}
                                    placeholder="Backend/Secret name"
                                    className="text-sm mt-1 border-primary/30"
                                    disabled={!isEditing}
                                  />
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
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            Category
                          </FormLabel>
                          <Combobox
                            options={comboboxes.category.options}
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Select category..."
                            searchValue={categorySearch}
                            onSearchChange={setCategorySearch}
                            disabled={!isEditing}
                          />
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1 text-[10px] text-primary hover:text-primary hover:bg-primary/5 mt-0.5 gap-1"
                              onClick={() => setIsCategoryDrawerOpen(true)}
                            >
                              <Plus className="h-3 w-3" /> Add New Category
                            </Button>
                          )}
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Column 2: Code & BrandItem/HSN */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            Product Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="DEMO"
                              className="text-sm"
                              disabled={!isEditing}
                            />
                          </FormControl>
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
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                              Brand Item
                            </FormLabel>
                            <RadioGroup
                              onValueChange={(val) =>
                                field.onChange(val === "yes")
                              }
                              value={field.value ? "yes" : "no"}
                              className="flex items-center gap-3"
                              disabled={!isEditing}
                            >
                              <div className="flex items-center space-x-1.5">
                                <RadioGroupItem value="yes" id="brand-yes" />
                                <Label
                                  htmlFor="brand-yes"
                                  className="text-sm cursor-pointer font-medium m-0"
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <RadioGroupItem value="no" id="brand-no" />
                                <Label
                                  htmlFor="brand-no"
                                  className="text-sm cursor-pointer font-medium m-0"
                                >
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hsn_code"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                              HSN Code
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="e.g. 3401.19"
                                className="text-sm"
                                disabled={!isEditing}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Column 3: Type & Fragrance/Brand */}
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="product_type"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                            Product Type
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem
                                value="FINISHED_GOOD"
                                className="text-xs"
                              >
                                Finished Good
                              </SelectItem>
                              <SelectItem
                                value="SEMI_FINISHED"
                                className="text-xs"
                              >
                                Semi Finished
                              </SelectItem>
                              <SelectItem
                                value="RAW_MATERIAL"
                                className="text-xs"
                              >
                                Raw Material
                              </SelectItem>
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
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                              Fragrance
                            </FormLabel>
                            <Combobox
                              options={comboboxes.fragrance.options}
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Select fragrance..."
                              searchValue={fragranceSearch}
                              onSearchChange={setFragranceSearch}
                              disabled={!isEditing}
                            />
                            {isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-[10px] text-primary hover:text-primary hover:bg-primary/5 mt-0.5 gap-1"
                                onClick={() => setIsFragranceDrawerOpen(true)}
                              >
                                <Plus className="h-3 w-3" /> Add New Fragrance
                              </Button>
                            )}
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brand_id"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                              Brand
                            </FormLabel>
                            <Combobox
                              options={comboboxes.brand.options}
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Select brand..."
                              searchValue={brandSearch}
                              onSearchChange={setBrandSearch}
                              disabled={!isEditing || !form.watch("is_brand")}
                            />
                            {isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1 text-[10px] text-primary hover:text-primary hover:bg-primary/5 mt-0.5 gap-1"
                                onClick={() => setIsBrandDrawerOpen(true)}
                              >
                                <Plus className="h-3 w-3" /> Add New Brand
                              </Button>
                            )}
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Grid underneath basic grid */}
                <div className="border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cost_price"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[10px] font-bold text-primary uppercase tracking-wide">
                          Cost Price
                        </FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                            ₹
                          </span>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            className="text-sm pl-7"
                            placeholder="0.00"
                            disabled={!isEditing}
                          />
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
                        <FormLabel className="text-[10px] font-bold text-primary uppercase tracking-wide">
                          Selling Price
                        </FormLabel>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                            ₹
                          </span>
                          <Input
                            type="number"
                            step="any"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            className="text-sm pl-7"
                            placeholder="0.00"
                            disabled={!isEditing}
                          />
                        </div>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sidebar Photo Area (3 Cols) */}
              <div className="xl:col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
                      Product Images
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs rounded-sm"
                      onClick={tabProps.images.openModal}
                      disabled={isNew || isSaving || !isEditing}
                    >
                      <UploadCloud className="h-3 w-3 mr-1" />
                      Add Photos
                    </Button>
                    {isNew && (
                      <span className="text-[9px] text-muted-foreground italic text-right">
                        Save product first to upload photos
                      </span>
                    )}
                  </div>
                </div>

                <div className="border border-dashed border-border rounded-lg p-4 bg-muted/10 min-h-[180px] flex flex-col items-start">
                  {tabProps.images.previews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full h-full flex-1 gap-2 text-muted-foreground py-8">
                      <ImageIcon className="h-8 w-8 opacity-30" />
                      <p className="text-xs">No images uploaded yet</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs rounded-sm mt-1"
                        onClick={tabProps.images.openModal}
                        disabled={isNew || isSaving || !isEditing}
                      >
                        <UploadCloud className="h-3 w-3 mr-1" /> Upload first
                        image
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full gap-2 flex-1">
                      <div
                        className="relative w-full rounded-md overflow-hidden bg-muted/20 border border-border group cursor-zoom-in"
                        style={{ minHeight: 160 }}
                      >
                        <img
                          src={
                            tabProps.images.previews[
                              Math.min(
                                tabProps.images.slideIdx,
                                tabProps.images.previews.length - 1,
                              )
                            ].url
                          }
                          alt={`Product image ${
                            Math.min(
                              tabProps.images.slideIdx,
                              tabProps.images.previews.length - 1,
                            ) + 1
                          }`}
                          className="w-full object-cover"
                          style={{ minHeight: 160, maxHeight: 200 }}
                          onClick={() =>
                            tabProps.images.setLightboxIndex(
                              Math.min(
                                tabProps.images.slideIdx,
                                tabProps.images.previews.length - 1,
                              ),
                            )
                          }
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full pointer-events-none border border-white/10 z-10">
                          {Math.min(
                            tabProps.images.slideIdx,
                            tabProps.images.previews.length - 1,
                          ) + 1}{" "}
                          / {tabProps.images.previews.length}
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const idx = Math.min(
                                tabProps.images.slideIdx,
                                tabProps.images.previews.length - 1,
                              );
                              tabProps.images.deletePhoto(
                                tabProps.images.previews[idx].id,
                                idx,
                              );
                              if (idx > 0) tabProps.images.setSlideIdx(idx - 1);
                            }}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white rounded-full p-1 z-10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-60 transition-opacity" />
                        </div>
                        {tabProps.images.previews.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                tabProps.images.setSlideIdx(
                                  (i: number) =>
                                    (i - 1 + tabProps.images.previews.length) %
                                    tabProps.images.previews.length,
                                );
                              }}
                              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                tabProps.images.setSlideIdx(
                                  (i: number) =>
                                    (i + 1) % tabProps.images.previews.length,
                                );
                              }}
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
                              key={i}
                              type="button"
                              onClick={() => tabProps.images.setSlideIdx(i)}
                              className={`rounded-full transition-all ${
                                i ===
                                Math.min(
                                  tabProps.images.slideIdx,
                                  tabProps.images.previews.length - 1,
                                )
                                  ? "bg-primary w-3 h-1.5"
                                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-1.5 h-1.5"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-4 w-full pt-3 border-t border-border/50 text-center uppercase tracking-tighter">
                    JPG, PNG, WebP · Auto-compressed
                  </p>
                </div>
              </div>
            </div>

            {/* Full Width Tabs Section */}
            <div className="mt-8">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="flex flex-wrap h-auto w-full justify-start bg-transparent border-b border-border rounded-none pb-0 mb-2 gap-1">
                  <TabsTrigger
                    value="measurements"
                    className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold"
                  >
                    Units & Measurements
                  </TabsTrigger>
                  {form.watch("product_type") !== "RAW_MATERIAL" && (
                    <TabsTrigger
                      value="packaging"
                      className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold"
                    >
                      Packaging
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="specifications"
                    className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold"
                  >
                    Specifications
                  </TabsTrigger>
                  {form.watch("product_type") !== "RAW_MATERIAL" && (
                    <>
                      <TabsTrigger
                        value="kits"
                        className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold"
                      >
                        Kits
                      </TabsTrigger>
                      <TabsTrigger
                        value="recipes"
                        className="data-[state=active]:bg-muted data-[state=active]:border-b-primary rounded-t-md border-b-2 border-transparent px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold"
                      >
                        Recipes
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <TabsContent
                    value="measurements"
                    className="m-0 focus-visible:outline-none"
                  >
                    <UnitsMeasurementsTab form={form} disabled={!isEditing} />
                  </TabsContent>

                  <TabsContent
                    value="packaging"
                    className="m-0 focus-visible:outline-none"
                  >
                    <PackagingTab
                      form={form}
                      comboboxes={comboboxes}
                      packageModal={{ setOpen: setIsPackageModalOpen }}
                      disabled={!isEditing}
                    />
                  </TabsContent>

                  <TabsContent
                    value="specifications"
                    className="m-0 focus-visible:outline-none"
                  >
                    <SpecificationsTab
                      metadata={{
                        metaColors,
                        setMetaColors,
                        metaFeatures,
                        setMetaFeatures,
                        metaParams,
                        setMetaParams,
                        metaAttrs: metaAttributes,
                        setMetaAttrs: setMetaAttributes,
                      }}
                      disabled={!isEditing}
                    />
                  </TabsContent>

                  <TabsContent
                    value="kits"
                    className="m-0 focus-visible:outline-none"
                  >
                    <KitsTab
                      productId={id}
                      productType={form.watch("product_type")}
                      isNew={isNew}
                      disabled={!isEditing}
                    />
                  </TabsContent>

                  <TabsContent
                    value="recipes"
                    className="m-0 focus-visible:outline-none"
                  >
                    <RecipesTab
                      productId={id}
                      productType={form.watch("product_type")}
                      isNew={isNew}
                      sellingPrice={Number(form.watch("selling_price") || 0)}
                      disabled={!isEditing}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </form>
        </Form>
      </div>

      <CategoryDrawer
        open={isCategoryDrawerOpen}
        onOpenChange={setIsCategoryDrawerOpen}
      />
      <FragranceDrawer
        open={isFragranceDrawerOpen}
        onOpenChange={setIsFragranceDrawerOpen}
      />
      <BrandDrawer
        open={isBrandDrawerOpen}
        onOpenChange={setIsBrandDrawerOpen}
      />

      {/* Modals & Drawers */}
      {!isNew && id && (
        <AddProductPhotoModal
          product={{
            id: id,
            name:
              form.getValues("product_name") ||
              fetchedProduct?.product_name ||
              "",
          }}
          open={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          onSuccess={() => {
            setIsPhotoModalOpen(false);
            refetch?.();
          }}
        />
      )}

      <PackageModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
      />

      {/* Lightbox placeholder (if needed, but slideIdx handles it mostly) */}
      {lightboxIndex !== null && imagePreviews.length > 0 && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(8px)",
            zIndex: 999999,
            margin: 0,
            padding: 0,
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
                setLightboxIndex((i) =>
                  i !== null
                    ? (i - 1 + imagePreviews.length) % imagePreviews.length
                    : null,
                );
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
              maxWidth: "95vw",
              maxHeight: "95vh",
              width: "100%",
              height: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <img
              src={imagePreviews[lightboxIndex].url}
              alt={`Product image ${lightboxIndex + 1}`}
              style={{
                maxWidth: "90vw",
                maxHeight: "80vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "0.5rem",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
                        transition: "all 0.2s",
                        width: i === lightboxIndex ? "1.5rem" : "0.5rem",
                        height: "0.5rem",
                        backgroundColor:
                          i === lightboxIndex
                            ? "white"
                            : "rgba(255, 255, 255, 0.4)",
                        borderRadius: "9999px",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (i !== lightboxIndex) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.7)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (i !== lightboxIndex) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.4)";
                        }
                      }}
                    />
                  ))}
                </div>
                {/* Counter */}
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
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
                setLightboxIndex((i) =>
                  i !== null ? (i + 1) % imagePreviews.length : null,
                );
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFormPage;
