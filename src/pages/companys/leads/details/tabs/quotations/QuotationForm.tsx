import { ComponentProps, useEffect, useMemo } from "react";
import {
    useFieldArray,
    useForm,
    useWatch,
    UseFormSetError,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Loader2, Plus, RefreshCw, Trash2, ChevronLeft, Save, FileText, Info, DollarSign, Truck, ShieldCheck, Mail, Phone, ArrowLeft

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDateForAPI } from "@/utils/date";
import { cn } from "@/lib/utils";

const quotationStatuses = [
    "DRAFT",
    "SENT",
    "VIEWED",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
    "REVISED",
    "CANCELLED",
] as const;

const discountTypes = ["PERCENTAGE", "FIXED"] as const;

const paymentTermsOptions = [
    "ADVANCE",
    "COD",
    "NET_7",
    "NET_15",
    "NET_30",
    "NET_45",
    "NET_60",
    "50_ADVANCE_50_DELIVERY",
    "30_ADVANCE_70_DELIVERY",
    "LETTER_OF_CREDIT",
] as const;

const deliveryTermsOptions = [
    "EX_WORKS",
    "FOB",
    "CIF",
    "CIP",
    "DAP",
    "DDP",
    "FREE_DELIVERY",
    "PAID_DELIVERY",
] as const;

const optionalText = z.string().optional().or(z.literal(""));

const requiredNumber = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return 0;
        }
        const parsed = typeof value === "number" ? value : Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
    },
    z.number().min(0, "Value must be 0 or more"),
);

const optionalNumber = z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
}, z.number().min(0, "Value must be 0 or more").optional());

const keyValueSchema = z.object({
    key: z.string().min(1, "Key is required"),
    value: requiredNumber,
});

export const quotationSchema = z.object({
    quotation_number: z.string().min(1, "Quotation number is required"),
    lead_id: z.string().min(1, "Lead is required"),
    quotation_date: z.string().min(1, "Quotation date is required"),
    valid_until: optionalText,
    status: z.enum(quotationStatuses),

    customer_name: z.string().min(1, "Customer name is required"),
    customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
    customer_phone: optionalText,
    customer_address: optionalText,
    customer_gst: optionalText,
    customer_pan: optionalText,

    contact_person_id: optionalText,
    contact_person_name: optionalText,
    contact_person_email: optionalText,
    contact_person_phone: optionalText,
    contact_person_designation: optionalText,

    subtotal: requiredNumber,
    discount_type: z.enum(discountTypes).optional().or(z.literal("NONE")),
    discount_value: optionalNumber,
    tax_details: z.array(keyValueSchema),
    total_tax_amount: requiredNumber,
    additional_charges: z.array(keyValueSchema),
    total_additional_charges: requiredNumber,

    amount_in_words: optionalText,
    payment_terms: z.enum(paymentTermsOptions).optional(),
    payment_terms_custom: optionalText,
    delivery_terms: z.enum(deliveryTermsOptions).optional(),
    delivery_terms_custom: optionalText,
    delivery_charges: requiredNumber,
    delivery_address: optionalText,
    expected_delivery_date: optionalText,

    notes: optionalText,
    requires_approval: z.boolean().default(false),
    approval_status: optionalText,
    approval_remarks: optionalText,
}).refine((data) => {
    if (data.valid_until && data.quotation_date) {
        return new Date(data.valid_until) >= new Date(data.quotation_date);
    }
    return true;
}, {
    message: "Valid until date must be after or equal to quotation date",
    path: ["valid_until"],
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

export type Quotation = QuotationFormData & {
    id: string;
    created_at: string;
};

const quotationFormLabelBase = "text-xs font-bold";

type QuotationFormLabelProps = ComponentProps<typeof FormLabel> & {
    required?: boolean;
};

const QuotationFormLabel = ({
    children,
    className,
    required = false,
    ...props
}: QuotationFormLabelProps) => (
    <FormLabel
        className={cn(
            quotationFormLabelBase,
            required ? "flex gap-1 items-center" : "",
            className,
        )}
        {...props}
    >
        {children}
        {required && <span className="text-destructive">*</span>}
    </FormLabel>
);

interface QuotationFormProps {
    quotationData?: Quotation | null;
    onSave: (data: QuotationFormData, setError: UseFormSetError<QuotationFormData>) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const createQuotationNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `QT-${year}-${random}`;
};

const QuotationForm = ({ quotationData, onSave, onCancel, isSubmitting }: QuotationFormProps) => {
    const form = useForm<QuotationFormData>({
        resolver: zodResolver(quotationSchema),
        defaultValues: quotationData || {
            quotation_number: createQuotationNumber(),
            quotation_date: formatDate(new Date()),
            valid_until: "",
            status: "DRAFT",
            lead_id: "",
            subtotal: 0,
            tax_details: [],
            additional_charges: [],
            total_tax_amount: 0,
            total_additional_charges: 0,
            delivery_charges: 0,
            requires_approval: false,
            customer_gst: "",
            customer_pan: "",
            contact_person_name: "",
            contact_person_email: "",
            contact_person_phone: "",
            contact_person_designation: "",
            amount_in_words: "",
            payment_terms_custom: "",
            delivery_terms_custom: "",
            approval_remarks: "",
        },
    });

    const { fields: taxFields, append: appendTax, remove: removeTax } = useFieldArray({
        control: form.control,
        name: "tax_details",
    });

    const { fields: chargeFields, append: appendCharge, remove: removeCharge } = useFieldArray({
        control: form.control,
        name: "additional_charges",
    });

    const watchAll = useWatch({ control: form.control });

    const totals = useMemo(() => {
        const sub = Number(watchAll.subtotal) || 0;
        const discVal = Number(watchAll.discount_value) || 0;
        const discAmount = watchAll.discount_type === "PERCENTAGE"
            ? (sub * discVal) / 100
            : watchAll.discount_type === "FIXED" ? discVal : 0;

        const taxable = Math.max(sub - discAmount, 0);
        const taxTotal = (watchAll.tax_details || []).reduce((s, t) => s + (Number(t.value) || 0), 0);
        const chargesTotal = (watchAll.additional_charges || []).reduce((s, c) => s + (Number(c.value) || 0), 0) + (Number(watchAll.delivery_charges) || 0);

        return {
            discountAmount: discAmount,
            taxableAmount: taxable,
            taxTotal,
            chargesTotal,
            grandTotal: taxable + taxTotal + chargesTotal
        };
    }, [watchAll.subtotal, watchAll.discount_type, watchAll.discount_value, watchAll.tax_details, watchAll.additional_charges, watchAll.delivery_charges]);

    useEffect(() => {
        form.setValue("total_tax_amount", totals.taxTotal);
        form.setValue("total_additional_charges", totals.chargesTotal);
    }, [totals.taxTotal, totals.chargesTotal, form]);

    const onSubmit = (data: QuotationFormData) => {
        onSave({
            ...data,
            quotation_date: formatDateForAPI(data.quotation_date) || data.quotation_date,
            valid_until: formatDateForAPI(data.valid_until) || data.valid_until,
            expected_delivery_date: formatDateForAPI(data.expected_delivery_date) || data.expected_delivery_date,
        }, form.setError);
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onCancel} className="h-9 w-9 rounded-full hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={onCancel} className="h-9 font-bold px-5" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={form.handleSubmit(onSubmit)} className="h-9 font-bold px-6 shadow-md shadow-primary/20" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {quotationData ? 'Update Quotation' : 'Save Quotation'}
                    </Button>
                </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 ">
                <Form {...form}>
                    <form className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-20">

                            {/* LEFT COLUMN: Essential Details & Customer */}
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                                        <FileText className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Quotation Basics</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="quotation_number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel required>Quotation #</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="QT-2026-1024" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Status</QuotationFormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {quotationStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="quotation_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel required>Date</QuotationFormLabel>
                                                    <DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} className="h-10 rounded-md border-border/60" />
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="valid_until"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Valid Until</QuotationFormLabel>
                                                    <DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} className="h-10 rounded-md border-border/60" />
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                                        <Info className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Customer Information</h3>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="customer_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel required>Customer Name</QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter customer or company name" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customer_email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Email</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@example.com" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customer_phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Phone</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1..." className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customer_gst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>GST Number</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Optional" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customer_pan"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>PAN Number</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Optional" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="customer_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>Full Address</QuotationFormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Company billing address..." className="min-h-[80px] text-sm resize-none" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Contact Person</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contact_person_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Contact Name</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Name" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contact_person_designation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Designation</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Manager" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="contact_person_email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Contact Email</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Email" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="contact_person_phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Contact Phone</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Phone" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Financials & Terms */}
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Pricing & Summary</h3>
                                    </div>

                                    <Card className="bg-muted/10 border-border/40 overflow-hidden shadow-none">
                                        <CardContent className="p-6 space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="subtotal"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <QuotationFormLabel required>Subtotal Amount</QuotationFormLabel>
                                                        <div className="relative mt-1">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                                            <Input type="number" step="0.01" className="pl-9 h-12 text-lg font-black tracking-tight" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} />
                                                        </div>
                                                        <FormMessage className="text-[10px]" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="discount_type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <QuotationFormLabel>Discount Type</QuotationFormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-10 text-sm font-medium border-border/60 bg-background">
                                                                        <SelectValue placeholder="No discount" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="NONE">No Discount</SelectItem>
                                                                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                                                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="discount_value"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <QuotationFormLabel>Discount Value</QuotationFormLabel>
                                                            <FormControl>
                                                                <Input type="number" step="0.01" placeholder="0.00" className="h-10 text-sm font-medium border-border/60 bg-background" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Calculations Preview */}
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="p-3 bg-background rounded border border-border/40 flex flex-col justify-center">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Discount Amount</span>
                                                    <span className="text-sm font-bold">-{totals.discountAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="p-3 bg-primary/5 rounded border border-primary/20 flex flex-col justify-center">
                                                    <span className="text-[10px] uppercase font-bold text-primary">Grand Total</span>
                                                    <span className="text-lg font-black">{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="amount_in_words"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <QuotationFormLabel>Amount in Words</QuotationFormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="e.g. One thousand dollars only" className="min-h-[60px] text-xs resize-none" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4" /> Taxes
                                            </h4>
                                            <Button type="button" variant="outline" size="sm" onClick={() => appendTax({ key: "", value: 0 })} className="h-7 text-[10px] font-bold uppercase gap-1">
                                                <Plus className="h-3 w-3" /> Add Tax
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {taxFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-right-2">
                                                    <Input placeholder="Tax Name (e.g. GST)" className="h-9 text-xs flex-1" {...form.register(`tax_details.${index}.key` as const)} />
                                                    <Input type="number" placeholder="0.00" className="h-9 text-xs w-[120px]" {...form.register(`tax_details.${index}.value` as const)} onChange={e => form.setValue(`tax_details.${index}.value`, Number(e.target.value))} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeTax(index)} className="h-9 w-9 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black uppercase text-muted-foreground flex items-center gap-2">
                                                <Truck className="h-4 w-4" /> Additional Charges
                                            </h4>
                                            <Button type="button" variant="outline" size="sm" onClick={() => appendCharge({ key: "", value: 0 })} className="h-7 text-[10px] font-bold uppercase gap-1">
                                                <Plus className="h-3 w-3" /> Add Charge
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex gap-2 items-start bg-muted/20 p-1 rounded-md">
                                                <span className="flex-1 px-3 py-2 text-xs font-bold text-muted-foreground uppercase flex items-center">Standard Delivery</span>
                                                <Input type="number" placeholder="0.00" className="h-9 text-xs w-[120px] bg-background" {...form.register(`delivery_charges` as const)} onChange={e => form.setValue(`delivery_charges`, Number(e.target.value))} />
                                                <div className="w-9" />
                                            </div>
                                            {chargeFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-right-2">
                                                    <Input placeholder="Description" className="h-9 text-xs flex-1" {...form.register(`additional_charges.${index}.key` as const)} />
                                                    <Input type="number" placeholder="0.00" className="h-9 text-xs w-[120px]" {...form.register(`additional_charges.${index}.value` as const)} onChange={e => form.setValue(`additional_charges.${index}.value`, Number(e.target.value))} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeCharge(index)} className="h-9 w-9 text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                                        <Truck className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Terms & Logistics</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="payment_terms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <QuotationFormLabel>Payment Terms</QuotationFormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                                    <SelectValue placeholder="Select terms" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {paymentTermsOptions.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g, ' ')}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="payment_terms_custom"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <QuotationFormLabel>Custom Payment Info</QuotationFormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Additional payment details..." className="h-10 text-sm border-border/60" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="delivery_terms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <QuotationFormLabel>Delivery Terms</QuotationFormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                                    <SelectValue placeholder="Select terms" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {deliveryTermsOptions.map(o => <SelectItem key={o} value={o}>{o.replace(/_/g, ' ')}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="delivery_terms_custom"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <QuotationFormLabel>Custom Delivery Info</QuotationFormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Additional delivery details..." className="h-10 text-sm border-border/60" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="expected_delivery_date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Expected Delivery</QuotationFormLabel>
                                                    <DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} className="h-10 rounded-md border-border/60" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="delivery_address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <QuotationFormLabel>Delivery Address</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Same as customer address?" className="h-10 text-sm border-border/60" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                                        <ShieldCheck className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Internal & Approval</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <FormField
                                            control={form.control}
                                            name="requires_approval"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card border-border/40">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-[13px] font-bold">Require Approval</FormLabel>
                                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Manager must review</p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        {watchAll.requires_approval && (
                                            <FormField
                                                control={form.control}
                                                name="approval_remarks"
                                                render={({ field }) => (
                                                    <FormItem className="animate-in fade-in zoom-in-95 duration-200">
                                                        <QuotationFormLabel>Approval Remarks</QuotationFormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Notes for approver..." className="h-10 text-sm border-border/60" {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>Internal Notes</QuotationFormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Private notes for team..." className="min-h-[80px] text-sm resize-none" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default QuotationForm;
