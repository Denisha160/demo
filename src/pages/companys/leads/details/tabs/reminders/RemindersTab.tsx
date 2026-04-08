import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
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
import { formatDate, formatDateForAPI, parseFormattedDate } from "@/utils/date";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import ReminderModal, { Reminder, ReminderFormData } from "./ReminderModal";
import {
  useCreateLeadReminder,
  useDeleteLeadReminder,
  useLeadReminders,
  useUpdateLeadReminder,
} from "@/hooks/useLeadReminders";

const applyServerValidationErrors = (
  error: any,
  setError: (field: any, err: any) => void,
) => {
  if (error?.code === "validation_error" && error?.details?.body) {
    Object.entries(error.details.body).forEach(([key, message]) => {
      if (key === "remind_at") {
        setError("remind_date" as any, {
          type: "server",
          message: String(message),
        });
        return;
      }
      setError(key as any, { type: "server", message: String(message) });
    });
  }
};

const mapReminder = (reminder: any): Reminder => {
  const remindAt = reminder?.remind_at;
  let remindDate = reminder?.remind_date || "";
  let remindTime = reminder?.remind_time || "";

  if (remindAt) {
    const parsed = new Date(remindAt);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      const hours = String(parsed.getHours()).padStart(2, "0");
      const minutes = String(parsed.getMinutes()).padStart(2, "0");
      remindDate = remindDate || `${year}-${month}-${day}`;
      remindTime = remindTime || `${hours}:${minutes}`;
    }
  }

  return {
    ...reminder,
    remind_at: remindAt,
    remind_date: remindDate,
    remind_time: remindTime,
  };
};

const formatReminderDateTime = (date: string, time: string) => {
  if (!date && !time) return "-";
  if (!date) return time;

  return formatDate(date);
};

interface RemindersTabProps {
  leadId: string;
}

const RemindersTab = ({ leadId }: RemindersTabProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(
    null,
  );

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
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, page, limit, setSearchParams]);

  const { data: reminders = [], isLoading } = useLeadReminders(leadId, {
    ...(dateRange?.from ? { startDate: formatDateForAPI(dateRange.from) } : {}),
    ...(dateRange?.to ? { endDate: formatDateForAPI(dateRange.to) } : {}),
    limit,
    offset: (page - 1) * limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const createReminderMutation = useCreateLeadReminder(leadId);
  const updateReminderMutation = useUpdateLeadReminder(leadId);
  const deleteReminderMutation = useDeleteLeadReminder(leadId);

  const reminderItems = useMemo(
    () => reminders.map((reminder: any) => mapReminder(reminder)),
    [reminders],
  );

  const serverTotal =
    reminderItems.length === limit
      ? page * limit + 1
      : (page - 1) * limit + reminderItems.length;

  const handleSaveReminder = (
    formData: ReminderFormData,
    setError: (field: any, err: any) => void,
  ) => {
    const parsedDate = parseFormattedDate(formData.remind_date);
    const datePart = parsedDate
      ? parsedDate.toISOString().split("T")[0]
      : formData.remind_date;
    const remind_at = `${datePart}T${formData.remind_time.length === 5 ? `${formData.remind_time}:00` : formData.remind_time}`;
    const payload = {
      title: formData.title,
      description: formData.description,
      remind_at,
      remind_time:
        formData.remind_time.length === 5
          ? `${formData.remind_time}:00`
          : formData.remind_time,
    };

    if (editingReminder) {
      updateReminderMutation.mutate(
        { reminderId: editingReminder.id, ...payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingReminder(null);
          },
          onError: (error) => applyServerValidationErrors(error, setError),
        },
      );
      return;
    }

    createReminderMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false),
      onError: (error) => applyServerValidationErrors(error, setError),
    });
  };

  const columns: Column<Reminder>[] = [
    {
      key: "remind_date",
      header: "Reminder Date",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {formatReminderDateTime(item.remind_date, item.remind_time)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(item.remind_date)} at {item.remind_time}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.title}
          </span>
          <span className="line-clamp-2 text-[11px] text-muted-foreground">
            {item.description}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item) => (
        <span className="max-w-md line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              setEditingReminder(item);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setReminderToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            className="h-9 gap-2 px-4"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-[260px]"
            placeholder="Filter by remind date"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reminders..."
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
        data={reminderItems}
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
      />
      {isLoading && (
        <p className="mt-3 text-xs text-muted-foreground">
          Loading reminders...
        </p>
      )}

      {isModalOpen && (
        <ReminderModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReminder(null);
          }}
          reminderData={editingReminder}
          onSave={handleSaveReminder}
          isSubmitting={
            createReminderMutation.isPending || updateReminderMutation.isPending
          }
        />
      )}

      <AlertDialog
        open={!!reminderToDelete}
        onOpenChange={(open) => !open && setReminderToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the reminder for "
              {reminderToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteReminderMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                reminderToDelete &&
                deleteReminderMutation.mutate(reminderToDelete.id, {
                  onSuccess: () => setReminderToDelete(null),
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteReminderMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RemindersTab;
