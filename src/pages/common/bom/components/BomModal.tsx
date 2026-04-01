import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { z } from "zod";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/useDebounce";
import { useBOMDetails, useCreateBOM, useUpdateBOM } from "@/hooks/useBom";
import { useProductsCombobox, useProduct } from "@/hooks/useProducts";
import {
  RawMaterialItem,
  BomCreatePayload,
  BomUpdatePayload,
} from "@/types/bom";
import { Product, BaseUnit, UnitCategory } from "@/types/products";
import {
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  ChevronRight,
  Calculator,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";

interface BomModalProps {
  isOpen: boolean;
  onClose: () => void;
  bomId?: string;
  isViewOnly?: boolean;
}

// Validation schemas
const materialItemSchema = z.object({
  raw_product_id: z.string().min(1, "Material selection is required"),
  raw_quantity: z
    .number({
      invalid_type_error: "Quantity must be a number",
      required_error: "Quantity is required",
    })
    .positive("Quantity must be greater than 0"),
  raw_unit: z.string(),
  raw_unit_category: z.string(),
  product_name: z.string(),
  cost_price: z.number(),
});

const bomSchema = z.object({
  bom_id: z.string().min(1, "Please select a finished product"),
  materials: z
    .array(materialItemSchema)
    .min(1, "At least one raw material is required"),
});

type BomFormData = z.infer<typeof bomSchema>;
type MaterialErrors = Partial<
  Record<keyof z.infer<typeof materialItemSchema>, string>
>;

const BomModal = ({
  isOpen,
  onClose,
  bomId,
  isViewOnly = false,
}: BomModalProps) => {
  const isEditing = !!bomId;

  // Hooks for data
  const [effectiveProductId, setEffectiveProductId] = useState<
    string | undefined
  >(bomId);

  // Sync effectiveProductId when modal opens or prop changes
  useEffect(() => {
    if (isOpen) {
      setEffectiveProductId(bomId);
      setHasDetectedExisting(false);
    }
  }, [isOpen, bomId]);

  const { data: bomDetails, isLoading: isLoadingBOM } =
    useBOMDetails(effectiveProductId);
  const { data: finishedProduct, isLoading: isLoadingFinishedProduct } =
    useProduct(effectiveProductId);
  const [hasDetectedExisting, setHasDetectedExisting] = useState(false);

  // Search and Debounce for Selectors
  const [fgSearch, setFgSearch] = useState("");
  const [rmSearch, setRmSearch] = useState("");
  const debouncedFgSearch = useDebounce(fgSearch, 300);
  const debouncedRmSearch = useDebounce(rmSearch, 300);

  // Fetch products for selectors using the optimized combobox hook
  const { data: finishedGoods = [], isLoading: isLoadingFG } =
    useProductsCombobox({
      type: "FINISHED_GOOD",
      status: "active",
      search: debouncedFgSearch.trim() || undefined,
    });
  const { data: rawMaterials = [], isLoading: isLoadingRM } =
    useProductsCombobox({
      type: "RAW_MATERIAL",
      status: "active",
      search: debouncedRmSearch.trim() || undefined,
    });

  // State
  const finishedProductRef = useRef<HTMLButtonElement>(null);
  const [selectedBomId, setSelectedBomId] = useState<string>("");
  const [materials, setMaterials] = useState<RawMaterialItem[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BomFormData, string>>
  >({});
  const [materialErrors, setMaterialErrors] = useState<MaterialErrors[]>([]);

  // Mutations
  const { mutate: createBOM, isPending: isCreating } = useCreateBOM();
  const { mutate: updateBOM, isPending: isUpdating } = useUpdateBOM();

  const isPending =
    isCreating ||
    isUpdating ||
    isLoadingBOM ||
    isLoadingFinishedProduct ||
    isLoadingFG ||
    isLoadingRM;

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        finishedProductRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Initialize/Reset form
  useEffect(() => {
    if (!isOpen) return;

    // Case 1: We have data (Edit or View mode, or recently detected existing)
    if (effectiveProductId && bomDetails) {
      const hasMaterials =
        bomDetails.raw_materials && bomDetails.raw_materials.length > 0;

      // Update selectors
      setSelectedBomId(effectiveProductId);

      // Populate materials
      setMaterials(
        bomDetails.raw_materials.map((m) => ({
          raw_product_id: m.raw_product_id,
          raw_quantity: m.raw_quantity,
          raw_unit: m.raw_unit as BaseUnit,
          raw_unit_category: m.raw_unit_category as UnitCategory,
          product_name: m.raw_product,
          cost_price: m.cost_price || 0,
        })),
      );

      // Detect shift from Create to Edit ONLY if materials actually exist and we haven't warned yet
      if (!bomId && hasMaterials && !hasDetectedExisting) {
        toast.info(
          "This product is already configured. Switching to Edit mode.",
          {
            theme: "colored",
          },
        );
        setHasDetectedExisting(true);
      }
    }
    // Case 2: Fresh Create mode (no product selected)
    else if (!effectiveProductId) {
      setSelectedBomId("");
      setMaterials([]);
      setErrors({});
      setMaterialErrors([]);
      setHasDetectedExisting(false);
    }
    // Case 3: Product selected but NO recipe found (Stay in Create mode)
    else if (effectiveProductId && !bomDetails && !isLoadingBOM) {
      // Only clear if we were NOT originally editing (i.e., user manually selected a new product)
      if (!bomId) {
        setMaterials([]);
        setErrors({});
        setMaterialErrors([]);
        setHasDetectedExisting(false);
      }
    }
  }, [
    isOpen,
    bomDetails,
    effectiveProductId,
    bomId,
    isLoadingBOM,
    hasDetectedExisting,
  ]);

  useEffect(() => {
    if (rawMaterials.length > 0) {
      setMaterials((prev) => {
        let hasChanges = false;
        const updatedMaterials = prev.map((m) => {
          const product = rawMaterials.find(
            (p: Product) => p.id === m.raw_product_id,
          );
          if (
            product &&
            (m.cost_price !== product.cost_price ||
              m.product_name !== product.product_name)
          ) {
            hasChanges = true;
            return {
              ...m,
              cost_price: product.cost_price || 0,
              product_name: product.product_name,
            };
          }
          return m;
        });
        return hasChanges ? updatedMaterials : prev;
      });
    }
  }, [rawMaterials]);

  const handleFinishedProductChange = useCallback(
    (id: string) => {
      setSelectedBomId(id);
      setEffectiveProductId(id);
      setErrors({});
      if (id !== bomId) {
        setHasDetectedExisting(false);
      }
    },
    [bomId],
  );

  const handleAddMaterial = useCallback(() => {
    setMaterials((prev) => [
      ...prev,
      {
        raw_product_id: "",
        raw_quantity: "" as unknown as number,
        raw_unit: "kg" as BaseUnit,
        raw_unit_category: "weight" as UnitCategory,
        cost_price: 0,
        product_name: "",
      },
    ]);
    setErrors({});
    setMaterialErrors((prev) => [...prev, {}]);
  }, []);

  const handleRemoveMaterial = useCallback((index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleMaterialChange = useCallback(
    (index: number, field: keyof RawMaterialItem, value: string | number) => {
      setMaterials((prev) => {
        const newMaterials = [...prev];

        if (field === "raw_product_id") {
          // If a new product is selected, but quantity was empty/0, default to 1
          const currentRawQuantity = prev[index].raw_quantity;
          const finalValue =
            currentRawQuantity === ("" as unknown as number) ||
              Number(currentRawQuantity) === 0
              ? 1
              : currentRawQuantity;

          // Check if this product is already added in another row
          const existingIndex = newMaterials.findIndex(
            (m, i) => i !== index && m.raw_product_id === value,
          );

          if (existingIndex !== -1) {
            // Item already exists -> Merge quantity and remove current row
            const currentQuantityToMerge = Number(finalValue) || 1;
            const existingQuantity =
              Number(newMaterials[existingIndex].raw_quantity) || 0;

            newMaterials[existingIndex] = {
              ...newMaterials[existingIndex],
              raw_quantity: existingQuantity + currentQuantityToMerge,
            };

            newMaterials.splice(index, 1); // Remove the duplicate row
            setMaterialErrors((prevErrors) =>
              prevErrors.filter((_, i) => i !== index),
            );
            toast.info("Material already selected. Quantities merged.");
            return newMaterials;
          }

          // If not duplicate, update the normal way
          const product = rawMaterials.find((p: Product) => p.id === value);
          if (product) {
            newMaterials[index] = {
              ...newMaterials[index],
              raw_product_id: value as string,
              product_name: product.product_name,
              raw_unit: product.base_unit,
              raw_unit_category: product.unit_category,
              cost_price: product.cost_price || 0,
              raw_quantity: finalValue,
            };
          }
        } else {
          newMaterials[index] = { ...newMaterials[index], [field]: value };
        }

        return newMaterials;
      });
      setErrors({});
      setMaterialErrors((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], [field]: undefined };
        return next;
      });
    },
    [rawMaterials],
  );

  // Calculations
  const currentFinishedProduct = useMemo(() => {
    if (bomDetails?.finished_product)
      return bomDetails.finished_product as unknown as Product;
    if (bomId && finishedProduct) return finishedProduct as Product;
    return finishedGoods.find(
      (p: Product) => p.id === selectedBomId,
    ) as Product;
  }, [selectedBomId, finishedGoods, bomId, finishedProduct, bomDetails]);

  const totalCost = useMemo(() => {
    return materials.reduce(
      (sum, m) => sum + (Number(m.raw_quantity) || 0) * (m.cost_price || 0),
      0,
    );
  }, [materials]);

  const sellingPrice = currentFinishedProduct?.selling_price || 0;
  const profit = sellingPrice - totalCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  const validateForm = () => {
    try {
      const formData = {
        bom_id: selectedBomId,
        materials: materials.map((m) => ({
          ...m,
          raw_quantity: Number(m.raw_quantity), // Ensure number for validation
        })),
      };
      bomSchema.parse(formData);
      setErrors({});
      setMaterialErrors([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof BomFormData, string>> = {};
        const newMaterialErrors: MaterialErrors[] = materials.map(() => ({}));

        error.errors.forEach((err) => {
          if (err.path[0] === "bom_id") {
            newErrors.bom_id = err.message;
          } else if (err.path[0] === "materials") {
            const index = err.path[1] as number;
            const field = err.path[2] as keyof z.infer<
              typeof materialItemSchema
            >;
            if (index !== undefined && field) {
              newMaterialErrors[index][field] = err.message;
            } else if (index === undefined) {
              newErrors.materials = err.message;
            }
          }
        });

        setErrors(newErrors);
        setMaterialErrors(newMaterialErrors);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const payload = {
      bom_id: selectedBomId,
      raw_materials: materials.map(
        ({ raw_product_id, raw_quantity, raw_unit, raw_unit_category }) => ({
          raw_product_id,
          raw_quantity: Number(raw_quantity),
          raw_unit,
          raw_unit_category,
        }),
      ),
    };

    // If we detected an existing BOM or were originally editing, use update mutation
    const isActuallyUpdating = !!bomId || hasDetectedExisting;

    if (isActuallyUpdating) {
      updateBOM(payload as BomUpdatePayload, {
        onSuccess: () => onClose(),
      });
    } else {
      createBOM(payload as BomCreatePayload, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary font-bold"
      maxWidth="sm:max-w-[850px]"
      title={
        isEditing
          ? "Edit Manufacturing Recipe"
          : isViewOnly
            ? "Recipe Details"
            : "Create New Recipe"
      }
      description={
        isEditing || isViewOnly
          ? `Managing ingredients for ${currentFinishedProduct?.product_name || "..."}`
          : "Define the Bill of Materials (BOM) for a finished product"
      }
      footer={
        <div className="flex justify-end items-center w-full">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm text-xs h-8"
              onClick={onClose}
              disabled={isPending}
            >
              {isViewOnly ? "Close" : "Cancel"}
            </Button>
            {!isViewOnly && (
              <Button
                size="sm"
                className="rounded-sm text-xs h-8 px-6 bg-primary hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending && <Loader2 className="mr-2 h-3 w-4 animate-spin" />}
                {!!bomId || hasDetectedExisting
                  ? "Update Recipe"
                  : "Save Recipe"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <div className="space-y-2 group">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
            <Plus className="h-3 w-3 text-primary" />
            Finished Product
          </Label>
          <Combobox
            ref={finishedProductRef}
            options={finishedGoods.map((p: Product) => ({
              label: `${p.product_name} (${p.code})`,
              value: p.id,
            }))}
            value={selectedBomId}
            onValueChange={handleFinishedProductChange}
            placeholder="Select finished product..."
            searchPlaceholder="Search product name or code..."
            emptyText={
              isLoadingFG ? "Loading products..." : "No finished goods found."
            }
            className={`h-10 border-primary/20 focus:ring-primary/20 ${errors.bom_id ? "border-destructive" : ""}`}
            disabled={!!bomId || isPending || isViewOnly}
            searchValue={fgSearch}
            onSearchChange={setFgSearch}
          />
          {errors.bom_id && (
            <p className="text-[10px] text-destructive mt-1 font-medium">
              {errors.bom_id}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Plus className="h-3 w-3 text-primary" />
              Required Raw Materials
            </Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMaterial}
              disabled={isPending || !selectedBomId || isViewOnly}
              className="h-7 px-3 text-[10px] font-bold border-dashed border-primary/50 text-primary hover:bg-primary/5 flex gap-1"
            >
              <Plus className="h-3 w-3" />
              ADD MATERIAL
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden bg-card/30 backdrop-blur-sm shadow-inner min-h-[100px]">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left w-[40%]">Raw Material</th>
                  <th className="px-3 py-2 text-center w-[15%]">Quantity</th>
                  <th className="px-3 py-2 text-center w-[15%]">Unit</th>
                  <th className="px-3 py-2 text-right w-[20%]">Est. Cost</th>
                  <th className="px-3 py-2 text-center w-[10%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {materials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground italic"
                    >
                      No materials added. Click "Add Material" to begin.
                    </td>
                  </tr>
                ) : (
                  materials.map((m, index) => (
                    <tr
                      key={index}
                      className="hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-2 px-3">
                        <Combobox
                          options={rawMaterials.map((p: Product) => ({
                            label: p.product_name,
                            value: p.id,
                          }))}
                          value={m.raw_product_id}
                          onValueChange={(val) =>
                            handleMaterialChange(index, "raw_product_id", val)
                          }
                          placeholder="Select Material"
                          searchPlaceholder="Search..."
                          emptyText={
                            isLoadingRM ? "Loading..." : "No products."
                          }
                          className={`h-8 text-[11px] bg-background/50 border-border ${materialErrors[index]?.raw_product_id ? "border-destructive ring-1 ring-destructive" : ""}`}
                          disabled={isPending || isViewOnly}
                          searchValue={rmSearch}
                          onSearchChange={setRmSearch}
                        />
                        {materialErrors[index]?.raw_product_id && (
                          <p className="text-[9px] text-destructive mt-0.5 font-medium px-1">
                            {materialErrors[index]?.raw_product_id}
                          </p>
                        )}
                      </td>
                      <td className="p-2 px-3">
                        <Input
                          type="number"
                          value={
                            m.raw_quantity === 0 && !isEditing
                              ? ""
                              : m.raw_quantity
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            handleMaterialChange(
                              index,
                              "raw_quantity",
                              val === "" ? "" : parseFloat(val),
                            );
                          }}
                          className={`h-8 text-[11px] text-center rounded-sm bg-background/50 ${materialErrors[index]?.raw_quantity ? "border-destructive ring-1 ring-destructive" : ""}`}
                          disabled={isPending || isViewOnly}
                          min="0"
                          step="0.000001"
                          placeholder="0.00"
                        />
                        {materialErrors[index]?.raw_quantity && (
                          <p className="text-[9px] text-destructive mt-0.5 font-medium text-center">
                            {materialErrors[index]?.raw_quantity}
                          </p>
                        )}
                      </td>
                      <td className="p-2 px-3 text-center">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold rounded-sm h-6 px-2 bg-muted/30"
                        >
                          {m.raw_unit}
                        </Badge>
                      </td>
                      <td className="p-2 px-3 text-right font-mono font-medium text-primary">
                        ₹
                        {(
                          (Number(m.raw_quantity) || 0) * (m.cost_price || 0)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2 px-3 text-center">
                        {!isViewOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                            onClick={() => handleRemoveMaterial(index)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-sm flex items-center gap-2.5 text-destructive text-[11px] animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">
              {errors.materials ||
                errors.bom_id ||
                "Please fix the errors indicated above."}
            </span>
          </div>
        )}

        {/* Cost Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-md border border-primary/10 space-y-2 group hover:bg-primary/[0.08] transition-all">
            <div className="flex items-center gap-2 text-primary">
              <Calculator className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Base Material Cost
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-mono tracking-tight text-primary">
                ₹
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Per Unit of Finished Product
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-md border border-border space-y-2 group hover:bg-muted/40 transition-all">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Planned Selling Price
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-mono tracking-tight text-foreground">
                ₹
                {sellingPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                From Product Settings
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-md border transition-all space-y-2 group ${profit >= 0 ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10" : "bg-destructive/5 border-destructive/10 hover:bg-destructive/10"}`}
          >
            <div
              className={`flex items-center gap-2 ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}
            >
              <TrendingUp
                className={`h-4 w-4 group-hover:-translate-y-0.5 transition-transform ${profit < 0 ? "rotate-180" : ""}`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Est. Margin ({margin.toFixed(1)}%)
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className={`text-xl font-bold font-mono tracking-tight ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}
              >
                {profit >= 0 ? "+" : ""}₹
                {profit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                Projected Profit per Unit
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BomModal;
