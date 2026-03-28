import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Deal, PipelineColumn } from "../../../types/leads";
import { useUpdateLead, useUpdateLeadStatus } from "@/hooks/useLeads";
import { useLeadStatuses } from "@/hooks/useLeadStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  displayedColumns: PipelineColumn[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  enableSelection?: boolean;
  onSelectionChange?: (
    selectedItems: (Deal & { stage: string; stageVariant: string })[],
  ) => void;
  // Pagination Props
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
}

const PRIORITIES = [
  { value: "HOT", label: "Hot", color: "text-destructive" },
  { value: "WARM", label: "Warm", color: "text-warning" },
  { value: "COLD", label: "Cold", color: "text-primary" },
];

const LeadTable = ({
  displayedColumns,
  enableSelection,
  onSelectionChange,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: LeadTableProps) => {
  const navigate = useNavigate();
  const updateLeadMutation = useUpdateLead();
  const updateLeadStatusMutation = useUpdateLeadStatus();
  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const leadStatuses = (statusResponse as any)?.items || [];

  const flatDeals = useMemo(() => {
    return (displayedColumns as any[]).flatMap((col: any) =>
      col.deals.map((deal: any) => ({
        ...deal,
        stage: col.title,
        stageVariant: col.variant,
      })),
    );
  }, [displayedColumns]);

  const handlePriorityChange = (leadId: string, priority: string) => {
    updateLeadMutation.mutate({ leadId, priority });
  };

  const handleStatusChange = (leadId: string, statusId: string) => {
    updateLeadStatusMutation.mutate({ leadId, status_id: statusId });
  };

  const tableColumns: Column<Deal & { stage: string; stageVariant: string }>[] =
    [
      {
        key: "index",
        header: "#",
        render: (_: Deal) => (
          <div className="text-center font-mono opacity-50 text-[10px]">
            {flatDeals.findIndex((item) => item.id === _.id) + 1}
          </div>
        ),
        className: "w-[40px] text-center",
      },
      {
        key: "title",
        header: "Lead Name",
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground text-sm uppercase">
              {item.title}
            </span>
          </div>
        ),
      },
      {
        key: "company",
        header: "Company",
        className: "hidden md:table-cell",
        render: (item) => (
          <span className="text-sm text-foreground/80">
            {item.company || "-"}
          </span>
        ),
      },
      {
        key: "contact",
        header: "Contact Details",
        render: (item) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium">{item.contact || "-"}</span>
          </div>
        ),
      },
      {
        key: "tags",
        header: "Tags",
        className: "hidden lg:table-cell",
        render: (item) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {item.tags && item.tags.length > 0 ? (
              item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-xs font-medium whitespace-nowrap"
                >
                  {tag.name}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground/40 text-[10px]">-</span>
            )}
          </div>
        ),
      },
      {
        key: "status_id",
        header: "Status",
        render: (item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-accent/50 group border border-transparent hover:border-border/40"
              >
                <StatusBadge
                  status={item.status_name || item.stage}
                  color={item.status_color}
                  variant={item.stageVariant}
                />
                <ChevronDown className="ml-1.5 h-3 w-3 text-muted-foreground/60 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1">
              {leadStatuses.map((status) => (
                <DropdownMenuItem
                  key={status.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(item.id, status.id);
                  }}
                  className={cn(
                    "flex items-center justify-between text-[11px] rounded-xs mb-0.5 last:mb-0 py-2",
                    item.status_id === status.id && "bg-accent/50 font-medium",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: status.color || "#ccc" }}
                    />
                    {status.name}
                  </div>
                  {item.status_id === status.id && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        key: "priority",
        header: "Priority",
        render: (item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-accent/50 group border border-transparent hover:border-border/40"
              >
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-wide",
                    PRIORITIES.find((p) => p.value === item.priority)?.color ||
                      "text-muted-foreground",
                  )}
                >
                  {item.priority || "NORMAL"}
                </span>
                <ChevronDown className="ml-1.5 h-3 w-3 text-muted-foreground/60 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 p-1">
              {PRIORITIES.map((p) => (
                <DropdownMenuItem
                  key={p.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePriorityChange(item.id, p.value);
                  }}
                  className={cn(
                    "flex items-center justify-between text-[10px] rounded-xs mb-0.5 last:mb-0 py-2",
                    item.priority === p.value && "bg-accent/50 font-bold",
                  )}
                >
                  <span
                    className={cn(
                      "font-extrabold uppercase tracking-wide",
                      p.color,
                    )}
                  >
                    {p.label}
                  </span>
                  {item.priority === p.value && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        key: "date",
        header: "Created At",
        className: "hidden xl:table-cell",
        render: (item) => (
          <span className="text-[10px] text-muted-foreground font-medium">
            {item.date}
          </span>
        ),
      },
    ];

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      <div className="flex-1 overflow-auto bg-card rounded-sm border border-border/40 shadow-sm scrollbar-hide">
        <DataTable
          data={flatDeals}
          columns={tableColumns}
          pageSize={pageSize}
          onRowClick={(item) => navigate(item.id)}
          enableSelection={enableSelection}
          onSelectionChange={(items) => onSelectionChange?.(items as any)}
          serverSide={true}
          serverTotal={total}
          serverPage={page}
          onServerPageChange={onPageChange}
          onServerPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
        />
      </div>
      {updateLeadMutation.isPending && (
        <div className="fixed bottom-4 right-4 animate-pulse bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs shadow-lg">
          Updating priority...
        </div>
      )}
      {updateLeadStatusMutation.isPending && (
        <div className="fixed bottom-4 right-4 animate-pulse bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs shadow-lg">
          Updating status...
        </div>
      )}
    </div>
  );
};

export default LeadTable;
