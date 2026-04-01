import { useFormContext, useFieldArray } from "react-hook-form";
import { useProductsCombobox } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useKitList } from "@/hooks/useKits";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Trash2, Scan, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { QuotationFormData } from "./QuotationForm";
import { FormMessage } from "@/components/ui/form";

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
  const debouncedFgSearch = useDebounce(fgSearch, 300);
  const debouncedKitSearch = useDebounce(kitSearch, 300);

  const { data: products = [], isLoading: isLoadingProducts } =
    useProductsCombobox({
      type: "FINISHED_GOOD",
      status: "active",
      search: debouncedFgSearch.trim() || undefined,
    });
  const { data: kitsData, isLoading: isLoadingKits } = useKitList({
    search: debouncedKitSearch.trim() || undefined,
    limit: 20,
  });

  const kits = useMemo(() => kitsData?.items || [], [kitsData]);

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
        product_name: "",
        product_code: "",
        description: "",
        long_description: "",
        quantity: 1,
        rate: 0,
        tax_rate: 0,
        amount: 0,
        unit: "-",
        is_optional: false,
        type: type,
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

  const handleAddKitClick = () => {
    const newIndex = itemFields.length;
    addNewRow("kit");

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

  const handleItemAmountUpdate = (index: number) => {
    const item = getValues(`items.${index}`);
    const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    setValue(`items.${index}.amount`, amount, { shouldDirty: true });
  };

  const handleSelectProductInline = (index: number, productId: string) => {
    const currentItems = getValues("items") || [];
    const isDuplicate = currentItems.some(
      (item, i) =>
        i !== index && item.type === "product" && item.product_id === productId,
    );

    if (isDuplicate) {
      toast.error(
        "You have already added this product. Duplicate items are not allowed.",
      );
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    updateItem(index, {
      ...currentItems[index],
      product_id: product.id,
      product_name: product.product_name,
      product_code: product.code || "",
      description: product.product_name,
      rate: product.selling_price || 0,
      amount:
        (currentItems[index].quantity || 1) * (product.selling_price || 0),
      unit: product.base_unit || "pcs",
    });
  };

  const handleSelectKitInline = (index: number, kitId: string) => {
    const currentItems = getValues("items") || [];
    const isDuplicate = currentItems.some(
      (item, i) => i !== index && item.type === "kit" && item.kit_id === kitId,
    );

    if (isDuplicate) {
      toast.error(
        "You have already added this kit. Duplicate items are not allowed.",
      );
      return;
    }

    const kit = kits.find((k) => k.id === kitId);
    if (!kit) return;

    updateItem(index, {
      ...currentItems[index],
      kit_id: kit.id,
      product_name: kit.name,
      product_code: kit.sku || "",
      description: kit.name,
      rate: kit.kit_price || 0,
      amount: (currentItems[index].quantity || 1) * (kit.kit_price || 0),
      unit: "kit",
    });
  };

  const handleScanProduct = () => {
    if (!scanValue.trim()) return;
    toast.info(`Searching for product code: ${scanValue}`);
    setScanValue("");
  };

  return (
    <div className="mb-3 animate-in fade-in slide-in-from-top-4 duration-700">
      <Card className="border-border/40 shadow-sm overflow-hidden rounded-md">
        {/* Header */}
        <div className="bg-muted/10 px-4 py-2.5 border-b border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">
              Bill Items
            </h3>
          </div>
          {(isLoadingProducts || isLoadingKits) && (
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
                  <th className="w-[40px] px-3 py-2 text-center">#</th>
                  <th className="w-[80px] px-3 py-2 text-center text-xs">
                    Type
                  </th>
                  <th className="min-w-[120px] w-[120px] px-2 py-2">Code</th>
                  <th className="min-w-[280px] px-2 py-2">Item</th>
                  <th className="w-[100px] px-2 py-2 text-center">Unit</th>
                  <th className="w-[100px] px-2 py-2">Qty</th>
                  <th className="w-[140px] px-2 py-2">Rate</th>
                  <th className="w-[140px] px-2 py-2 text-right">Amount</th>
                  <th className="w-[40px] px-2 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/10">
                {itemFields.map((field, index) => (
                  <tr
                    key={field.id}
                    className="hover:bg-muted/5 transition-colors group"
                  >
                    <td className="px-3 py-1.5 text-center">
                      <Badge
                        variant="destructive"
                        className={cn(
                          "text-[9px] uppercase font-black px-1.5 h-4 tracking-tighter",
                          watch(`items.${index}.type`) === "product"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-purple-500/10 text-purple-500 border-purple-500/20",
                        )}
                      >
                        {watch(`items.${index}.type`)}
                      </Badge>
                    </td>
                    <td className="px-2 py-1.5 text-center text-xs font-bold text-muted-foreground/40">
                      {index + 1}
                    </td>
                    <td className="px-2 py-1.5 text-center text-xs font-bold text-muted-foreground/40">
                      <Input
                        {...register(`items.${index}.product_code` as const)}
                        className="h-8 text-xs font-mono bg-muted/20 border-transparent text-muted-foreground cursor-not-allowed w-full focus-visible:ring-0 shadow-none"
                        placeholder="Code"
                        disabled
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <div data-combobox-index={index} className="w-full">
                        {watch(`items.${index}.type`) === "product" ? (
                          <Combobox
                            options={products.map((p) => ({
                              label: `${p.product_name} (${p.code})`,
                              value: p.id,
                            }))}
                            value={watch(`items.${index}.product_id`) || ""}
                            onValueChange={(val) =>
                              handleSelectProductInline(index, val)
                            }
                            placeholder="Search products..."
                            className="h-8 border-border/40 bg-background/50 text-xs font-medium focus:ring-1 focus:ring-primary/20 transition-all hover:border-primary/40 w-full"
                            searchValue={fgSearch}
                            onSearchChange={setFgSearch}
                          />
                        ) : (
                          <Combobox
                            options={kits.map((k) => ({
                              label: k.name,
                              value: k.id,
                            }))}
                            value={watch(`items.${index}.kit_id`) || ""}
                            onValueChange={(val) =>
                              handleSelectKitInline(index, val)
                            }
                            placeholder="Search kits..."
                            className="h-8 border-border/40 bg-background/50 text-xs font-medium focus:ring-1 focus:ring-primary/20 transition-all hover:border-primary/40 w-full"
                            searchValue={kitSearch}
                            onSearchChange={setKitSearch}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-muted/30 border-transparent px-2 font-medium"
                      >
                        {watch(`items.${index}.unit`) || "-"}
                      </Badge>
                    </td>
                    <td className="px-2 py-1.5">
                      <Input
                        type="number"
                        autoFocus={true}
                        step="0.01"
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,

                          onChange: () => handleItemAmountUpdate(index),
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
                          {...register(`items.${index}.rate` as const, {
                            valueAsNumber: true,
                            onChange: () => handleItemAmountUpdate(index),
                          })}
                          className="h-8 text-right text-xs pl-5 border-border/40 rounded-sm bg-background/50 focus:bg-background font-mono font-medium w-full"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <div className="text-xs font-black text-foreground pr-2 font-mono">
                        ₹
                        {(watch(`items.${index}.amount`) || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-center">
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
                  <td colSpan={8} className="p-0 border-none">
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

                      {/* Add Kit Button */}
                      <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-2 h-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all group focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500/50"
                        onClick={handleAddKitClick}
                      >
                        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          Add Kit
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
    </div>
  );
};
