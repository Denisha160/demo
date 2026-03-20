import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadVisit,
  deleteLeadVisit,
  listLeadVisits,
  updateLeadVisit,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T,>(response: any): T[] => {
  if (Array.isArray(response?.data?.visits)) return response.data.visits;
  if (Array.isArray(response?.visits)) return response.visits;
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

export function useLeadVisits(leadId?: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.leads.visits(leadId || ""),
    queryFn: () => listLeadVisits(leadId, params),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useCreateLeadVisit(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createLeadVisit(leadId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.visits(leadId || "") });
      toast.success("Visit created successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(getErrorMessage(error, "Failed to create visit."));
      }
    },
  });
}

export function useUpdateLeadVisit(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ visitId, ...payload }: { visitId: string } & Record<string, unknown>) =>
      updateLeadVisit({ leadId, visitId, ...payload }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.visits(leadId || "") });
      toast.success("Visit updated successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(getErrorMessage(error, "Failed to update visit."));
      }
    },
  });
}

export function useDeleteLeadVisit(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (visitId: string) => deleteLeadVisit({ leadId, visitId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.visits(leadId || "") });
      toast.success("Visit deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete visit."));
    },
  });
}
