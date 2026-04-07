import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Plus, Search, Trash2, FileText, Download, Loader2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { useQuotations, useDeleteQuotation, useDownloadQuotation } from "@/hooks/useQuotations";
import { Quotation } from "@/types/quotations";
import { useDebounce } from "@/hooks/useDebounce";
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

export const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "DRAFT":
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    case "SENT":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "VIEWED":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "ACCEPTED":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "EXPIRED":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "CANCELLED":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    default:
      return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }
};

const QuotationsTab = () => {
  const [search, setSearch] = useState("");
  const { companyId, id: leadId } = useParams();
  const navigate = useNavigate();
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(
    null,
  );

  const debouncedSearch = useDebounce(search, 500);
  const { data: quotationsData, isLoading } = useQuotations({
    lead_id: leadId,
    search: debouncedSearch || undefined,
  });
  const { mutate: deleteQuotation } = useDeleteQuotation();
  const { mutate: download, isPending: isDownloading } = useDownloadQuotation();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const quotations = useMemo(
    () => quotationsData?.items || [],
    [quotationsData],
  );

  const handleCreate = () => {
    navigate(`/${companyId}/leads/${leadId}/quotations/new`);
  };

  const handleEdit = (quotation: Quotation) => {
    navigate(`/${companyId}/leads/${leadId}/quotations/${quotation.id}/edit`);
  };

  const handleView = (quotation: Quotation) => {
    navigate(`/${companyId}/leads/${leadId}/quotations/${quotation.id}/view`);
  };

  const handleDelete = (id: string) => {
    deleteQuotation(id);
    setQuotationToDelete(null);
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

  const columns: Column<any>[] = [
    {
      key: "quotation_number",
      header: "Quotation Number",
      render: (item) => (
        <div className="flex flex-col">
          <span
            onClick={() => handleView(item)}
            className="font-semibold text-sm text-primary hover:underline cursor-pointer decoration-primary/30 underline-offset-2"
          >
            {" "}
            {item.quotation_number || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "quotation_date",
      header: "Date",
      render: (item) => (
        <span className="text-sm">{formatDate(item.quotation_date)}</span>
      ),
    },
    {
      key: "grand_total",
      header: "Total",
      render: (item) => (
        <span className="text-sm font-bold">
          ₹{(item.grand_total || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant="outline" className={getStatusColor(item.status)}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created At",
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(item.created_at)}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
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
            size="icon"
            className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setQuotationToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full animate-fade-in rounded-lg border border-border/50 bg-card p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          New Quotation
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
            className="h-9 w-[260px] pl-9 text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={quotations} pageSize={10} />

      <AlertDialog
        open={!!quotationToDelete}
        onOpenChange={(open) => !open && setQuotationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete quotation "
              {quotationToDelete?.quotation_number}". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                quotationToDelete && handleDelete(quotationToDelete.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationsTab;
