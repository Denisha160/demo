import { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical, CheckCircle, ShieldCheck, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import { PipelineColumn } from "../../../types/leads";
import { getDaysSince } from "@/utils/date";
import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeadPipelineProps {
  displayedColumns: (PipelineColumn & {
    total: number;
    total_expected_revenue: number;
  })[];
  onDragEnd: (result: DropResult) => void;
  onLoadMore?: (statusId: string) => void;
  isUpdatingOrder?: boolean;
  isLoadingMore?: string | null;
}

const LeadPipeline = ({
  displayedColumns,
  onDragEnd,
  onLoadMore,
  isUpdatingOrder,
  isLoadingMore,
}: LeadPipelineProps) => {
  const navigate = useNavigate();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId="pipeline-columns"
        direction="horizontal"
        type="COLUMN"
      >
        {(boardProvided) => (
          <div
            ref={boardProvided.innerRef}
            {...boardProvided.droppableProps}
            className={`flex h-full min-h-0 gap-3 overflow-x-auto overflow-y-hidden pb-2 ${isUpdatingOrder ? "opacity-30 pointer-events-none" : ""}`}
          >
            {displayedColumns.map((col, columnIndex) => {
              const visibleDeals = col.deals;
              const canLoadMore = visibleDeals.length < col.total;

              return (
                <Draggable
                  key={col.id}
                  draggableId={col.id}
                  index={columnIndex}
                  isDragDisabled={columnIndex === 0}
                >
                  {(columnProvided, columnSnapshot) => (
                    <div
                      ref={columnProvided.innerRef}
                      {...columnProvided.draggableProps}
                      style={columnProvided.draggableProps.style}
                      className={`group/column relative flex h-full min-h-0 w-[350px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-border/5 bg-secondary/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-300 ${columnSnapshot.isDragging
                        ? "shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]"
                        : "hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.1)] hover:border-border/30"
                        }`}
                    >
                      {/* Top side hover highlight */}
                      <div
                        className="absolute inset-x-0 top-0 h-1 z-10 opacity-0 transition-opacity duration-300 group-hover/column:opacity-100"
                        style={
                          col.color
                            ? {
                              background: `linear-gradient(to right, transparent, ${col.color}, transparent)`,
                            }
                            : {
                              background: `linear-gradient(to right, transparent, hsl(var(--primary)/0.6), transparent)`,
                            }
                        }
                      />

                      <div
                        {...columnProvided.dragHandleProps}
                        className={`flex cursor-grab items-center justify-between border-b px-4 py-3.5 backdrop-blur-xl transition-colors duration-200 active:cursor-grabbing ${!col.color ? "border-border/20 bg-background/90" : ""
                          }`}
                        style={
                          col.color
                            ? {
                              background: `linear-gradient(to bottom, ${col.color}25, ${col.color}05)`,
                              borderColor: `${col.color}30`,
                            }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-3">
                          {columnIndex === 0 ? (
                            <div className="w-4" />
                          ) : (
                            <div className="text-muted-foreground/40 transition-colors group-hover/column:text-muted-foreground/80">
                              <GripVertical className="h-4 w-4" />
                            </div>
                          )}

                          <StatusBadge
                            status={col.title}
                            variant={col.variant}
                            color={col.color}
                          />
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-muted-foreground/60">
                            Vol:
                          </span>
                          <span className="text-[12px] font-bold text-primary">
                            ₹{col.total_expected_revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Droppable droppableId={col.id} type="DEAL">
                        {(dealProvided, dealSnapshot) => (
                          <div
                            ref={dealProvided.innerRef}
                            {...dealProvided.droppableProps}
                            className={`flex min-h-0 flex-1 flex-col transition-colors ${dealSnapshot.isDraggingOver
                              ? "bg-primary/5"
                              : "bg-transparent"
                              }`}
                          >
                            <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
                              <div className="space-y-3">
                                {visibleDeals.map((deal, i) => (
                                  <Draggable
                                    key={deal.id}
                                    draggableId={deal.id}
                                    index={i}
                                  >
                                    {(dealDragProvided, dealDragSnapshot) => (
                                      <div
                                        ref={dealDragProvided.innerRef}
                                        {...dealDragProvided.draggableProps}
                                        {...dealDragProvided.dragHandleProps}
                                        style={
                                          dealDragProvided.draggableProps.style
                                        }
                                        className={`group relative cursor-pointer rounded-xl bg-card p-4 transition-all duration-300 ease-out active:cursor-grabbing ${dealDragSnapshot.isDragging
                                          ? "z-50 scale-[1.03] rotate-1 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] ring-2 ring-primary/40"
                                          : "shadow-[0_2px_10px_-3px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.12)] hover:ring-1 hover:ring-primary/20"
                                          }`}
                                      >
                                        <div
                                          onClick={() => navigate(deal.id)}
                                          className="flex h-full flex-col gap-1.5 focus:outline-none"
                                        >
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1 group/title cursor-help">
                                                      <p className="line-clamp-2 text-[14px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary flex items-center gap-1.5">
                                                        <span className="truncate max-w-[140px] block">
                                                          {deal.title}
                                                        </span>
                                                        {deal.isVerified && (
                                                          <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
                                                        )}
                                                        {deal.isCustomer && (
                                                          <CheckCircle className="h-4 w-4 shrink-0 text-blue-500" />
                                                        )}
                                                      </p>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent side="bottom" className="max-w-[250px] bg-popover text-popover-foreground shadow-lg border border-border">
                                                    <p className="text-xs font-semibold">{deal.title}</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                              <div className="flex gap-1 mt-0.5">
                                                <span className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                                  {getDaysSince(deal.raw_date)} D
                                                </span>
                                                <span className="whitespace-nowrap rounded bg-secondary/60 px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-muted-foreground/80">
                                                  {deal.date}
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                              <div>
                                                <p className="mt-1 truncate text-[11px] text-muted-foreground">
                                                  {deal.company}
                                                </p>
                                                {deal.phone &&
                                                  deal.phone !== "-" && (
                                                    <p className="mt-1 truncate text-[10px] text-primary/70 font-medium">
                                                      {deal.phone}
                                                    </p>
                                                  )}
                                              </div>
                                              {deal.expected_revenue && (
                                                <span className="text-[16px] font-bold text-green-600">
                                                  ₹{Number(deal.expected_revenue).toLocaleString()}
                                                </span>
                                              )}
                                            </div>

                                            {deal.interested_categories &&
                                              deal.interested_categories
                                                .length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                  {deal.interested_categories.map(
                                                    (cat, idx) => (
                                                      <span
                                                        key={`${cat.id}-${idx}`}
                                                        className="inline-flex items-center rounded-sm bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                                      >
                                                        {cat.name}
                                                      </span>
                                                    ),
                                                  )}
                                                </div>
                                              )}

                                            <div className="mt-3 flex items-center justify-between border-t border-border/10 pt-3">
                                              <div className="flex flex-col gap-1 items-start">
                                                <span className="rounded-md bg-primary/5 px-2 py-0.5 text-[12px] font-bold text-primary">
                                                  {deal.priority}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-1.5 overflow-hidden rounded-full bg-secondary/30 px-1.5 py-0.5">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
                                                  {deal.contact.charAt(0)}
                                                </div>
                                                <span className="max-w-[80px] truncate text-[10px] font-medium text-muted-foreground">
                                                  {deal.contact}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {dealProvided.placeholder}
                              </div>
                            </div>

                            <div className="border-t border-border/20 bg-background/80 p-3">
                              {canLoadMore ? (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-full"
                                  disabled={isLoadingMore === col.id}
                                  onClick={() => onLoadMore?.(col.id)}
                                >
                                  {isLoadingMore === col.id
                                    ? "Loading..."
                                    : "Load More"}
                                </Button>
                              ) : (
                                <div className="text-center text-xs text-muted-foreground">
                                  All leads loaded
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {boardProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default LeadPipeline;
