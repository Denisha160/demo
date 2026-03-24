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
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/hooks/useUsers";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().nullish().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  assigned_to: z.string().min(1, "Assigned to is required"),
  due_date: z.string().min(1, "Due date is required"),
  set_reminder: z.boolean().optional().default(false),
  reminder_time: z.string().optional().or(z.literal("")),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export interface Task extends TaskFormData {
  id: string;
  created_at: string;
  assigned_to_name?: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  taskData?: Task | null;
  onSave: (data: TaskFormData, setError: UseFormSetError<TaskFormData>) => void;
  isSubmitting?: boolean;
}

const getDateOnly = (value?: string | null) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const TaskModal = ({
  open,
  onClose,
  taskData,
  onSave,
  isSubmitting,
}: TaskModalProps) => {
  const { data: usersResponse } = useUsers({ limit: 100 });
  const users = usersResponse?.items || usersResponse || [];
  const userOptions = users.map((user: { id: string; name: string }) => ({
    value: user.id,
    label: user.name,
  }));

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assigned_to: "",
      due_date: getTodayDate(),
      set_reminder: false,
      reminder_time: getCurrentTime(),
    },
  });

  useEffect(() => {
    if (open) {
      if (taskData) {
        form.reset({
          title: taskData.title || "",
          description: taskData.description || "",
          status: taskData.status || "TODO",
          priority: taskData.priority || "MEDIUM",
          assigned_to: taskData.assigned_to || "",
          due_date: getDateOnly(taskData.due_date as string) || getTodayDate(),
          set_reminder: false,
          reminder_time: getCurrentTime(),
        });
      } else {
        form.reset({
          title: "",
          description: "",
          status: "TODO",
          priority: "MEDIUM",
          assigned_to: "",
          due_date: getTodayDate(),
          set_reminder: false,
          reminder_time: getCurrentTime(),
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
      description={
        taskData ? "Update task details." : "Create a new task for this lead."
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
              ? taskData
                ? "Updating..."
                : "Creating..."
              : taskData
                ? "Update Task"
                : "Create Task"}
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
                  Title <span className="text-destructive">*</span>
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
                  Description <span className="text-destructive">*</span>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TODO">TODO</SelectItem>
                      <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                      <SelectItem value="IN_REVIEW">IN REVIEW</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
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
                    Assigned To <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={userOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Search and select a user..."
                      disabled={isSubmitting}
                      className={
                        form.formState.errors.assigned_to
                          ? "border-destructive"
                          : ""
                      }
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
                  <FormLabel className="text-xs font-bold flex gap-1">
                    Due Date <span className="text-destructive">*</span>
                  </FormLabel>
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
          {form.watch("status") === "TODO" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="set_reminder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-3 bg-muted/5">
                    <FormControl>
                      <Checkbox
                        id="set_reminder_task"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="set_reminder_task"
                        className="text-xs font-bold cursor-pointer"
                      >
                        Set Reminder
                      </Label>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("set_reminder") && (
                <FormField
                  control={form.control}
                  name="reminder_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold flex gap-1">
                        Reminder Time{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          className="h-9 text-xs"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </form>
      </Form>
    </Modal>
  );
};

export default TaskModal;
