import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Upload,
  FileIcon,
  Trash2,
  Eye,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import AttachmentModal, { Attachment } from "./AttachmentModal";
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
import {
  useDeleteLeadAttachment,
  useUploadLeadAttachment,
  useGetLeadAttachments,
} from "@/hooks/useLeadAttachments";
import { formatFileSize } from "@/utils/imageCompression";

const mapAttachment = (attachment: any): Attachment => ({
  id: String(attachment?.id || ""),
  fileName:
    attachment?.fileName ||
    attachment?.file_name ||
    attachment?.name ||
    "Attachment",
  fileType:
    attachment?.fileType ||
    attachment?.file_type ||
    attachment?.mime_type ||
    "application/octet-stream",
  fileSize: formatFileSize(
    Number(
      attachment?.file_size_bytes ||
        attachment?.fileSize ||
        attachment?.file_size ||
        attachment?.size ||
        0,
    ),
  ),
  url:
    attachment?.url || attachment?.file_url || attachment?.download_url || "#",
  uploadedBy:
    attachment?.uploadedBy ||
    attachment?.uploaded_by_name ||
    attachment?.uploaded_by ||
    "-",
  date: (
    attachment?.date ||
    attachment?.created_at ||
    new Date().toISOString()
  ).slice(0, 10),
});

interface AttachmentsTabProps {
  leadId: string;
  initialAttachments?: any[];
}

const AttachmentsTab = ({
  leadId,
  initialAttachments = [],
}: AttachmentsTabProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(
    parseInt(searchParams.get("page") || "1", 10),
  );
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "10", 10),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<Attachment | null>(null);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedSearch) next.set("search", debouncedSearch);
        else next.delete("search");
        if (page > 1) next.set("page", page.toString());
        else next.delete("page");
        if (limit !== 10) next.set("limit", limit.toString());
        else next.delete("limit");
        return next;
      },
      { replace: true },
    );
  }, [debouncedSearch, page, limit, setSearchParams]);

  const { data: attachmentsData, isLoading } = useGetLeadAttachments(leadId, {
    limit,
    offset: (page - 1) * limit,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });
  const uploadAttachmentMutation = useUploadLeadAttachment(leadId);
  const deleteAttachmentMutation = useDeleteLeadAttachment(leadId);

  const attachments = useMemo(() => {
    const rawItems = attachmentsData?.data?.items || [];
    if (isLoading && rawItems.length === 0 && initialAttachments.length > 0) {
      return initialAttachments.map(mapAttachment);
    }
    return rawItems.map(mapAttachment);
  }, [attachmentsData, initialAttachments, isLoading]);

  const serverTotal =
    attachments.length === limit
      ? page * limit + 1
      : (page - 1) * limit + attachments.length;

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    if (type === "application/pdf")
      return <FileText className="h-4 w-4 text-red-500" />;
    return <FileIcon className="h-4 w-4 text-gray-500" />;
  };

  const columns: Column<Attachment>[] = [
    {
      key: "fileName",
      header: "File",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
            {item.fileType.startsWith("image/") && item.url !== "#" ? (
              <img
                src={item.url}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              getFileIcon(item.fileType)
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="max-w-[200px] truncate text-sm font-medium">
              {item.fileName}
            </span>
            <span className="text-[10px] uppercase text-muted-foreground">
              {item.fileType.split("/")[1] || item.fileType}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "fileSize",
      header: "Size",
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.fileSize}</span>
      ),
    },
    {
      key: "uploadedBy",
      header: "Uploaded By",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm">{item.uploadedBy}</span>
          <span className="text-[10px] text-muted-foreground">{item.date}</span>
        </div>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2 bg-transparent">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
            onClick={() => window.open(item.url, "_blank")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setAttachmentToDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button
          size="sm"
          className="gap-2 h-9 px-4"
          onClick={() => setIsModalOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="h-9 pl-9 w-[250px] text-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={attachments}
        isLoading={isLoading}
        serverSide={true}
        serverPage={page}
        pageSize={limit}
        serverTotal={serverTotal}
        onServerPageChange={setPage}
        onServerPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
      />

      {isModalOpen && (
        <AttachmentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={async (file, onProgress) => {
            const formData = new FormData();
            formData.append("file", file);

            await uploadAttachmentMutation.mutateAsync({
              formData,
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                onProgress(percentCompleted);
              },
            });
          }}
          isSubmitting={uploadAttachmentMutation.isPending}
        />
      )}

      <AlertDialog
        open={!!attachmentToDelete}
        onOpenChange={(open) => !open && setAttachmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the attachment "
              {attachmentToDelete?.fileName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAttachmentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                attachmentToDelete &&
                deleteAttachmentMutation.mutate(attachmentToDelete.id, {
                  onSuccess: () => {
                    setAttachmentToDelete(null);
                  },
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAttachmentMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AttachmentsTab;
