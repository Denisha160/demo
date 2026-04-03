import { useFormContext, useFieldArray } from "react-hook-form";
import { useAllProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useCallback } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Trash2,
  Scan,
  AlertCircle,
  Info,
  Image as ImageIcon,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { QuotationFormData } from "./QuotationForm";
import KitViewModal from "@/pages/common/kits/KitViewModal";

const STORAGE_BASE_URL = "https://basaltbucket.s3.us-east-1.amazonaws.com/";

const normalizeImageUrl = (image?: string | null) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) {
    return image;
  }
  return `${STORAGE_BASE_URL}${image.replace(/^\/+/, "")}`;
};

type SelectableItem = {
  id: string;
  name: string;
  type: "product" | "kit";
  image_url?: string;
  images?: string[];
  original: Record<string, unknown>;
};

export const QuotationProductsTable = () => {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<QuotationFormData>();
  const [fgSearch, setFgSearch] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [isKitViewOpen, setIsKitViewOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [imagePickerState, setImagePickerState] = useState<{
    index: number;
    item: SelectableItem;
    images: string[];
    selectedImages: string[];
  } | null>(null);
  const debouncedFgSearch = useDebounce(fgSearch, 300);

  const { data: allItems = [], isLoading: isLoadingItems } = useAllProducts({
    search: debouncedFgSearch.trim() || undefined,
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    update: updateItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const addNewRow = useCallback(
    (type: "product" | "kit" = "product") => {
      appendItem({
        product_id: "",
        kit_id: "",
        item_name: "",
        item_code: "",
        item_description: "",
        quantity: 1,
        unit_price: 0,
        amount: 0,
        type: type,
        fragrance_name: "",
        category_id: null,
        category_name: "",
        gst_percentage: 18,
        gst_amount: 0,
        image_url: "",
        images: [],
      });
    },
    [appendItem],
  );

  const handleAddProductClick = () => {
    const newIndex = itemFields.length;
    addNewRow("product");

    setTimeout(() => {
      focusRow(newIndex);
    }, 50);
  };

  const focusRow = (index: number) => {
    const rowWrapper = document.querySelector(
      `[data-combobox-index="${index}"]`,
    );
    if (!rowWrapper) return;

    const input = rowWrapper.querySelector("input");
    const button = rowWrapper.querySelector('button[role="combobox"]');

    if (input) {
      (input as HTMLElement).focus();
    } else if (button) {
      (button as HTMLElement).click();
    }
  };

  const handleItemAmountUpdate = (index: number, newQty?: number) => {
    const item = getValues(`items.${index}`);
    const qty = newQty !== undefined ? newQty : Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const gstPercent = Number(item.gst_percentage) || 0;

    const rawAmount = qty * price;
    const amount = Math.round(rawAmount);
    const gstAmount = Number(((amount * gstPercent) / 100).toFixed(2));

    setValue(`items.${index}.amount`, amount, { shouldDirty: true });
    setValue(`items.${index}.gst_amount`, gstAmount, { shouldDirty: true });
    if (item.item_name) {
      setValue(
        `items.${index}.item_description`,
        `${item.item_name} x ${qty}`,
        { shouldDirty: true },
      );
    }
  };

  const buildItemImages = (
    item: SelectableItem,
    selectedImages: string[],
  ) => {
    const normalizedSelectedImages = selectedImages
      .map(normalizeImageUrl)
      .filter(Boolean);
    const defaultImage = normalizeImageUrl(item.type === "kit" ? item.image_url : "");

    return [
      ...(defaultImage ? [defaultImage] : []),
      ...normalizedSelectedImages,
    ].filter((image, imageIndex, imageList) => imageList.indexOf(image) === imageIndex);
  };

  const populateRowDetails = (
    index: number,
    item: SelectableItem,
    selectedImages: string[],
  ) => {
    const currentItems = getValues("items") || [];
    const currentRow = currentItems[index];
    const normalizedImages = buildItemImages(item, selectedImages);
    const quantity = currentRow?.quantity || 1;

    if (item.type === "product") {
      const p = item.original as {
        id: string;
        product_name: string;
        code?: string | null;
        selling_price?: number | null;
        fragrance_name?: string | null;
        category_id?: string | null;
        category_name?: string | null;
      };
      updateItem(index, {
        ...currentRow,
        type: "product",
        product_id: p.id,
        kit_id: "",
        item_name: p.product_name,
        item_code: p.code || "",
        item_description: `${p.product_name} x ${quantity}`,
        unit_price: p.selling_price || 0,
        amount: quantity * (p.selling_price || 0),
        fragrance_name: p.fragrance_name || "",
        category_id: p.category_id || null,
        category_name: p.category_name || "",
        gst_percentage: 18,
        gst_amount: (quantity * (p.selling_price || 0) * 18) / 100,
        image_url: "",
        images: normalizedImages,
      });
      return;
    }

    const k = item.original as {
      id: string;
      name: string;
      sku?: string | null;
      description?: string | null;
      kit_price?: number | null;
    };
    updateItem(index, {
      ...currentRow,
      type: "kit",
      kit_id: k.id,
      product_id: "",
      item_name: k.name,
      item_code: k.sku || "",
      item_description: k.description || `${k.name} x ${quantity}`,
      unit_price: k.kit_price || 0,
      amount: quantity * (k.kit_price || 0),
      fragrance_name: "",
      category_id: null,
      category_name: "",
      gst_percentage: 18,
      gst_amount: (quantity * (k.kit_price || 0) * 18) / 100,
      image_url: "",
      images: normalizedImages,
    });
  };

  const openImagePicker = (index: number, item: SelectableItem) => {
    const currentItems = getValues("items") || [];
    const selectableImages = (item.images || []).filter(Boolean);

    if (selectableImages.length === 0) {
      return;
    }

    const defaultImage = normalizeImageUrl(item.type === "kit" ? item.image_url : "");
    const currentSelectedImages = (
      (currentItems[index]?.images as string[] | undefined) || []
    )
      .map(normalizeImageUrl)
      .filter((image) => Boolean(image) && image !== defaultImage);

    setImagePickerState({
      index,
      item,
      images: selectableImages,
      selectedImages: currentSelectedImages,
    });
  };

  const handleSelectItemInline = (index: number, itemId: string) => {
    if (!itemId) {
      return;
    }

    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    const currentItems = getValues("items") || [];
    const isDuplicate = currentItems.some(
      (existing, i) =>
        i !== index &&
        existing.type === item.type &&
        (item.type === "product"
          ? existing.product_id === itemId
          : existing.kit_id === itemId),
    );

    if (isDuplicate) {
      toast.error(
        `You have already added this ${item.type}. Duplicate items are not allowed.`,
      );
      return;
    }

    populateRowDetails(index, item, []);
    openImagePicker(index, item);
  };

  const handleEditImages = (index: number) => {
    const row = getValues(`items.${index}`);
    const itemId = row.type === "kit" ? row.kit_id : row.product_id;
    if (!itemId) return;

    const item = allItems.find((entry) => entry.id === itemId);
    if (!item) return;

    openImagePicker(index, item);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryImages.length === 0) return;
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };
 
  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (galleryImages.length === 0) return;
    setGalleryIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };
 
  const handleScanProduct = () => {
    if (!scanValue.trim()) return;
    toast.info(`Searching for product code: ${scanValue}`);
    setScanValue("");
  };

  return (
    <div className="mb-3 animate-in fade-in slide-in-from-top-4 duration-700">
      <Card className="border-border/40 shadow-sm overflow-hidden rounded-sm">
        {/* Header */}
        <div className="bg-muted/10 px-4 py-2.5 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">
              Bill Items
            </h3>
          </div>
          {isLoadingItems && (
            <span className="text-[10px] text-muted-foreground animate-pulse font-medium">
              Loading...
            </span>
          )}
        </div>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/5 border-b border-border/20 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="w-[50px] px-2 py-2">Img</th>
                  <th className="min-w-[100px] px-2 py-2">Code</th>
                  <th className="min-w-[200px] px-2 py-2">Item</th>
                  <th className="min-w-[200px] px-2 py-2">Description</th>
                  <th className="min-w-[80px] px-2 py-2">Qty</th>
                  <th className="min-w-[120px] px-2 py-2">Price</th>
                  <th className="min-w-[80px] px-2 py-2">GST %</th>
                  <th className="min-w-[140px] px-2 py-2">Amt (Excl. Tax)</th>
                  <th className="w-[50px] px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {itemFields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="hover:bg-muted/5 transition-colors group"
                  >
                    <td className="px-2 py-1.5">
                      {(() => {
                        const finalImages = (
                          watch(`items.${index}.images`) || []
                        ).map(normalizeImageUrl);

                        return (
                          <div
                            className="h-16 w-16 rounded-sm bg-muted/20 border border-border/10 overflow-hidden flex items-center justify-center group/img relative cursor-zoom-in"
                            onClick={() => {
                              if (finalImages.length > 0) {
                                setGalleryImages(finalImages);
                                setGalleryIndex(0);
                              }
                            }}
                          >
                            {finalImages.length > 0 ? (
                              <>
                                <div className="grid h-full w-full grid-cols-2 gap-px bg-border/10">
                                  {finalImages.slice(0, 4).map((image, imageIdx) => (
                                    <div
                                      key={`${image}-${imageIdx}`}
                                      className="relative overflow-hidden bg-muted/10"
                                    >
                                      <img
                                        src={image}
                                        alt={`Item ${imageIdx + 1}`}
                                        className="h-full w-full object-cover"
                                      />
                                      {imageIdx === 3 && finalImages.length > 4 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                                          <span className="text-[10px] font-black tracking-widest text-white">
                                            +{finalImages.length - 4}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {finalImages.length > 1 && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] font-black tracking-widest">
                                      {finalImages.length} IMAGES
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-2 py-1.5  text-xs font-bold text-muted-foreground/40">
                      <Input
                        {...register(`items.${index}.item_code` as const)}
                        className="h-8 text-xs font-mono bg-muted/20 border-transparent text-muted-foreground cursor-not-allowed w-full focus-visible:ring-0 shadow-none"
                        placeholder="Code"
                        disabled
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div
                        data-combobox-index={index}
                        className="w-full flex items-center gap-2"
                      >
                        <div className="flex-1">
                          <Combobox
                            options={allItems.map((item) => ({
                              label: item.name,
                              value: item.id,
                            }))}
                            value={
                              watch(`items.${index}.type`) === "product"
                                ? watch(`items.${index}.product_id`) || ""
                                : watch(`items.${index}.kit_id`) || ""
                            }
                            onValueChange={(val) =>
                              handleSelectItemInline(index, val)
                            }
                            placeholder="Search products or kits..."
                            className={cn(
                              "h-8 border-border/40 bg-background/50 text-xs font-medium focus:ring-1 focus:ring-primary/20 transition-all hover:border-primary/40 w-full",
                              errors.items?.[index]?.item_name &&
                              "border-destructive focus:ring-destructive/20",
                            )}
                            searchValue={fgSearch}
                            onSearchChange={setFgSearch}
                          />
                        </div>
                        {watch(`items.${index}.kit_id`) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-primary hover:bg-primary/10"
                            onClick={() => {
                              setSelectedKitId(
                                watch(`items.${index}.kit_id`) || null,
                              );
                              setIsKitViewOpen(true);
                            }}
                            title="View Kit Details"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        {...register(
                          `items.${index}.item_description` as const,
                        )}
                        autoFocus={true}
                        placeholder="Description"
                        className={cn(
                          "h-8 text-xs border-border/40 rounded-sm bg-background/50 focus:bg-background w-full",
                          errors.items?.[index]?.item_description &&
                          "border-destructive focus:ring-destructive",
                        )}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                          onChange: (e) =>
                            handleItemAmountUpdate(
                              index,
                              Number(e.target.value),
                            ),
                        })}
                        className={cn(
                          "h-8 text-center text-xs border-border/40 rounded-sm bg-background/50 focus:bg-background w-full",
                          errors.items?.[index]?.quantity &&
                          "border-destructive focus:ring-destructive",
                        )}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">
                          ₹
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unit_price` as const, {
                            valueAsNumber: true,
                            onChange: () => handleItemAmountUpdate(index),
                          })}
                          className={cn(
                            "h-8 text-xs pl-5 border-border/40 rounded-sm bg-background/50 focus:bg-background font-mono font-medium w-full",
                            errors.items?.[index]?.unit_price &&
                            "border-destructive focus:ring-destructive",
                          )}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.gst_percentage` as const, {
                          valueAsNumber: true,
                          onChange: () => handleItemAmountUpdate(index),
                        })}
                        className="h-8 text-xs border-border/40 rounded-sm bg-background/50 focus:bg-background w-full"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="text-xs font-black text-foreground font-mono">
                        ₹
                        {(watch(`items.${index}.amount`) || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={
                            !watch(`items.${index}.product_id`) &&
                            !watch(`items.${index}.kit_id`)
                          }
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                          onClick={() => handleEditImages(index)}
                          title="Manage Images"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={itemFields.length <= 1}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Seamless 50/50 Footer Row directly attached to the table layout */}
              <tfoot className="w-full">
                <tr className="border-t border-border/20 bg-muted/5">
                  <td colSpan={9} className="p-0 border-none">
                    <div className="flex items-center w-full h-10 divide-x divide-border/20">
                      {/* Left side: Add Product Button */}
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 h-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                        onClick={handleAddProductClick}
                      >
                        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          Add Product
                        </span>
                      </button>

                      {/* Right side: Scan Input Only */}
                      <div className="flex-1 flex items-center h-full relative group focus-within:bg-background transition-colors">
                        <Scan className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                          value={scanValue}
                          onChange={(e) => setScanValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              e.stopPropagation();
                              handleScanProduct();
                            }
                          }}
                          placeholder="Scan product barcode..."
                          className="w-full h-full pl-10 pr-4 text-[11px] font-medium tracking-wide bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {errors.items && (
        <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-destructive/5 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-1 duration-300">
          <AlertCircle className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {errors.items.root?.message ||
              (errors.items as { message?: string } | undefined)?.message ||
              "at least one item is required"}
          </span>
        </div>
      )}

      <Dialog
        open={!!imagePickerState}
        onOpenChange={(open) => !open && setImagePickerState(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="border-b border-border/50 px-6 py-4">
            <DialogTitle className="text-base font-bold">
              Select Product Image
            </DialogTitle>
            <DialogDescription>
              Select or unselect images for this item. Closing without saving keeps the current row details.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {imagePickerState && (
              <>
                <div className="mb-4 flex items-center justify-between gap-3 rounded-sm border border-border/50 bg-muted/10 px-4 py-3">
                  <span className="text-xs font-bold text-muted-foreground">
                    {imagePickerState.selectedImages.length} image(s) selected
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      populateRowDetails(
                        imagePickerState.index,
                        imagePickerState.item,
                        imagePickerState.selectedImages,
                      );
                      setImagePickerState(null);
                    }}
                  >
                    Use Selected Images
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {imagePickerState.images.map((image, imageIndex) => (
                  <button
                    key={`${image}-${imageIndex}`}
                    type="button"
                    className={cn(
                      "group overflow-hidden rounded-sm border bg-background text-left transition-all hover:border-primary/50 hover:shadow-md",
                      imagePickerState.selectedImages.includes(
                        normalizeImageUrl(image),
                      )
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border/60",
                    )}
                    onClick={() => {
                      const normalizedImage = normalizeImageUrl(image);
                      setImagePickerState((prev) => {
                        if (!prev) return prev;

                        const exists = prev.selectedImages.includes(
                          normalizedImage,
                        );

                        return {
                          ...prev,
                          selectedImages: exists
                            ? prev.selectedImages.filter(
                                (selected) => selected !== normalizedImage,
                              )
                            : [...prev.selectedImages, normalizedImage],
                        };
                      });
                    }}
                  >
                    <div className="aspect-square overflow-hidden bg-muted/10">
                      <img
                        src={normalizeImageUrl(image)}
                        alt={`${imagePickerState.item.name} ${imageIndex + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow-sm">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            imagePickerState.selectedImages.includes(
                              normalizeImageUrl(image),
                            )
                              ? "text-primary"
                              : "text-muted-foreground/40",
                          )}
                        />
                      </div>
                    </div>
                    <div className="border-t border-border/40 px-3 py-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        {imagePickerState.selectedImages.includes(
                          normalizeImageUrl(image),
                        )
                          ? "Selected"
                          : "Tap To Select"}
                      </span>
                    </div>
                  </button>
                ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <KitViewModal
        open={isKitViewOpen}
        onClose={() => setIsKitViewOpen(false)}
        kitId={selectedKitId || undefined}
      />

      {/* Lightbox Preview - Multi-Image Gallery */}
      {galleryImages.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 pointer-events-auto"
          style={{ zIndex: 1000001 }}
          onClick={() => setGalleryImages([])}
        >
          {/* Close Button */}
          <button
            type="button"
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[1000002]"
            onClick={() => setGalleryImages([])}
          >
            <X className="h-6 w-6" />
          </button>
 
          {/* Navigation Controls */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all group scale-90 hover:scale-100 z-[1000002]"
                onClick={prevImage}
              >
                <ChevronLeft className="h-10 w-10 opacity-60 group-hover:opacity-100" />
              </button>
              <button
                type="button"
                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/15 text-white rounded-full transition-all group scale-90 hover:scale-100 z-[1000002]"
                onClick={nextImage}
              >
                <ChevronRight className="h-10 w-10 opacity-60 group-hover:opacity-100" />
              </button>
 
              {/* Image Counter Badge */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 text-white rounded-full text-xs font-black tracking-widest uppercase backdrop-blur-sm border border-white/10">
                {galleryIndex + 1} / {galleryImages.length}
              </div>
            </>
          )}
 
          <div
            className="max-w-[70vw] max-h-[85vh] bg-white rounded-sm overflow-hidden shadow-2xl relative animate-in zoom-in duration-500 delay-150"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={normalizeImageUrl(galleryImages[galleryIndex])}
              alt={`Gallery Image ${galleryIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
