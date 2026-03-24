import { useEffect } from "react";
import { z } from "zod";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Modal from "@/components/Modal";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/hooks/useUsers";

const followUpSchema = z.object({
  status: z.string().min(1, "Status is required"),
  follow_up_method: z.string().optional().or(z.literal("")),
  purpose: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
  assigned_to: z.string().min(1, "Assigned To is required"),
  scheduled_at: z.string().min(1, "Scheduled date is required"),
});

export type FollowUpFormData = z.infer<typeof followUpSchema>;

export interface FollowUp extends FollowUpFormData {
  id: string;
  assigned_to_name?: string;
  created_by?: string | null;
  created_by_name?: string | null;
}

interface FollowUpModalProps {
  open: boolean;
  onClose: () => void;
  followUpData?: FollowUp | null;
  isEditing?: boolean;
  onSave: (
    data: FollowUpFormData,
    setError: UseFormSetError<FollowUpFormData>,
  ) => void;
  isSubmitting?: boolean;
}

const getDateOnly = (value?: string | null) => {
  if (!value) return new Date().toISOString().split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()))
    return new Date().toISOString().split("T")[0];
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const FollowUpModal = ({
  open,
  onClose,
  followUpData,
  isEditing = false,
  onSave,
  isSubmitting = false,
}: FollowUpModalProps) => {
  const { data: usersResponse } = useUsers({ limit: 100 });
  const users = usersResponse?.items || usersResponse || [];
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors },
  } = useForm<FollowUpFormData>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      status: "SCHEDULED",
      follow_up_method: "Email",
      purpose: "",
      remarks: "",
      assigned_to: "",
      scheduled_at: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (!open) return;

    if (isEditing && followUpData) {
      reset({
        status: followUpData.status || "SCHEDULED",
        follow_up_method: followUpData.follow_up_method || "",
        purpose: followUpData.purpose || "",
        remarks: followUpData.remarks || "",
        assigned_to: followUpData.assigned_to || "",
        scheduled_at: getDateOnly(followUpData.scheduled_at),
      });
      return;
    }

    reset({
      status: "SCHEDULED",
      follow_up_method: "Email",
      purpose: "",
      remarks: "",
      assigned_to: "",
      scheduled_at: new Date().toISOString().split("T")[0],
    });
  }, [open, isEditing, followUpData, reset]);

  const handleFormSubmit = (data: FollowUpFormData) => {
    onSave(data, setError);
  };

  const status = watch("status");
  const followUpMethod = watch("follow_up_method");
  const scheduledAt = watch("scheduled_at");

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBg="bg-primary/10"
      title={isEditing ? "Edit Follow Up" : "Add Follow Up"}
      description="Enter follow up details"
      footer={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            type="submit"
            form="follow-up-form"
            size="sm"
            disabled={isSubmitting}
          >
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      }
    >
      <form
        id="follow-up-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(val) =>
                setValue("status", val, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                <SelectItem value="RESCHEDULED">RESCHEDULED</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-500">{errors.status.message}</p>
            )}
          </div>

          <div>
            <Label>Method</Label>
            <Select
              value={followUpMethod}
              onValueChange={(val) =>
                setValue("follow_up_method", val, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
            {errors.follow_up_method && (
              <p className="text-xs text-red-500">
                {errors.follow_up_method.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Purpose</Label>
            <Input {...register("purpose")} placeholder="Enter purpose" />
            {errors.purpose && (
              <p className="text-xs text-red-500">{errors.purpose.message}</p>
            )}
          </div>

          <div>
            <Label>
              Assigned To <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={userOptions}
              value={watch("assigned_to")}
              onValueChange={(value) =>
                setValue("assigned_to", value, { shouldValidate: true })
              }
              placeholder="Search and select a user..."
              disabled={isSubmitting}
              className={errors.assigned_to ? "border-destructive" : ""}
            />
            {errors.assigned_to && (
              <p className="text-xs text-red-500">
                {errors.assigned_to.message}
              </p>
            )}
          </div>

          <div>
            <Label>
              Scheduled Date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={scheduledAt}
              onChange={(val: string) =>
                setValue("scheduled_at", val || "", { shouldValidate: true })
              }
              disabled={isSubmitting}
            />
            {errors.scheduled_at && (
              <p className="text-xs text-red-500">
                {errors.scheduled_at.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Remarks</Label>
            <Textarea
              {...register("remarks")}
              placeholder="Enter remarks"
              className="min-h-[100px]"
            />
            {errors.remarks && (
              <p className="text-xs text-red-500">{errors.remarks.message}</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default FollowUpModal;
