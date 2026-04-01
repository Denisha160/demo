import { ReactNode, useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
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

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  enableSelection?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  idKey?: keyof T;
  isLoading?: boolean;

  serverSide?: boolean;
  serverTotal?: number;
  serverPage?: number;
  serverSortKey?: string;
  serverSortDirection?: SortDirection;
  onServerPageChange?: (page: number) => void;
  onServerPageSizeChange?: (size: number) => void;
  onServerSortChange?: (key: string, direction: SortDirection) => void;
  enablePagination?: boolean;
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
  isLoading = false,

  serverSide = false,
  serverTotal = 0,
  serverPage = 1,
  serverSortKey,
  serverSortDirection,
  onServerPageChange,
  onServerPageSizeChange,
  onServerSortChange,
  enablePagination = true,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<T[keyof T]>>(
    new Set(),
  );
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    setPageSizeState(pageSize);
  }, [pageSize]);

  const activePage = serverSide ? serverPage : currentPage;
  const activePageSize = serverSide ? pageSize : pageSizeState;
  const activeTotal = serverSide ? serverTotal : data.length;
  const activeSortKey = serverSide ? serverSortKey : sortKey;
  const activeSortDirection = serverSide ? serverSortDirection : sortDirection;

  const sortedData = useMemo(() => {
    if (serverSide) return data;
    if (!activeSortKey || !activeSortDirection) return data;

    const column = columns.find((c) => c.key === activeSortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      if (column.sortFn) {
        return activeSortDirection === "asc"
          ? column.sortFn(a, b)
          : column.sortFn(b, a);
      }

      const valA = a[activeSortKey];
      const valB = b[activeSortKey];

      if (typeof valA === "string" && typeof valB === "string") {
        return activeSortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      if (valA < valB) return activeSortDirection === "asc" ? -1 : 1;
      if (valA > valB) return activeSortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, serverSide, activeSortKey, activeSortDirection, columns]);

  const totalPages = Math.ceil(activeTotal / activePageSize);
  const start = serverSide ? 0 : (activePage - 1) * activePageSize;
  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    if (!enablePagination) return sortedData;
    return sortedData.slice(start, start + activePageSize);
  }, [sortedData, serverSide, data, start, activePageSize, enablePagination]);

  const handleSort = useCallback(
    (key: string) => {
      // Default to asc when clicking a new column
      let newDirection: SortDirection = "asc";

      if (activeSortKey === key) {
        // Strictly toggle between asc and desc (no null state)
        newDirection = activeSortDirection === "asc" ? "desc" : "asc";
      }

      if (serverSide) {
        onServerSortChange?.(key, newDirection);
      } else {
        setSortKey(key);
        setSortDirection(newDirection);
      }
    },
    [activeSortKey, activeSortDirection, serverSide, onServerSortChange],
  );

  const handlePageSizeChange = useCallback(
    (newValue: string) => {
      const size = parseInt(newValue);
      if (serverSide) {
        onServerPageSizeChange?.(size);
      } else {
        setPageSizeState(size);
        setCurrentPage(1);
      }
    },
    [serverSide, onServerPageSizeChange],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (serverSide) {
        onServerPageChange?.(newPage);
      } else {
        setCurrentPage(newPage);
      }
    },
    [serverSide, onServerPageChange],
  );

  const updateSelection = useCallback(
    (newSet: Set<T[keyof T]>) => {
      setSelectedRowIds(newSet);
      if (onSelectionChange) {
        const selectedItems = data.filter((item) => newSet.has(item[idKey]));
        onSelectionChange(selectedItems);
      }
    },
    [data, idKey, onSelectionChange],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newSelected = new Set(selectedRowIds);
      if (checked) {
        paginatedData.forEach((item) => newSelected.add(item[idKey]));
      } else {
        paginatedData.forEach((item) => newSelected.delete(item[idKey]));
      }
      updateSelection(newSelected);
    },
    [selectedRowIds, paginatedData, idKey, updateSelection],
  );

  const handleSelectRow = useCallback(
    (item: T, checked: boolean) => {
      const newSelected = new Set(selectedRowIds);
      if (checked) {
        newSelected.add(item[idKey]);
      } else {
        newSelected.delete(item[idKey]);
      }
      updateSelection(newSelected);
    },
    [selectedRowIds, idKey, updateSelection],
  );

  const isAllPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedRowIds.has(item[idKey]));
  const isSomePageSelected =
    !isAllPageSelected &&
    paginatedData.some((item) => selectedRowIds.has(item[idKey]));

  useEffect(() => {
    if (!serverSide && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [data.length, totalPages, currentPage, serverSide]);

  return (
    <div className="relative flex flex-col rounded-sm border border-border/60 bg-card shadow-sm shadow-card">
      {isLoading && paginatedData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 top-[33px] z-20 flex items-center justify-center rounded-b-md bg-background/50 backdrop-blur-[1px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="relative overflow-x-auto scrollbar-hide">
        <table className="w-full min-w-[600px] border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-secondary/80 shadow-sm backdrop-blur-sm">
            <tr className="border-b border-border/60 bg-muted/30 transition-colors">
              {enableSelection && (
                <th className="h-8 w-[40px] px-3 align-middle text-center">
                  <Checkbox
                    checked={
                      isAllPageSelected
                        ? true
                        : isSomePageSelected
                          ? "indeterminate"
                          : false
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
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={cn(
                    "h-8 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap transition-colors",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-foreground",
                    col.className,
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <span className="flex-shrink-0 text-muted-foreground/50">
                        {activeSortKey === col.key ? (
                          activeSortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-foreground" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40 relative">
            {paginatedData.map((item, i) => {
              const isSelected = selectedRowIds.has(item[idKey]);
              return (
                <tr
                  key={item[idKey] || i}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group transition-all duration-200",
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "even:bg-muted/20 hover:bg-muted/40",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {enableSelection && (
                    <td
                      className="w-[40px] px-3 py-1.5 align-middle text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) =>
                          handleSelectRow(item, c === true)
                        }
                        aria-label="Select row"
                        className="translate-y-[1px]"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-3 py-1.5 align-middle t ext-foreground/90 tabular-nums",
                        col.className,
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

        {/* Empty States / Loading New Data */}
        {paginatedData.length === 0 && (
          <div className="flex min-h-[150px] flex-col items-center justify-center py-10 text-muted-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary/60" />
                <span className="text-xs font-medium">Fetching records...</span>
              </>
            ) : (
              <>
                <Inbox className="mb-2 h-8 w-8 opacity-20" />
                <span className="text-xs font-medium">No records found</span>
              </>
            )}
          </div>
        )}
      </div>

      {enablePagination && activeTotal > 0 && (
        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2">
            {enableSelection && (
              <p className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                {selectedRowIds.size} of {activeTotal} row(s) selected
              </p>
            )}

            <p className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
              Showing{" "}
              <span className="text-foreground">
                {serverSide ? (activePage - 1) * activePageSize + 1 : start + 1}
                -
                {Math.min(
                  serverSide
                    ? activePage * activePageSize
                    : start + activePageSize,
                  activeTotal,
                )}
              </span>{" "}
              of <span className="text-foreground">{activeTotal}</span>
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Rows:
              </span>
              <Select
                value={activePageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-6 w-[60px] border-border/60 bg-transparent px-2 py-0 text-[11px] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 50, 100].map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                      className="text-[11px]"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="mr-1 flex items-center text-[11px] font-medium text-muted-foreground">
              Page {activePage} of {totalPages}
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="outline"
                className="h-6 w-6 border-border/60 bg-transparent p-0 disabled:opacity-30"
                disabled={activePage === 1}
                onClick={() => handlePageChange(1)}
              >
                <ChevronsLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                className="h-6 w-6 border-border/60 bg-transparent p-0 disabled:opacity-30"
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                className="h-6 w-6 border-border/60 bg-transparent p-0 disabled:opacity-30"
                disabled={activePage === totalPages}
                onClick={() => handlePageChange(activePage + 1)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                className="h-6 w-6 border-border/60 bg-transparent p-0 disabled:opacity-30"
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
