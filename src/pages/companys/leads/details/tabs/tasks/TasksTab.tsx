import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskModal, { Task, TaskFormData } from "./TaskModal";
import {
  useCreateLeadTask,
  useDeleteLeadTask,
  useLeadTasks,
  useUpdateLeadTask,
} from "@/hooks/useLeadTasks";

const applyServerValidationErrors = (
  error: any,
  setError: (field: any, err: any) => void
) => {
  if (error?.code === "validation_error" && error?.details?.body) {
    Object.entries(error.details.body).forEach(([key, message]) => {
      setError(key as any, { type: "server", message: String(message) });
    });
  }
};

interface TasksTabProps {
  leadId: string;
}

const TasksTab = ({ leadId }: TasksTabProps) => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useLeadTasks(leadId);
  const createTaskMutation = useCreateLeadTask(leadId);
  const updateTaskMutation = useUpdateLeadTask(leadId);
  const deleteTaskMutation = useDeleteLeadTask(leadId);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task: Task) =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        String(task.assigned_to_name || task.assigned_to || "").toLowerCase().includes(search.toLowerCase())
      ),
    [tasks, search]
  );

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (formData: TaskFormData, setError: (field: any, err: any) => void) => {
    if (!leadId) {
      return;
    }

    if (editingTask) {
      updateTaskMutation.mutate(
        {
          taskId: editingTask.id,
          ...formData,
          assigned_to_id: formData.assigned_to,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingTask(null);
          },
          onError: (error) => applyServerValidationErrors(error, setError),
        }
      );
      return;
    }

    createTaskMutation.mutate({
      ...formData,
      assigned_to_id: formData.assigned_to,
    }, {
      onSuccess: () => setIsModalOpen(false),
      onError: (error) => applyServerValidationErrors(error, setError),
    });
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
      case "IN_REVIEW":
        return "info";
      case "TODO":
        return "warning";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  const columns: Column<Task>[] = [
    {
      key: "title",
      header: "Task",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.title}</span>
          <span className="line-clamp-1 text-[10px] text-muted-foreground">{item.description}</span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge status={item.priority.toUpperCase()} variant={getPriorityVariant(item.priority)} />
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (item) => <span className="text-sm">{item.assigned_to_name || item.assigned_to}</span>,
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item) => <span className="text-sm">{item.due_date || "No date"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <StatusBadge
          status={item.status.replace("_", " ").toUpperCase()}
          variant={getStatusVariant(item.status)}
        />
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2 bg-transparent">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setTaskToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="h-9 w-[250px] pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredTasks} pageSize={10} />
      {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading tasks...</p>}

      {isModalOpen && (
        <TaskModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          taskData={editingTask}
          onSave={handleSaveTask}
          isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      )}

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTaskMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                taskToDelete &&
                deleteTaskMutation.mutate(taskToDelete.id, {
                  onSuccess: () => setTaskToDelete(null),
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTaskMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksTab;
