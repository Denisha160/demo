import { useEffect, useRef } from "react";
import { z } from "zod";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatDate } from "@/utils/date";

const followUpSchema = z.object({
  status: z.string().min(1, "Status is required"),
  follow_up_method: z.string().optional().or(z.literal("")),
  purpose: z.string().optional().or(z.literal("")),
  remarks: z.string().optional().or(z.literal("")),
  assigned_to: z.string().min(1, "Assigned To is required"),
  scheduled_at: z.string().min(1, "Scheduled date is required"),
  set_reminder: z.boolean().optional().default(false), // currently not sent
  reminder_time: z.string().optional().or(z.literal("")),
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
  defaultAssignedTo?: { id: string; name: string };
  isEditing?: boolean;
  onSave: (
    data: FollowUpFormData,
    setError: UseFormSetError<FollowUpFormData>,
  ) => void;
  isSubmitting?: boolean;
}

const getCurrentTime = () => new Date().toTimeString();

const getDateOnly = (value?: string | null) => {
  return formatDate(value);
};

const FollowUpModal = ({
  open,
  onClose,
  followUpData,
  defaultAssignedTo,
  isEditing = false,
  onSave,
  isSubmitting = false,
}: FollowUpModalProps) => {
  const { data: usersResponse } = useUsers({ limit: 100 });
  const users = (usersResponse as any)?.items || usersResponse || [];
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
      status: "",
      follow_up_method: "",
      purpose: "",
      remarks: "",
      assigned_to: "",
      scheduled_at: "",
      // set_reminder: false,
      // reminder_time: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    // Focus the first input after a small delay to allow modal animation
    const timer = setTimeout(() => {
      statusTriggerRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (isEditing && followUpData) {
      reset({
        status: followUpData.status || "SCHEDULED",
        follow_up_method: followUpData.follow_up_method || "",
        purpose: followUpData.purpose || "",
        remarks: followUpData.remarks || "",
        assigned_to: followUpData.assigned_to || "",
        scheduled_at: getDateOnly(followUpData.scheduled_at),
        // set_reminder: false,
        // reminder_time: getCurrentTime(),
      });
      return;
    }

    reset({
      status: "",
      follow_up_method: "",
      purpose: "",
      remarks: "",
      assigned_to: defaultAssignedTo?.id || "",
      scheduled_at: "",
      set_reminder: false,
      reminder_time: "",
    });
  }, [open, isEditing, followUpData, reset, defaultAssignedTo]);

  const handleFormSubmit = (data: FollowUpFormData) => {
    onSave(data, setError);
  };

  const status = watch("status");
  const followUpMethod = watch("follow_up_method");
  const scheduledAt = watch("scheduled_at");
  const statusTriggerRef = useRef<HTMLButtonElement>(null);

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
              <SelectTrigger ref={statusTriggerRef}>
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
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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
              disabled={true}
              placeholder="Search and select a user..."
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

          {/* {(status === "SCHEDULED" || status === "RESCHEDULED") && (
            <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-row items-center space-x-2 rounded-md border p-3 bg-muted/5">
                <Checkbox
                  id="set_reminder_followup"
                  checked={watch("set_reminder")}
                  onCheckedChange={(val) => setValue("set_reminder", !!val)}
                  disabled={isSubmitting}
                />
                <Label
                  htmlFor="set_reminder_followup"
                  className="text-xs font-bold cursor-pointer"
                >
                  Set Reminder
                </Label>
              </div>

              {watch("set_reminder") && (
                <div>
                  <Label className="text-xs font-bold flex gap-1 mb-1.5">
                    Reminder Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="time"
                    placeholder="Select reminder time"
                    className="h-9 text-xs"
                    disabled={isSubmitting}
                    {...register("reminder_time")}
                  />
                  {errors.reminder_time && (
                    <p className="text-[10px] text-red-500">
                      {errors.reminder_time.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )} */}
        </div>
      </form>
    </Modal>
  );
};

export default FollowUpModal;
