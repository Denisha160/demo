import { useFormContext, useFieldArray } from "react-hook-form";
import { useAllProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Trash2, Scan, AlertCircle, Info } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { QuotationFormData } from "./QuotationForm";
import KitViewModal from "@/pages/common/kits/KitViewModal";

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
  const [kitSearch, setKitSearch] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [isKitViewOpen, setIsKitViewOpen] = useState(false);
  const debouncedFgSearch = useDebounce(fgSearch, 300);
  const debouncedKitSearch = useDebounce(kitSearch, 300);

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
    const qty = newQty !== undefined ? newQty : (Number(item.quantity) || 0);
    const price = Number(item.unit_price) || 0;
    const gstPercent = Number(item.gst_percentage) || 0;

    const amount = qty * price;
    const gstAmount = (amount * gstPercent) / 100;

    setValue(`items.${index}.amount`, amount, { shouldDirty: true });
    setValue(`items.${index}.gst_amount`, gstAmount, { shouldDirty: true });
    if (item.item_name) {
      setValue(`items.${index}.item_description`, `${item.item_name} x ${qty}`, { shouldDirty: true });
    }
  };

  const handleSelectItemInline = (index: number, itemId: string) => {
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

    if (item.type === "product") {
      const p = item.original;
      updateItem(index, {
        ...currentItems[index],
        type: "product",
        product_id: p.id,
        kit_id: "",
        item_name: p.product_name,
        item_code: p.code || "",
        item_description: `${p.product_name} x ${currentItems[index].quantity || 1}`,
        unit_price: p.selling_price || 0,
        amount: (currentItems[index].quantity || 1) * (p.selling_price || 0),
        fragrance_name: p.fragrance_name || "",
        category_id: p.category_id || null,
        category_name: p.category_name || "",
        gst_percentage: 18,
        gst_amount: (p.selling_price || 0) * 0.18,
      });
    } else {
      const k = item.original;
      updateItem(index, {
        ...currentItems[index],
        type: "kit",
        kit_id: k.id,
        product_id: "",
        item_name: k.name,
        item_code: k.sku || "",
        item_description: `${k.name} x ${currentItems[index].quantity || 1}`,
        unit_price: k.kit_price || 0,
        amount: (currentItems[index].quantity || 1) * (k.kit_price || 0),
        fragrance_name: "",
        category_id: null,
        category_name: "",
        gst_percentage: 18,
        gst_amount: (k.kit_price || 0) * 0.18,
      });
    }
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
                    <td className="px-2 py-1.5  text-xs font-bold text-muted-foreground/40">
                      <Input
                        {...register(`items.${index}.item_code` as const)}
                        className="h-8 text-xs font-mono bg-muted/20 border-transparent text-muted-foreground cursor-not-allowed w-full focus-visible:ring-0 shadow-none"
                        placeholder="Code"
                        disabled
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div data-combobox-index={index} className="w-full flex items-center gap-2">
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
                            className="h-8 border-border/40 bg-background/50 text-xs font-medium focus:ring-1 focus:ring-primary/20 transition-all hover:border-primary/40 w-full"
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
                              setSelectedKitId(watch(`items.${index}.kit_id`) || null);
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
                        placeholder="Description"
                        className="h-8 text-xs border-border/40 rounded-sm bg-background/50 focus:bg-background w-full"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        autoFocus={true}
                        step="0.01"
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                          onChange: (e) => handleItemAmountUpdate(index, Number(e.target.value)),
                        })}
                        className="h-8 text-center text-xs border-border/40 rounded-sm bg-background/50 focus:bg-background w-full"
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
                          className="h-8 text-xs pl-5 border-border/40 rounded-sm bg-background/50 focus:bg-background font-mono font-medium w-full"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="text-xs font-black text-primary font-mono">
                        ₹
                        {(
                          watch(`items.${index}.gst_amount`) || 0
                        ).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="text-xs font-black text-foreground font-mono">
                        ₹
                        {(watch(`items.${index}.amount`) || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-2 py-1.5">
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
            {errors.items.root?.message || errors.items.message}
          </span>
        </div>
      )}

      <KitViewModal
        open={isKitViewOpen}
        onClose={() => setIsKitViewOpen(false)}
        kitId={selectedKitId || undefined}
      />
    </div>
  );
};
