import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { useVerifyLead } from "@/hooks/useLeadVerification";

const verifyFormSchema = z.object({
  property_type: z.enum(['HOTEL', 'RESTAURANT', 'CHAIN_PROPERTY', 'RESORT', 'SPA', 'OTHER']),
  property_name: z.string().max(100).min(1, "Required"),
  number_of_properties: z.coerce.number().int().min(1, "Required"),
  cities_of_operation: z.array(z.string()).default([]),
  total_staff: z.coerce.number().int().min(0),
  years_of_experience: z.coerce.number().int().min(0),
  annual_turnover: z.coerce.number(),
  has_warehouse: z.boolean().default(false),
  warehouse_location: z.string().max(255).optional().nullable(),
  warehouse_size: z.coerce.number().optional().nullable(),
  has_showroom: z.boolean().default(false),
  showroom_location: z.string().max(255).optional().nullable(),
  showroom_size: z.coerce.number().optional().nullable(),
  has_delivery_vehicles: z.boolean().default(false),
  number_of_vehicles: z.coerce.number().int().min(0).default(0),
  vehicle_details: z.array(z.object({
    type: z.string(),
    model: z.string(),
    registration: z.string(),
    capacity: z.string()
  })).default([]),
  customer_type: z.enum([
    'DEALER', 'DISTRIBUTOR', 'RETAIL', 'HOTEL', 'RESORT',
    'CHAIN_HOTEL_RESORT', 'SPA_WELLNESS', 'CONSULTANT',
    'SCHOOL', 'HOSPITAL', 'CORPORATE_OFFICE', 'BANK', 'BUILDER'
  ]),
  verification_notes: z.string().optional().nullable(),
});

type VerifyFormData = z.infer<typeof verifyFormSchema>;

interface VerifyLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
}

export default function VerifyLeadModal({ open, onClose, leadId }: VerifyLeadModalProps) {
  const verifyMutation = useVerifyLead();
  const [cityInput, setCityInput] = useState("");

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
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "vehicle_details",
  });

  useEffect(() => {
    if (open) {
      form.reset();
      setCityInput("");
    }
  }, [open, form]);

  const cities = form.watch("cities_of_operation") || [];

  const handleAddCity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = cityInput.trim();
      if (val && !cities.includes(val)) {
        form.setValue("cities_of_operation", [...cities, val], { shouldDirty: true });
        setCityInput("");
      }
    }
  };

  const removeCity = (index: number) => {
    form.setValue("cities_of_operation", cities.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const onSubmit = (data: VerifyFormData) => {
    const payload = {
      ...data,
      documents: [],
    };
    verifyMutation.mutate({ leadId, data: payload }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const propertyTypes = ['HOTEL', 'RESTAURANT', 'CHAIN_PROPERTY', 'RESORT', 'SPA', 'OTHER'].map(v => ({ label: v, value: v }));
  const customerTypes = ['DEALER', 'DISTRIBUTOR', 'RETAIL', 'HOTEL', 'RESORT', 'CHAIN_HOTEL_RESORT', 'SPA_WELLNESS', 'CONSULTANT', 'SCHOOL', 'HOSPITAL', 'CORPORATE_OFFICE', 'BANK', 'BUILDER'].map(v => ({ label: v, value: v }));

  return (
    <Modal open={open} onClose={onClose} title="Verify Lead Details" maxWidth="sm:max-w-[800px]"
      footer={
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={onClose} disabled={verifyMutation.isPending}>Cancel</Button>
          <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={verifyMutation.isPending}>Submit Verification</Button>
        </div>
      }>
      <form className="max-h-[65vh] overflow-y-auto pr-2 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Customer Type *</Label>
            <Combobox options={customerTypes} value={form.watch("customer_type")} onValueChange={(val) => form.setValue("customer_type", val as any)} placeholder="Select customer type" />
          </div>
          <div className="space-y-1.5">
            <Label>Property Type *</Label>
            <Combobox options={propertyTypes} value={form.watch("property_type")} onValueChange={(val) => form.setValue("property_type", val as any)} placeholder="Select property type" />
          </div>
          <div className="space-y-1.5">
            <Label>Property Name *</Label>
            <Input {...form.register("property_name")} />
          </div>

          <div className="space-y-1.5">
            <Label>Number of Properties *</Label>
            <Input type="number" {...form.register("number_of_properties")} />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <Label>Cities of Operation</Label>
            <div className="flex flex-wrap gap-1 mb-1">
              {cities.map((city, idx) => (
                <Badge key={idx} variant="secondary" className="px-1.5 py-0">
                  {city} 
                  <X className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" onClick={() => removeCity(idx)} />
                </Badge>
              ))}
            </div>
            <Input 
              placeholder="Type city and press Enter" 
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={handleAddCity}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Total Staff *</Label>
            <Input type="number" {...form.register("total_staff")} />
          </div>

          <div className="space-y-1.5">
            <Label>Years of Experience *</Label>
            <Input type="number" {...form.register("years_of_experience")} />
          </div>
          <div className="space-y-1.5">
            <Label>Annual Turnover *</Label>
            <Input type="number" step="0.01" {...form.register("annual_turnover")} />
          </div>

          <div className="space-y-1.5">
            <Label>Verification Notes</Label>
            <Input {...form.register("verification_notes")} />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="has_warehouse" checked={form.watch("has_warehouse")} onCheckedChange={(val) => form.setValue("has_warehouse", val as boolean)} />
            <Label htmlFor="has_warehouse" className="cursor-pointer">Has Warehouse</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="has_showroom" checked={form.watch("has_showroom")} onCheckedChange={(val) => form.setValue("has_showroom", val as boolean)} />
            <Label htmlFor="has_showroom" className="cursor-pointer">Has Showroom</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="has_delivery_vehicles" checked={form.watch("has_delivery_vehicles")} onCheckedChange={(val) => form.setValue("has_delivery_vehicles", val as boolean)} />
            <Label htmlFor="has_delivery_vehicles" className="cursor-pointer">Has Vehicles</Label>
          </div>
        </div>

        {(form.watch("has_warehouse") || form.watch("has_showroom")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            {form.watch("has_warehouse") && (
              <>
                <div className="space-y-1.5">
                  <Label>Warehouse Location</Label>
                  <Input {...form.register("warehouse_location")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Warehouse Size</Label>
                  <Input type="number" step="0.01" {...form.register("warehouse_size")} />
                </div>
              </>
            )}
            {form.watch("has_showroom") && (
              <>
                <div className="space-y-1.5">
                  <Label>Showroom Location</Label>
                  <Input {...form.register("showroom_location")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Showroom Size</Label>
                  <Input type="number" step="0.01" {...form.register("showroom_size")} />
                </div>
              </>
            )}
          </div>
        )}

        {form.watch("has_delivery_vehicles") && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Number of Vehicles</Label>
                <Input type="number" {...form.register("number_of_vehicles")} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Vehicle Details</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => append({ type: "", model: "", registration: "", capacity: "" })}>Add Vehicle</Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Type</Label>
                    <Input className="h-8 text-xs" {...form.register(`vehicle_details.${index}.type` as const)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Model</Label>
                    <Input className="h-8 text-xs" {...form.register(`vehicle_details.${index}.model` as const)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Registration</Label>
                    <Input className="h-8 text-xs" {...form.register(`vehicle_details.${index}.registration` as const)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Capacity</Label>
                    <Input className="h-8 text-xs" {...form.register(`vehicle_details.${index}.capacity` as const)} />
                  </div>
                  <Button type="button" variant="destructive" size="sm" className="h-8" onClick={() => remove(index)}>Remove</Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
