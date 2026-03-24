import { useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const callLogSchema = z.object({
  call_type: z.string().min(1, "Call type is required"),
  call_start_time: z.string().min(1, "Start time is required"),
  call_end_time: z.string().min(1, "End time is required"),
  recording_url: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Subject is required").max(200),
  remarks: z.string().optional().or(z.literal("")),
  created_at: z.string().optional().or(z.literal("")),
});

export type CallLogFormData = z.infer<typeof callLogSchema>;

export interface CallLog extends CallLogFormData {
  id: string;
}

interface CallLogModalProps {
  open: boolean;
  onClose: () => void;
  callLogData?: CallLog | null;
  onSave: (
    data: CallLogFormData,
    setError: UseFormSetError<CallLogFormData>,
  ) => void;
  isSubmitting?: boolean;
}

const CallLogModal = ({
  open,
  onClose,
  callLogData,
  onSave,
  isSubmitting,
}: CallLogModalProps) => {
  const form = useForm<CallLogFormData>({
    resolver: zodResolver(callLogSchema),
    defaultValues: {
      call_type: "",
      call_start_time: "",
      call_end_time: "",
      recording_url: "",
      subject: "",
      remarks: "",
      created_at: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (callLogData) {
        form.reset({
          call_type: callLogData.call_type || "",
          call_start_time: callLogData.call_start_time || "",
          call_end_time: callLogData.call_end_time || "",
          recording_url: callLogData.recording_url || "",
          subject: callLogData.subject || "",
          remarks: callLogData.remarks || "",
          created_at:
            callLogData.created_at || "",
        });
      } else {
        form.reset({
          call_type: "",
          call_start_time: "",
          call_end_time: "",
          recording_url: "",
          subject: "",
          remarks: "",
          created_at: "",
        });
      }
    }
  }, [open, callLogData, form]);

  const onSubmit = (data: CallLogFormData) => {
    onSave(data, form.setError);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        form.reset();
        onClose();
      }}
      headerBg="bg-primary/10"
      title={callLogData ? "Edit Call Log" : "Add Call Log"}
      description={
        callLogData
          ? "Update call log details."
          : "Record a new call log for this lead."
      }
      maxWidth="sm:max-w-lg"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              form.reset();
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
              ? callLogData
                ? "Updating..."
                : "Saving..."
              : callLogData
                ? "Update Log"
                : "Save Log"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="call_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> Call Type
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={(value: string) =>
                        field.onChange(value || null)
                      }
                      className="h-8 text-sm rounded-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold flex gap-1">
                  <span className="text-destructive">*</span> Subject
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Brief description of the call"
                    className="h-9 text-xs"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="call_start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> Start Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="Start"
                      step="1"
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
              name="call_end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> End Time
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      placeholder="End"
                      step="1"
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

          <FormField
            control={form.control}
            name="recording_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">
                  Recording URL
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/recording.mp3"
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
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detailed notes about the call"
                    className="min-h-[80px] text-xs resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
};

export default CallLogModal;
