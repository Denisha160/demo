import { useMemo, useState } from "react";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
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
import FollowUpModal, { FollowUp, FollowUpFormData } from "./FollowUpModal";
import {
  useCreateLeadFollowUp,
  useDeleteLeadFollowUp,
  useLeadFollowUps,
  useUpdateLeadFollowUp,
} from "@/hooks/useLeadFollowUps";

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

const toIsoDateTime = (value?: string) => {
  if (!value) return "";
  if (value.includes("T")) return value;
  return `${value}T00:00:00.000Z`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "SCHEDULED":
    case "RESCHEDULED":
      return "warning";
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
};

interface FollowUpTabProps {
  leadId: string;
}

const FollowUpTab = ({ leadId }: FollowUpTabProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [followUpToDelete, setFollowUpToDelete] = useState<FollowUp | null>(null);

  const { data: followups = [], isLoading } = useLeadFollowUps(leadId);
  const createFollowUpMutation = useCreateLeadFollowUp(leadId);
  const updateFollowUpMutation = useUpdateLeadFollowUp(leadId);
  const deleteFollowUpMutation = useDeleteLeadFollowUp(leadId);

  const filteredData = useMemo(
    () =>
      followups.filter((item: FollowUp) => {
        const query = searchTerm.toLowerCase();
        return (
          (item.purpose || "").toLowerCase().includes(query) ||
          (item.assigned_to_name || "").toLowerCase().includes(query) ||
          (item.follow_up_method || "").toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
        );
      }),
    [followups, searchTerm]
  );

  const handleSave = (data: FollowUpFormData, setError: (field: any, err: any) => void) => {
    const payload = {
      ...data,
      scheduled_at: toIsoDateTime(data.scheduled_at),
    };

    if (editingFollowUp) {
      updateFollowUpMutation.mutate(
        {
          followupId: editingFollowUp.id,
          ...payload,
        },
        {
          onSuccess: () => {
            setOpen(false);
            setEditingFollowUp(null);
          },
          onError: (error) => applyServerValidationErrors(error, setError),
        }
      );
      return;
    }

    createFollowUpMutation.mutate(payload, {
      onSuccess: () => setOpen(false),
      onError: (error) => applyServerValidationErrors(error, setError),
    });
  };

  const columns: Column<FollowUp>[] = [
    {
      key: "scheduled_at",
      header: "Scheduled At",
      render: (item) => <span className="text-sm">{formatDateTime(item.scheduled_at)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} variant={getStatusVariant(item.status)} />,
    },
    {
      key: "follow_up_method",
      header: "Method",
      render: (item) => <span className="text-sm">{item.follow_up_method || "-"}</span>,
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (item) => <span className="text-sm">{item.purpose || "-"}</span>,
    },
    {
      key: "assigned_to_name",
      header: "Assigned To",
      render: (item) => <span className="text-sm">{item.assigned_to_name || "-"}</span>,
    },
    {
      key: "remarks",
      header: "Remarks",
      render: (item) => <span className="max-w-xs line-clamp-2 text-xs text-muted-foreground">{item.remarks || "-"}</span>,
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => {
              setEditingFollowUp(item);
              setOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setFollowUpToDelete(item)}
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
        <Button
          onClick={() => {
            setEditingFollowUp(null);
            setOpen(true);
          }}
          size="sm"
          className="h-9 gap-2 px-4"
        >
          <Plus className="h-4 w-4" />
          Add Follow Up
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search follow ups..."
            className="h-9 w-[250px] pl-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} pageSize={10} />
      {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading follow ups...</p>}

      <FollowUpModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingFollowUp(null);
        }}
        onSave={handleSave}
        followUpData={editingFollowUp}
        isEditing={!!editingFollowUp}
        isSubmitting={createFollowUpMutation.isPending || updateFollowUpMutation.isPending}
      />

      <AlertDialog open={!!followUpToDelete} onOpenChange={(nextOpen) => !nextOpen && setFollowUpToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the follow up "{followUpToDelete?.purpose}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFollowUpMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                followUpToDelete &&
                deleteFollowUpMutation.mutate(followUpToDelete.id, {
                  onSuccess: () => setFollowUpToDelete(null),
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteFollowUpMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FollowUpTab;
