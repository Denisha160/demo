import { useState, useMemo, useEffect } from "react";
import {
    Hash, Plus, AlertCircle, CheckCircle2,
    ArrowLeft, LayoutPanelLeft, Box, Clock,
    X, Loader2, MapPin, FileText, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-toastify";
import { useBatchesCombobox } from "@/hooks/useBatch";
import { useSerials, useBulkSyncSerials } from "@/hooks/useSerials";
import { GenerateSerialParams } from "@/types/serial";
import { Combobox } from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/useDebounce";
import SerialsPreviewTable from "@/components/customtables/SerialsPreviewTable";
import { v4 as uuidv4 } from "uuid";
import { useSearchParams } from "react-router-dom";

const schema = z.object({
    batch_id: z.string().uuid("Please select a valid batch"),
    pattern: z.string().min(1, "Pattern template is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-6 rounded-sm flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            {icon}
        </div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">{title}</h3>
    </div>
);

const VariableBadge = ({ tag, label }: { tag: string; label: string }) => (
    <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono bg-primary/10 text-primary px-1 rounded">{tag}</span>
        <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
    </div>
);

interface SerialPreview {
    id?: string;
    serial_number: string;
    batch_number: string;
}

const GenerateSerialsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlBatchId = searchParams.get("batch_id");
    
    const [selectedBatchId, setSelectedBatchId] = useState<string>(urlBatchId || "");
    const [batchSearch, setBatchSearch] = useState("");
    const [previewSerials, setPreviewSerials] = useState<SerialPreview[]>([]);
    const [existingSerials, setExistingSerials] = useState<{ id: string; serial_number: string; batch_number: string; status: string; location?: string }[]>([]);
    const debouncedBatchSearch = useDebounce(batchSearch, 300);

    // Fetch batches for selection
    const { data: batches = [] } = useBatchesCombobox({
        search: debouncedBatchSearch || undefined,
        status: 'active'
    });

    const selectedBatch = useMemo(() =>
        batches.find(b => b.id === selectedBatchId), [batches, selectedBatchId]);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            batch_id: urlBatchId || "",
            pattern: "{BATCH}-{####}",
            quantity: 1
        }
    });

    // Fetch existing serials for the selected batch
    const { data: existingSerialsData, isLoading: isLoadingExisting } = useSerials(
        { batch_id: selectedBatchId, limit: 200 },
        { enabled: !!selectedBatchId }
    );

    useEffect(() => {
        if (urlBatchId) {
            setSelectedBatchId(urlBatchId);
            setValue("batch_id", urlBatchId);
        }
    }, [urlBatchId, setValue]);

    useEffect(() => {
        if (existingSerialsData?.items) {
            const mapped = existingSerialsData.items.map(s => ({
                id: s.id,
                serial_number: s.serial_number,
                batch_number: s.batch_number || selectedBatch?.batch_number || "—",
                status: s.status,
                location: s.location || ""
            }));
            setExistingSerials(mapped);
            // Update quantity to existing serials count OR 1 if none
            setValue("quantity", mapped.length > 0 ? mapped.length : 1);
        } else {
            setExistingSerials([]);
            setValue("quantity", 1);
        }
    }, [existingSerialsData, selectedBatch, setValue]);

    const watchPattern = watch("pattern");
    const watchQuantity = watch("quantity") || 0;
    const watchLocation = watch("location");

    // Auto-generate preview rows when pattern or quantity changes
    useEffect(() => {
        if (!watchPattern || watchQuantity <= 0) {
            setPreviewSerials([]);
            return;
        }

        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');

        const newPreview = Array.from({ length: Math.min(watchQuantity, 500) }, (_, i) => {
            // Priority 1: Use existing serial at this index if available
            if (existingSerials[i]) {
                return {
                    id: existingSerials[i].id,
                    serial_number: existingSerials[i].serial_number,
                    batch_number: existingSerials[i].batch_number
                };
            }

            // Priority 2: Generate new serial
            const sequence = i + 1;
            let str = watchPattern;

            str = str
                .replace(/{YYYY}/g, year)
                .replace(/{MM}/g, month)
                .replace(/{DD}/g, day)
                .replace(/{PROD}/g, selectedBatch?.product_code || "PROD")
                .replace(/{BATCH}/g, selectedBatch?.batch_number || "BATCH");

            const bracedMatch = str.match(/{#+}/);
            if (bracedMatch) {
                const [token] = bracedMatch;
                const len = token.length - 2;
                str = str.replace(token, sequence.toString().padStart(len, '0'));
            } else {
                const rawMatch = str.match(/#+/);
                if (rawMatch) {
                    const [token] = rawMatch;
                    const len = token.length;
                    str = str.replace(token, sequence.toString().padStart(len, '0'));
                }
            }

            return {
                serial_number: str,
                batch_number: selectedBatch?.batch_number || "—"
            };
        });

        setPreviewSerials(newPreview);
    }, [watchPattern, watchQuantity, selectedBatch, existingSerials]);

    const onUpdateSerial = (id: string, newSerial: string) => {
        setPreviewSerials(prev => prev.map(s => s.id === id ? { ...s, serial_number: newSerial } : s));
    };

    const { mutate: sync, isPending: isSyncing } = useBulkSyncSerials();

    const onSubmit = (data: FormData) => {
        if (!selectedBatch) return;

        // If we have existing serials OR we are managing a list, use sync
        const payload = {
            batch_id: data.batch_id,
            serials: previewSerials.map(s => ({
                id: s.id,
                serial_number: s.serial_number,
                location: data.location
            }))
        };

        sync(payload, {
            onSuccess: (res) => {
                const responseData = res as { data?: { message?: string }; message?: string };
                const message = responseData.data?.message || responseData.message || "Serials synchronized successfully";
                toast.success(message);
                navigate("/inventory/serials");
            },
            onError: (error: any) => {
                const msg = error.response?.data?.message || error.message || "Failed to sync serials";
                toast.error(msg);
            }
        });
    };

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <LayoutPanelLeft className="h-4 w-4" />
                            {urlBatchId ? "MANAGE BATCH SERIALS" : "GENERATE SERIAL NUMBERS"}
                        </h2>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            {urlBatchId ? `Synchronizing serial numbers for batch ${selectedBatch?.batch_number || ""}` : "Assign unique identifiers to batch units"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-sm text-xs gap-1.5"
                        onClick={() => navigate(-1)}
                        disabled={isSyncing}
                    >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        className="h-8 rounded-sm text-xs gap-1.5"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSyncing || !selectedBatchId}
                    >
                        {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        {isSyncing ? "Saving..." : "Save Serials"}
                    </Button>
                </div>
            </div>

            {/* Changed from lg:grid-cols-3 to lg:grid-cols-12 for better left/right proportions */}
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* LEFT: Configuration - Assigned 4 cols and made it Sticky! */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4 lg:self-start z-10">
                    {/* Batch Selection */}
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<Box className="h-3.5 w-3.5" />} title="Target Batch" />
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Select Batch <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    options={batches.map(b => ({
                                        label: `${b.batch_number} - ${b.product_name}`,
                                        value: b.id
                                    }))}
                                    value={selectedBatchId}
                                    onValueChange={(v) => {
                                        setSelectedBatchId(v);
                                        setValue("batch_id", v);
                                    }}
                                    onSearchChange={setBatchSearch}
                                    placeholder="Search Batch (Number - Product Name)"
                                    className={`h-8 text-xs rounded-sm ${errors.batch_id ? "border-destructive" : ""}`}
                                    disabled={!!urlBatchId}
                                />
                                {errors.batch_id && <p className="text-[10px] text-destructive font-medium">{errors.batch_id.message}</p>}
                            </div>

                            {selectedBatch && (
                                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 border border-dashed border-border/60 rounded-md animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase">Initial Quantity</p>
                                        <p className="text-xs font-bold">{selectedBatch.initial_quantity} Units</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-muted-foreground uppercase">Remaining Capacity</p>
                                        <p className="text-xs font-bold text-emerald-500">{selectedBatch.remaining_quantity} Units</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pattern Configuration */}
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<Hash className="h-3.5 w-3.5" />} title="Pattern Configuration" />
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Pattern Template <span className="text-destructive">*</span>
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        {...register("pattern")}
                                        placeholder="Template: {PROD}-{YYYY}-{MM}-{####}"
                                        className={`h-8 text-xs rounded-sm font-mono flex-1 ${errors.pattern ? "border-destructive" : ""}`}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2.5 text-xs rounded-sm shrink-0"
                                        title="Auto-fill recommended pattern"
                                        onClick={() => setValue("pattern", "{BATCH}-{####}")}
                                        disabled={isSyncing}
                                    >
                                        Auto
                                    </Button>
                                </div>
                                {errors.pattern && <p className="text-[10px] text-destructive font-medium">{errors.pattern.message}</p>}
                            </div>

                            <div className="bg-muted/30 rounded-md p-3 border border-border/40">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Available Variables:</p>
                                {/* Adjusted to grid-cols-2 inside the narrower column */}
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-y-1.5 gap-x-2">
                                    <VariableBadge tag="{YYYY}" label="Year (2025)" />
                                    <VariableBadge tag="{MM}" label="Month (03)" />
                                    <VariableBadge tag="{DD}" label="Day (12)" />
                                    <VariableBadge tag="{PROD}" label="Product Code" />
                                    <VariableBadge tag="{BATCH}" label="Batch#" />
                                    <VariableBadge tag="{####}" label="Sequence" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Run Parameters */}
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<Clock className="h-3.5 w-3.5" />} title="Run Parameters" />
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {urlBatchId ? "Manage Quantity" : "Quantity to Generate"}
                                </Label>
                                <Input 
                                    type="number"
                                    {...register("quantity", { valueAsNumber: true })}
                                    className={`h-8 text-xs rounded-sm ${errors.quantity ? "border-destructive" : ""}`}
                                />
                                {errors.quantity && <p className="text-[10px] text-destructive font-medium">{errors.quantity.message}</p>}
                            </div>
                        </div>

                        <div className="mt-4 space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Default Location
                                <span className="text-muted-foreground font-normal text-[9px]">(optional)</span>
                            </Label>
                            <Input
                                {...register("location")}
                                placeholder="e.g. Warehouse A, Shelf 1"
                                className="h-8 text-xs rounded-sm"
                            />
                            {errors.location && <p className="text-[10px] text-destructive font-medium">{errors.location.message}</p>}
                        </div>

                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md flex items-start gap-3">
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-800 dark:text-amber-400">
                                <strong>Note:</strong> Generating <span className="font-bold underline">{watchQuantity}</span> serial numbers for <strong>{selectedBatch?.batch_number || "selected batch"}</strong>.
                                Ensure sequence length is sufficient.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Preview Table - Assigned remaining 8 cols */}
                <div className="lg:col-span-7 xl:col-span-8">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm h-full flex flex-col">
                        <SectionHeader icon={<FileText className="h-3.5 w-3.5" />} title="Serials Management" />
                        <div className="space-y-4 flex-1">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-md flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-800 dark:text-amber-400">
                                    <strong>Note:</strong> You can edit the individual serial numbers below before final generation.
                                    Maximum quantity for preview is 500 items.
                                </p>
                            </div>

                            <SerialsPreviewTable
                                data={previewSerials}
                                onUpdate={onUpdateSerial}
                                isLoading={isLoadingExisting || isSyncing}
                            />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default GenerateSerialsPage;
