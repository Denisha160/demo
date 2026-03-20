import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadFollowUp,
  deleteLeadFollowUp,
  listLeadFollowUps,
  updateLeadFollowUp,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T,>(response: any): T[] => {
  if (Array.isArray(response?.data?.followups)) return response.data.followups;
  if (Array.isArray(response?.followups)) return response.followups;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export function useLeadFollowUps(leadId?: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.leads.followUps(leadId || ""),
    queryFn: () => listLeadFollowUps(leadId, params),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useCreateLeadFollowUp(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createLeadFollowUp(leadId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(leadId || "") });
      toast.success("Follow up created successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(getErrorMessage(error, "Failed to create follow up."));
      }
    },
  });
}

export function useUpdateLeadFollowUp(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followupId, ...payload }: { followupId: string } & Record<string, unknown>) =>
      updateLeadFollowUp({ leadId, followupId, ...payload }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(leadId || "") });
      toast.success("Follow up updated successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(getErrorMessage(error, "Failed to update follow up."));
      }
    },
  });
}

export function useDeleteLeadFollowUp(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followupId: string) => deleteLeadFollowUp({ leadId, followupId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.followUps(leadId || "") });
      toast.success("Follow up deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete follow up."));
    },
  });
}
