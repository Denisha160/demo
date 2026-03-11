import { useState, useEffect } from "react";
import { z } from "zod";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateBatch } from "@/hooks/useBatch";
import { useProductsCombobox } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2, Save, X } from "lucide-react";

const batchSchema = z.object({
    product_id: z.string().uuid("Select a valid product"),
    batch_number: z.string().min(2, "Batch number is required").max(50),
    manufacturing_date: z.string().min(1, "Manufacturing date is required"),
    expiry_date: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    initial_quantity: z
        .number({ invalid_type_error: "Enter a valid quantity" })
        .min(0.000001, "Quantity must be greater than 0"),
    notes: z.string().optional().nullable(),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchCreateModalProps {
    open: boolean;
    onClose: () => void;
}

const defaultForm: BatchFormData = {
    product_id: "",
    batch_number: "",
    manufacturing_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    location: "",
    initial_quantity: 0,
    notes: "",
};

const BatchCreateModal = ({ open, onClose }: BatchCreateModalProps) => {
    const [formData, setFormData] = useState<BatchFormData>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof BatchFormData, string>>>({});
    const [productSearch, setProductSearch] = useState("");
    const debouncedProductSearch = useDebounce(productSearch, 300);

    const { data: products = [] } = useProductsCombobox({
        search: debouncedProductSearch || undefined,
    });
    const { mutate: createBatch, isPending } = useCreateBatch();

    useEffect(() => {
        if (open) {
            setFormData(defaultForm);
            setErrors({});
        }
    }, [open]);

    const handleChange = (field: keyof BatchFormData, value: string | number | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        try {
            batchSchema.parse(formData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Partial<Record<keyof BatchFormData, string>> = {};
                err.errors.forEach((e) => {
                    if (e.path[0]) newErrors[e.path[0] as keyof BatchFormData] = e.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            product_id: formData.product_id,
            batch_number: formData.batch_number,
            manufacturing_date: formData.manufacturing_date,
            expiry_date: formData.expiry_date || null,
            location: formData.location || null,
            initial_quantity: formData.initial_quantity,
            notes: formData.notes || null,
        };

        createBatch(payload, { onSuccess: onClose });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary font-bold"
            maxWidth="sm:max-w-[580px]"
            title="Add New Batch"
            description="Register a new stock batch for inventory tracking"
            footer={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-sm text-sm h-8 gap-1.5"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        className="rounded-sm text-sm h-8 gap-1.5 px-5"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        {isPending ? "Saving..." : "Save Batch"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {/* Product */}
                <div className="space-y-1">
                    <Label className="text-sm">
                        Product <span className="text-destructive">*</span>
                    </Label>
                    <Combobox
                        options={products.map((p) => ({ label: `${p.product_name} (${p.code})`, value: p.id }))}
                        value={formData.product_id}
                        onValueChange={(v) => handleChange("product_id", v)}
                        onSearchChange={setProductSearch}
                        placeholder="Select product..."
                        searchPlaceholder="Search products..."
                        className={errors.product_id ? "border-destructive" : ""}
                    />
                    {errors.product_id && <p className="text-[10px] text-destructive font-medium">{errors.product_id}</p>}
                </div>

                {/* Batch number + status */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm">
                            Batch Number <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. BATCH-20260311-0001"
                            value={formData.batch_number}
                            onChange={(e) => handleChange("batch_number", e.target.value)}
                            className={`h-8 text-sm rounded-sm ${errors.batch_number ? "border-destructive" : ""}`}
                            disabled={isPending}
                        />
                        {errors.batch_number && <p className="text-[10px] text-destructive font-medium">{errors.batch_number}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm">Initial Quantity <span className="text-destructive">*</span></Label>
                        <Input
                            type="number"
                            step="any"
                            min="0.000001"
                            placeholder="0"
                            value={formData.initial_quantity || ""}
                            onChange={(e) => handleChange("initial_quantity", parseFloat(e.target.value) || 0)}
                            className={`h-8 text-sm rounded-sm ${errors.initial_quantity ? "border-destructive" : ""}`}
                            disabled={isPending}
                        />
                        {errors.initial_quantity && <p className="text-[10px] text-destructive font-medium">{errors.initial_quantity}</p>}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-sm">Manufacturing Date <span className="text-destructive">*</span></Label>
                        <DatePicker
                            value={formData.manufacturing_date}
                            onChange={(value: string) => handleChange("manufacturing_date", value)}
                            className={`h-8 text-sm rounded-sm ${errors.manufacturing_date ? "border-destructive" : ""}`}
                            disabled={isPending}
                        />
                        {errors.manufacturing_date && <p className="text-[10px] text-destructive font-medium">{errors.manufacturing_date}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-sm">Expiry Date <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
                        <DatePicker
                            value={formData.expiry_date}
                            onChange={(value: string) => handleChange("expiry_date", value || null)}
                            className="h-8 text-sm rounded-sm"
                            disabled={isPending}
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                    <Label className="text-sm">Storage Location <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
                    <Input
                        placeholder="e.g. Warehouse A, Rack 3"
                        value={formData.location || ""}
                        onChange={(e) => handleChange("location", e.target.value || null)}
                        className="h-8 text-sm rounded-sm"
                        disabled={isPending}
                    />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                    <Label className="text-sm">Notes <span className="text-muted-foreground text-[10px]">(optional)</span></Label>
                    <Textarea
                        placeholder="Any additional batch notes..."
                        value={formData.notes || ""}
                        onChange={(e) => handleChange("notes", e.target.value || null)}
                        className="text-sm rounded-sm min-h-[60px]"
                        disabled={isPending}
                    />
                </div>
            </form>
        </Modal>
    );
};

export default BatchCreateModal;
