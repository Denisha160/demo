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
    subject: z.string().min(1, "Subject is required"),
    quotation_number: z.string().min(1, "Quotation number is required"),
    quotation_date: z.string().min(1, "Quotation date is required"),
    valid_until: optionalText,
    status: z.enum(quotationStatuses),

    related_to: optionalText, // e.g. "Lead", "Customer"
    lead_id: optionalText,
    account_id: optionalText,
    currency: z.string().default("USD $"),
    tags: z.array(z.string()).optional(),
    allow_comments: z.boolean().default(true),

    assigned_to: optionalText,
    customer_name: z.string().min(1, "Customer name is required"),
    customer_email: z.string().email("Invalid email").optional().or(z.literal("")),
    customer_phone: optionalText,
    customer_gst: optionalText,
    customer_pan: optionalText,
    customer_address: optionalText,
    contact_person_name: optionalText,
    contact_person_email: optionalText,
    contact_person_phone: optionalText,
    contact_person_designation: optionalText,
    city: optionalText,
    state: optionalText,
    country: optionalText,
    zip_code: optionalText,

    subtotal: requiredNumber,
    discount_type: z.enum(discountTypes).optional(),
    discount_value: optionalNumber,
    tax_details: z.array(keyValueSchema),
    total_tax_amount: requiredNumber,
    additional_charges: z.array(keyValueSchema),
    total_additional_charges: requiredNumber,

    payment_terms: z.enum(paymentTermsOptions).optional(),
    delivery_terms: z.enum(deliveryTermsOptions).optional(),
    delivery_charges: requiredNumber,
    delivery_address: optionalText,
    expected_delivery_date: optionalText,

    notes: optionalText,
    amount_in_words: optionalText,
    requires_approval: z.boolean().default(false),
    approval_status: optionalText,
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

export interface Quotation extends QuotationFormData {
    id: string;
    created_at: string;
}

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
            subject: "",
            quotation_number: createQuotationNumber(),
            quotation_date: formatDate(new Date()),
            valid_until: "",
            status: "DRAFT",
            related_to: "Lead",
            currency: "USD $",
            allow_comments: true,
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                            {/* LEFT COLUMN */}
                            <div className="space-y-6">

                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <QuotationFormLabel required>
                                                Subject
                                            </QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter quotation subject..." className="h-10 text-sm italic font-medium border-border/60 focus:ring-primary/20" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="related_to"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel required>
                                                    Related
                                                </QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                            <SelectValue placeholder="Lead" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Lead">Lead</SelectItem>
                                                        <SelectItem value="Customer">Customer</SelectItem>
                                                        <SelectItem value="Contact">Contact</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lead_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel required>
                                                    Lead
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Select Lead..." className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
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
                                                <QuotationFormLabel required>
                                                    Date
                                                </QuotationFormLabel>
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
                                                <QuotationFormLabel>
                                                    Open Till
                                                </QuotationFormLabel>
                                                <DatePicker value={field.value} onChange={(v) => field.onChange(v || '')} className="h-10 rounded-md border-border/60" />
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="currency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel required>
                                                    Currency
                                                </QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                            <SelectValue placeholder="USD $" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="USD $">USD $</SelectItem>
                                                        <SelectItem value="INR ₹">INR ₹</SelectItem>
                                                        <SelectItem value="EUR €">EUR €</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discount_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Discount Type
                                                </QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                            <SelectValue placeholder="No discount" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="NONE">No Discount</SelectItem>
                                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <QuotationFormLabel>
                                                Tags
                                            </QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Tag" className="h-10 text-sm font-medium border-border/60 shadow-inner" {...field} value={field.value?.join(', ') || ''} onChange={(e) => field.onChange(e.target.value.split(',').map(t => t.trim()))} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="allow_comments"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card border-border/40">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-[13px] font-bold">Allow Comments</FormLabel>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Permit customer feedback on quote</p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Status
                                                </QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-sm font-medium border-border/60 bg-muted/20">
                                                            <SelectValue placeholder="Draft" />
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
                                    <FormField
                                        control={form.control}
                                        name="assigned_to"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Assigned
                                                </QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                            <SelectValue placeholder="Vito Nikolaus" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Vito Nikolaus">Vito Nikolaus</SelectItem>
                                                        <SelectItem value="Basalt Admin">Basalt Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="customer_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <QuotationFormLabel required>
                                                To
                                            </QuotationFormLabel>
                                            <FormControl>
                                                <Input placeholder="Ferry, Bosco and Langosh" className="h-10 text-sm font-black border-border/60 bg-muted/10 italic" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="customer_gst"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Customer GST
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="29ABCDE1234F1Z5" className="h-10 text-sm font-medium border-border/60" {...field} />
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
                                                <QuotationFormLabel>
                                                    Customer PAN
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="ABCDE1234F" className="h-10 text-sm font-medium border-border/60" {...field} />
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
                                            <QuotationFormLabel>
                                                Address
                                            </QuotationFormLabel>
                                            <FormControl>
                                                <Textarea placeholder="8098 Kuphal Manors" className="min-h-[100px] text-sm italic font-medium border-border/60 resize-none shadow-inner" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/20">
                                    <div className="col-span-2">
                                        <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Contact Person</h4>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="contact_person_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Name
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Rahul Sharma" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contact_person_designation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Designation
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Manager" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contact_person_email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Email
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="rahul@example.com" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="contact_person_phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Phone
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="+91 98765 43210" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    City
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Port Francesstad" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    State
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="Oregon" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Country
                                                </QuotationFormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-10 text-sm font-medium border-border/60">
                                                            <SelectValue placeholder="United Kingdom GB" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="United Kingdom GB">United Kingdom GB</SelectItem>
                                                        <SelectItem value="United States US">United States US</SelectItem>
                                                        <SelectItem value="India IN">India IN</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="zip_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel>
                                                    Zip Code
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="97751" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="customer_email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <QuotationFormLabel required>
                                                    Email
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="kadin.waelchi@example.net" className="h-10 text-sm font-medium border-border/60 italic" {...field} />
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
                                                <QuotationFormLabel>
                                                    Phone
                                                </QuotationFormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1.458.602.5470" className="h-10 text-sm font-medium border-border/60" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
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
