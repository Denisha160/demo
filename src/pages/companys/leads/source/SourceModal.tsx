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

const sourceSchema = z.object({
  name: z
    .string()
    .min(1, "Source name is required")
    .max(100, "Source name cannot exceed 100 characters"),
  is_active: z.boolean().default(true),
});

export type SourceFormData = z.infer<typeof sourceSchema>;

interface SourceModalProps {
  open: boolean;
  onClose: () => void;
  sourceData?: any;
  onSave: (
    data: SourceFormData,
    setError: UseFormSetError<SourceFormData>,
  ) => void;
  isSubmitting?: boolean;
}

const SourceModal = ({
  open,
  onClose,
  sourceData,
  onSave,
  isSubmitting,
}: SourceModalProps) => {
  const form = useForm<SourceFormData>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      is_active: true,
    },
  });

  // Reset form when sourceData changes or modal opens
  useEffect(() => {
    if (open) {
      if (sourceData) {
        form.reset({
          name: sourceData.name || "",
          is_active: sourceData.is_active ?? true,
        });
      } else {
        form.reset({
          name: "",
          is_active: true,
        });
      }
    }
  }, [open, sourceData, form]);

  const onSubmit = (data: SourceFormData) => {
    onSave(data, form.setError);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={sourceData ? "Edit Source" : "Add Source"}
      description={
        sourceData ? "Update source details." : "Create a new lead source."
      }
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
            {isSubmitting
              ? sourceData
                ? "Updating..."
                : "Creating..."
              : sourceData
                ? "Update Source"
                : "Create Source"}
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
                    placeholder="e.g. Website"
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
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between space-x-2 py-2 border rounded-md px-3 bg-muted/20">
                <div className="flex flex-col space-y-0.5">
                  <FormLabel className="text-xs font-bold">
                    Active Status
                  </FormLabel>
                  <span className="text-[10px] text-muted-foreground">
                    Toggle visibility
                  </span>
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

export default SourceModal;
