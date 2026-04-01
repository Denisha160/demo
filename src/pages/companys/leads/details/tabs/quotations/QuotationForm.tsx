import { ComponentProps, useMemo, useState, useRef, useEffect } from "react";
import { useForm, useWatch, UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useLeadContacts } from "@/hooks/useLeadContacts";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatDateForAPI } from "@/utils/date";
import { cn } from "@/lib/utils";
import { QuotationProductsTable } from "./QuotationProductsTable";
import { numberToWords } from "@/utils/numberToWords";

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

const quotationItemSchema = z.object({
  product_id: z.string().optional().nullable(),
  kit_id: z.string().optional().nullable(),
  item_name: z.string().min(1, "Name is required"),
  item_code: optionalText,
  item_description: optionalText,
  quantity: requiredNumber.pipe(z.number().positive("Quantity must be greater than 0")),
  unit_price: requiredNumber.pipe(z.number().min(0, "Unit price cannot be negative")),
  amount: requiredNumber, // local only for display
  type: z.enum(["product", "kit"]).default("product"),
  fragrance_name: optionalText,
  category_id: optionalText.nullable(),
  category_name: optionalText,
});

export const quotationSchema = z.object({
  lead_id: z.string().min(1, "Lead is required"),
  quotation_number: z.string().min(1, "Quotation number is required").max(50),
  quotation_date: z.string().min(1, "Quotation date is required"),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'REVISED', 'CANCELLED']).default('DRAFT'),
  amount_in_words: optionalText,
  notes: optionalText,
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  // These might be needed for the UI calculation but shouldn't break the stripUnknown if handled in onSubmit
  sub_total: requiredNumber.optional(),
  total_tax_amount: requiredNumber.optional(),
  grand_total: requiredNumber.optional(),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

export type Quotation = QuotationFormData & {
  id: string;
  created_at: string;
};

const quotationFormLabelBase =
  "text-[10px] font-bold uppercase tracking-widest text-muted-foreground";

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
  onSave: (
    data: QuotationFormData,
    setError: UseFormSetError<QuotationFormData>,
  ) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const QuotationForm = ({
  quotationData,
  onSave,
  onCancel,
  isSubmitting,
}: QuotationFormProps) => {
  const leadComboboxRef = useRef<HTMLButtonElement>(null);
  const datePickerRef = useRef<any>(null);

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: quotationData || {
      quotation_date: formatDate(new Date()),
      quotation_number: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      lead_id: "",
      status: "DRAFT",
      notes: "",
      sub_total: 0,
      total_tax_amount: 0,
      grand_total: 0,
      items: [
        {
          product_id: "",
          kit_id: "",
          item_name: "",
          item_code: "",
          item_description: "",
          quantity: 1,
          unit_price: 0,
          amount: 0,
          type: "product",
          fragrance_name: "",
          category_id: null,
          category_name: "",
        },
      ],
      amount_in_words: "",
    },
  });

  // Focus Customer/Lead on mount for new quotations
  useEffect(() => {
    if (!quotationData?.id) {
      const timer = setTimeout(() => {
        if (leadComboboxRef.current) {
          leadComboboxRef.current.focus();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [quotationData?.id]);

  const [leadSearch, setLeadSearch] = useState("");
  const debouncedLeadSearch = useDebounce(leadSearch, 500);

  const { data: leads = [] } = useLeads({
    search: debouncedLeadSearch,
    limit: 10,
  });

  const selectedLeadId = form.watch("lead_id");
  const { data: contactData } = useLeadContacts(selectedLeadId);

  const leadOptions = useMemo(() => {
    return (leads as any[]).map((l) => ({
      value: l.id,
      label: l.name || l.title || "Unknown Lead",
    }));
  }, [leads]);

  const handleLeadChange = (leadId: string) => {
    form.setValue("lead_id", leadId, { shouldValidate: true });
    const lead = (leads as any[]).find((l) => l.id === leadId);
    if (lead) {
      // Set lead related fields if needed, but the customer fields are removed from schema
      // Move focus to Quotation Date after selection and open it
      setTimeout(() => {
        if (datePickerRef.current) {
          // If RSuite DatePicker has an open method, use it to make entry faster
          if (typeof datePickerRef.current.open === "function") {
            datePickerRef.current.open();
          } else {
            // Fallback to focusing the input element
            const dateInput =
              datePickerRef.current.root?.querySelector("input") ||
              datePickerRef.current.querySelector?.("input");
            if (dateInput) {
              dateInput.focus();
            } else if (datePickerRef.current.focus) {
              datePickerRef.current.focus();
            }
          }
        }
      }, 100);
    }
  };

  const watchAll = useWatch({ control: form.control });

  const totals = useMemo(() => {
    const itemsList = watchAll.items || [];
    let sub = 0;
    let tax = 0;

    itemsList.forEach((item) => {
      const amt = Number(item.amount) || 0;
      sub += amt;
    });

    return {
      subtotal: sub,
      totalTax: 0, // No tax in the new schema but used for UI
      grandTotal: sub,
    };
  }, [watchAll.items]);

  // Auto-update amount_in_words and total_tax_amount when grandTotal changes
  useEffect(() => {
    const words = numberToWords(totals.grandTotal);
    form.setValue("amount_in_words", words, { shouldDirty: true });
    form.setValue("sub_total", totals.subtotal, { shouldDirty: true });
    form.setValue("total_tax_amount", totals.totalTax, { shouldDirty: true });
    form.setValue("grand_total", totals.grandTotal, { shouldDirty: true });
  }, [totals.grandTotal, totals.totalTax, totals.subtotal, form]);

  const onSubmit = (data: QuotationFormData) => {
    onSave(
      {
        ...data,
        quotation_date:
          formatDateForAPI(data.quotation_date) || data.quotation_date,
      },
      form.setError,
    );
  };

  return (
    <Form {...form}>
      <form
        id="quotation-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <Card className="bg-muted/5 border-border/40 overflow-hidden shadow-none mb-2">
          <CardContent className="p-2 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quotation Number */}
              <FormField
                control={form.control}
                name="quotation_number"
                render={({ field }) => (
                  <FormItem>
                    <QuotationFormLabel required className="text-[11px]">
                      Quotation #
                    </QuotationFormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="QT-2024-001"
                          className="h-10 border-border/60 rounded-md font-mono font-bold uppercase"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <QuotationFormLabel required className="text-[11px]">
                        Customer / Lead
                      </QuotationFormLabel>
                    </div>
                    <FormControl>
                      <Combobox
                        ref={leadComboboxRef}
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
                      <QuotationFormLabel required className="text-[11px]">
                        Quotation Date
                      </QuotationFormLabel>
                    </div>
                    <DatePicker
                      value={field.value}
                      onChange={(v) => field.onChange(v || "")}
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
                  {(leads as any[]).find(l => l.id === selectedLeadId) && (
                    <>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Email Address
                        </span>
                        <span className="text-xs font-semibold text-foreground break-all">
                          {((leads as any[]).find(l => l.id === selectedLeadId) as any)?.email || "Not provided"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          Contact Number
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {((leads as any[]).find(l => l.id === selectedLeadId) as any)?.phone || "Not provided"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
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
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              Pricing & Summary
            </h3>
          </div>

          <Card className="bg-muted/10 border-border/40 overflow-hidden shadow-none">
            <CardContent className="p-4 space-y-4">
              {/* Calculations Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-2.5 bg-muted/20 rounded border border-border/40 flex flex-col justify-center">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-sm font-bold">
                    {totals.subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="p-2.5 bg-muted/20 rounded border border-border/40 flex flex-col justify-center">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">
                    Total Tax
                  </span>
                  <span className="text-sm font-bold">
                    {totals.totalTax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="p-2.5 bg-primary/5 rounded border border-primary/20 flex flex-col justify-center">
                  <span className="text-[9px] uppercase font-bold text-primary">
                    Grand Total
                  </span>
                  <span className="text-base font-black">
                    {totals.grandTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <FormField
                control={form.control}
                name="amount_in_words"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <QuotationFormLabel>Amount in Words</QuotationFormLabel>
                    <FormControl>
                      <div className="min-h-[50px] p-3 text-xs font-bold text-primary bg-primary/5 border border-primary/20 rounded-sm leading-relaxed uppercase tracking-tighter italic">
                        {field.value || "Zero Only"}
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <QuotationFormLabel>Additional Notes</QuotationFormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Priority customer - first order"
                        className="w-full p-3 text-xs bg-muted/20 border border-border/40 rounded-sm focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none"
                      />
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
