import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DropResult } from "@hello-pangea/dnd";
import {
  parseISO,
  startOfDay,
  endOfDay,
  isWithinInterval,
  format,
} from "date-fns";
import { Plus, Search, Filter, List, Kanban, X } from "lucide-react";
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
import { formatDate, formatDateForAPI } from "@/utils/date";
import { Combobox } from "@/components/ui/combobox";
import LeadModal, { LeadFormData } from "./LeadModal";
import LeadPipeline from "./LeadPipeline";
import LeadTable from "./LeadTable";
import { Deal, PipelineColumn } from "../../../types/leads";
import { useCreateLead, useLeads, useUpdateLeadStatus, useBulkUpdateLeads } from "@/hooks/useLeads";
import {
  useLeadStatuses,
  useUpdateLeadStatusOrder,
} from "@/hooks/useLeadStatus";
import type { LeadStatus } from "@/types/leadStatus";
import { listLeads } from "@/services/api";
import BatchAssignModal from "./BatchAssignModal";

const VARIANTS: PipelineColumn["variant"][] = [
  "default",
  "info",
  "warning",
  "success",
  "destructive",
];

const PRIORITY_OPTIONS = [
  { value: "ALL", label: "All Priorities" },
  { value: "HOT", label: "Hot" },
  { value: "WARM", label: "Warm" },
  { value: "COLD", label: "Cold" },
];

const slugify = (value?: string) =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getColumnIdFromLead = (lead: any, statuses: LeadStatus[]) => {
  if (
    lead?.status_id &&
    statuses.some((status) => status.id === lead.status_id)
  ) {
    return lead.status_id;
  }

  const rawStatusName = slugify(
    lead?.status?.name || lead?.status_name || lead?.status,
  );
  const matchedStatus = statuses.find(
    (status) => slugify(status.name) === rawStatusName,
  );
  return matchedStatus?.id || statuses[0]?.id || "default";
};

const mapLeadToDeal = (
  lead: any,
): Deal & { isVerified?: boolean; isCustomer?: boolean } => ({
  id: String(lead?.id || ""),
  title: lead?.name || lead?.title || "Untitled Lead",
  company: lead?.company || lead?.company_name || "-",
  value: lead?.value
    ? String(lead.value)
    : lead?.budget
      ? String(lead.budget)
      : "-",
  contact: lead?.contact || lead?.email || lead?.phone || "-",
  date: formatDate(lead?.created_at || lead?.date),
  priority: lead?.priority || "NORMAL",
  quotationStatus: lead?.quotationStatus || lead?.quotation_status,
  isVerified: !!lead?.is_verified,
  isCustomer: !!lead?.customer_id || lead?.lead_type === "CUSTOMER",
  status_id: lead?.status_id,
  status_name: lead?.status_name,
  status_color: lead?.status_color,
  tags: lead?.tags,
  phone: lead?.phone || lead?.mobile || "-",
  raw_date: lead?.created_at || lead?.date,
});

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

const LeadsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchTerm = searchParams.get("search") || "";
  const setSearchTerm = useCallback((val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set("search", val);
      else prev.delete("search");
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const dateRange = useMemo<DateRange | undefined>(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    return {
      from: from ? parseISO(from) : undefined,
      to: to ? parseISO(to) : undefined,
    };
  }, [searchParams]);

  const setDateRange = useCallback((range: DateRange | undefined) => {
    setSearchParams((prev) => {
      if (range?.from) prev.set("from", format(range.from, "yyyy-MM-dd"));
      else prev.delete("from");
      if (range?.to) prev.set("to", format(range.to, "yyyy-MM-dd"));
      else prev.delete("to");
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const viewMode = (searchParams.get("view") as "pipeline" | "table") || "pipeline";
  const setViewMode = useCallback((mode: "pipeline" | "table") => {
    setSearchParams((prev) => {
      prev.set("view", mode);
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const visibleStageIds = useMemo(() => {
    const stages = searchParams.get("stages");
    return stages ? stages.split(",") : [];
  }, [searchParams]);

  const setVisibleStageIds = useCallback((ids: string[] | ((prev: string[]) => string[])) => {
    setSearchParams((prev) => {
      const nextIds = typeof ids === "function" ? ids(visibleStageIds) : ids;
      if (nextIds.length) prev.set("stages", nextIds.join(","));
      else prev.delete("stages");
      return prev;
    }, { replace: true });
  }, [setSearchParams, visibleStageIds]);

  const priority = searchParams.get("priority") || "";
  const setPriority = useCallback((val: string) => {
    setSearchParams((prev) => {
      if (val && val !== "ALL") prev.set("priority", val);
      else prev.delete("priority");
      return prev;
    }, { replace: true });
  }, [setSearchParams]);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isBatchAssignOpen, setIsBatchAssignOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [createLeadStatusId, setCreateLeadStatusId] = useState<string | null>(
    null,
  );
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const bulkUpdateLeadsMutation = useBulkUpdateLeads();
  const [isAssigning, setIsAssigning] = useState(false);
  const [tableResetKey, setTableResetKey] = useState(0);

  const hasFilters = useMemo(() => {
    return Boolean(searchTerm || dateRange?.from || dateRange?.to || priority);
  }, [searchTerm, dateRange, priority]);

  const handleClearFilters = () => {
    setSearchParams((prev) => {
      prev.delete("search");
      prev.delete("from");
      prev.delete("to");
      prev.delete("priority");
      return prev;
    }, { replace: true });
  };

  const filters = useMemo(() => {
    const f: any = {};
    if (searchTerm) f.search = searchTerm;
    if (dateRange?.from) {
      f.start_date = formatDateForAPI(dateRange.from);
    }
    if (dateRange?.to) {
      f.end_date = formatDateForAPI(dateRange.to);
    }
    if (priority && priority !== "ALL") f.priority = priority;
    return f;
  }, [searchTerm, dateRange, priority]);

  const [paginationData, setPaginationData] = useState<Record<string, {
    items: any[];
    total: number;
    offset: number;
    limit: number;
  }>>({});

  const [tableData, setTableData] = useState<{
    items: any[];
    total: number;
    offset: number;
  }>({ items: [], total: 0, offset: 0 });

  const { data: initialGroups, isLoading: isGroupLoading } = useLeads<any[]>(
    { ...filters, grouped: true, limit_per_status: 10 },
    (res) => res?.data?.groups || [],
    { enabled: viewMode === "pipeline" },
  );

  const { data: initialTableLeads, isLoading: isTableLoading } = useLeads<any>(
    { ...filters, limit: 20, offset: 0 },
    (res) => res?.data,
    { enabled: viewMode === "table" },
  );

  const isLoading = viewMode === "pipeline" ? isGroupLoading : isTableLoading;
  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLeadStatus();
  const updateStatusOrderMutation = useUpdateLeadStatusOrder();
  const leadStatuses = useMemo(() => (statusResponse as any)?.items || [], [statusResponse]);

  useEffect(() => {
    if (initialGroups) {
      const newPagination: Record<string, any> = {};
      (initialGroups as any[]).forEach((group: any) => {
        newPagination[group.status_id] = {
          items: group.items,
          total: group.total,
          offset: 0,
          limit: 10,
        };
      });
      setPaginationData(newPagination);
    }
  }, [initialGroups]);

  useEffect(() => {
    if (initialTableLeads) {
      setTableData({
        items: (initialTableLeads as any).items,
        total: (initialTableLeads as any).pagination.total,
        offset: 0,
      });
    }
  }, [initialTableLeads]);

  useEffect(() => {
    if (!leadStatuses.length) return;

    const sortedIds = [...leadStatuses]
      .sort(
        (a, b) =>
          (a.display_order ?? Number.MAX_SAFE_INTEGER) -
          (b.display_order ?? Number.MAX_SAFE_INTEGER),
      )
      .map((status) => status.id);

    setColumnOrder((prev) =>
      prev.length
        ? [
          ...prev.filter((id) => sortedIds.includes(id)),
          ...sortedIds.filter((id) => !prev.includes(id)),
        ]
        : sortedIds,
    );
    if (!searchParams.has("stages")) {
      setVisibleStageIds(sortedIds);
    }
    setCreateLeadStatusId((prev) => prev || sortedIds[0] || null);
  }, [leadStatuses, searchParams, setVisibleStageIds]);

  const isDealVisible = useCallback(
    (deal: Deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateRange?.from && deal.raw_date) {
        const dealDate = new Date(deal.raw_date);
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from);
        matchesDate = isWithinInterval(dealDate, {
          start: fromDate,
          end: toDate,
        });
      }

      const matchesPriority = priority ? deal.priority === priority : true;

      return matchesSearch && matchesDate && matchesPriority;
    },
    [searchTerm, dateRange, priority],
  );

  const columns = useMemo(() => {
    const sortedStatuses = [...leadStatuses].sort(
      (a, b) =>
        (a.display_order ?? Number.MAX_SAFE_INTEGER) -
        (b.display_order ?? Number.MAX_SAFE_INTEGER),
    );

    return columnOrder
      .map((columnId) => {
        const statusIndex = sortedStatuses.findIndex(
          (status) => status.id === columnId,
        );
        const status = sortedStatuses.find((item) => item.id === columnId);
        if (!status) return null;

        const paginated = paginationData[columnId];
        const statusItems = paginated?.items || [];

        return {
          id: status.id,
          title: status.name,
          variant: VARIANTS[statusIndex % VARIANTS.length] || "default",
          color: status.color,
          deals: statusItems.map(mapLeadToDeal).filter(isDealVisible),
          total: paginated?.total || 0,
        } satisfies PipelineColumn & { total: number };
      })
      .filter(Boolean) as (PipelineColumn & { total: number })[];
  }, [columnOrder, isDealVisible, leadStatuses, paginationData]);

  const [loadingMoreStatus, setLoadingMoreStatus] = useState<string | null>(null);

  const handleLoadMore = async (statusId: string) => {
    const current = paginationData[statusId];
    if (!current || current.items.length >= current.total) return;

    setLoadingMoreStatus(statusId);
    try {
      const nextOffset = current.offset + current.limit;
      const response = await listLeads({
        ...filters,
        status_id: statusId,
        limit: 10,
        offset: nextOffset,
      });

      const newItems = (response as any)?.data?.items || [];
      setPaginationData((prev) => ({
        ...prev,
        [statusId]: {
          ...prev[statusId],
          items: [...prev[statusId].items, ...newItems],
          offset: nextOffset,
        },
      }));
    } catch (error) {
      console.error("Failed to load more leads:", error);
      toast.error("Failed to load more leads.");
    } finally {
      setLoadingMoreStatus(null);
    }
  };

  const [isTableLoadingMore, setIsTableLoadingMore] = useState(false);

  const handleLoadMoreTable = async () => {
    if (tableData.items.length >= tableData.total) return;

    setIsTableLoadingMore(true);
    try {
      const nextOffset = tableData.offset + 20;
      const response = await listLeads({
        ...filters,
        limit: 20,
        offset: nextOffset,
      });

      const newItems = (response as any)?.data?.items || [];
      setTableData((prev) => ({
        ...prev,
        items: [...prev.items, ...newItems],
        offset: nextOffset,
      }));
    } catch (error) {
      console.error("Failed to load more leads:", error);
      toast.error("Failed to load more leads.");
    } finally {
      setIsTableLoadingMore(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "COLUMN") {
      if (source.index === 0 || destination.index === 0) return;

      const previousColumnOrder = [...columnOrder];

      // Optimistically update column order to avoid UI jump-back
      setColumnOrder((prev) => {
        const next = [...prev];
        const [movedColumn] = next.splice(source.index, 1);
        if (!movedColumn) return prev;
        next.splice(destination.index, 0, movedColumn);
        return next;
      });

      updateStatusOrderMutation.mutate(
        {
          orders: [
            {
              id: result.draggableId,
              display_order: destination.index + 1,
            },
          ],
        },
        {
          onError: () => {
            // Revert if mutation fails
            setColumnOrder(previousColumnOrder);
          },
        },
      );
      return;
    }

    const srcCol = columns.find((column) => column.id === source.droppableId);
    const destCol = columns.find(
      (column) => column.id === destination.droppableId,
    );
    const movedDeal = srcCol?.deals[source.index];

    if (!destCol || !movedDeal) {
      return;
    }

    // Optimistic Update locally
    setPaginationData((prev) => {
      // 1. Same-column move
      if (source.droppableId === destination.droppableId) {
        if (source.index === destination.index) return prev;
        const status = prev[source.droppableId];
        if (!status) return prev;

        const newItems = [...status.items];
        const [movedLead] = newItems.splice(source.index, 1);
        if (!movedLead) return prev;
        newItems.splice(destination.index, 0, movedLead);

        return {
          ...prev,
          [source.droppableId]: { ...status, items: newItems },
        };
      }

      // 2. Inter-column move
      const sourceStatus = prev[source.droppableId];
      const destStatus = prev[destination.droppableId];
      if (!sourceStatus || !destStatus) return prev;

      const newSourceItems = [...sourceStatus.items];
      const [movedLead] = newSourceItems.splice(source.index, 1);
      if (!movedLead) return prev;

      // Update lead status id for the destination column
      const updatedLead = { ...movedLead, status_id: destination.droppableId };

      const newDestItems = [...destStatus.items];
      newDestItems.splice(destination.index, 0, updatedLead);

      return {
        ...prev,
        [source.droppableId]: {
          ...sourceStatus,
          items: newSourceItems,
          total: Math.max(0, sourceStatus.total - 1),
        },
        [destination.droppableId]: {
          ...destStatus,
          items: newDestItems,
          total: destStatus.total + 1,
        },
      };
    });

    // Fire API call only for inter-column moves, since intra-column reordering
    // might not be natively supported by the backend without a specific index/order field.
    if (source.droppableId !== destination.droppableId) {
      updateLeadMutation.mutate(
        {
          leadId: movedDeal.id,
          status_id: destCol.id,
        },
        {
          onError: () => {
            // Rollback (Simplification: refetch initial groups)
            // queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
          },
        },
      );
    }
  };

  const handleAddLead = (
    data: any,
    setError: (field: any, err: any) => void,
  ) => {
    createLeadMutation.mutate(data, {
      onSuccess: () => {
        setIsLeadModalOpen(false);
      },
      onError: (error) => applyServerValidationErrors(error, setError),
    });
  };

  const toggleStageVisibility = (id: string) => {
    setVisibleStageIds((prev) =>
      prev.includes(id)
        ? prev.filter((stageId) => stageId !== id)
        : [...prev, id],
    );
  };

  const displayedColumns = useMemo(() => {
    return columns.filter((column) => visibleStageIds.includes(column.id));
  }, [columns, visibleStageIds]);

  const handleBatchAssign = async (assignedToId: string) => {
    setIsAssigning(true);
    try {
      await bulkUpdateLeadsMutation.mutateAsync({
        lead_ids: selectedLeads.map((lead) => lead.id),
        updates: {
          assigned_to: assignedToId,
        },
      });
      toast.success(`Successfully assigned ${selectedLeads.length} leads.`);
      setSelectedLeads([]);
      setTableResetKey((prev) => prev + 1);
      setIsBatchAssignOpen(false);
    } catch (error) {
      console.error("Batch assignment failed:", error);
      // mutateAsync will reject if there's an error, and useMutation will toast the error already
    } finally {
      setIsAssigning(false);
    }
  };

  const tableColumns = useMemo(() => {
    return [
      {
        id: "all",
        title: "All Leads",
        variant: "default" as const,
        deals: tableData.items.map(mapLeadToDeal),
      },
    ];
  }, [tableData.items]);

  return (
    <div className="mx-auto flex h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in flex-col overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:pb-2">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <div className="relative w-full sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search leads..."
              className="h-9 w-full rounded-sm border-border/60 bg-background pl-9 text-sm focus-visible:ring-1 focus-visible:ring-primary/20 sm:min-w-30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto sm:flex-row sm:items-center sm:gap-2">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              <div className="w-[140px]">
                <Combobox
                  options={PRIORITY_OPTIONS}
                  value={priority || "ALL"}
                  onValueChange={setPriority}
                  placeholder="Priority"
                  className="h-9"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 border-border/60 bg-background hover:bg-accent/50"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs font-semibold">
                    Filter Stages
                  </DropdownMenuLabel>
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

              {hasFilters && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-9 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <div className="flex w-full justify-center gap-1 rounded-sm border border-border/60 bg-muted/20 p-1 sm:w-auto">
              <Button
                variant={viewMode === "pipeline" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 flex-1 rounded-xs px-3 text-xs font-semibold transition-all sm:flex-none",
                  viewMode === "pipeline"
                    ? "bg-background shadow-xs text-primary"
                    : "text-muted-foreground hover:text-foreground",
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
                  viewMode === "table"
                    ? "bg-background shadow-xs text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setViewMode("table")}
              >
                <List className="mr-1.5 h-3.5 w-3.5" />
                <span>Table</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedLeads.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBatchAssignOpen(true)}
              className="h-9 px-4 font-semibold shadow-sm transition-all hover:bg-primary hover:text-primary-foreground animate-in slide-in-from-right-4"
              disabled={isAssigning}
            >
              Assign To ({selectedLeads.length})
            </Button>
          )}

          <Button
            onClick={() => {
              setCreateLeadStatusId(
                columns[0]?.id || createLeadStatusId || null,
              );
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
          <LeadPipeline
            displayedColumns={displayedColumns}
            onDragEnd={onDragEnd}
            onLoadMore={handleLoadMore}
            isLoadingMore={loadingMoreStatus}
          />
        ) : (
          <div className="h-full overflow-auto">
            <LeadTable
              key={tableResetKey}
              displayedColumns={tableColumns}
              onLoadMore={handleLoadMoreTable}
              hasMore={tableData.items.length < tableData.total}
              isLoadingMore={isTableLoadingMore}
              enableSelection={true}
              onSelectionChange={setSelectedLeads}
            />
          </div>
        )}
        {isLoading && (
          <p className="mt-3 text-xs text-muted-foreground">Loading leads...</p>
        )}
      </div>

      <LeadModal
        open={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSave={handleAddLead}
        addModalCol={createLeadStatusId}
        columns={columns}
        isSubmitting={createLeadMutation.isPending}
      />

      <BatchAssignModal
        open={isBatchAssignOpen}
        onClose={() => setIsBatchAssignOpen(false)}
        onAssign={handleBatchAssign}
        selectedCount={selectedLeads.length}
        isSubmitting={isAssigning}
      />
    </div>
  );
};

export default LeadsPage;
