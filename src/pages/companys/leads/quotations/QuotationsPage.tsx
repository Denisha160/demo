import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import {
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import {
  useQuotations,
  useDeleteQuotation,
  useDownloadQuotation,
} from "@/hooks/useQuotations";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/ui/combobox";
import { useLeads } from "@/hooks/useLeads";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { Quotation } from "@/types/quotations";
import { format } from "date-fns";
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

const QuotationsPage = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const leadId = searchParams.get("lead_id") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("limit") || "15", 10);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(
    null,
  );
  const { mutate: deleteQuotation, isPending: isDeleting } =
    useDeleteQuotation();
  const { mutate: download, isPending: isDownloading } = useDownloadQuotation();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const updateParam = (key: string, value: string | number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, String(value));
        else next.delete(key);
        if (key !== "page" && key !== "limit") {
          next.set("page", "1");
        }
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateParam("search", debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const setLeadId = (v: string) => updateParam("lead_id", v);
  const setPage = (p: number) => updateParam("page", p);
  const setPageSize = (s: number) => updateParam("limit", s);

  const clearFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const limit = prev.get("limit");
        if (limit) next.set("limit", limit);
        next.set("page", "1");
        return next;
      },
      { replace: true },
    );
    setSearchTerm("");
  };
  const handleDownload = (quotation: Quotation) => {
    setDownloadingId(quotation.id);
    download(
      {
        quotationId: quotation.id,
        quotationNumber: String(quotation.quotation_number),
      },
      {
        onSettled: () => setDownloadingId(null),
      },
    );
  };

  const { data: leadsDataRaw = [] } = useLeads({ limit: 100 });
  const leadOptions = useMemo(() => {
    const leadsData = (leadsDataRaw as any)?.items || leadsDataRaw || [];
    return (leadsData as any[]).map((l: any) => ({
      value: l.id,
      label: l.name || l.title || "Unknown Lead",
    }));
  }, [leadsDataRaw]);

  const filters = useMemo(() => {
    return {
      search: debouncedSearch || undefined,
      lead_id: leadId || undefined,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    };
  }, [debouncedSearch, leadId, page, pageSize]);

  const { data: quotationsData, isLoading } = useQuotations(filters);
  const quotations = quotationsData?.items || [];
  const totalItems = quotationsData?.total || 0;

  const columns: Column<Quotation>[] = [
    {
      key: "lead_name",
      header: "Customer / Lead",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.lead_name}
          </span>
          <span className="text-[11px] text-muted-foreground uppercase opacity-70">
            {item.company_name || "Personal"}
          </span>
        </div>
      ),
    },
    {
      key: "quotation_date",
      header: "Date",
      render: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {format(new Date(item.quotation_date), "dd MMM yyyy")}
        </span>
      ),
    },
    {
      key: "grand_total",
      header: "Total Amount",
      render: (item) => (
        <span className="text-sm font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-sm border border-primary/10">
          ₹{item.grand_total?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => handleDownload(item)}
            disabled={isDownloading && downloadingId === item.id}
          >
            {isDownloading && downloadingId === item.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() =>
              navigate(
                `/${companyId}/leads/${item.lead_id}/quotations/${item.id}/edit`,
              )
            }
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setQuotationToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-theme(spacing.16))] w-full animate-fade-in flex-col overflow-hidden gap-2">
      <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-[240px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search quotations..."
              className="h-9 rounded-sm pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-[200px]">
            <Combobox
              options={leadOptions}
              value={leadId}
              onValueChange={setLeadId}
              placeholder="Filter by lead"
              searchPlaceholder="Search leads..."
              clearable
            />
          </div>
          {(searchTerm || leadId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <XCircle className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
        <Button
          size="sm"
          className="h-9 gap-2 px-4 shadow-sm"
          onClick={() => navigate(`/${companyId}/quotations/new`)}
        >
          <Plus className="h-4 w-4" />
          Create Quotation
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-auto bg-card rounded-sm border border-border/40 shadow-sm transition-all hover:border-border/60">
          <DataTable
            data={quotations}
            columns={columns}
            isLoading={isLoading}
            serverSide={true}
            serverTotal={totalItems}
            serverPage={page}
            pageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={setPageSize}
            onRowClick={(item) =>
              navigate(
                `/${companyId}/leads/${item.lead_id}/quotations/${item.id}/view`,
              )
            }
          />
        </div>
      </div>

      <AlertDialog
        open={!!quotationToDelete}
        onOpenChange={(open) => !open && setQuotationToDelete(null)}
      >
        <AlertDialogContent className="rounded-sm border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm pt-2">
              Are you sure you want to delete quotation{" "}
              <strong>#{quotationToDelete?.quotation_number}</strong>? This will
              permanently remove the record and all associated items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-sm border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-sm"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (quotationToDelete) {
                  deleteQuotation(quotationToDelete.id, {
                    onSuccess: () => setQuotationToDelete(null),
                  });
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete Quotation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationsPage;
