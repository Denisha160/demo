import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUsers } from "@/hooks/useUsers";
import { useEffect } from "react";

const batchAssignSchema = z.object({
  assigned_to: z.string().min(1, { message: "Please select a user" }),
});

type BatchAssignFormData = z.infer<typeof batchAssignSchema>;

interface BatchAssignModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (assignedTo: string) => void;
  selectedCount: number;
  isSubmitting?: boolean;
}

const BatchAssignModal = ({
  open,
  onClose,
  onAssign,
  selectedCount,
  isSubmitting = false,
}: BatchAssignModalProps) => {
  const form = useForm<BatchAssignFormData>({
    resolver: zodResolver(batchAssignSchema),
    defaultValues: {
      assigned_to: "",
    },
  });

  const { data: usersResponse } = useUsers({ limit: 100 }, { enabled: open });
  const users = (usersResponse as any)?.items || usersResponse || [];
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

  useEffect(() => {
    if (open) {
      form.reset({ assigned_to: "" });
    }
  }, [open, form]);

  const handleSubmit = (data: BatchAssignFormData) => {
    onAssign(data.assigned_to);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assign Leads"
      description={`Assign ${selectedCount} selected lead(s) to a user`}
      headerBg="bg-primary/5"
      maxWidth="sm:max-w-[400px]"
      titleClassName="text-primary font-bold"
      footer={
        <div className="flex w-full gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-6 text-xs font-semibold rounded-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 px-8 text-xs font-semibold rounded-sm"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            Assign
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-bold text-foreground">
                  Assigned To
                </FormLabel>
                <FormControl>
                  <Combobox
                    options={userOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Assignee"
                    className="h-9 w-full"
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

export default BatchAssignModal;
