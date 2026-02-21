import { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);

  const totalPages = Math.ceil(data.length / pageSizeState);
  const start = (currentPage - 1) * pageSizeState;
  const paginatedData = data.slice(start, start + pageSizeState);

  const handlePageSizeChange = (newValue: string) => {
    const size = parseInt(newValue);
    setPageSizeState(size);
    setCurrentPage(1);
  };

  return (
    <div className="shadow-card border border-border/60 bg-card rounded-sm shadow-sm">
      <div className="relative overflow-x-auto scrollbar-hide">
        <table className="w-full text-[13px] text-sm border-collapse min-w-[600px]">
          <thead className="sticky top-[-8px] z-10 bg-secondary shadow-sm">
            <tr className="border-b border-border/60 bg-muted/30 transition-colors">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-9 px-3 text-left align-middle font-semibold text-muted-foreground whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedData.map((item, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group transition-colors even:bg-muted/20",
                  onRowClick ? "cursor-pointer hover:bg-accent/80" : "hover:bg-muted/30"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-1.5 align-middle text-foreground/90 tabular-nums",
                      col.className
                    )}
                  >
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-20" />
            <span className="text-sm font-medium">No records found</span>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/5">
          <div className="flex items-center gap-6">
            <p className="text-[12px] font-medium text-muted-foreground">
              Showing <span className="text-foreground">{start + 1}-{Math.min(start + pageSizeState, data.length)}</span> of <span className="text-foreground">{data.length}</span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-muted-foreground font-medium">Rows:</span>
              <Select
                value={pageSizeState.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-7 w-[65px] text-[12px] bg-transparent border-border/60 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()} className="text-[12px]">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center text-[12px] font-medium text-muted-foreground mr-2">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="outline"
                className="h-7 w-7 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="h-7 w-7 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="h-7 w-7 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="h-7 w-7 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;