import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import {
    ArrowLeft, FlaskConical, Save, Loader2, X, Info,
    Package, Calendar, MapPin, FileText, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateBatch, useBatchDetails, useUpdateBatch } from "@/hooks/useBatch";
import { useProductsCombobox } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { BatchCreatePayload, BatchUpdatePayload } from "@/types/batch";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";

// ── Validation Schema ────────────────────────────────────────────────────────

const batchSchema = z.object({
    product_id: z.string().uuid("Select a valid product"),
    batch_number: z.string().min(2, "Batch number is required").max(50),
    manufacturing_date: z.string().min(1, "Manufacturing date is required"),
    expiry_date: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    initial_quantity: z.number({ invalid_type_error: "Enter a valid quantity" }).min(0.000001, "Quantity must be greater than 0"),
    status: z.enum(["active", "expired", "depleted", "blocked", "quarantine"]).default("active"),
    notes: z.string().optional().nullable(),
});

type BatchFormData = z.infer<typeof batchSchema>;

const defaultForm: BatchFormData = {
    product_id: "",
    batch_number: "",
    manufacturing_date: format(new Date(), "yyyy-MM-dd"),
    expiry_date: "",
    location: "",
    initial_quantity: 0,
    status: "active",
    notes: "",
};

// ── Auto-generate batch number helper ───────────────────────────────────────

const generateBatchNumber = (productCode: string) => {
    const date = format(new Date(), "yyyyMMdd");
    const rand = Math.floor(Math.random() * 900) + 100;
    return `${productCode || "BATCH"}-${date}-${rand}`;
};

// ── Form Section ─────────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 rounded-sm flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            {icon}
        </div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">{title}</h3>
    </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const BatchFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState<BatchFormData>(defaultForm);
    const [errors, setErrors] = useState<Partial<Record<keyof BatchFormData, string>>>({});
    const [productSearch, setProductSearch] = useState("");
    const [selectedProductCode, setSelectedProductCode] = useState("");
    const debouncedProductSearch = useDebounce(productSearch, 300);

    // Data + mutations
    const { data: existingBatch, isLoading: isLoadingBatch } = useBatchDetails(id);
    const { data: products = [] } = useProductsCombobox({ search: debouncedProductSearch || undefined });
    const { mutate: createBatch, isPending: isCreating } = useCreateBatch();
    const { mutate: updateBatch, isPending: isUpdating } = useUpdateBatch();
    const isPending = isCreating || isUpdating;

    // Prefill on edit
    useEffect(() => {
        if (existingBatch && isEditing) {
            setFormData({
                product_id: existingBatch.product_id,
                batch_number: existingBatch.batch_number,
                manufacturing_date: existingBatch.manufacturing_date
                    ? format(new Date(existingBatch.manufacturing_date), "yyyy-MM-dd")
                    : format(new Date(), "yyyy-MM-dd"),
                expiry_date: existingBatch.expiry_date
                    ? format(new Date(existingBatch.expiry_date), "yyyy-MM-dd")
                    : "",
                location: existingBatch.location || "",
                initial_quantity: Number(existingBatch.initial_quantity),
                status: (existingBatch.status as BatchFormData["status"]) || "active",
                notes: existingBatch.notes || "",
            });
            setSelectedProductCode(existingBatch.product_code || "");
        }
    }, [existingBatch, isEditing]);

    const handleChange = <K extends keyof BatchFormData>(field: K, value: BatchFormData[K]) => {
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
            status: formData.status,
            notes: formData.notes || null,
        };

        if (isEditing) {
            updateBatch({ id, ...payload } as BatchUpdatePayload, { onSuccess: () => navigate(-1) });
        } else {
            createBatch(payload as BatchCreatePayload, { onSuccess: () => navigate(-1) });
        }
    };

    if (isEditing && isLoadingBatch) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <FlaskConical className="h-4 w-4" />
                            {isEditing ? "Edit Batch" : "Create New Batch"}
                        </h2>
                        {isEditing && existingBatch && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                {existingBatch.batch_number} · {existingBatch.product_name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-sm text-xs gap-1.5"
                        onClick={() => navigate(-1)}
                        disabled={isPending}
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-8 rounded-sm text-xs gap-1.5"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                        {isPending ? (isEditing ? "Updating..." : "Saving...") : (isEditing ? "Update Batch" : "Save Batch")}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-2">

                {/* ── LEFT: Basic Information ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<Package className="h-3.5 w-3.5" />} title="Basic Information" />

                        <div className="space-y-4">
                            {/* Product */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Product <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    options={products.map((p) => ({
                                        label: `${p.product_name} (${p.code})`,
                                        value: p.id,
                                    }))}
                                    value={formData.product_id}
                                    onValueChange={(v) => {
                                        handleChange("product_id", v);
                                        const prod = products.find((p) => p.id === v);
                                        if (prod) setSelectedProductCode(prod.code);
                                    }}
                                    onSearchChange={setProductSearch}
                                    placeholder="Search and select a product..."
                                    disabled={isEditing || isPending}
                                    className={errors.product_id ? "border-destructive" : ""}
                                />
                                {errors.product_id && <p className="text-[10px] text-destructive font-medium">{errors.product_id}</p>}
                            </div>

                            {/* Batch Number + Auto-generate */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Batch Number <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex gap-1.5">
                                        <Input
                                            placeholder="e.g. BULK-20260311-001"
                                            value={formData.batch_number}
                                            onChange={(e) => handleChange("batch_number", e.target.value)}
                                            className={`h-8 text-xs rounded-sm flex-1 font-mono ${errors.batch_number ? "border-destructive" : ""}`}
                                            disabled={isPending}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-2.5 text-xs rounded-sm shrink-0"
                                            title="Auto-generate batch number"
                                            onClick={() => handleChange("batch_number", generateBatchNumber(selectedProductCode))}
                                            disabled={isPending || isEditing}
                                        >
                                            Auto
                                        </Button>
                                    </div>
                                    {errors.batch_number && <p className="text-[10px] text-destructive font-medium">{errors.batch_number}</p>}
                                    <p className="text-[9px] text-muted-foreground">Format: PREFIX-YYYYMMDD-SEQ</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Initial Quantity <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        min="0.000001"
                                        placeholder="0"
                                        value={formData.initial_quantity || ""}
                                        onChange={(e) => handleChange("initial_quantity", parseFloat(e.target.value) || 0)}
                                        className={`h-8 text-xs rounded-sm ${errors.initial_quantity ? "border-destructive" : ""}`}
                                        disabled={isPending || (isEditing)}
                                    />
                                    {isEditing && <p className="text-[9px] text-muted-foreground">Quantity cannot be changed after batch creation</p>}
                                    {errors.initial_quantity && <p className="text-[10px] text-destructive font-medium">{errors.initial_quantity}</p>}
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Manufacturing Date <span className="text-destructive">*</span>
                                    </Label>
                                    <DatePicker
                                        value={formData.manufacturing_date}
                                        onChange={(value: string) => handleChange("manufacturing_date", value)}
                                        className={`h-8 text-sm rounded-sm ${errors.manufacturing_date ? "border-destructive" : ""}`}
                                        disabled={isPending}
                                    />
                                    {errors.manufacturing_date && <p className="text-[10px] text-destructive font-medium">{errors.manufacturing_date}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Expiry Date
                                        <span className="text-muted-foreground font-normal text-[9px]">(optional)</span>
                                    </Label>
                                    <DatePicker
                                        value={formData.expiry_date}
                                        onChange={(value: string) => handleChange("expiry_date", value || null)}
                                        className="h-8 text-sm rounded-sm"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Storage Location
                                    <span className="text-muted-foreground font-normal text-[9px]">(optional)</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Warehouse A - Tank 3, Rack B2"
                                    value={formData.location || ""}
                                    onChange={(e) => handleChange("location", e.target.value || null)}
                                    className="h-8 text-xs rounded-sm"
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quality & Notes */}
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<FileText className="h-3.5 w-3.5" />} title="Quality & Notes" />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Notes <span className="text-muted-foreground font-normal text-[9px]">(optional)</span>
                                </Label>
                                <Textarea
                                    placeholder="E.g. Initial stock from Supplier A - Quality checked and approved"
                                    value={formData.notes || ""}
                                    onChange={(e) => handleChange("notes", e.target.value || null)}
                                    className="text-xs rounded-sm min-h-[80px]"
                                    disabled={isPending}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Status & Summary ──────────────────────────────── */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<CheckCircle2 className="h-3.5 w-3.5" />} title="Batch Status" />

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v) => handleChange("status", v as BatchFormData["status"])}
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="h-8 text-xs rounded-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">✅ Active</SelectItem>
                                        <SelectItem value="blocked">🚫 Blocked</SelectItem>
                                        <SelectItem value="expired">⛔ Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Summary Preview */}
                    <div className="bg-muted/30 border border-border/60 rounded-lg p-4 space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Batch Preview</p>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Batch #</span>
                                <span className="font-mono font-bold truncate max-w-[120px]">
                                    {formData.batch_number || "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Qty</span>
                                <span className="font-bold">{formData.initial_quantity || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mfg.</span>
                                <span>{formData.manufacturing_date || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Expiry</span>
                                <span className={!formData.expiry_date ? "text-muted-foreground/50 italic" : ""}>
                                    {formData.expiry_date || "None"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <Badge
                                    variant={formData.status === "active" ? "success" : formData.status === "blocked" ? "warning" : "secondary"}
                                    className="text-[9px] uppercase font-bold h-4 px-1.5"
                                >
                                    {formData.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BatchFormPage;
