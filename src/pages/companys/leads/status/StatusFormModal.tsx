import { useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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

const statusSchema = z.object({
  name: z.string().min(1, "Status name is required").max(100, "Status name cannot exceed 100 characters"),
  color: z.string().min(1, "Color is required"),
  is_active: z.boolean().default(true),
});

export type StatusFormData = z.infer<typeof statusSchema>;

interface StatusFormModalProps {
  open: boolean;
  onClose: () => void;
  statusData?: any;
  onSave: (data: StatusFormData, setError: UseFormSetError<StatusFormData>) => void;
  isSubmitting?: boolean;
}

const StatusFormModal = ({ open, onClose, statusData, onSave, isSubmitting }: StatusFormModalProps) => {
  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
      is_active: true,
    },
  });

  // Reset form when statusData changes or modal opens
  useEffect(() => {
    if (open) {
      if (statusData) {
        form.reset({
          name: statusData.name || "",
          color: statusData.color || "#3b82f6",
          is_active: statusData.is_active ?? true,
        });
      } else {
        form.reset({
          name: "",
          color: "#3b82f6",
          is_active: true,
        });
      }
    }
  }, [open, statusData, form]);

  const onSubmit = (data: StatusFormData) => {
    onSave(data, form.setError);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Edit Status"
      description="Update status details."
      maxWidth="sm:max-w-md"
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
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold flex gap-1">
                  <span className="text-destructive">*</span> Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. New Lead"
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> Color
                  </FormLabel>
                  <div className="flex gap-2 items-center">
                    <FormControl>
                      <Input
                        type="color"
                        className="w-12 h-9 p-1 cursor-pointer shrink-0"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        type="text"
                        className="flex-1 h-9 text-xs uppercase"
                        disabled={isSubmitting}
                        value={field.value.toUpperCase()}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

          </div>

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-2 py-2 border rounded-md px-3 bg-muted/20">
                <div className="flex flex-col space-y-1">
                  <FormLabel className="text-xs font-bold">Active Status</FormLabel>
                  <span className="text-[10px] text-muted-foreground">Toggle visibility</span>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
};

export default StatusFormModal;
