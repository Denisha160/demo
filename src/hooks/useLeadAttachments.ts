import {
  deleteLeadAttachment,
  listLeadAttachments,
  uploadLeadAttachment,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useGetLeadAttachments(leadId: string, params?: any) {
  return useQuery({
    queryKey: [...queryKeys.leads.attachments(leadId), params],
    queryFn: () => listLeadAttachments(leadId, params),
    enabled: !!leadId,
  });
}

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
    mutationFn: ({
      formData,
      onUploadProgress,
    }: {
      formData: FormData;
      onUploadProgress?: (progressEvent: any) => void;
    }) => uploadLeadAttachment(leadId, formData, onUploadProgress),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.attachments(leadId || ""),
      });
      toast.success(response?.message || "Attachment uploaded successfully.");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to upload attachment."));
    },
  });
}

export function useDeleteLeadAttachment(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => deleteLeadAttachment(attachmentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.attachments(leadId || ""),
      });
      toast.success(response?.message || "Attachment deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete attachment."));
    },
  });
}
