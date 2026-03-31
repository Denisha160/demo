import { useFormContext, useFieldArray } from "react-hook-form";
import { useProductsCombobox } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useMemo } from "react";
import DataTable, { Column } from "@/components/DataTable";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Trash2 } from "lucide-react";
import { QuotationFormData } from "./QuotationForm";

export const QuotationProductsTable = () => {
    const { register, control, watch, setValue, getValues } = useFormContext<QuotationFormData>();
    const [fgSearch, setFgSearch] = useState("");
    const debouncedFgSearch = useDebounce(fgSearch, 300);

    const { data: products = [], isLoading: isLoadingProducts } = useProductsCombobox({
        type: "FINISHED_GOOD",
        status: "active",
        search: debouncedFgSearch.trim() || undefined,
    });

    const { fields: itemFields, append: appendItem, remove: removeItem, update: updateItem } = useFieldArray({
        control,
        name: "items",
    });

    const handleItemAmountUpdate = (index: number) => {
        const item = getValues(`items.${index}`);
        const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
        setValue(`items.${index}.amount`, amount, { shouldDirty: true });
    };

    const handleSelectProductInline = (index: number, productId: string) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        updateItem(index, {
            product_id: product.id,
            product_name: product.product_name,
            product_code: product.code || "",
            description: product.product_name,
            long_description: "",
            quantity: 1,
            rate: product.selling_price || 0,
            tax_rate: 0,
            amount: product.selling_price || 0,
            unit: product.base_unit || "pcs",
            is_optional: false,
        });
    };

    const addNewRow = () => {
        appendItem({
            product_id: "",
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
        });
    };

    const columns = useMemo<Column<any>[]>(() => [
        {
            key: "index",
            header: "#",
            className: "w-[40px] text-center",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return <span className="text-xs font-bold text-muted-foreground/40">{index + 1}</span>;
            },
        },
        {
            key: "product_code",
            header: "Code",
            className: "w-[120px]",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <Input
                        {...register(`items.${index}.product_code` as const)}
                        className="h-8 text-xs font-mono bg-muted/20 border-transparent text-muted-foreground cursor-not-allowed"
                        placeholder="Code"
                        disabled
                    />
                );
            },
        },
        {
            key: "product_name",
            header: "Product",
            className: "min-w-[280px]",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <Combobox
                        options={products.map((p) => ({
                            label: `${p.product_name} (${p.code})`,
                            value: p.id,
                        }))}
                        value={watch(`items.${index}.product_id`) || ""}
                        onValueChange={(val) => handleSelectProductInline(index, val)}
                        placeholder="Search products..."
                        className="h-8 border-border/40 bg-background/50 text-xs font-medium focus:ring-1 focus:ring-primary/20 transition-all hover:border-primary/40"
                        searchValue={fgSearch}
                        onSearchChange={setFgSearch}
                    />
                );
            },
        },
        {
            key: "unit",
            header: "Unit",
            className: "w-[100px] text-center",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <Badge variant="outline" className="text-[10px] bg-muted/30 border-transparent px-2 font-medium">
                        {watch(`items.${index}.unit`) || "-"}
                    </Badge>
                );
            },
        },
        {
            key: "quantity",
            header: "Qty",
            className: "w-[100px]",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <Input
                        type="number"
                        {...register(`items.${index}.quantity` as const, {
                            valueAsNumber: true,
                            onChange: () => handleItemAmountUpdate(index),
                        })}
                        className="h-8 text-center text-xs border-border/40 rounded-sm bg-background/50 focus:bg-background"
                    />
                );
            },
        },
        {
            key: "rate",
            header: "Rate",
            className: "w-[140px]",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <div className="relative group">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">₹</span>
                        <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.rate` as const, {
                                valueAsNumber: true,
                                onChange: () => handleItemAmountUpdate(index),
                            })}
                            className="h-8 text-right text-xs pl-5 border-border/40 rounded-sm bg-background/50 focus:bg-background font-mono font-medium"
                        />
                    </div>
                );
            },
        },
        {
            key: "amount",
            header: "Amount",
            className: "w-[140px] text-right",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <div className="text-xs font-black text-foreground pr-2 font-mono">
                        ₹{(watch(`items.${index}.amount`) || 0).toLocaleString()}
                    </div>
                );
            },
        },
        {
            key: "actions",
            header: "",
            className: "w-[60px] text-center",
            render: (_item) => {
                const index = itemFields.findIndex((f) => f.id === (_item as any).id);
                return (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => removeItem(index)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                );
            },
        },
    ], [itemFields, products, fgSearch, register, watch]);

    return (
        <div className="mb-3 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <Card className="border-border/40 shadow-sm overflow-hidden">
                <div className="bg-muted/10 px-5 py-3 border-b border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest">Bill Items</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold h-5 px-2 bg-background border-border/40 text-muted-foreground">
                        {itemFields.length} {itemFields.length === 1 ? "item" : "items"}
                    </Badge>
                </div>
                <CardContent className="p-0 border-t border-border/10">
                    <DataTable
                        data={itemFields}
                        columns={columns}
                        pageSize={100}
                        idKey="id"
                        isLoading={isLoadingProducts}
                    />
                </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row items-center">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:max-w-[300px] h-10 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all flex items-center justify-center gap-2 group shadow-sm"
                    onClick={addNewRow}
                >
                    <Plus className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary">Add Product</span>
                </Button>
            </div>
        </div>
    );
};
