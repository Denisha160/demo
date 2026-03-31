import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
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
import { formatDate, formatDateForAPI } from "@/utils/date";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskModal, {
  Task,
  TaskFormData,
} from "@/pages/companys/leads/details/tabs/tasks/TaskModal";
import {
  useCreateLeadTask,
  useDeleteLeadTask,
  useLeadTasks,
  useUpdateLeadTask,
  useAllTasks,
} from "@/hooks/useLeadTasks";
import { useCreateLeadReminder } from "@/hooks/useLeadReminders";
import { useCompanies } from "@/hooks/useCompanies";
import { useLeads } from "@/hooks/useLeads";
import { Combobox } from "@/components/ui/combobox";

const applyServerValidationErrors = (
  error: any,
  setError: (field: any, err: any) => void,
) => {
  if (error?.code === "validation_error" && error?.details?.body) {
    Object.entries(error.details.body).forEach(([key, message]) => {
      setError(key as any, { type: "server", message: String(message) });
    });
  }
};

interface TasksTableProps {
  leadId?: string;
  hideCreate?: boolean;
  defaultAssignedTo?: { id: string; name: string };
}

const TasksTable = ({
  leadId,
  hideCreate = false,
  defaultAssignedTo,
}: TasksTableProps) => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: companiesData } = useCompanies();
  const companies = useMemo(
    () => companiesData?.items || [],
    [companiesData?.items],
  );

  const currentCompany = useMemo(() => {
    if (companies.length === 0) return null;
    return (
      companies.find((c: any) => c.id === companyId) ||
      companies.find(
        (c: any) => c.id === localStorage.getItem("currentCompanyId"),
      ) ||
      companies[0]
    );
  }, [companyId, companies]);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10", 10),
  );

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const urlLeadId = searchParams.get("lead_id");
  const effectiveLeadId = leadId || urlLeadId;

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        if (page > 1) next.set("page", page.toString());
        else next.delete("page");
        if (limit !== 10) next.set("limit", limit.toString());
        else next.delete("limit");

        // Handle lead_id query param
        if (urlLeadId) next.set("lead_id", urlLeadId);
        else next.delete("lead_id");

        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, page, limit, urlLeadId, setSearchParams]);

  // Use useAllTasks with lead_id param as requested
  const allTasksQuery = useAllTasks({
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    limit,
    offset: (page - 1) * limit,
    lead_id: effectiveLeadId, // Passed as API param
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  const { data: tasks = [], isLoading } = allTasksQuery;

  const serverTotal =
    tasks.length === (limit || 10)
      ? page * (limit || 10) + 1
      : (page - 1) * (limit || 10) + tasks.length;

  const { data: leadsDataRaw = [] } = useLeads({ limit: 100 });
  const leadOptions = useMemo(() => {
    const leadsData = (leadsDataRaw as any)?.items || leadsDataRaw || [];
    return (leadsData as any[]).map((l: any) => ({
      value: l.id,
      label: l.name || l.title || "Unknown Lead",
    }));
  }, [leadsDataRaw]);

  const createTaskMutation = useCreateLeadTask(effectiveLeadId || "");
  const updateTaskMutation = useUpdateLeadTask(effectiveLeadId || "");
  const deleteTaskMutation = useDeleteLeadTask(effectiveLeadId || "");
  const createReminderMutation = useCreateLeadReminder(effectiveLeadId || "");

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (
    formData: TaskFormData,
    setError: (field: any, err: any) => void,
  ) => {
    const { set_reminder, reminder_time, ...taskData } = formData;

    const handleReminderCreation = () => {
      if (
        leadId &&
        formData.status === "TODO" &&
        set_reminder &&
        reminder_time
      ) {
        createReminderMutation.mutate({
          title: `Reminder: ${formData.title}`,
          description:
            formData.description || `Task Reminder: ${formData.title}`,
          remind_at: formatDateForAPI(formData.due_date),
          remind_time: reminder_time,
        });
      }
    };

    if (editingTask) {
      updateTaskMutation.mutate(
        {
          taskId: editingTask.id,
          ...taskData,
          due_date: formatDateForAPI(taskData.due_date),
        },
        {
          onSuccess: () => {
            handleReminderCreation();
            setIsModalOpen(false);
            setEditingTask(null);
          },
          onError: (error) => applyServerValidationErrors(error, setError),
        },
      );
      return;
    }

    createTaskMutation.mutate(
      {
        ...taskData,
        due_date: formatDateForAPI(taskData.due_date),
      },
      {
        onSuccess: () => {
          handleReminderCreation();
          setIsModalOpen(false);
        },
        onError: (error) => applyServerValidationErrors(error, setError),
      },
    );
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      case "LOW":
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
    ...(leadId
      ? []
      : [
          {
            key: "lead_name" as keyof Task,
            header: "Lead",
            render: (item: any) => (
              <span className="text-sm font-medium text-foreground">
                {item.lead_name || "-"}
              </span>
            ),
          },
        ]),
    {
      key: "title",
      header: "Task",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{item.title}</span>
          <span className="line-clamp-1 text-[10px] text-muted-foreground">
            {item.description}
          </span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item) => (
        <StatusBadge
          status={item.priority.toUpperCase()}
          variant={getPriorityVariant(item.priority)}
        />
      ),
    },
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (item) => (
        <span className="text-sm">
          {item.assigned_to_name || item.assigned_to}
        </span>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (item) => (
        <span className="text-sm">{formatDate(item.due_date)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Select
          value={item.status}
          onValueChange={(val) => {
            updateTaskMutation.mutate({
              taskId: item.id,
              leadId: leadId || item.lead_id,
              status: val,
            });
          }}
          disabled={updateTaskMutation.isPending}
        >
          <SelectTrigger className="h-6 w-fit bg-transparent border-none p-0 focus:ring-0 shadow-none hover:bg-transparent">
            <StatusBadge
              status={item.status.replace("_", " ").toUpperCase()}
              variant={getStatusVariant(item.status)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[120px]">
            <SelectItem value="TODO" className="text-xs">
              Todo
            </SelectItem>
            <SelectItem value="IN_PROGRESS" className="text-xs">
              In Progress
            </SelectItem>
            <SelectItem value="IN_REVIEW" className="text-xs">
              In Review
            </SelectItem>
            <SelectItem value="COMPLETED" className="text-xs">
              Completed
            </SelectItem>
            <SelectItem value="CANCELLED" className="text-xs">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {!hideCreate && (
            <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          )}
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-[260px]"
            placeholder="Filter by due date"
          />

          {!leadId && (
            <div className="w-[200px]">
              <Combobox
                options={leadOptions}
                value={urlLeadId || ""}
                onValueChange={(val) => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    if (val) next.set("lead_id", val);
                    else next.delete("lead_id");
                    next.set("page", "1");
                    return next;
                  });
                }}
                placeholder="Filter by lead"
                searchPlaceholder="Search leads..."
                clearable
              />
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="h-9 w-[260px] pl-9 text-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        serverSide={true}
        serverPage={page}
        pageSize={limit}
        serverTotal={serverTotal}
        onServerPageChange={setPage}
        onServerPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
        onRowClick={(item: any) => {
          if (!leadId && item.lead_id) {
            navigate(`/${currentCompany.id}/leads/${item.lead_id}?tab=tasks`);
          }
        }}
      />

      {isLoading && (
        <p className="mt-3 text-xs text-muted-foreground">Loading tasks...</p>
      )}

      {isModalOpen && (
        <TaskModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          taskData={editingTask}
          defaultAssignedTo={defaultAssignedTo}
          onSave={handleSaveTask}
          isSubmitting={
            createTaskMutation.isPending || updateTaskMutation.isPending
          }
        />
      )}

      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTaskMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                taskToDelete &&
                deleteTaskMutation.mutate(
                  {
                    taskId: taskToDelete.id,
                    leadId: leadId || taskToDelete.lead_id || "",
                  },
                  {
                    onSuccess: () => setTaskToDelete(null),
                  },
                )
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

export default TasksTable;
