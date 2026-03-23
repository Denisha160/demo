import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { useAllReminders } from "@/hooks/useLeadReminders";

const formatReminderDateTime = (date: string, time: string) => {
  if (!date && !time) return "-";
  if (!date) return time;
  if (!time) return date;

  const parsed = new Date(`${date}T${time}`);
  if (Number.isNaN(parsed.getTime())) return `${date} ${time}`;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const mapReminder = (reminder: any) => {
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

const RemindersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filters = useMemo(() => {
    const f: any = {};
    if (searchTerm) f.search = searchTerm;
    return f;
  }, [searchTerm]);

  const { data: rawReminders = [], isLoading } = useAllReminders(filters);
  const reminders = useMemo(() => rawReminders.map(mapReminder), [rawReminders]);

  const columns: Column<any>[] = [
    {
      key: "remind_date",
      header: "Reminder Date",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{formatReminderDateTime(item.remind_date, item.remind_time)}</span>
          <span className="text-[11px] text-muted-foreground">{item.remind_date} at {item.remind_time}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{item.title}</span>
          <span className="line-clamp-2 text-[11px] text-muted-foreground">{item.description}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item) => <span className="max-w-md line-clamp-2 text-xs text-muted-foreground">{item.description}</span>,
    },
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in flex-col overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-[300px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search reminders..."
            className="h-9 rounded-sm pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pt-2">
        <div className="h-full overflow-auto bg-card rounded-sm border border-border/40 shadow-sm">
          <DataTable
            data={reminders}
            columns={columns}
            pageSize={15}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;