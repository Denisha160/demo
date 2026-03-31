import { ComponentProps, useEffect, useMemo, useState } from "react";
import {
    useFieldArray,
    useForm,
    useWatch,
    UseFormSetError,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Loader2, Plus, RefreshCw, Trash2, ChevronLeft, Save, FileText, Info, DollarSign, Truck, ShieldCheck, Mail, Phone, ArrowLeft, User, Package
} from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useLeadContacts } from "@/hooks/useLeadContacts";
import { useProductsCombobox } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
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
import { numberToWords } from "@/utils/numberToWords";
import { cn } from "@/lib/utils";
import { QuotationProductsTable } from "./QuotationProductsTable";

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

const approvalStatuses = [
    "PENDING",
    "APPROVED",
    "REJECTED",
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

const quotationItemSchema = z.object({
    product_id: z.string().min(1, "Product is required"),
    product_name: z.string().min(1, "Product name is required"),
    product_code: optionalText,
    description: optionalText,
    long_description: optionalText,
    quantity: requiredNumber.default(1),
    rate: requiredNumber,
    tax_rate: requiredNumber.default(0),
    amount: requiredNumber,
    unit: optionalText.default("pcs"),
    is_optional: z.boolean().default(false),
});

export const quotationSchema = z.object({
    quotation_number: z.string().min(1, "Quotation number is required"),
    lead_id: z.string().min(1, "Lead is required"),
    quotation_date: z.string().min(1, "Quotation date is required"),
    status: z.enum(quotationStatuses),

    customer_name: z.string().min(1, "Customer name is required"),
    customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
    customer_phone: optionalText,
    customer_address: optionalText,
    customer_gst: optionalText,
    customer_pan: optionalText,

    contact_person_id: optionalText,
    contact_person_name: z.string().min(1, "Contact name is required"),
    contact_person_email: optionalText,
    contact_person_phone: optionalText,
    contact_person_designation: optionalText,

    items: z.array(quotationItemSchema).min(1, "At least one item is required"),

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
    approval_status: z.enum(approvalStatuses).nullable().optional(),
    approval_remarks: optionalText,
    approved_by: optionalText,
    approved_at: optionalText,
    accepted_at: optionalText,
    accepted_by: optionalText,
    rejected_reason: optionalText,
    cancelled_reason: optionalText,
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

export type Quotation = QuotationFormData & {
    id: string;
    created_at: string;
};

const quotationFormLabelBase = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground";

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
            items: [{
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
            }],
            amount_in_words: "",
            payment_terms_custom: "",
            delivery_terms_custom: "",
            approval_remarks: "",
            approval_status: null,
            approved_by: "",
            approved_at: "",
            accepted_at: "",
            accepted_by: "",
            rejected_reason: "",
            cancelled_reason: "",
        },
    });

    const [leadSearch, setLeadSearch] = useState("");
    const debouncedLeadSearch = useDebounce(leadSearch, 500);

    const { data: leads = [] } = useLeads({ search: debouncedLeadSearch, limit: 10 });

    const selectedLeadId = form.watch("lead_id");
    const { data: contactData } = useLeadContacts(selectedLeadId);

    const leadOptions = useMemo(() => {
        return (leads as any[]).map(l => ({
            value: l.id,
            label: l.name || l.title || "Unknown Lead"
        }));
    }, [leads]);

    const contactOptions = useMemo(() => {
        return (contactData?.contacts || []).map(c => ({
            value: c.id,
            label: c.name || "Unknown Contact"
        }));
    }, [contactData]);

    const handleLeadChange = (leadId: string) => {
        form.setValue("lead_id", leadId, { shouldValidate: true });
        const lead = (leads as any[]).find(l => l.id === leadId);
        if (lead) {
            form.setValue("customer_name", lead.name || lead.title || "", { shouldDirty: true });
            form.setValue("customer_email", lead.email || "", { shouldDirty: true });
            form.setValue("customer_phone", lead.phone || "", { shouldDirty: true });
            const addressParts = [lead.address, lead.address_line1, lead.address_line2]
                .filter(Boolean);
            const fullAddress = addressParts.join(", ");
            form.setValue("customer_address", fullAddress || "", { shouldDirty: true });

            form.setValue("customer_gst", lead.gst_number || "", { shouldDirty: true });
            form.setValue("customer_pan", lead.pan_number || "", { shouldDirty: true });
        }
    };

    const handleContactChange = (contactId: string) => {
        const contact = (contactData?.contacts || []).find(c => c.id === contactId);
        if (contact) {
            form.setValue("contact_person_id", contact.id, { shouldDirty: true });
            form.setValue("contact_person_name", contact.name || "", { shouldValidate: true });
            form.setValue("contact_person_designation", contact.designation || "", { shouldDirty: true });
            form.setValue("contact_person_email", contact.email || "", { shouldDirty: true });
            form.setValue("contact_person_phone", contact.phone || "", { shouldDirty: true });
        }
    };

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
        const itemsList = watchAll.items || [];
        const sub = itemsList.reduce((sum, item) => sum + (item.is_optional ? 0 : (Number(item.amount) || 0)), 0);
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
            subtotal: sub,
            grandTotal: taxable + taxTotal + chargesTotal
        };
    }, [watchAll.items, watchAll.subtotal, watchAll.discount_type, watchAll.discount_value, watchAll.tax_details, watchAll.additional_charges, watchAll.delivery_charges]);

    const uiStatusLabel = useMemo(() => {
        const { status, approval_status, requires_approval } = watchAll;
        if (status === "DRAFT") {
            if (requires_approval) {
                if (approval_status === "PENDING") return "Pending Approval";
                if (approval_status === "REJECTED") return "Approval Rejected";
                if (approval_status === "APPROVED") return "Approved (Ready to Send)";
            }
            return "Draft";
        }
        if (status === "SENT") return "Sent";
        if (status === "VIEWED") return "Viewed";
        if (status === "ACCEPTED") return "Accepted";
        if (status === "REJECTED") return "Rejected";
        if (status === "EXPIRED") return "Expired";
        if (status === "REVISED") return "Revised";
        if (status === "CANCELLED") return "Cancelled";
        return status;
    }, [watchAll]);

    // Handle initial approval status logic
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "requires_approval") {
                if (value.requires_approval) {
                    if (!value.approval_status) {
                        form.setValue("approval_status", "PENDING");
                    }
                } else {
                    form.setValue("approval_status", null);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    useEffect(() => {
        form.setValue("subtotal", totals.subtotal);
        form.setValue("total_tax_amount", totals.taxTotal);
        form.setValue("total_additional_charges", totals.chargesTotal);
        const words = numberToWords(totals.grandTotal);
        form.setValue("amount_in_words", words, { shouldDirty: true });
    }, [totals.subtotal, totals.taxTotal, totals.chargesTotal, totals.grandTotal, form]);

    const onSubmit = (data: QuotationFormData) => {
        // Business Rule: Block Send
        if (data.status === "SENT" && data.requires_approval && data.approval_status !== "APPROVED") {
            form.setError("status", {
                type: "manual",
                message: "Cannot send quotation until it is approved by a manager."
            });
            return;
        }

        onSave({
            ...data,
            quotation_date: formatDateForAPI(data.quotation_date) || data.quotation_date,
            expected_delivery_date: formatDateForAPI(data.expected_delivery_date) || data.expected_delivery_date,
        }, form.setError);
    };

    return (
        <Form {...form}>
            <form id="quotation-form" onSubmit={form.handleSubmit(onSubmit)} className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                <Card className="bg-muted/5 border-border/40 overflow-hidden shadow-none mb-2">
                    <CardContent className="p-2 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Selection */}
                            <FormField
                                control={form.control}
                                name="lead_id"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <QuotationFormLabel required className="text-[11px]">Customer / Lead</QuotationFormLabel>
                                        </div>
                                        <FormControl>
                                            <Combobox
                                                options={leadOptions}
                                                value={field.value}
                                                onValueChange={handleLeadChange}
                                                placeholder="Select a customer..."
                                                searchPlaceholder="Search leads..."
                                                className="h-10 border-border/60 rounded-md"
                                                searchValue={leadSearch}
                                                onSearchChange={setLeadSearch}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            {/* Date Selection */}
                            <FormField
                                control={form.control}
                                name="quotation_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center">
                                            <QuotationFormLabel required className="text-[11px]">Quotation Date</QuotationFormLabel>
                                        </div>
                                        <DatePicker
                                            value={field.value}
                                            onChange={(v) => field.onChange(v || '')}
                                            className="h-10 border-border/60 rounded-md"
                                        />
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Customer Details Display */}
                        {form.watch("lead_id") && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-border/10">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</span>
                                        <span className="text-xs font-semibold text-foreground break-all">{form.watch("customer_email") || "Not provided"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Number</span>
                                        <span className="text-xs font-semibold text-foreground">{form.watch("customer_phone") || "Not provided"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">GST Registration</span>
                                        <span className="text-xs font-semibold text-foreground uppercase tracking-tight">{form.watch("customer_gst") || "Not available"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PAN Number</span>
                                        <span className="text-xs font-semibold text-foreground uppercase tracking-tight">{form.watch("customer_pan") || "Not available"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 bg-muted/20 rounded-md">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Billing Address</span>
                                        <span className="text-xs font-semibold text-foreground uppercase tracking-tight">
                                            {form.watch("customer_address") || "No billing address on file for this lead."}
                                        </span>
                                    </div>
                                </div>


                            </div>
                        )}

                        {/* Optional Reasons based on Status */}
                        {(watchAll.status === "REJECTED" || watchAll.status === "CANCELLED") && (
                            <div className="pt-4 border-t border-border/10">
                                {watchAll.status === "REJECTED" && (
                                    <FormField
                                        control={form.control}
                                        name="rejected_reason"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <QuotationFormLabel required className="text-destructive">Rejection Reason</QuotationFormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Details about customer rejection..." className="min-h-[80px] text-xs border-destructive/20 rounded-md bg-destructive/5 placeholder:text-destructive/40" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {watchAll.status === "CANCELLED" && (
                                    <FormField
                                        control={form.control}
                                        name="cancelled_reason"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <QuotationFormLabel required className="text-orange-600">Cancellation Reason</QuotationFormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Why was this quotation cancelled?" className="min-h-[80px] text-xs border-orange-200 rounded-md bg-orange-50/30 placeholder:text-orange-300" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>


                {/* BILL ITEMS SECTION - FULL WIDTH */}
                <QuotationProductsTable />

                {/* Pricing & Summary */}
                <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                        <DollarSign className="h-3.5 w-3.5 text-primary" />
                        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Pricing & Summary</h3>
                    </div>

                    <Card className="bg-muted/10 border-border/40 overflow-hidden shadow-none">
                        <CardContent className="p-4 space-y-4">



                            {/* Calculations Preview */}
                            <div className="grid grid-cols-2 gap-3 pt-1">


                                <div className="p-2.5 bg-primary/5 rounded border border-primary/20 flex flex-col justify-center">
                                    <span className="text-[9px] uppercase font-bold text-primary">Grand Total</span>
                                    <span className="text-base font-black">{totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="amount_in_words"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <QuotationFormLabel>Amount in Words</QuotationFormLabel>
                                        <FormControl>
                                            <div className="min-h-[50px] p-3 text-xs font-bold text-muted-foreground bg-muted/20 border border-border/40 rounded-sm leading-relaxed uppercase tracking-tighter italic">
                                                {field.value || "Calculating amount..."}
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
};

export default QuotationForm;
