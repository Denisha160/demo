import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search, MapPin } from "lucide-react";
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
import { useListCity } from "@/hooks/useCityStateCountry";
import { useDebounce } from "@/hooks/useDebounce";

const verifyFormSchema = z.object({
  property_type: z.string().min(1, "Property Type is required"),
  property_name: z.string().min(1, "Property Name is required").max(100),
  number_of_properties: z.coerce
    .number()
    .int()
    .min(1, "At least 1 property is required"),
  cities_of_operation: z.array(z.string()).default([]),
  total_staff: z.coerce.number().int().min(0).optional().nullable(),
  years_of_experience: z.coerce.number().int().min(0).optional().nullable(),
  annual_turnover: z.coerce
    .number({
      required_error: "Annual turnover is required",
      invalid_type_error: "Annual turnover must be a number",
    })
    .min(0, "Annual turnover must be a positive number"),
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
  customer_type: z.string().min(1, "Customer Type is required"),
  verification_notes: z.string().optional().nullable(),
});

type VerifyFormData = z.infer<typeof verifyFormSchema>;

interface VerifyLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  initialData?: VerifyFormData & {
    warehouse_location?: string | null;
    warehouse_size?: number | null;
    showroom_location?: string | null;
    showroom_size?: number | null;
    verification_notes?: string | null;
  };
}

export default function VerifyLeadModal({
  open,
  onClose,
  leadId,
  initialData,
}: VerifyLeadModalProps) {
  const verifyMutation = useVerifyLead();
  const updateMutation = useUpdateVerifyLead();
  const [citySearch, setCitySearch] = useState("");
  const debouncedCitySearch = useDebounce(citySearch, 300);

  const { data: cityResults, isLoading: isCitiesLoading } = useListCity({
    search: debouncedCitySearch,
    limit: 10,
    combobox: true,
  });

  const cityOptions = useMemo(() => {
    return (cityResults?.items || []).map((c) => ({
      label: `${c.name}, ${c.state_name || ""}, ${c.country_name || ""}`
        .replace(/, , /g, ", ")
        .trim(),
      value: `${c.name}, ${c.state_name || ""}, ${c.country_name || ""}`
        .replace(/, , /g, ", ")
        .trim(),
    }));
  }, [cityResults]);

  const isEditing = !!initialData;
  const activeMutation = isEditing ? updateMutation : verifyMutation;

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      has_warehouse: false,
      has_showroom: false,
      has_delivery_vehicles: false,
      number_of_vehicles: 0,
      total_staff: "" as any,
      years_of_experience: "" as any,
      annual_turnover: "" as any,
      number_of_properties: "" as any,
      property_type: "" as any,
      property_name: "",
      customer_type: "" as any,
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
          total_staff: initialData.total_staff ?? undefined,
          years_of_experience: initialData.years_of_experience ?? undefined,
          annual_turnover: initialData.annual_turnover ?? 0,
          number_of_properties: initialData.number_of_properties ?? 1,
          property_type: initialData.property_type || ("OTHER" as any),
          property_name: initialData.property_name || "",
          customer_type: initialData.customer_type || ("DEALER" as any),
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
      setCitySearch("");
    }
  }, [open, form, initialData]);

  const cities = form.watch("cities_of_operation") || [];

  const handleSelectCity = (val: string) => {
    if (val && !cities.includes(val)) {
      form.setValue("cities_of_operation", [...cities, val], {
        shouldDirty: true,
      });
      setCitySearch("");
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

  const formatLabel = (s: string) =>
    s
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const propertyTypes = [
    "HOTEL",
    "RESTAURANT",
    "CHAIN_PROPERTY",
    "RESORT",
    "SPA",
    "OTHER",
  ].map((v) => ({ label: formatLabel(v), value: v }));

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
  ].map((v) => ({ label: formatLabel(v), value: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBg="bg-primary/10"
      description={
        isEditing
          ? "Update verification details."
          : "Create a new verification for this lead."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                    <Input
                      className="h-9 text-xs"
                      {...field}
                      placeholder="Enter Property name"
                    />
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
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      {...field}
                      placeholder="Enter number of properties"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="space-y-1.5 flex flex-col">
              <Label className="text-xs font-bold flex gap-1">
                Cities of Operation
              </Label>
              <Combobox
                options={cityOptions}
                onValueChange={handleSelectCity}
                placeholder="Search and select city..."
                searchPlaceholder="Type city name..."
                searchValue={citySearch}
                onSearchChange={setCitySearch}
                className="h-9 text-xs"
                emptyText={
                  isCitiesLoading ? "Searching..." : "No cities found."
                }
              />
              <div className="flex flex-wrap gap-1 mt-1">
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
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      {...field}
                      placeholder="Enter total staff"
                    />
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
                    <Input
                      type="number"
                      className="h-9 text-xs"
                      {...field}
                      placeholder="Enter years of experience"
                    />
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
                    Annual Turnover <span className="text-destructive">*</span>
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
            <div className="space-y-2 p-3 mt-1 rounded-xl border border-border/40 bg-muted/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {form.watch("has_warehouse") && (
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="warehouse_location"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs font-bold">
                            Warehouse Location
                          </FormLabel>
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
                          <FormLabel className="text-xs font-bold">
                            Size (sqft)
                          </FormLabel>
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
                          <FormLabel className="text-xs font-bold">
                            Showroom Location
                          </FormLabel>
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
                          <FormLabel className="text-xs font-bold">
                            Size (sqft)
                          </FormLabel>
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
            <div className="mt-2 p-2 rounded-xl border border-border/40 bg-muted/5">
              <div className="overflow-x-auto rounded-lg border border-border/20">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-background/50 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-3 py-2 border-r border-border/10">
                        Type
                      </th>
                      <th className="px-3 py-2 border-r border-border/10">
                        Model
                      </th>
                      <th className="px-3 py-2 border-r border-border/10">
                        Reg No
                      </th>
                      <th className="px-3 py-2 border-r border-border/10">
                        Capacity
                      </th>
                      <th className="px-3 py-2 text-center w-10">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {fields.map((field, index) => (
                      <tr
                        key={field.id}
                        className="bg-background/30 hover:bg-background/50 transition-colors"
                      >
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
                            name={
                              `vehicle_details.${index}.registration` as const
                            }
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
