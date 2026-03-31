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
import { cn } from "@/lib/utils";
import { QuotationItemsTable } from "./QuotationItemsTable";

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
    }, [totals.subtotal, totals.taxTotal, totals.chargesTotal, form]);

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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 pb-4">
                    {/* LEFT COLUMN: Basics, Contact, Pricing, Internal */}
                    <div className="space-y-4">
                        {/* Quotation Basics */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Quotation Basics</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="quotation_number"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel required>Quotation #</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="QT-2026-1024" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <QuotationFormLabel>Status</QuotationFormLabel>
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] h-4 px-1.5 uppercase font-black",
                                                    uiStatusLabel.includes("Rejected") || uiStatusLabel === "Cancelled" ? "border-destructive text-destructive" :
                                                        uiStatusLabel.includes("Approved") || uiStatusLabel === "Accepted" ? "border-primary text-primary" :
                                                            uiStatusLabel === "Sent" ? "border-blue-500 text-blue-500" : ""
                                                )}>
                                                    {uiStatusLabel}
                                                </Badge>
                                            </div>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-8 text-xs font-medium border-border/60 rounded-sm">
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

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="quotation_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel required>Date</QuotationFormLabel>
                                            <DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} className="h-8 rounded-sm text-xs border-border/60" />
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Contact Person</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="contact_person_name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel required>Contact Name</QuotationFormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={contactOptions}
                                                    value={contactData?.contacts.find(c => c.name === field.value)?.id || ""}
                                                    onValueChange={handleContactChange}
                                                    placeholder="Select contact..."
                                                    searchPlaceholder="Search contacts..."
                                                    disabled={!selectedLeadId}
                                                    className="h-8 border-border/60 rounded-sm"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contact_person_designation"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Designation</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Designation" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="contact_person_email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Contact Email</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Email" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contact_person_phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Contact Phone</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Taxes */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5 leading-none">
                                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Taxes
                                </h4>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendTax({ key: "", value: 0 })} className="h-6 text-[9px] font-bold uppercase gap-1">
                                    <Plus className="h-2.5 w-2.5" /> Add Tax
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {taxFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-right-1">
                                        <Input placeholder="Tax Name" className="h-8 text-xs flex-1 rounded-sm border-border/60" {...form.register(`tax_details.${index}.key` as const)} />
                                        <Input type="number" placeholder="0.00" className="h-8 text-xs w-[100px] rounded-sm border-border/60" {...form.register(`tax_details.${index}.value` as const)} onChange={e => form.setValue(`tax_details.${index}.value`, Number(e.target.value))} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTax(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Truck className="h-3.5 w-3.5" /> Additional Charges
                                </h4>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendCharge({ key: "", value: 0 })} className="h-6 text-[9px] font-bold uppercase gap-1">
                                    <Plus className="h-2.5 w-2.5" /> Add Charge
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex gap-2 items-start bg-muted/20 p-1 rounded-md">
                                    <span className="flex-1 px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase flex items-center">Standard Delivery</span>
                                    <Input type="number" placeholder="0.00" className="h-8 text-xs w-[100px] bg-background" {...form.register(`delivery_charges` as const)} onChange={e => form.setValue(`delivery_charges`, Number(e.target.value))} />
                                    <div className="w-8" />
                                </div>
                                {chargeFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-right-1">
                                        <Input placeholder="Description" className="h-8 text-xs flex-1 rounded-sm border-border/60" {...form.register(`additional_charges.${index}.key` as const)} />
                                        <Input type="number" placeholder="0.00" className="h-8 text-xs w-[100px] rounded-sm border-border/60" {...form.register(`additional_charges.${index}.value` as const)} onChange={e => form.setValue(`additional_charges.${index}.value`, Number(e.target.value))} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCharge(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing & Summary */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Pricing & Summary</h3>
                            </div>

                            <Card className="bg-muted/10 border-border/40 overflow-hidden shadow-none">
                                <CardContent className="p-4 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="subtotal"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <QuotationFormLabel required>Subtotal Amount</QuotationFormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                                    <Input type="number" step="0.01" className="pl-9 h-10 text-lg font-black tracking-tight rounded-sm bg-muted/20 border-border/30" {...field} value={field.value || ""} readOnly />
                                                </div>
                                                <p className="text-[9px] font-bold text-muted-foreground/70 uppercase">Autocalculated from items</p>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="discount_type"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <QuotationFormLabel>Discount Type</QuotationFormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-8 text-xs font-medium border-border/60 bg-background rounded-sm">
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
                                                <FormItem className="space-y-1">
                                                    <QuotationFormLabel>Discount Value</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="0.00" className="h-8 text-xs font-medium border-border/60 bg-background rounded-sm" {...field} value={field.value || ''} onChange={e => field.onChange(Number(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Calculations Preview */}
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="p-2.5 bg-background rounded border border-border/40 flex flex-col justify-center">
                                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Discount</span>
                                            <span className="text-sm font-bold">-{totals.discountAmount.toFixed(2)}</span>
                                        </div>
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
                                                    <Textarea placeholder="e.g. One thousand dollars only" className="min-h-[50px] text-xs resize-none" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Customer, Taxes, Terms */}
                    <div className="space-y-3">
                        {/* Customer Information */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                                <Info className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Customer Information</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="lead_id"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <QuotationFormLabel required>Customer Name</QuotationFormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={leadOptions}
                                                value={field.value}
                                                onValueChange={handleLeadChange}
                                                placeholder="Select a lead..."
                                                searchPlaceholder="Search leads..."
                                                className="h-8 border-border/60 rounded-sm"
                                                searchValue={leadSearch}
                                                onSearchChange={setLeadSearch}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="customer_email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Email</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="email@example.com" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="customer_phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Phone</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="+1..." className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="customer_gst"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>GST Number</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="customer_pan"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>PAN Number</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" className="h-8 text-xs font-medium border-border/60 rounded-sm" {...field} />
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
                                    <FormItem className="space-y-1">
                                        <QuotationFormLabel>Full Address</QuotationFormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Company billing address..." className="min-h-[60px] text-xs resize-none rounded-sm border-border/60" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            {watchAll.status === "REJECTED" && (
                                <FormField
                                    control={form.control}
                                    name="rejected_reason"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 animate-in slide-in-from-top-2">
                                            <QuotationFormLabel required>Customer Rejection Reason</QuotationFormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Why was this rejected by the customer?" className="min-h-[60px] text-xs border-destructive/30 rounded-sm" {...field} />
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
                                        <FormItem className="space-y-1 animate-in slide-in-from-top-2">
                                            <QuotationFormLabel required>Cancellation Reason</QuotationFormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Reason for cancellation..." className="min-h-[60px] text-xs border-orange-300 rounded-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>



                        {/* Terms & Logistics */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                                <Truck className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Terms & Logistics</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="payment_terms"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <QuotationFormLabel>Payment Terms</QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-8 text-xs font-medium border-border/60 rounded-sm">
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
                                            <FormItem className="space-y-1">
                                                <QuotationFormLabel>Custom Payment Info</QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Additional details..." className="h-8 text-xs border-border/60 rounded-sm" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="delivery_terms"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <QuotationFormLabel>Delivery Terms</QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-8 text-xs font-medium border-border/60 rounded-sm">
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
                                            <FormItem className="space-y-1">
                                                <QuotationFormLabel>Custom Delivery Info</QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Additional details..." className="h-8 text-xs border-border/60 rounded-sm" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <FormField
                                    control={form.control}
                                    name="expected_delivery_date"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Expected Delivery</QuotationFormLabel>
                                            <DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} className="h-8 rounded-sm text-xs border-border/60" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="delivery_address"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <QuotationFormLabel>Delivery Address</QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Same as customer?" className="h-8 text-xs border-border/60 rounded-sm" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>




                        {/* Internal & Approval */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Internal & Approval</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-2 items-start">
                                <FormField
                                    control={form.control}
                                    name="requires_approval"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card border-border/40 space-y-0">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-xs font-bold">Require Approval</FormLabel>
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Manager review</p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                {watchAll.requires_approval && (
                                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                        <FormField
                                            control={form.control}
                                            name="approval_status"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <QuotationFormLabel>Approval Status</QuotationFormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || "PENDING"}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-8 text-[11px] font-bold border-border/60 rounded-sm">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {approvalStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="approval_remarks"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <QuotationFormLabel>Approval Remarks</QuotationFormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Notes for/from approver..." className="h-8 text-xs border-border/60 rounded-sm" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>

                            {(watchAll.status === "ACCEPTED" || watchAll.approval_status === "APPROVED") && (
                                <div className="grid grid-cols-2 gap-2 p-2 rounded-sm border border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-primary/70">
                                            {watchAll.status === "ACCEPTED" ? "Accepted By" : "Approved By"}
                                        </p>
                                        <p className="text-sm font-bold truncate">
                                            {watchAll.status === "ACCEPTED" ? (watchAll.accepted_by || "System") : (watchAll.approved_by || "Pending")}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-primary/70">
                                            {watchAll.status === "ACCEPTED" ? "Accepted At" : "Approved At"}
                                        </p>
                                        <p className="text-sm font-bold">
                                            {watchAll.status === "ACCEPTED"
                                                ? (watchAll.accepted_at ? formatDate(new Date(watchAll.accepted_at)) : "-")
                                                : (watchAll.approved_at ? formatDate(new Date(watchAll.approved_at)) : "-")
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <QuotationFormLabel>Internal Notes</QuotationFormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Private notes for team..." className="min-h-[60px] text-xs resize-none rounded-sm border-border/60" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>


                    </div>
                </div>

                {/* BILL ITEMS SECTION - FULL WIDTH */}
                <QuotationItemsTable />
            </form>
        </Form>
    );
};

export default QuotationForm;
