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
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
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
      toast.success(response?.message || "Visit created successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to create visit.");
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
      toast.success(response?.message || "Visit updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update visit.");
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
      toast.success(response?.message || "Visit deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete visit.");
    },
  });
}
