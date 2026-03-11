import { useState, useMemo } from "react";
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
import { useBatches } from "@/hooks/useBatch";
import { useGenerateSerials } from "@/hooks/useSerials";
import { GenerateSerialParams } from "@/types/serial";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

const schema = z.object({
    batch_id: z.string().uuid("Please select a valid batch"),
    pattern: z.string().min(1, "Pattern template is required"),
    starting_number: z.number().int().min(0, "Starting number cannot be negative"),
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

const GenerateSerialsPage = () => {
    const navigate = useNavigate();
    const [selectedBatchId, setSelectedBatchId] = useState<string>("");
    
    // Fetch batches for selection
    const { data: batchesRes } = useBatches();
    const batches = useMemo(() => batchesRes?.items || [], [batchesRes]);
    
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
            pattern: "{PROD}-{YYYY}-{MM}-{####}",
            starting_number: 1,
            quantity: 1
        }
    });

    const watchPattern = watch("pattern");
    const watchStartingNumber = watch("starting_number") || 0;
    const watchQuantity = watch("quantity") || 0;
    const watchLocation = watch("location");

    const generatePreview = () => {
        if (!watchPattern) return [];
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        
        const previews = Array.from({ length: Math.min(watchQuantity, 6) }, (_, i) => {
            const sequence = watchStartingNumber + i;
            const str = (watchPattern || "")
                .replace(/{YYYY}/g, year)
                .replace(/{MM}/g, month)
                .replace(/{DD}/g, day)
                .replace(/{PROD}/g, selectedBatch?.product_code || "PROD")
                .replace(/{BATCH}/g, selectedBatch?.batch_number || "BATCH");

            // Look for sequence placeholder with braces first
            const bracedMatch = str.match(/{#+}/);
            if (bracedMatch) {
                const [token] = bracedMatch;
                const len = token.length - 2;
                return str.replace(token, sequence.toString().padStart(len, '0'));
            }

            // Fallback: look for sequence placeholder without braces
            const rawMatch = str.match(/#+/);
            if (rawMatch) {
                const [token] = rawMatch;
                const len = token.length;
                return str.replace(token, sequence.toString().padStart(len, '0'));
            }

            return str;
        });

        if (watchQuantity > 6) {
            previews.push(`... and ${watchQuantity - 6} more`);
        }
        
        return previews;
    };

    const previewList = generatePreview();

    const { mutate: generate, isPending } = useGenerateSerials();

    const onSubmit = (data: FormData) => {
        if (selectedBatch && data.quantity > selectedBatch.remaining_quantity) {
             toast.error(`Quantity exceeds batch remaining capacity of ${selectedBatch.remaining_quantity}`);
             return;
        }

        const payload: GenerateSerialParams = {
            batch_id: data.batch_id,
            pattern: data.pattern,
            starting_number: data.starting_number,
            quantity: data.quantity,
            location: data.location || undefined
        };

        generate(payload, {
            onSuccess: (res) => {
                const message = (res as { data?: { message?: string }; message?: string }).data?.message || 
                               (res as { message?: string }).message || 
                               "Serial numbers generated successfully";
                toast.success(message);
                navigate("/inventory/serials");
            },
            onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
                const msg = error.response?.data?.message || error.message || "Failed to generate serial numbers";
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
                            GENERATE SERIAL NUMBERS
                        </h2>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Assign unique identifiers to batch units</p>
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
                        onClick={handleSubmit(onSubmit)}
                        disabled={isPending || !selectedBatchId}
                    >
                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        {isPending ? "Generating..." : "Generate Serials"}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* LEFT: Configuration */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Batch Selection */}
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<Box className="h-3.5 w-3.5" />} title="Target Batch" />
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Select Batch <span className="text-destructive">*</span>
                                </Label>
                                <Select 
                                    onValueChange={(v) => {
                                        setSelectedBatchId(v);
                                        setValue("batch_id", v);
                                    }}
                                >
                                    <SelectTrigger className="h-8 text-xs rounded-sm">
                                        <SelectValue placeholder="Search Batch (ID - Product Name)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.batch_number} - {b.product_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <Input 
                                    {...register("pattern")}
                                    placeholder="Template: {PROD}-{YYYY}-{MM}-{####}"
                                    className={`h-8 text-xs rounded-sm font-mono ${errors.pattern ? "border-destructive" : ""}`}
                                />
                                {errors.pattern && <p className="text-[10px] text-destructive font-medium">{errors.pattern.message}</p>}
                            </div>

                            <div className="bg-muted/30 rounded-md p-3 border border-border/40">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase mb-2">Available Variables:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Starting Number</Label>
                                <Input 
                                    type="number"
                                    {...register("starting_number", { valueAsNumber: true })}
                                    className={`h-8 text-xs rounded-sm ${errors.starting_number ? "border-destructive" : ""}`}
                                />
                                 {errors.starting_number && <p className="text-[10px] text-destructive font-medium">{errors.starting_number.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity to Generate</Label>
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

                {/* RIGHT: Summary & Previews */}
                <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <SectionHeader icon={<FileText className="h-3.5 w-3.5" />} title="Generation Summary" />
                        
                        <div className="space-y-3">
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground uppercase tracking-tighter">Batch #</span>
                                    <span className="font-mono font-bold truncate max-w-[120px]">
                                        {selectedBatch?.batch_number || "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground uppercase tracking-tighter">Quantity</span>
                                    <span className="font-bold">{watchQuantity || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground uppercase tracking-tighter">Location</span>
                                    <span className="truncate max-w-[120px]">{watchLocation || "Default"}</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-border">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Live Preview:</p>
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {previewList.length > 0 ? (
                                        previewList.map((p, i) => (
                                            <div key={i} className="flex items-center gap-2 py-1 px-2 bg-secondary/30 rounded border border-border/40">
                                                <code className="text-[10px] font-mono text-primary truncate flex-1">{p}</code>
                                                {p.toString().startsWith("...") === false && <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-muted-foreground italic">Enter details to see preview...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 border border-border/60 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Serial numbers are unique identifiers. Once generated, they will be linked to this batch and cannot be reassigned to other products.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default GenerateSerialsPage;
