import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatDateForAPI, formatDateTime } from "@/utils/date";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import VisitsModal, { Visit, VisitFormData } from "./VisitsModal";
import {
  useCreateLeadVisit,
  useDeleteLeadVisit,
  useLeadVisits,
  useUpdateLeadVisit,
} from "@/hooks/useLeadVisits";
import { useLeadContacts, useCreateLeadContact } from "@/hooks/useLeadContacts";

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

interface VisitsTabProps {
  leadId: string;
}

const VisitsTab = ({ leadId }: VisitsTabProps) => {
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
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

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

  const { data: visits = [], isLoading } = useLeadVisits(leadId, {
    startDate: formatDateForAPI(dateRange?.from),
    endDate: formatDateForAPI(dateRange?.to),
    limit,
    offset: (page - 1) * limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const createVisitMutation = useCreateLeadVisit(leadId);
  const updateVisitMutation = useUpdateLeadVisit(leadId);
  const deleteVisitMutation = useDeleteLeadVisit(leadId);

  const { data: contactData } = useLeadContacts(leadId);
  const contacts = contactData?.contacts || [];
  const createContactMutation = useCreateLeadContact();

  const serverTotal =
    visits.length === limit
      ? page * limit + 1
      : (page - 1) * limit + visits.length;

  const handleCreate = () => {
    setEditingVisit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (visit: Visit) => {
    setEditingVisit(visit);
    setIsModalOpen(true);
  };

  const handleSaveVisit = (
    formData: VisitFormData,
    setError: (field: any, err: any) => void,
  ) => {
    if (!leadId) {
      return;
    }

    const { visit_image_file, visit_image_name, ...remainingFormData } =
      formData;

    const payload: any = {
      title: remainingFormData.title,
      description: remainingFormData.description,
      visit_type: remainingFormData.visit_type,
      location_address: remainingFormData.location_address,
      location_latitude: toNullableNumber(remainingFormData.location_latitude),
      location_longitude: toNullableNumber(
        remainingFormData.location_longitude,
      ),
      customer_rating: toNullableNumber(remainingFormData.customer_rating),
      contact_person_name: remainingFormData.contact_person_name,
      contact_person_designation: remainingFormData.contact_person_designation,
      contact_person_phone: remainingFormData.contact_person_phone,
      outcome_summary: remainingFormData.outcome_summary,
      next_steps: remainingFormData.next_steps,
      status: formData.status || "COMPLETED", // Default status as requested
      scheduled_time: formatDateForAPI(formData.scheduled_time),
    };

    // Auto-create contact if it is new
    if (formData.contact_person_name) {
      const isExisting = contacts.some(
        (c) =>
          c.name.toLowerCase() === formData.contact_person_name?.toLowerCase(),
      );
      if (!isExisting) {
        createContactMutation.mutate({
          leadId,
          data: {
            name: formData.contact_person_name,
            designation: formData.contact_person_designation,
            phone: formData.contact_person_phone,
            is_primary: false,
          },
        });
      }
    }

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
        { visitId: editingVisit.id, data: dataToSubmit },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingVisit(null);
          },
          onError: (error) => applyServerValidationErrors(error, setError),
        },
      );
      return;
    }

    createVisitMutation.mutate(dataToSubmit, {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingVisit(null);
      },
      onError: (error) => applyServerValidationErrors(error, setError),
    });
  };

  const columns: Column<Visit>[] = [
    {
      key: "title",
      header: "Visit Details",
      render: (item) => (
        <div className="flex items-start gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.visit_image_name || item.title}
              className="h-12 w-12 cursor-pointer rounded-md border border-border/60 object-cover transition-transform hover:scale-105 active:scale-95"
              onClick={() => setSelectedImageUrl(item.image_url || null)}
            />
          ) : null}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {item.title}
            </span>
            <span className="line-clamp-2 text-[11px] text-muted-foreground">
              {item.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "scheduled_time",
      header: "Scheduled",
      render: (item) => (
        <div className="flex items-center gap-2 text-xs text-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDateTime(item.scheduled_time)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status || "COMPLETED"} />,
    },
    {
      key: "contact_person_name",
      header: "Contact",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.contact_person_name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {item.contact_person_designation || "-"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {item.contact_person_phone}
          </span>
        </div>
      ),
    },
    {
      key: "location_address",
      header: "Location",
      render: (item) => (
        <div className="flex max-w-xs items-start gap-2">
          {item.location_latitude && item.location_longitude ? (
            <div className="flex flex-col items-center gap-1">
              <button
                title="Open in Google Maps"
                className="rounded-full p-1 transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${item.location_latitude},${item.location_longitude}`;
                  window.open(url, "_blank");
                }}
              >
                <MapPin className="h-3.5 w-3.5 text-primary" />
              </button>
              <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-600 dark:bg-green-500/20 dark:text-green-400">
                LIVE
              </span>
            </div>
          ) : (
            <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
          )}
          <div className="flex flex-col">
            <span className="line-clamp-2 text-sm text-foreground">
              {item.location_address}
            </span>
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
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Visit
          </Button>
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
            className="w-[260px]"
            placeholder="Filter by scheduled date"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search visits..."
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
        data={visits}
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
        <p className="mt-3 text-xs text-muted-foreground">Loading visits...</p>
      )}

      {isModalOpen && (
        <VisitsModal
          open={isModalOpen}
          leadId={leadId}
          onClose={() => {
            setIsModalOpen(false);
            setEditingVisit(null);
          }}
          visitData={editingVisit}
          onSave={handleSaveVisit}
          isSubmitting={
            createVisitMutation.isPending || updateVisitMutation.isPending
          }
        />
      )}

      <AlertDialog
        open={!!visitToDelete}
        onOpenChange={(open) => !open && setVisitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the visit "{visitToDelete?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteVisitMutation.isPending}>
              Cancel
            </AlertDialogCancel>
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

      <Dialog
        open={!!selectedImageUrl}
        onOpenChange={(open) => !open && setSelectedImageUrl(null)}
      >
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="relative flex h-full w-full items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-50 h-8 w-8 rounded-full bg-background/50 text-foreground hover:bg-background/80"
              onClick={() => setSelectedImageUrl(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImageUrl && (
              <img
                src={selectedImageUrl}
                alt="Enlarged visit view"
                className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitsTab;
