import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteLeadAttachment, uploadLeadAttachment } from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export function useUploadLeadAttachment(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadLeadAttachment(leadId, formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.attachments(leadId || "") });
      toast.success(response?.message || "Attachment uploaded successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload attachment."));
    },
  });
}

export function useDeleteLeadAttachment(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deleteLeadAttachment(attachmentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.attachments(leadId || "") });
      toast.success(response?.message || "Attachment deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete attachment."));
    },
  });
}
