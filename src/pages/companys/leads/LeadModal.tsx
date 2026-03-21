import { useEffect } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "lucide-react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { ComboboxWithAdd } from "@/components/ui/comboBoxWithAdd";
import { PipelineColumn } from "../../../types/leads";
import { useLeadSources } from "@/hooks/useLeadSource";
import { useLeadStatuses } from "@/hooks/useLeadStatus";
import { useUsers } from "@/hooks/useUsers";
import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import { TagSelector } from "@/components/ui/tag-selector";
import { useLeadTags } from "@/hooks/useLeadTags";

const InterestedCategorySelect = ({ value, onValueChange }: { value?: string, onValueChange: (val: string) => void }) => {
  const { data: categories = [], isLoading } = useCategoriesCombobox();
  const options = categories
    .filter((cat: any) => !!cat.parent_name)
    .map((cat: any) => ({
      value: cat.id,
      label: cat.name,
    }));

  return (
    <Combobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={isLoading ? "Loading..." : "Select Category"}
    />
  );
};

const formSchema = z.object({
  status_id: z.string().min(1, { message: "Status is required" }),
  source_id: z.string().min(1, { message: "Source is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  company_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  alternate_phone: z.string().optional().refine(val => !val || /^[0-9]{10}$/.test(val), "Must be exactly 10 digits").or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  gst_number: z.string().optional().refine(val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(val), "Invalid GST Number format").or(z.literal("")),
  priority: z.string().optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")),
  interested_category_id: z.string().optional().or(z.literal("")),
  tags: z.array(z.object({ id: z.string().optional(), name: z.string() })).optional(),
});

export type LeadFormData = z.infer<typeof formSchema>;

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LeadFormData, setError: UseFormSetError<LeadFormData>) => void;
  addModalCol: string | null;
  columns: PipelineColumn[];
  isSubmitting?: boolean;
}

const LeadModal = ({
  open,
  onClose,
  onSave,
  addModalCol,
  columns,
  isSubmitting = false,
}: LeadModalProps) => {
  const form = useForm<LeadFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_id: "",
      source_id: "",
      name: "",
      company_name: "",
      email: "",
      phone: "",
      alternate_phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      designation: "",
      website: "",
      gst_number: "",
      priority: "HOT",
      assigned_to: "",
      interested_category_id: "",
      tags: [],
    },
  });

  const { data: leadTagsData } = useLeadTags();
  const leadTags = Array.isArray(leadTagsData)
    ? leadTagsData
    : Array.isArray((leadTagsData as any)?.items)
      ? (leadTagsData as any).items
      : [];

  const tagSuggestions = leadTags.map((tag: any) => ({
    id: String(tag.id),
    name: tag.name,
  }));

  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const { data: sourceResponse } = useLeadSources({ limit: 100 });
  const { data: usersResponse } = useUsers({ limit: 100 });
  const users = usersResponse?.items || usersResponse || [];
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

  const statusOptions =
    statusResponse?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const sourceOptions =
    sourceResponse?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  useEffect(() => {
    if (!open) return;

    const defaultColumn = columns.find((column) => column.id === addModalCol);
    form.reset({
      status_id: defaultColumn?.id || "",
      source_id: "",
      name: "",
      company_name: "",
      email: "",
      phone: "",
      alternate_phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      designation: "",
      website: "",
      gst_number: "",
      priority: "HOT",
      assigned_to: "",
      interested_category_id: "",
      tags: [],
    });
  }, [open, addModalCol, columns, form]);

  const handleSubmit = (data: LeadFormData) => {
    const payload = {
      ...data,
      interested_category_id: data.interested_category_id ? [data.interested_category_id] : [],
      tags: data.tags?.length
        ? data.tags.map((t: any) => (t.id ? String(t.id) : t.name))
        : [],
    };

    onSave(payload as any, form.setError);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Lead"
      description={addModalCol ? `Stage: ${columns.find((c) => c.id === addModalCol)?.title}` : ""}
      headerBg="bg-primary/5"
      maxWidth="sm:max-w-[800px] md:max-w-[900px]"
      titleClassName="text-primary font-bold"
      footer={
        <div className="flex w-full gap-2 sm:w-auto">
          <Button variant="outline" size="sm" className="h-9 px-6 text-xs font-semibold rounded-sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" className="h-9 px-8 text-xs font-semibold rounded-sm" onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
            Save Lead
          </Button>
        </div>
      }
    >
      <form className="custom-scrollbar h-[60vh] space-y-4 overflow-y-auto pr-2 pt-2" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span> Status
            </Label>
            <Combobox
              options={statusOptions}
              value={form.watch("status_id")}
              onValueChange={(value) => form.setValue("status_id", value, { shouldValidate: true, shouldDirty: true })}
              placeholder="Select Status"
              className="h-9 w-full"
            />
            {form.formState.errors.status_id && <p className="text-[10px] text-destructive">{form.formState.errors.status_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span> Source
            </Label>
            <Combobox
              options={sourceOptions}
              value={form.watch("source_id")}
              onValueChange={(value) => form.setValue("source_id", value, { shouldValidate: true, shouldDirty: true })}
              placeholder="Select Source"
              className="h-9 w-full"
            />
            {form.formState.errors.source_id && <p className="text-[10px] text-destructive">{form.formState.errors.source_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Priority</Label>
            <Combobox
              options={[
                { value: "HOT", label: "Hot" },
                { value: "WARM", label: "Warm" },
                { value: "COLD", label: "Cold" }
              ]}
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value, { shouldValidate: true, shouldDirty: true })}
              placeholder="Select Priority"
              className="h-9 w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Assigned</Label>
            <Combobox
              options={userOptions}
              value={form.watch("assigned_to")}
              onValueChange={(value) =>
                form.setValue("assigned_to", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5 border-t border-border/40 pt-2">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2">
            <Tag className="h-4 w-4 text-muted-foreground" /> Tags
          </Label>
          <TagSelector
            suggestions={tagSuggestions}
            value={(form.watch("tags") as any) || []}
            onChange={(tags) => form.setValue("tags", tags as any, { shouldValidate: true, shouldDirty: true })}
          />
        </div>

        <div className="grid grid-cols-1 gap-x-2 gap-y-2 border-t border-border/40 pt-2 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span> Name
            </Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-[10px] text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Email Address</Label>
            <Input type="email" className="h-9 text-xs border-border/60" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-[10px] text-destructive">{form.formState.errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Phone</Label>
            <Input type="tel" className="h-9 text-xs border-border/60" {...form.register("phone")} />
            {form.formState.errors.phone && <p className="text-[10px] text-destructive">{form.formState.errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Alternative Phone</Label>
            <Input type="tel" className="h-9 text-xs border-border/60" {...form.register("alternate_phone")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Country</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("country")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">City</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("city")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">State</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("state")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Pincode</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("pincode")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Company Name</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("company_name")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Designation</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("designation")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Website</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("website")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">GST Number</Label>
            <Input className="h-9 text-xs border-border/60 uppercase" {...form.register("gst_number")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Interested Category</Label>
            <InterestedCategorySelect
              value={form.watch("interested_category_id")}
              onValueChange={(value) => form.setValue("interested_category_id", value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Address Line 1</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("address_line1")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Address Line 2</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("address_line2")} />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default LeadModal;
