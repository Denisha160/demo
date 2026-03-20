import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteLeadAttachment, uploadLeadAttachment } from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

export function useUploadLeadAttachment(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadLeadAttachment(leadId, formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.attachments(leadId || "") });
      toast.success(response?.message || "Attachment uploaded successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload attachment.");
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
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete attachment.");
    },
  });
}
