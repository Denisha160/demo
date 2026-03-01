import { ReactNode, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  enableSelection?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  idKey?: keyof T;
  serverSide?: boolean;
  serverTotal?: number;
  serverPage?: number;
  onServerPageChange?: (page: number) => void;
  onServerPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
  enableSelection = false,
  onSelectionChange,
  idKey = "id" as keyof T,
  serverSide = false,
  serverTotal = 0,
  serverPage = 1,
  onServerPageChange,
  onServerPageSizeChange,
  isLoading = false,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<T[keyof T]>>(new Set());

  // Use props if server-side, else use local state
  const activePage = serverSide ? serverPage : currentPage;
  const activePageSize = serverSide ? pageSize : pageSizeState;
  const activeTotal = serverSide ? serverTotal : data.length;

  // Pagination Logic
  const totalPages = Math.ceil(activeTotal / activePageSize);
  const start = serverSide ? 0 : (activePage - 1) * activePageSize;
  const paginatedData = serverSide ? data : data.slice(start, start + activePageSize);

  const handlePageSizeChange = (newValue: string) => {
    const size = parseInt(newValue);
    if (serverSide) {
      onServerPageSizeChange?.(size);
    } else {
      setPageSizeState(size);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (serverSide) {
      onServerPageChange?.(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRowIds);
    if (checked) {
      paginatedData.forEach((item) => newSelected.add(item[idKey]));
    } else {
      paginatedData.forEach((item) => newSelected.delete(item[idKey]));
    }
    updateSelection(newSelected);
  };

  const handleSelectRow = (item: T, checked: boolean) => {
    const newSelected = new Set(selectedRowIds);
    if (checked) {
      newSelected.add(item[idKey]);
    } else {
      newSelected.delete(item[idKey]);
    }
    updateSelection(newSelected);
  };

  const updateSelection = (newSet: Set<T[keyof T]>) => {
    setSelectedRowIds(newSet);
    if (onSelectionChange) {
      const selectedItems = data.filter((item) => newSet.has(item[idKey]));
      onSelectionChange(selectedItems);
    }
  };

  const isAllPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedRowIds.has(item[idKey]));

  const isSomePageSelected =
    !isAllPageSelected &&
    paginatedData.some((item) => selectedRowIds.has(item[idKey]));

  // Reset page if data changes dramatically (only for client-side)
  useEffect(() => {
    if (!serverSide && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [data.length, totalPages, currentPage, serverSide]);

  return (
    <div className={cn("shadow-card border border-border/60 bg-card rounded-md shadow-sm flex flex-col", isLoading && "opacity-60 pointer-events-none")}>
      <div className="relative overflow-x-auto scrollbar-hide">
        <table className="w-full text-xs border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-10 bg-secondary/80 backdrop-blur-sm shadow-sm">
            <tr className="border-b border-border/60 bg-muted/30 transition-colors">
              {enableSelection && (
                <th className="h-8 px-3 w-[40px] text-center align-middle">
                  <Checkbox
                    checked={
                      isAllPageSelected ? true : isSomePageSelected ? "indeterminate" : false
                    }
                    onCheckedChange={(c) => handleSelectAll(c === true)}
                    aria-label="Select all"
                    className="translate-y-[1px]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-8 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedData.map((item, i) => {
              const isSelected = selectedRowIds.has(item[idKey]);
              return (
                <tr
                  key={item[idKey] || i}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-colors",
                    isSelected ? "bg-primary/5 hover:bg-primary/10" : "even:bg-muted/20 hover:bg-muted/40",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {enableSelection && (
                    <td
                      className="px-3 py-1.5 w-[40px] text-center align-middle"
                      onClick={(e) => e.stopPropagation()} // Prevent row click when checking box
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) => handleSelectRow(item, c === true)}
                        aria-label="Select row"
                        className="translate-y-[1px]"
                      />
                    </td>
                  )}
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
              );
            })}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="h-8 w-8 mb-2 opacity-20" />
            <span className="text-xs font-medium">No records found</span>
          </div>
        )}
      </div>

      {activeTotal > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-2 border-t border-border/60 bg-muted/10 gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {enableSelection && (
              <p className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                {selectedRowIds.size} of {activeTotal} row(s) selected
              </p>
            )}

            <p className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
              Showing <span className="text-foreground">{serverSide ? (activePage - 1) * activePageSize + 1 : start + 1}-{Math.min(serverSide ? activePage * activePageSize : start + activePageSize, activeTotal)}</span> of <span className="text-foreground">{activeTotal}</span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-medium">Rows:</span>
              <Select
                value={activePageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-6 w-[60px] text-[11px] px-2 py-0 bg-transparent border-border/60 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()} className="text-[11px]">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-[11px] font-medium text-muted-foreground mr-1">
              Page {activePage} of {totalPages}
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="outline"
                className="h-6 w-6 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={activePage === 1}
                onClick={() => handlePageChange(1)}
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                className="h-6 w-6 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                className="h-6 w-6 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                className="h-6 w-6 p-0 border-border/60 bg-transparent disabled:opacity-30"
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                <ChevronsRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DataTable;