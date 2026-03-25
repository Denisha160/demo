import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  History,
  MoreHorizontal,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLeadActivities } from "@/hooks/useLeadActivities";
import { LeadActivityType } from "@/types/activities";
import { cn } from "@/lib/utils";

const ActivityTab = () => {
  const { id: leadId = "" } = useParams<{ id: string }>();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useLeadActivities(leadId, {
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const activities = data?.activities || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground animate-pulse font-medium">
          Loading history...
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border/50 shadow-sm p-10 flex flex-col items-center justify-center text-center space-y-3">
        <History className="h-10 w-10 text-muted-foreground opacity-20" />
        <div>
          <div className="font-medium text-sm text-foreground">
            No history found
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            Any changes or interactions will appear here in chronological order.
          </p>
        </div>
      </div>
    );
  }

  const activityLabels: Record<LeadActivityType, string> = {
    LEAD_CREATED: "Created",
    STATUS_CHANGE: "Status Update",
    OWNER_CHANGE: "Reassigned",
    PRIORITY_CHANGE: "Priority Update",
    FIELD_UPDATE: "Updated",
    NOTE_ADDED: "Note Added",
    CALL_LOGGED: "Call Log",
    VISIT_SCHEDULED: "Visit Scheduled",
    VISIT_COMPLETED: "Visit Done",
    TASK_CREATED: "Task Created",
    TASK_COMPLETED: "Task Done",
    FOLLOW_UP_SCHEDULED: "Follow-up",
    FOLLOW_UP_COMPLETED: "Follow-up Done",
    QUOTATION_CREATED: "Quoted",
    QUOTATION_UPDATED: "Quote Updated",
    ATTACHMENT_ADDED: "Attached",
    CONVERTED_TO_CUSTOMER: "Converted",
    SYSTEM_EVENT: "System",
    OTHER: "Action",
  };

  return (
    <div className="bg-card rounded-lg border border-border/50 shadow-sm flex flex-col animate-fade-in">
      <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div>
          <div className="font-bold text-xs text-foreground flex items-center gap-2">
            <History className="h-3 w-3 text-primary" />
            ACTIVITY LOG
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] py-0 h-4 border-border/60 font-mono text-muted-foreground"
        >
          {total} TOTAL EVENTS
        </Badge>
      </div>

      <div className="divide-y divide-border/30">
        {activities.map((activity, index) => {
          const label =
            activityLabels[activity.activity_type] || activityLabels.OTHER;

          return (
            <div
              key={activity.id}
              className="p-3.5 hover:bg-muted/10 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1.5 mb-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs font-bold text-foreground underline decoration-primary/20 decoration-2 underline-offset-4">
                    {activity.user_name || "System"}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                    {label}
                  </span>
                  <span className="text-[11px] text-muted-foreground/80">
                    •
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {format(new Date(activity.created_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground font-mono bg-muted/30 px-1.5 py-0.5 rounded border border-border/20 whitespace-nowrap hidden md:block">
                  {formatDistanceToNow(new Date(activity.created_at))} ago
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[12px] text-foreground/80 leading-relaxed font-medium">
                  {activity.description}
                </p>

                {activity.activity_type === "FIELD_UPDATE" &&
                  activity.new_value &&
                  typeof activity.new_value === "object" && (
                    <div className="flex flex-col gap-1 mt-1 pl-2 border-l-2 border-primary/10">
                      {Object.keys(activity.new_value).map((key) => {
                        const newVal = (activity.new_value as any)[key];
                        const oldVal = (activity.old_value as any)?.[key];

                        if (
                          key.endsWith("_id") ||
                          key === "id" ||
                          ["updated_at", "updated_by", "created_at", "created_by", "deleted_at"].includes(key)
                        ) {
                          return null;
                        }

                        // Skip if redundant with description (rough check)
                        if (
                          activity.description.toLowerCase().includes(key.toLowerCase()) &&
                          activity.description.toLowerCase().includes(String(newVal).toLowerCase())
                        ) {
                          return null;
                        }

                        const fieldLabel =
                          key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/_/g, " ");

                        return (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-[10px]"
                          >
                            <span className="text-muted-foreground font-medium">
                              {fieldLabel}:
                            </span>
                            {oldVal !== undefined && (
                              <span className="text-muted-foreground/60 line-through">
                                {String(oldVal)}
                              </span>
                            )}
                            <MoreHorizontal className="h-2 w-2 text-muted-foreground/30" />
                            <span className="text-primary font-bold">
                              {String(newVal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple Minimalist Pagination */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-border/40 bg-muted/5 flex items-center justify-between">
          <div className="text-[10px] font-medium text-muted-foreground">
            Page <span className="text-foreground">{currentPage}</span> of{" "}
            {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/5"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/5"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-1 px-1">
              {[1, 2, 3].map((offset) => {
                const pageNum = currentPage - 2 + offset;
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "secondary" : "ghost"}
                      className={cn(
                        "h-6 w-6 text-[10px] p-0 font-bold",
                        currentPage === pageNum
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-muted-foreground",
                      )}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/5"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-primary/5"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTab;
