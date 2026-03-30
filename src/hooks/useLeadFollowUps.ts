import type { Query } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadFollowUp,
  deleteLeadFollowUp,
  listLeadFollowUps,
  updateLeadFollowUp,
  listAllFollowUps,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T>(response: any): T[] => {
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

export function useLeadFollowUps(
  leadId?: string,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.leads.followUps(leadId || "", params),
    queryFn: () => listLeadFollowUps(leadId, params),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useAllFollowUps(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.allFollowUps.list(params),
    queryFn: () => listAllFollowUps(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

const isLeadFollowUpsQuery = (query: Query<unknown, unknown>, leadId?: string) => {
  const key = query.queryKey;
  if (!Array.isArray(key)) return false;
  return (
    key[0] === "leads" &&
    key[1] === "detail" &&
    key[2] === (leadId || "") &&
    key[3] === "follow-ups"
  );
};

export function useCreateLeadFollowUp(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createLeadFollowUp(leadId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        predicate: (query) => isLeadFollowUpsQuery(query, leadId),
      });
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
    mutationFn: ({
      followupId,
      ...payload
    }: { followupId: string } & Record<string, unknown>) =>
      updateLeadFollowUp({ leadId, followupId, ...payload }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        predicate: (query) => isLeadFollowUpsQuery(query, leadId),
      });
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
    mutationFn: (followupId: string) =>
      deleteLeadFollowUp({ leadId, followupId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        predicate: (query) => isLeadFollowUpsQuery(query, leadId),
      });
      toast.success("Follow up deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete follow up."));
    },
  });
}
