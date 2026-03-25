import { useEffect, useMemo } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  UseFormSetError,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
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
import { formatDate, formatDateForAPI, parseFormattedDate } from "@/utils/date";

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

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().min(0, "Value must be 0 or more").optional());

const requiredNumber = z.preprocess(
  (value) => {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }

    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  },
  z.number().min(0, "Value must be 0 or more"),
);

const keyValueSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: requiredNumber,
});

const quotationSchema = z
  .object({
    quotation_number: z
      .string()
      .min(1, "Quotation number is required")
      .max(50, "Maximum 50 characters"),
    quotation_date: z.string().min(1, "Quotation date is required"),
    valid_until: optionalText,
    status: z.enum(quotationStatuses),

    customer_name: z
      .string()
      .min(1, "Customer name is required")
      .max(255, "Maximum 255 characters"),
    customer_email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    customer_phone: optionalText,
    customer_address: optionalText,
    customer_gst: optionalText,
    customer_pan: optionalText,

    contact_person_id: optionalText,
    contact_person_name: optionalText,
    contact_person_email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    contact_person_phone: optionalText,
    contact_person_designation: optionalText,

    subtotal: requiredNumber,
    discount_type: z.enum(discountTypes).optional(),
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
    accepted_at: optionalText,
    accepted_by: optionalText,
    rejected_reason: optionalText,
    cancelled_reason: optionalText,

    requires_approval: z.boolean(),
    approval_status: optionalText,
    approved_by: optionalText,
    approved_at: optionalText,
    approval_remarks: optionalText,
  })
  .superRefine((data, ctx) => {
    const validUntilDate = parseFormattedDate(data.valid_until);
    const quotationDate = parseFormattedDate(data.quotation_date);
    const expectedDeliveryDate = parseFormattedDate(data.expected_delivery_date);
 
    if (
      validUntilDate &&
      quotationDate &&
      validUntilDate < quotationDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["valid_until"],
        message: "Valid until must be on or after quotation date",
      });
    }
 
    if (
      expectedDeliveryDate &&
      quotationDate &&
      expectedDeliveryDate < quotationDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expected_delivery_date"],
        message: "Expected delivery date must be on or after quotation date",
      });
    }

    if (data.discount_type && data.discount_value === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount_value"],
        message: "Discount value is required when discount type is selected",
      });
    }

    if (
      data.discount_type === "PERCENTAGE" &&
      (data.discount_value ?? 0) > 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discount_value"],
        message: "Percentage discount cannot exceed 100",
      });
    }
  });

export type QuotationFormData = z.infer<typeof quotationSchema>;

export interface Quotation extends QuotationFormData {
  id: string;
  created_at: string;
}

interface QuotationModalProps {
  open: boolean;
  onClose: () => void;
  quotationData?: Quotation | null;
  onSave: (
    data: QuotationFormData,
    setError: UseFormSetError<QuotationFormData>,
  ) => void;
  isSubmitting?: boolean;
}

const createQuotationNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QT-${year}-${random}`;
};

const defaultValues: QuotationFormData = {
  quotation_number: "",
  quotation_date: formatDate(new Date()),
  valid_until: "",
  status: "DRAFT",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  customer_address: "",
  customer_gst: "",
  customer_pan: "",
  contact_person_id: "",
  contact_person_name: "",
  contact_person_email: "",
  contact_person_phone: "",
  contact_person_designation: "",
  subtotal: 0,
  discount_type: undefined,
  discount_value: undefined,
  tax_details: [],
  total_tax_amount: 0,
  additional_charges: [],
  total_additional_charges: 0,
  amount_in_words: "",
  payment_terms: undefined,
  payment_terms_custom: "",
  delivery_terms: undefined,
  delivery_terms_custom: "",
  delivery_charges: 0,
  delivery_address: "",
  expected_delivery_date: "",
  notes: "",
  accepted_at: "",
  accepted_by: "",
  rejected_reason: "",
  cancelled_reason: "",
  requires_approval: false,
  approval_status: "",
  approved_by: "",
  approved_at: "",
  approval_remarks: "",
};

const formatEnumLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");

const toSafeNumber = (value?: number) =>
  typeof value === "number" && !Number.isNaN(value) ? value : 0;

const QuotationModal = ({
  open,
  onClose,
  quotationData,
  onSave,
  isSubmitting,
}: QuotationModalProps) => {
  const form = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues,
  });

  const {
    fields: taxFields,
    append: appendTax,
    remove: removeTax,
  } = useFieldArray({
    control: form.control,
    name: "tax_details",
  });

  const {
    fields: chargeFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({
    control: form.control,
    name: "additional_charges",
  });

  const subtotal = useWatch({ control: form.control, name: "subtotal" });
  const discountType = useWatch({
    control: form.control,
    name: "discount_type",
  });
  const discountValue = useWatch({
    control: form.control,
    name: "discount_value",
  });
  const taxDetails = useWatch({ control: form.control, name: "tax_details" });
  const additionalCharges = useWatch({
    control: form.control,
    name: "additional_charges",
  });
  const deliveryCharges = useWatch({
    control: form.control,
    name: "delivery_charges",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (quotationData) {
      form.reset({
        ...defaultValues,
        ...quotationData,
        tax_details: quotationData.tax_details || [],
        additional_charges: quotationData.additional_charges || [],
      });
      return;
    }

    form.reset({
      ...defaultValues,
      quotation_number: createQuotationNumber(),
    });
  }, [open, quotationData, form]);

  const discountAmount = useMemo(() => {
    const safeSubtotal = toSafeNumber(subtotal);
    const safeDiscountValue = toSafeNumber(discountValue);

    if (discountType === "PERCENTAGE") {
      return (safeSubtotal * safeDiscountValue) / 100;
    }

    if (discountType === "FIXED") {
      return safeDiscountValue;
    }

    return 0;
  }, [discountType, discountValue, subtotal]);

  const totalTaxAmount = useMemo(
    () =>
      (taxDetails || []).reduce(
        (sum, item) => sum + toSafeNumber(item?.value),
        0,
      ),
    [taxDetails],
  );

  const totalAdditionalCharges = useMemo(
    () =>
      (additionalCharges || []).reduce(
        (sum, item) => sum + toSafeNumber(item?.value),
        0,
      ) + toSafeNumber(deliveryCharges),
    [additionalCharges, deliveryCharges],
  );

  const taxableAmount = useMemo(
    () => Math.max(toSafeNumber(subtotal) - discountAmount, 0),
    [discountAmount, subtotal],
  );

  const grandTotal = useMemo(
    () => taxableAmount + totalTaxAmount + totalAdditionalCharges,
    [taxableAmount, totalTaxAmount, totalAdditionalCharges],
  );

  useEffect(() => {
    form.setValue("total_tax_amount", Number(totalTaxAmount.toFixed(2)), {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [form, totalTaxAmount]);

  useEffect(() => {
    form.setValue(
      "total_additional_charges",
      Number(totalAdditionalCharges.toFixed(2)),
      {
        shouldDirty: true,
        shouldValidate: false,
      },
    );
  }, [form, totalAdditionalCharges]);

  const onSubmit = (data: QuotationFormData) => {
    onSave(
      {
        ...data,
        quotation_date: formatDateForAPI(data.quotation_date) || data.quotation_date,
        valid_until: formatDateForAPI(data.valid_until) || data.valid_until,
        expected_delivery_date: formatDateForAPI(data.expected_delivery_date) || data.expected_delivery_date,
        total_tax_amount: Number(totalTaxAmount.toFixed(2)),
        total_additional_charges: Number(totalAdditionalCharges.toFixed(2)),
      },
      form.setError,
    );
  };

  const renderCurrencyValue = (value: number) => value.toFixed(2);

  return (
    <Modal
      open={open}
      onClose={() => {
        form.reset(defaultValues);
        onClose();
      }}
      headerBg="bg-primary/10"
      title={quotationData ? "Edit Quotation" : "Create Quotation"}
      description="Add all quotation details, pricing, approval info, and delivery terms."
      maxWidth="sm:max-w-6xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              form.reset(defaultValues);
              onClose();
            }}
            className="h-9"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            className="h-9"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? quotationData
                ? "Updating..."
                : "Creating..."
              : quotationData
                ? "Update Quotation"
                : "Create Quotation"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-h-[75vh] space-y-5 overflow-y-auto pr-2 pt-2"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="quotation_number"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> Quotation Number
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Quotation number"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 shrink-0 gap-2"
                      disabled={isSubmitting}
                      onClick={() =>
                        form.setValue(
                          "quotation_number",
                          createQuotationNumber(),
                          { shouldDirty: true },
                        )
                      }
                    >
                      <RefreshCw className="h-4 w-4" />
                      Random
                    </Button>
                  </div>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {quotationStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {formatEnumLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="quotation_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> Quotation Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={(value) => field.onChange(value || "")}
                      className="h-9 text-xs rounded-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valid_until"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">
                    Valid Until
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={(value) => field.onChange(value || "")}
                      className="h-9 text-xs rounded-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expected_delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">
                    Expected Delivery Date
                  </FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={(value) => field.onChange(value || "")}
                      className="h-9 text-xs rounded-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-sm font-semibold">Customer Details</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold flex gap-1">
                      <span className="text-destructive">*</span> Customer Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer name"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Customer Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer email"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      Customer Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer phone"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_gst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Customer GST
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer GST"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      Customer PAN
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer PAN"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold">
                      Customer Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Customer address"
                        className="min-h-[90px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-sm font-semibold">Contact Person</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contact_person_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Contact Person ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UUID"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_person_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Contact Person Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contact person name"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      Contact Person Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contact email"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      Contact Person Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contact phone"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
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
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Designation
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Designation"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-sm font-semibold">Pricing</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="subtotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold flex gap-1">
                      <span className="text-destructive">*</span> Subtotal
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Discount Type
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? undefined : value)
                      }
                      value={field.value ?? "NONE"}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">No Discount</SelectItem>
                        {discountTypes.map((item) => (
                          <SelectItem key={item} value={item}>
                            {formatEnumLabel(item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Discount Value
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 text-xs"
                        disabled={isSubmitting || !discountType}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Discount Amount
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {renderCurrencyValue(discountAmount)}
                </p>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Taxable Amount
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {renderCurrencyValue(taxableAmount)}
                </p>
              </div>
              <div className="rounded-md bg-muted/40 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Total Tax
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {renderCurrencyValue(totalTaxAmount)}
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-3">
                <p className="text-[10px] uppercase text-muted-foreground">
                  Grand Total
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {renderCurrencyValue(grandTotal)}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Tax Details</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-2"
                  onClick={() => appendTax({ key: "", value: 0 })}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  Add Tax
                </Button>
              </div>

              {taxFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tax rows added.
                </p>
              ) : (
                <div className="space-y-3">
                  {taxFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_44px]"
                    >
                      <FormField
                        control={form.control}
                        name={`tax_details.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Tax name"
                                className="h-9 text-xs"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`tax_details.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="h-9 text-xs"
                                disabled={isSubmitting}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isSubmitting}
                        onClick={() => removeTax(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Additional Charges</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-2"
                  onClick={() => appendCharge({ key: "", value: 0 })}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4" />
                  Add Charge
                </Button>
              </div>

              {chargeFields.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No additional charge rows added.
                </p>
              ) : (
                <div className="space-y-3">
                  {chargeFields.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_44px]"
                    >
                      <FormField
                        control={form.control}
                        name={`additional_charges.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder="Charge name"
                                className="h-9 text-xs"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`additional_charges.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="h-9 text-xs"
                                disabled={isSubmitting}
                                {...field}
                                value={field.value ?? ""}
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                              />
                            </FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={isSubmitting}
                        onClick={() => removeCharge(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="delivery_charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Delivery Charges
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Total Tax Amount
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-9 text-xs bg-muted/60"
                        readOnly
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_additional_charges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Total Additional Charges
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-9 text-xs bg-muted/60"
                        readOnly
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-sm font-semibold">Terms and Delivery</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Payment Terms
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? undefined : value)
                      }
                      value={field.value ?? "NONE"}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Not Selected</SelectItem>
                        {paymentTermsOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {formatEnumLabel(item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_terms_custom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Payment Terms Custom
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Custom payment terms"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Delivery Terms
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "NONE" ? undefined : value)
                      }
                      value={field.value ?? "NONE"}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select delivery terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">Not Selected</SelectItem>
                        {deliveryTermsOptions.map((item) => (
                          <SelectItem key={item} value={item}>
                            {formatEnumLabel(item)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_terms_custom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Delivery Terms Custom
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Custom delivery terms"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold">
                      Delivery Address
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Delivery address"
                        className="min-h-[90px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
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
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold">
                      Amount In Words
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Amount in words"
                        className="min-h-[80px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-sm font-semibold">Approval and Outcome</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requires_approval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 rounded-md border p-3 md:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div>
                      <FormLabel className="text-xs font-bold">
                        Requires Approval
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground">
                        Enable this checkbox if this quotation needs approval.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approval_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Approval Status
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Approval status"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approved_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Approved By
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="User ID"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approved_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Approved At
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={(value) => field.onChange(value || "")}
                        className="h-9 text-xs rounded-sm"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accepted_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Accepted At
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={(value) => field.onChange(value || "")}
                        className="h-9 text-xs rounded-sm"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accepted_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Accepted By
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="User ID"
                        className="h-9 text-xs"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rejected_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Rejected Reason
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Rejected reason"
                        className="min-h-[80px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancelled_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Cancelled Reason
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cancelled reason"
                        className="min-h-[80px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approval_remarks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-xs font-bold">
                      Approval Remarks
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Approval remarks"
                        className="min-h-[80px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-4 text-sm font-semibold">Notes</h3>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Quotation notes"
                        className="min-h-[110px] text-xs resize-none"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default QuotationModal;
