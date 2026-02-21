import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Layers, Package } from "lucide-react";
import { Product, ProductType, Variant, BOMItem } from "./types";

interface ProductModalProps {
    open: boolean;
    onClose: () => void;
    formData: Partial<Product>;
    setFormData: (data: Partial<Product>) => void;
    saveProduct: () => void;
    productTypes: (ProductType | "All")[];
    unitOptions: string[];
    addVariant: () => void;
    removeVariant: (id: string) => void;
    addBOMItem: () => void;
    products: Product[];
}

const ProductModal = ({
    open,
    onClose,
    formData,
    setFormData,
    saveProduct,
    productTypes,
    unitOptions,
    addVariant,
    removeVariant,
    addBOMItem,
    products
}: ProductModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create New Product"
            description="Define core product details, variants, and composition."
            maxWidth="max-w-3xl"
            headerBg="bg-primary/10"
            titleClassName="text-primary"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={saveProduct}>Create Product</Button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-1">
                        <Label>Product Name</Label>
                        <Input
                            value={formData.name || ""}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Lavender Oil"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={e => setFormData({ ...formData, type: e as ProductType })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {productTypes.filter(t => t !== "All").map(t => (
                                    <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Base Unit</Label>
                        <Select
                            value={formData.base_unit}
                            onValueChange={e => setFormData({ ...formData, base_unit: e })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Package className="h-4 w-4" /> Product Variants
                        </h3>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addVariant}>
                            <Plus className="h-3 v-3 mr-1" /> Add Variant
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {formData.variants?.map((variant, idx) => (
                            <div key={variant.id} className="grid grid-cols-7 gap-2 items-end bg-muted/20 p-3 rounded-md border border-dashed border-border">
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-[10px]">Variant Name / SKU</Label>
                                    <Input
                                        placeholder="Name"
                                        className="h-8 text-xs mb-1"
                                        value={variant.variant_name}
                                        onChange={e => {
                                            const v = [...formData.variants!];
                                            v[idx].variant_name = e.target.value;
                                            setFormData({ ...formData, variants: v });
                                        }}
                                    />
                                    <Input
                                        placeholder="SKU Code"
                                        className="h-8 text-xs font-mono"
                                        value={variant.sku}
                                        onChange={e => {
                                            const v = [...formData.variants!];
                                            v[idx].sku = e.target.value;
                                            setFormData({ ...formData, variants: v });
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Weight/Vol</Label>
                                    <Input type="number" className="h-8 text-xs" value={variant.weight_volume} onChange={e => {
                                        const v = [...formData.variants!];
                                        v[idx].weight_volume = Number(e.target.value);
                                        setFormData({ ...formData, variants: v });
                                    }} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Unit</Label>
                                    <Select
                                        value={variant.unit}
                                        onValueChange={e => {
                                            const v = [...formData.variants!];
                                            v[idx].unit = e;
                                            setFormData({ ...formData, variants: v });
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-8 text-[11px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Cost</Label>
                                    <Input type="number" className="h-8 text-xs" value={variant.cost_price} onChange={e => {
                                        const v = [...formData.variants!];
                                        v[idx].cost_price = Number(e.target.value);
                                        setFormData({ ...formData, variants: v });
                                    }} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Selling</Label>
                                    <Input type="number" className="h-8 text-xs" value={variant.selling_price} onChange={e => {
                                        const v = [...formData.variants!];
                                        v[idx].selling_price = Number(e.target.value);
                                        setFormData({ ...formData, variants: v });
                                    }} />
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVariant(variant.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {(formData.type === 'finished_good') && (
                    <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
                                <Layers className="h-4 w-4" /> Bill of Materials (Composition)
                            </h3>
                            <Button variant="link" size="sm" className="h-7 text-xs" onClick={addBOMItem}>
                                Add Component
                            </Button>
                        </div>

                        {formData.bom?.length === 0 && <p className="text-xs text-center py-4 text-muted-foreground">No raw materials linked yet.</p>}

                        {formData.bom?.map((item: BOMItem, idx: number) => (
                            <div key={idx} className="flex gap-4 items-end">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-[10px]">Select Raw Material Variant</Label>
                                    <Select
                                        value={item.component_variant_id}
                                        onValueChange={e => {
                                            const b = [...formData.bom!];
                                            b[idx].component_variant_id = e;
                                            setFormData({ ...formData, bom: b });
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60">
                                            {products.filter(p => p.type === 'raw_material').map(p => (
                                                <div key={p.id}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground opacity-70">
                                                        {p.name}
                                                    </div>
                                                    {p.variants.map(v => (
                                                        <SelectItem key={v.id} value={v.id} className="pl-6">
                                                            {v.variant_name} ({v.sku})
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32 space-y-1">
                                    <Label className="text-[10px]">Qty Required</Label>
                                    <Input
                                        type="number"
                                        className="h-9"
                                        value={item.quantity_required}
                                        onChange={e => {
                                            const b = [...formData.bom!];
                                            b[idx].quantity_required = Number(e.target.value);
                                            setFormData({ ...formData, bom: b });
                                        }}
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => {
                                    const b = formData.bom?.filter((_, i) => i !== idx);
                                    setFormData({ ...formData, bom: b });
                                }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ProductModal;
