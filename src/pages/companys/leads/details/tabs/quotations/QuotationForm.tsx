import { ComponentProps, useMemo, useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, useWatch, UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, FileText } from "lucide-react";
import { useLead, useLeads } from "@/hooks/useLeads";
import { useDebounce } from "@/hooks/useDebounce";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
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

const optionalText = z.string().optional().nullable().or(z.literal(""));

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
  quantity: requiredNumber.pipe(
    z.number().positive("Quantity must be greater than 0"),
  ),
  unit_price: requiredNumber.pipe(
    z.number().min(0, "Unit price cannot be negative"),
  ),
  amount: requiredNumber,
  gst_percentage: requiredNumber.default(18),
  gst_amount: requiredNumber,
  type: z.enum(["product", "kit"]).default("product"),
  fragrance_name: optionalText,
  category_id: optionalText.nullable(),
  category_name: optionalText,
  image_url: optionalText,
  images: z.array(z.string()).optional().default([]),
});

export const quotationSchema = z.object({
  lead_id: z.string().min(1, "Lead is required"),
  lead_name: optionalText,
  quotation_date: z.string().min(1, "Quotation date is required"),
  status: z
    .enum([
      "DRAFT",
      "SENT",
      "VIEWED",
      "ACCEPTED",
      "REJECTED",
      "EXPIRED",
      "REVISED",
      "CANCELLED",
    ])
    .default("DRAFT"),
  amount_in_words: optionalText,
  gst_number: optionalText,
  pan_number: optionalText,
  notes: optionalText,
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  sub_total: requiredNumber.optional(),
  tax_total: requiredNumber.optional(),
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
  const { id: leadIdFromUrl } = useParams();
  const datePickerRef = useRef<any>(null);

  const [leadSearch, setLeadSearch] = useState("");
  const debouncedLeadSearch = useDebounce(leadSearch, 300);
  const { data: leadsData = [], isLoading: isLoadingLeads } = useLeads<any[]>({
    search: debouncedLeadSearch || undefined,
  });

  const leadOptions = useMemo(
    () =>
      (leadsData as any[]).map((l: any) => ({
        value: l.id,
        label: `${l.name || l.title || "Untitled Lead"}`,
        description: `${l.company_name || "Private"} ${l.phone ? `• ${l.phone}` : ""}`,
        badge: `${l.status_name || "New"}`,
        badgeColor: l.status_color,
      })),
    [leadsData],
  );

  const defaultValues = useMemo(() => {
    return (
      quotationData || {
        quotation_date: formatDate(new Date()),
        lead_id: leadIdFromUrl || "",
        lead_name: (quotationData as any)?.lead_name || "",
        status: "DRAFT" as const,
        notes: "",
        gst_number: "",
        pan_number: "",
        sub_total: 0,
        tax_total: 0,
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
            gst_percentage: 18,
            gst_amount: 0,
            type: "product" as const,
            fragrance_name: "",
            category_id: null,
            category_name: "",
            image_url: "",
            images: [],
          },
        ],
        amount_in_words: "",
      }
    );
  }, [quotationData, leadIdFromUrl]);

  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: defaultValues,
  });

  const selectedLeadId = form.watch("lead_id");
  const { data: leadDetails } = useLead(leadIdFromUrl || selectedLeadId);

  useEffect(() => {
    if (leadIdFromUrl && !form.getValues("lead_id")) {
      form.setValue("lead_id", leadIdFromUrl);
    }
  }, [leadIdFromUrl, form]);

  useEffect(() => {
    if (leadDetails) {
      form.setValue("lead_name", leadDetails.name || leadDetails.title || "", {
        shouldDirty: true,
      });
      form.setValue("gst_number", leadDetails.gst_number || "", {
        shouldDirty: true,
      });
      form.setValue("pan_number", leadDetails.pan_number || "", {
        shouldDirty: true,
      });
    }
  }, [leadDetails, form]);

  useEffect(() => {
    if (!quotationData?.id) {
      const timer = setTimeout(() => {
        if (leadIdFromUrl) {
          if (datePickerRef.current) {
            const dateInput =
              datePickerRef.current.root?.querySelector("input") ||
              datePickerRef.current.querySelector?.("input");

            if (dateInput) {
              dateInput.focus();
            } else if (typeof datePickerRef.current.focus === "function") {
              datePickerRef.current.focus();
            }
          }
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [quotationData?.id, leadIdFromUrl]);

  const watchAll = useWatch({ control: form.control });

  const totals = useMemo(() => {
    const itemsList = watchAll.items || [];
    let sub = 0;
    let tax = 0;

    itemsList.forEach((item) => {
      const amt = Number(item.amount) || 0;
      const gstAmt = Number(item.gst_amount) || 0;

      sub += amt;
      tax += gstAmt;
    });

    const rawTotal = sub + tax;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = roundedTotal - rawTotal;

    return {
      subtotal: sub,
      totalTax: tax,
      grandTotal: roundedTotal,
      roundOff: roundOff,
    };
  }, [watchAll.items]);

  useEffect(() => {
    const words = numberToWords(totals.grandTotal);
    form.setValue("amount_in_words", words, { shouldDirty: true });
    form.setValue("sub_total", totals.subtotal, { shouldDirty: true });
    form.setValue("tax_total", totals.totalTax, { shouldDirty: true });
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
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLElement).tagName !== "TEXTAREA"
          ) {
            if ((e.target as HTMLElement).tagName === "BUTTON") return;

            const isDateInput = (e.target as HTMLElement).closest(
              ".rs-picker-date",
            );
            if (isDateInput) {
              e.preventDefault();
              const firstItemCombobox = document.querySelector(
                '[data-combobox-index="0"] button[role="combobox"]',
              );
              if (firstItemCombobox) {
                (firstItemCombobox as HTMLElement).focus();
              }
              return;
            }

            if ((e.target as HTMLElement).getAttribute("role") === "combobox") {
              (e.target as HTMLElement).click();
              return;
            }

            e.preventDefault();

            const formElement = e.currentTarget;
            const focusableElements = Array.from(
              formElement.querySelectorAll(
                'input:not([disabled]), button:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [role="combobox"]:not([disabled])',
              ),
            );

            const index = focusableElements.indexOf(e.target as any);
            if (index > -1 && index < focusableElements.length - 1) {
              const nextElement = focusableElements[index + 1] as HTMLElement;
              nextElement.focus();
            }
          }
        }}
        className="space-y-4 pt-2"
      >
        <Card className="bg-muted/5 border-border/40 overflow-hidden shadow-none mb-2">
          <CardContent className="p-2 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="lead_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <div className="flex items-center gap-2">
                      <QuotationFormLabel required className="text-[11px]">
                        Customer / Lead
                      </QuotationFormLabel>
                    </div>
                    <FormControl>
                      <Combobox
                        options={leadOptions}
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          setLeadSearch("");
                        }}
                        disabled={!!leadIdFromUrl}
                        placeholder="Select Customer / Lead"
                        searchPlaceholder="Search leads..."
                        searchValue={leadSearch}
                        onSearchChange={setLeadSearch}
                        selectedLabel={watchAll.lead_name || undefined}
                        className="h-9 border-border/60 rounded-sm"
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
                      ref={datePickerRef}
                      value={field.value}
                      onChange={(v) => field.onChange(v || "")}
                      className="h-10 border-border/60 rounded-sm"
                    />
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Customer Details Display - Compact */}
            {selectedLeadId && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <div className="flex flex-wrap gap-6 bg-muted/20 rounded-sm border border-border/10">
                  {(() => {
                    const displayEmail =
                      leadDetails?.email ||
                      (quotationData as any)?.lead_email ||
                      "—";
                    const displayPhone =
                      leadDetails?.phone ||
                      (quotationData as any)?.lead_phone ||
                      "—";
                    const displayGst =
                      leadDetails?.gst_number ||
                      (quotationData as any)?.gst_number ||
                      "—";

                    return (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            Email
                          </span>
                          <span className="text-[11px] font-bold text-foreground">
                            {displayEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-border/20 pl-6">
                          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            Phone
                          </span>
                          <span className="text-[11px] font-bold text-foreground">
                            {displayPhone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-border/20 pl-6">
                          <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                            GST
                          </span>
                          <span className="text-[11px] font-mono font-bold text-primary">
                            {displayGst}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <QuotationProductsTable />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                Notes & Additional Info
              </h3>
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <QuotationFormLabel>Additional Notes</QuotationFormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Priority customer - first order"
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount_in_words"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <QuotationFormLabel>Amount in Words</QuotationFormLabel>
                    <FormControl>
                      <div className="min-h-[40px] p-3 text-[10px] font-bold text-muted-foreground bg-muted/30 border border-border/40 rounded-sm leading-relaxed uppercase tracking-tight italic">
                        {field.value || "Zero Only"}
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-border/20">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                Pricing Summary
              </h3>
            </div>

            <Card className="border-border/40 shadow-none bg-card border-l-4 border-l-primary overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Base Amount
                    </span>
                    <span className="text-sm font-bold font-mono">
                      ₹
                      {totals.subtotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      Appl. Tax (GST)
                    </span>
                    <span className="text-sm font-bold font-mono tracking-tight">
                      +₹
                      {totals.totalTax.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {Math.abs(totals.roundOff) > 0.001 && (
                    <div className="flex justify-between items-center text-muted-foreground italic">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                        Round Off
                      </span>
                      <span className="text-[11px] font-bold font-mono tracking-tight">
                        {totals.roundOff > 0 ? "+" : ""}
                        {totals.roundOff.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">
                    Final Payable
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-foreground tracking-tighter font-mono">
                      ₹
                      {totals.grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      INR
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default QuotationForm;
