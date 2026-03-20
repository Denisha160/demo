import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DropResult } from "@hello-pangea/dnd";
import { parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
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
import { useCreateLead, useLeads, useUpdateLead } from "@/hooks/useLeads";

const COLUMN_META: Omit<PipelineColumn, "deals">[] = [
  { id: "initial", title: "Initial Lead", variant: "default" },
  { id: "verified", title: "Verified Lead", variant: "info" },
  { id: "quotation", title: "Quotation", variant: "warning" },
  { id: "won", title: "Won", variant: "success" },
  { id: "lost", title: "Lost", variant: "destructive" },
];

const slugify = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getColumnIdFromLead = (lead: any) => {
  const raw = slugify(lead?.stage || lead?.status || lead?.status_name);

  if (["initial", "initial_lead", "new"].includes(raw)) return "initial";
  if (["verified", "verified_lead", "contacted", "qualified"].includes(raw)) return "verified";
  if (["quotation", "proposal"].includes(raw)) return "quotation";
  if (["won", "closed_won"].includes(raw)) return "won";
  if (["lost", "closed_lost", "rejected"].includes(raw)) return "lost";

  return "initial";
};

const mapLeadToDeal = (lead: any): Deal => ({
  id: String(lead?.id || ""),
  title: lead?.name || lead?.title || "Untitled Lead",
  company: lead?.company || lead?.company_name || "-",
  value: lead?.value ? String(lead.value) : lead?.budget ? String(lead.budget) : "-",
  contact: lead?.contact || lead?.email || lead?.phone || "-",
  date: (lead?.created_at || lead?.date || new Date().toISOString()).slice(0, 10),
  quotationStatus: lead?.quotationStatus || lead?.quotation_status,
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
  const [addModalCol, setAddModalCol] = useState<string | null>(null);
  const [columnOrder, setColumnOrder] = useState(COLUMN_META.map((column) => column.id));
  const [visibleStageIds, setVisibleStageIds] = useState<string[]>(COLUMN_META.map((column) => column.id));
  const [viewMode, setViewMode] = useState<"pipeline" | "table">(() => {
    return (localStorage.getItem("leadsViewMode") as "pipeline" | "table") || "pipeline";
  });

  const { data: leads = [], isLoading } = useLeads();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();

  useEffect(() => {
    localStorage.setItem("leadsViewMode", viewMode);
  }, [viewMode]);

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
    const leadGroups = COLUMN_META.reduce<Record<string, Deal[]>>((acc, column) => {
      acc[column.id] = [];
      return acc;
    }, {});

    leads.forEach((lead: any) => {
      const columnId = getColumnIdFromLead(lead);
      leadGroups[columnId] = [...(leadGroups[columnId] || []), mapLeadToDeal(lead)];
    });

    return columnOrder
      .map((columnId) => {
        const meta = COLUMN_META.find((column) => column.id === columnId);
        if (!meta) return null;

        return {
          ...meta,
          deals: (leadGroups[columnId] || []).filter(isDealVisible),
        } satisfies PipelineColumn;
      })
      .filter(Boolean) as PipelineColumn[];
  }, [columnOrder, isDealVisible, leads]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      setColumnOrder((prev) => {
        const next = [...prev];
        const [movedColumn] = next.splice(source.index, 1);
        if (!movedColumn) return prev;
        next.splice(destination.index, 0, movedColumn);
        return next;
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
        status: destCol.title,
        stage: destCol.id,
        stage_name: destCol.title,
      },
      {
        onSuccess: () => {
          toast.success(`Lead moved to ${destCol.title}`);
        },
      }
    );
  };

  const handleAddLead = (data: LeadFormData, setError: (field: any, err: any) => void) => {
    const column = COLUMN_META.find((item) => item.id === addModalCol);

    createLeadMutation.mutate(
      {
        name: data.title,
        title: data.title,
        company: data.company,
        company_name: data.company,
        email: data.email,
        phone: data.phone,
        status: data.status || column?.title || "Initial Lead",
        stage: addModalCol || "initial",
        source: data.source,
        assigned_to: data.assigned_to,
        country: data.country,
        state: data.state,
        city: data.city,
        tags: data.tags,
        designation: data.designation,
        website: data.website,
        gst_pan: data.gst_pan,
        address: data.address,
        pincode: data.pincode,
        alternative_phone: data.alternative_phone,
      },
      {
        onSuccess: () => {
          setAddModalCol(null);
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
                  {COLUMN_META.map((column) => (
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
            onClick={() => setAddModalCol("initial")}
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
          <LeadPipeline displayedColumns={displayedColumns} onDragEnd={onDragEnd} />
        ) : (
          <div className="h-full overflow-auto">
            <LeadTable displayedColumns={displayedColumns} />
          </div>
        )}
        {isLoading && <p className="mt-3 text-xs text-muted-foreground">Loading leads...</p>}
      </div>

      <LeadModal
        open={!!addModalCol}
        onClose={() => setAddModalCol(null)}
        onSave={handleAddLead}
        addModalCol={addModalCol}
        columns={columns.length ? columns : COLUMN_META.map((column) => ({ ...column, deals: [] }))}
        isSubmitting={createLeadMutation.isPending}
      />
    </div>
  );
};

export default LeadsPage;
