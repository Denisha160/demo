import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useVerifyLead,
  useUpdateVerifyLead,
} from "@/hooks/useLeadVerification";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const verifyFormSchema = z.object({
  property_type: z.enum(
    ["HOTEL", "RESTAURANT", "CHAIN_PROPERTY", "RESORT", "SPA", "OTHER"],
    {
      required_error: "Property Type is required",
    },
  ),
  property_name: z.string().min(1, "Property Name is required").max(100),
  number_of_properties: z.coerce
    .number()
    .int()
    .min(1, "At least 1 property is required"),
  cities_of_operation: z.array(z.string()).default([]),
  total_staff: z.coerce.number().int().min(0).optional(),
  years_of_experience: z.coerce.number().int().min(0).optional(),
  annual_turnover: z.coerce.number().optional(),
  has_warehouse: z.boolean().default(false),
  warehouse_location: z.string().max(255).optional().nullable(),
  warehouse_size: z.coerce.number().optional().nullable(),
  has_showroom: z.boolean().default(false),
  showroom_location: z.string().max(255).optional().nullable(),
  showroom_size: z.coerce.number().optional().nullable(),
  has_delivery_vehicles: z.boolean().default(false),
  number_of_vehicles: z.coerce.number().int().min(0).default(0),
  vehicle_details: z
    .array(
      z.object({
        type: z.string(),
        model: z.string(),
        registration: z.string(),
        capacity: z.string(),
      }),
    )
    .default([]),
  customer_type: z.enum(
    [
      "DEALER",
      "DISTRIBUTOR",
      "RETAIL",
      "HOTEL",
      "RESORT",
      "CHAIN_HOTEL_RESORT",
      "SPA_WELLNESS",
      "CONSULTANT",
      "SCHOOL",
      "HOSPITAL",
      "CORPORATE_OFFICE",
      "BANK",
      "BUILDER",
    ],
    {
      required_error: "Customer Type is required",
    },
  ),
  verification_notes: z.string().optional().nullable(),
});

type VerifyFormData = z.infer<typeof verifyFormSchema>;

interface VerifyLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  initialData?: any;
}

export default function VerifyLeadModal({
  open,
  onClose,
  leadId,
  initialData,
}: VerifyLeadModalProps) {
  const verifyMutation = useVerifyLead();
  const updateMutation = useUpdateVerifyLead();
  const [cityInput, setCityInput] = useState("");

  const isEditing = !!initialData;
  const activeMutation = isEditing ? updateMutation : verifyMutation;

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      has_warehouse: false,
      has_showroom: false,
      has_delivery_vehicles: false,
      number_of_vehicles: 0,
      total_staff: 0,
      years_of_experience: 0,
      annual_turnover: 0,
      number_of_properties: 1,
      property_type: "OTHER" as const,
      customer_type: "RETAIL" as const,
      cities_of_operation: [],
      vehicle_details: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicle_details",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          has_warehouse: initialData.has_warehouse ?? false,
          has_showroom: initialData.has_showroom ?? false,
          has_delivery_vehicles: initialData.has_delivery_vehicles ?? false,
          number_of_vehicles: initialData.number_of_vehicles ?? 0,
          total_staff: initialData.total_staff ?? 0,
          years_of_experience: initialData.years_of_experience ?? 0,
          annual_turnover: initialData.annual_turnover ?? 0,
          number_of_properties: initialData.number_of_properties ?? 1,
          property_type: initialData.property_type ?? "OTHER",
          property_name: initialData.property_name ?? "",
          customer_type: initialData.customer_type ?? "RETAIL",
          warehouse_location: initialData.warehouse_location ?? "",
          warehouse_size: initialData.warehouse_size ?? null,
          showroom_location: initialData.showroom_location ?? "",
          showroom_size: initialData.showroom_size ?? null,
          cities_of_operation: initialData.cities_of_operation || [],
          vehicle_details: initialData.vehicle_details || [],
          verification_notes: initialData.verification_notes ?? "",
        });
      } else {
        form.reset();
      }
      setCityInput("");
    }
  }, [open, form, initialData]);

  const cities = form.watch("cities_of_operation") || [];

  const handleAddCity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && cityInput.trim()) {
      e.preventDefault();
      const val = cityInput.replace(",", "").trim();
      if (val && !cities.includes(val)) {
        form.setValue("cities_of_operation", [...cities, val], {
          shouldDirty: true,
        });
        setCityInput("");
      }
    } else if (e.key === "Backspace" && !cityInput && cities.length > 0) {
      e.preventDefault();
      const newCities = [...cities];
      newCities.pop();
      form.setValue("cities_of_operation", newCities, { shouldDirty: true });
    }
  };

  const removeCity = (index: number) => {
    form.setValue(
      "cities_of_operation",
      cities.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  const onSubmit = (data: VerifyFormData) => {
    const payload = {
      ...data,
      number_of_vehicles: data.has_delivery_vehicles
        ? data.vehicle_details.length
        : 0,
      documents: [],
    };
    activeMutation.mutate(
      { leadId, data: payload },
      {
        onSuccess: () => {
          onClose();
          if (!isEditing) form.reset();
        },
      },
    );
  };

  const propertyTypes = [
    "HOTEL",
    "RESTAURANT",
    "CHAIN_PROPERTY",
    "RESORT",
    "SPA",
    "OTHER",
  ].map((v) => ({ label: v, value: v }));
  const customerTypes = [
    "DEALER",
    "DISTRIBUTOR",
    "RETAIL",
    "HOTEL",
    "RESORT",
    "CHAIN_HOTEL_RESORT",
    "SPA_WELLNESS",
    "CONSULTANT",
    "SCHOOL",
    "HOSPITAL",
    "CORPORATE_OFFICE",
    "BANK",
    "BUILDER",
  ].map((v) => ({ label: v, value: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBg="bg-primary/10"
      description={
        isEditing ? "Update verification details." : "Create a new verification for this lead."
      }
      title={isEditing ? "Edit Verification Details" : "Verify Lead Details"}
      maxWidth="sm:max-w-[800px]"
      footer={
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={activeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={activeMutation.isPending}
          >
            {isEditing ? "Update Verification" : "Submit Verification"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          className="max-h-[65vh] overflow-y-auto pr-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer_type"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold flex gap-1">
                    Customer Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={customerTypes}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select customer type"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="property_type"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold flex gap-1">
                    Property Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={propertyTypes}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select property type"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="property_name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold flex gap-1">
                    Property Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input className="h-9 text-xs" {...field} placeholder="Enter Property name" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="number_of_properties"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold flex gap-1">
                    Number of Properties{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="h-9 text-xs" {...field} placeholder="Enter number of properties" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="space-y-1.5 flex flex-col">
              <Label className="text-xs font-bold flex gap-1">
                Cities of Operation
              </Label>
              <Input
                placeholder="Type city and press Enter"
                className="h-9 text-xs"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={handleAddCity}
              />
              <div className="flex flex-wrap gap-1 mt-1.5 min-h-[24px]">
                {cities.map((city, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="px-2 py-0.5 text-[10px] flex items-center gap-1 group"
                  >
                    {city}
                    <X
                      className="h-3 w-3 cursor-pointer text-muted-foreground group-hover:text-destructive transition-colors"
                      onClick={() => removeCity(idx)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="total_staff"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold">
                    Total Staff
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="h-9 text-xs" {...field} placeholder="Enter total staff" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="years_of_experience"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold">
                    Years of Experience
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="h-9 text-xs" {...field} placeholder="Enter years of experience" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annual_turnover"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold">
                    Annual Turnover
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="h-9 text-xs"
                      {...field}
                      placeholder="Enter annual turnover"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="verification_notes"
              render={({ field }) => (
                <FormItem className="space-y-1.5 col-span-1 md:col-span-2">
                  <FormLabel className="text-xs font-bold">
                    Verification Notes
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] text-xs resize-none"
                      {...field}
                      value={field.value || ""}
                      placeholder="Add any additional verification notes here..."
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-2">
            <FormField
              control={form.control}
              name="has_warehouse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-3 rounded-lg border border-border/50 bg-accent/5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-semibold cursor-pointer">
                    Has Warehouse
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="has_showroom"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-3 rounded-lg border border-border/50 bg-accent/5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-semibold cursor-pointer">
                    Has Showroom
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="has_delivery_vehicles"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-3 rounded-lg border border-border/50 bg-accent/5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);
                        if (val && fields.length === 0) {
                          append({
                            type: "",
                            model: "",
                            registration: "",
                            capacity: "",
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-semibold cursor-pointer">
                    Has Vehicles
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          {(form.watch("has_warehouse") || form.watch("has_showroom")) && (
            <div className="space-y-2 p-4 mt-2 rounded-xl border border-border/40 bg-muted/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {form.watch("has_warehouse") && (
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="warehouse_location"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-bold">Warehouse Location</FormLabel>
                          <FormControl>
                            <Input
                              className="h-8 text-xs"
                              {...field}
                              value={field.value || ""}
                              placeholder="Location"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="warehouse_size"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-bold">Size (sqft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              {...field}
                              value={field.value || ""}
                              placeholder="Size"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {form.watch("has_showroom") && (
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="showroom_location"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-bold">Showroom Location</FormLabel>
                          <FormControl>
                            <Input
                              className="h-8 text-xs"
                              {...field}
                              value={field.value || ""}
                              placeholder="Location"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="showroom_size"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-bold">Size (sqft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-8 text-xs"
                              {...field}
                              value={field.value || ""}
                              placeholder="Size"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {form.watch("has_delivery_vehicles") && (
            <div className="mt-4 p-4 rounded-xl border border-border/40 bg-muted/5">

              <div className="overflow-x-auto rounded-lg border border-border/20">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-background/50 text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-3 py-2 border-r border-border/10">Type</th>
                      <th className="px-3 py-2 border-r border-border/10">Model</th>
                      <th className="px-3 py-2 border-r border-border/10">Reg No</th>
                      <th className="px-3 py-2 border-r border-border/10">Capacity</th>
                      <th className="px-3 py-2 text-center w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {fields.map((field, index) => (
                      <tr key={field.id} className="bg-background/30 hover:bg-background/50 transition-colors">
                        <td className="p-1 border-r border-border/10">
                          <FormField
                            control={form.control}
                            name={`vehicle_details.${index}.type` as const}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    placeholder="Truck, Van..."
                                    className="h-8 border-0 bg-transparent text-xs focus-visible:ring-0 shadow-none px-2"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="p-1 border-r border-border/10">
                          <FormField
                            control={form.control}
                            name={`vehicle_details.${index}.model` as const}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    placeholder="Tata, etc."
                                    className="h-8 border-0 bg-transparent text-xs focus-visible:ring-0 shadow-none px-2"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="p-1 border-r border-border/10">
                          <FormField
                            control={form.control}
                            name={`vehicle_details.${index}.registration` as const}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    placeholder="Reg No"
                                    className="h-8 border-0 bg-transparent text-xs uppercase focus-visible:ring-0 shadow-none px-2"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="p-1 border-r border-border/10">
                          <FormField
                            control={form.control}
                            name={`vehicle_details.${index}.capacity` as const}
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <FormControl>
                                  <Input
                                    placeholder="Capacity"
                                    className="h-8 border-0 bg-transparent text-xs focus-visible:ring-0 shadow-none px-2"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="p-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs w-full sm:w-auto"
                  onClick={() =>
                    append({
                      type: "",
                      model: "",
                      registration: "",
                      capacity: "",
                    })
                  }
                >
                  Add Vehicle
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </Modal>
  );
}
