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

const formSchema = z.object({
  status: z.string().min(1, { message: "Status is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  title: z.string().min(1, { message: "Name is required" }),
  company: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\d+$/, "Only numbers allowed")
    .min(10, "Must be at least 10 digits"),
  assigned_to: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  gst_pan: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  alternative_phone: z.string().optional().or(z.literal("")),
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
      status: "",
      source: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      assigned_to: "",
      country: "",
      state: "",
      city: "",
      tags: "",
      designation: "",
      website: "",
      gst_pan: "",
      address: "",
      pincode: "",
      alternative_phone: "",
    },
  });

  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const { data: sourceResponse } = useLeadSources({ limit: 100 });

  const statusOptions =
    statusResponse?.items?.map((item: any) => ({
      value: item.name,
      label: item.name,
    })) || [];

  const sourceOptions =
    sourceResponse?.items?.map((item: any) => ({
      value: item.name,
      label: item.name,
    })) || [];

  useEffect(() => {
    if (!open) return;

    const defaultColumn = columns.find((column) => column.id === addModalCol);
    form.reset({
      status: defaultColumn?.title || "",
      source: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      assigned_to: "",
      country: "",
      state: "",
      city: "",
      tags: "",
      designation: "",
      website: "",
      gst_pan: "",
      address: "",
      pincode: "",
      alternative_phone: "",
    });
  }, [open, addModalCol, columns, form]);

  const handleSubmit = (data: LeadFormData) => {
    onSave(data, form.setError);
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span> Status
            </Label>
            <ComboboxWithAdd
              options={statusOptions}
              value={form.watch("status")}
              onValueChange={(value) => form.setValue("status", value, { shouldValidate: true, shouldDirty: true })}
              onOptionsChange={() => undefined}
              placeholder="Select Status"
              className="h-9 w-full"
            />
            {form.formState.errors.status && <p className="text-[10px] text-destructive">{form.formState.errors.status.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span> Source
            </Label>
            <ComboboxWithAdd
              options={sourceOptions}
              value={form.watch("source")}
              onValueChange={(value) => form.setValue("source", value, { shouldValidate: true, shouldDirty: true })}
              onOptionsChange={() => undefined}
              placeholder="Select Source"
              className="h-9 w-full"
            />
            {form.formState.errors.source && <p className="text-[10px] text-destructive">{form.formState.errors.source.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Assigned</Label>
            <Combobox
              options={[
                { value: "charley", label: "Charley Dicki" },
                { value: "john", label: "John Doe" },
                { value: "jane", label: "Jane Smith" },
              ]}
              value={form.watch("assigned_to")}
              onValueChange={(value) => form.setValue("assigned_to", value, { shouldDirty: true })}
              placeholder="Select User"
              className="h-9 w-full"
            />
          </div>
        </div>

        <div className="space-y-1.5 border-t border-border/40 pt-2">
          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2">
            <Tag className="h-4 w-4 text-muted-foreground" /> Tags
          </Label>
          <Input
            placeholder="Tag"
            className="h-9 rounded-none border-0 border-l-[3px] border-primary bg-transparent pl-3 text-sm shadow-none focus-visible:ring-0"
            {...form.register("tags")}
          />
        </div>

        <div className="grid grid-cols-1 gap-x-2 gap-y-2 border-t border-border/40 pt-2 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground flex items-center gap-1">
              <span className="text-destructive">*</span> Name
            </Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("title")} />
            {form.formState.errors.title && <p className="text-[10px] text-destructive">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Email Address</Label>
            <Input type="email" className="h-9 text-xs border-border/60" {...form.register("email")} />
            {form.formState.errors.email && <p className="text-[10px] text-destructive">{form.formState.errors.email.message}</p>}
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
            <Label className="text-xs font-bold text-foreground">Phone</Label>
            <Input type="tel" className="h-9 text-xs border-border/60" {...form.register("phone")} />
            {form.formState.errors.phone && <p className="text-[10px] text-destructive">{form.formState.errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Alternative Phone Number</Label>
            <Input type="tel" className="h-9 text-xs border-border/60" {...form.register("alternative_phone")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Pincode</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("pincode")} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Company Name</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("company")} />
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
            <Label className="text-xs font-bold text-foreground">GST / PAN</Label>
            <Input className="h-9 text-xs border-border/60 uppercase" {...form.register("gst_pan")} />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-bold text-foreground">Address</Label>
            <Input className="h-9 text-xs border-border/60" {...form.register("address")} />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default LeadModal;
