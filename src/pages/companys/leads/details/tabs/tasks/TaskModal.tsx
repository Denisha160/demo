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

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title cannot exceed 100 characters"),
  description: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  assigned_to: z.string().min(1, "Assigned to is required"),
  due_date: z.string().optional().or(z.literal("")),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export interface Task extends TaskFormData {
  id: string;
  created_at: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  taskData?: Task | null;
  onSave: (data: TaskFormData, setError: UseFormSetError<TaskFormData>) => void;
  isSubmitting?: boolean;
}

const TaskModal = ({ open, onClose, taskData, onSave, isSubmitting }: TaskModalProps) => {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      assigned_to: "",
      due_date: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (taskData) {
        form.reset({
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status || "pending",
          priority: taskData.priority || "medium",
          assigned_to: taskData.assigned_to || "",
          due_date: taskData.due_date || "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          status: "pending",
          priority: "medium",
          assigned_to: "",
          due_date: "",
        });
      }
    }
  }, [open, taskData, form]);

  const onSubmit = (data: TaskFormData) => {
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
      title={taskData ? "Edit Task" : "Add Task"}
      description={taskData ? "Update task details." : "Create a new task for this lead."}
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
            {isSubmitting ? (taskData ? "Updating..." : "Creating...") : (taskData ? "Update Task" : "Create Task")}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold flex gap-1">
                  <span className="text-destructive">*</span> Title
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Task title"
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold flex gap-1">
                  <span className="text-destructive">*</span> Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Task description"
                    className="min-h-[100px] text-xs resize-none"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold flex gap-1">
                    <span className="text-destructive">*</span> Assigned To
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="User name"
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
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Due Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={(value: string) => field.onChange(value || null)}
                      className="h-8 text-sm rounded-sm"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default TaskModal;
