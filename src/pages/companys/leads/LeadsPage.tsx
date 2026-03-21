import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DropResult } from "@hello-pangea/dnd";
import { parseISO, startOfDay, endOfDay, isWithinInterval, format } from "date-fns";
import { Plus, Search, Filter, List, Kanban } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import LeadModal, { LeadFormData } from "./LeadModal";
import LeadPipeline from "./LeadPipeline";
import LeadTable from "./LeadTable";
import { Deal, PipelineColumn } from "../../../types/leads";
import { useCreateLead, useLeads, useUpdateLeadStatus } from "@/hooks/useLeads";
import { useLeadStatuses, useUpdateLeadStatusOrder } from "@/hooks/useLeadStatus";
import type { LeadStatus } from "@/types/leadStatus";

const VARIANTS: PipelineColumn["variant"][] = ["default", "info", "warning", "success", "destructive"];

const slugify = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getColumnIdFromLead = (lead: any, statuses: LeadStatus[]) => {
  if (lead?.status_id && statuses.some((status) => status.id === lead.status_id)) {
    return lead.status_id;
  }

  const rawStatusName = slugify(lead?.status?.name || lead?.status_name || lead?.status);
  const matchedStatus = statuses.find((status) => slugify(status.name) === rawStatusName);
  return matchedStatus?.id || statuses[0]?.id || "default";
};

const mapLeadToDeal = (lead: any): Deal & { isVerified?: boolean; isCustomer?: boolean } => ({
  id: String(lead?.id || ""),
  title: lead?.name || lead?.title || "Untitled Lead",
  company: lead?.company || lead?.company_name || "-",
  value: lead?.value ? String(lead.value) : lead?.budget ? String(lead.budget) : "-",
  contact: lead?.contact || lead?.email || lead?.phone || "-",
  date: (lead?.created_at || lead?.date || new Date().toISOString()).slice(0, 10),
  quotationStatus: lead?.quotationStatus || lead?.quotation_status,
  isVerified: !!lead?.is_verified,
  isCustomer: !!lead?.customer_id || lead?.lead_type === "CUSTOMER",
});

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

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [createLeadStatusId, setCreateLeadStatusId] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [visibleStageIds, setVisibleStageIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"pipeline" | "table">(() => {
    return (localStorage.getItem("leadsViewMode") as "pipeline" | "table") || "pipeline";
  });

  const filters = useMemo(() => {
    const f: any = {};
    if (searchTerm) f.search = searchTerm;
    if (dateRange?.from) f.start_date = format(dateRange.from, "yyyy-MM-dd");
    if (dateRange?.to) {
      f.end_date = format(dateRange.to, "yyyy-MM-dd");
    } else if (dateRange?.from) {
      f.end_date = format(dateRange.from, "yyyy-MM-dd");
    }
    return f;
  }, [searchTerm, dateRange]);

  const { data: leads = [], isLoading } = useLeads(filters);
  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLeadStatus();
  const updateStatusOrderMutation = useUpdateLeadStatusOrder();
  const leadStatuses = statusResponse?.items || [];

  useEffect(() => {
    localStorage.setItem("leadsViewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!leadStatuses.length) return;

    const sortedIds = [...leadStatuses]
      .sort((a, b) => (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER))
      .map((status) => status.id);

    setColumnOrder((prev) =>
      prev.length
        ? [...prev.filter((id) => sortedIds.includes(id)), ...sortedIds.filter((id) => !prev.includes(id))]
        : sortedIds
    );
    setVisibleStageIds((prev) =>
      prev.length
        ? [...prev.filter((id) => sortedIds.includes(id)), ...sortedIds.filter((id) => !prev.includes(id))]
        : sortedIds
    );
    setCreateLeadStatusId((prev) => prev || sortedIds[0] || null);
  }, [leadStatuses]);

  const isDealVisible = useCallback(
    (deal: Deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateRange?.from) {
        const dealDate = parseISO(deal.date);
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchesDate = isWithinInterval(dealDate, { start: fromDate, end: toDate });
      }

      return matchesSearch && matchesDate;
    },
    [searchTerm, dateRange]
  );

  const columns = useMemo(() => {
    const sortedStatuses = [...leadStatuses].sort(
      (a, b) => (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER)
    );

    const leadGroups = sortedStatuses.reduce<Record<string, Deal[]>>((acc, status) => {
      acc[status.id] = [];
      return acc;
    }, {});

    leads.forEach((lead: any) => {
      const columnId = getColumnIdFromLead(lead, sortedStatuses);
      leadGroups[columnId] = [...(leadGroups[columnId] || []), mapLeadToDeal(lead)];
    });

    return columnOrder
      .map((columnId) => {
        const statusIndex = sortedStatuses.findIndex((status) => status.id === columnId);
        const status = sortedStatuses.find((item) => item.id === columnId);
        if (!status) return null;

        return {
          id: status.id,
          title: status.name,
          variant: VARIANTS[statusIndex % VARIANTS.length] || "default",
          deals: (leadGroups[columnId] || []).filter(isDealVisible),
        } satisfies PipelineColumn;
      })
      .filter(Boolean) as PipelineColumn[];
  }, [columnOrder, isDealVisible, leadStatuses, leads]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      if (source.index === 0 || destination.index === 0) return;

      updateStatusOrderMutation.mutate({
        orders: [
          {
            id: result.draggableId,
            display_order: destination.index + 1
          }
        ]
      }, {
        onSuccess: () => {
          setColumnOrder((prev) => {
            const next = [...prev];
            const [movedColumn] = next.splice(source.index, 1);
            if (!movedColumn) return prev;
            next.splice(destination.index, 0, movedColumn);
            return next;
          });
        }
      });
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return;
    }

    const srcCol = columns.find((column) => column.id === source.droppableId);
    const destCol = columns.find((column) => column.id === destination.droppableId);
    const movedDeal = srcCol?.deals[source.index];

    if (!destCol || !movedDeal) {
      return;
    }

    updateLeadMutation.mutate(
      {
        leadId: movedDeal.id,
        status_id: destCol.id,
      },
    );
  };

  const handleAddLead = (data: any, setError: (field: any, err: any) => void) => {
    createLeadMutation.mutate(
      data,
      {
        onSuccess: () => {
          setIsLeadModalOpen(false);
        },
        onError: (error) => applyServerValidationErrors(error, setError),
      }
    );
  };

  const toggleStageVisibility = (id: string) => {
    setVisibleStageIds((prev) =>
      prev.includes(id) ? prev.filter((stageId) => stageId !== id) : [...prev, id]
    );
  };

  const displayedColumns = useMemo(() => {
    return columns.filter((column) => visibleStageIds.includes(column.id));
  }, [columns, visibleStageIds]);

  return (
    <div className="mx-auto flex h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in flex-col overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search leads..."
              className="h-9 rounded-sm border-border/60 bg-background pl-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-2 md:w-auto sm:flex-row">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-border/60 bg-background hover:bg-accent/50">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-semibold">Filter Stages</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={visibleStageIds.includes(column.id)}
                      onCheckedChange={() => toggleStageVisibility(column.id)}
                      onSelect={(e) => e.preventDefault()}
                      className="text-sm"
                    >
                      {column.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex w-full justify-center gap-1 rounded-sm border border-border/60 bg-muted/20 p-1 sm:w-auto">
              <Button
                variant={viewMode === "pipeline" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 flex-1 rounded-xs px-3 text-xs font-semibold transition-all sm:flex-none",
                  viewMode === "pipeline" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewMode("pipeline")}
              >
                <Kanban className="mr-1.5 h-3.5 w-3.5" />
                <span>Pipeline</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 flex-1 rounded-xs px-3 text-xs font-semibold transition-all sm:flex-none",
                  viewMode === "table" ? "bg-background shadow-xs text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setViewMode("table")}
              >
                <List className="mr-1.5 h-3.5 w-3.5" />
                <span>Table</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Button
            onClick={() => {
              setCreateLeadStatusId(columns[0]?.id || createLeadStatusId || null);
              setIsLeadModalOpen(true);
            }}
            size="sm"
            className="h-9 w-full px-4 font-semibold shadow-sm transition-all hover:shadow-md active:scale-95 lg:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Create Lead</span>
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pt-2">
        {viewMode === "pipeline" ? (
          <LeadPipeline displayedColumns={displayedColumns} onDragEnd={onDragEnd} isUpdatingOrder={updateStatusOrderMutation.isPending} />
        ) : (
          <div className="h-full overflow-auto">
            <LeadTable displayedColumns={displayedColumns} />
          </div>
        )}
        {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading leads...</p>}
      </div>

      <LeadModal
        open={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={handleAddLead}
        addModalCol={createLeadStatusId}
        columns={columns}
        isSubmitting={createLeadMutation.isPending}
      />
    </div>
  );
};

export default LeadsPage;
