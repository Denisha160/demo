import { useMemo, useState } from "react";
import { CalendarDays, Edit, MapPin, Plus, Search, Trash2 } from "lucide-react";
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
import VisitsModal, { Visit, VisitFormData } from "./VisitsMode";
import {
  useCreateLeadVisit,
  useDeleteLeadVisit,
  useLeadVisits,
  useUpdateLeadVisit,
} from "@/hooks/useLeadVisits";

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
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toNullableNumber = (value?: string) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
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
      return "info";
    case "CANCELLED":
    case "MISSED":
      return "destructive";
    case "CHECKED_IN":
    case "IN_PROGRESS":
      return "warning";
    default:
      return "default";
  }
};

interface VisitsTabProps {
  leadId: string;
}

const VisitsTab = ({ leadId }: VisitsTabProps) => {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);

  const { data: visits = [], isLoading } = useLeadVisits(leadId);
  const createVisitMutation = useCreateLeadVisit(leadId);
  const updateVisitMutation = useUpdateLeadVisit(leadId);
  const deleteVisitMutation = useDeleteLeadVisit(leadId);

  const filteredVisits = useMemo(
    () =>
      visits.filter((visit: Visit) => {
        const query = search.toLowerCase();

        return (
          visit.title.toLowerCase().includes(query) ||
          visit.visit_type.toLowerCase().includes(query) ||
          visit.status.toLowerCase().includes(query) ||
          visit.location_address.toLowerCase().includes(query) ||
          visit.contact_person_name.toLowerCase().includes(query)
        );
      }),
    [visits, search]
  );

  const handleCreate = () => {
    setEditingVisit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (visit: Visit) => {
    setEditingVisit(visit);
    setIsModalOpen(true);
  };

  const handleSaveVisit = (formData: VisitFormData, setError: (field: any, err: any) => void) => {
    if (!leadId) {
      return;
    }

    const payload: any = {
      title: formData.title,
      description: formData.description,
      visit_type: formData.visit_type,
      status: formData.status,
      scheduled_time: toIsoDateTime(formData.scheduled_time),
      actual_check_in: toIsoDateTime(formData.actual_check_in),
      actual_check_out: toIsoDateTime(formData.actual_check_out),
      location_address: formData.location_address,
      location_latitude: toNullableNumber(formData.location_latitude),
      location_longitude: toNullableNumber(formData.location_longitude),
      customer_rating: toNullableNumber(formData.customer_rating),
      contact_person_name: formData.contact_person_name,
      contact_person_designation: formData.contact_person_designation,
      contact_person_phone: formData.contact_person_phone,
      outcome_summary: formData.outcome_summary,
      next_steps: formData.next_steps,
    };

    let dataToSubmit: any = payload;

    if (formData.visit_image_file) {
      const formDataObj = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, String(value));
        }
      });
      formDataObj.append("visit_image", formData.visit_image_file);
      dataToSubmit = formDataObj;
    }

    if (editingVisit) {
      updateVisitMutation.mutate(
        { visitId: editingVisit.id, ...dataToSubmit },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingVisit(null);
          },
          onError: (error) => applyServerValidationErrors(error, setError),
        }
      );
      return;
    }

    createVisitMutation.mutate(dataToSubmit, {
      onSuccess: () => setIsModalOpen(false),
      onError: (error) => applyServerValidationErrors(error, setError),
    });
  };

  const columns: Column<Visit>[] = [
    {
      key: "scheduled_time",
      header: "Visit Date",
      render: (item) => (
        <div className="flex items-start gap-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{formatDateTime(item.scheduled_time)}</span>
            <span className="text-[11px] text-muted-foreground">Check in: {formatDateTime(item.actual_check_in)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "title",
      header: "Visit Details",
      render: (item) => (
        <div className="flex items-start gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.visit_image_name || item.title}
              className="h-12 w-12 rounded-md border border-border/60 object-cover"
            />
          ) : null}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{item.title}</span>
            <span className="line-clamp-2 text-[11px] text-muted-foreground">{item.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <div className="space-y-1">
          <StatusBadge status={item.status.replace(/_/g, " ")} variant={getStatusVariant(item.status)} />
          <div className="text-[11px] capitalize text-muted-foreground">{item.visit_type.replace("_", " ")}</div>
        </div>
      ),
    },
    {
      key: "contact_person_name",
      header: "Contact",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{item.contact_person_name}</span>
          <span className="text-[11px] text-muted-foreground">{item.contact_person_designation || "-"}</span>
          <span className="text-[11px] text-muted-foreground">{item.contact_person_phone}</span>
        </div>
      ),
    },
    {
      key: "location_address",
      header: "Location",
      render: (item) => (
        <div className="flex max-w-xs items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="line-clamp-2 text-xs text-foreground">{item.location_address}</span>
            <span className="text-[11px] text-muted-foreground">Rating: {item.customer_rating || "-"}</span>
          </div>
        </div>
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
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setVisitToDelete(item)}
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
        <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Add Visit
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search visits..."
            className="h-9 w-[250px] pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredVisits} pageSize={10} />
      {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading visits...</p>}

      {isModalOpen && (
        <VisitsModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingVisit(null);
          }}
          visitData={editingVisit}
          onSave={handleSaveVisit}
          isSubmitting={createVisitMutation.isPending || updateVisitMutation.isPending}
        />
      )}

      <AlertDialog open={!!visitToDelete} onOpenChange={(open) => !open && setVisitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the visit "{visitToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVisitMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                visitToDelete &&
                deleteVisitMutation.mutate(visitToDelete.id, {
                  onSuccess: () => setVisitToDelete(null),
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteVisitMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VisitsTab;
