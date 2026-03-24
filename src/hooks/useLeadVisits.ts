import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadVisit,
  deleteLeadVisit,
  listLeadVisits,
  updateLeadVisit,
  listAllVisits,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T>(response: unknown): T[] => {
  const r = response as any;
  if (Array.isArray(r?.data?.visits)) return r.data.visits;
  if (Array.isArray(r?.visits)) return r.visits;
  if (Array.isArray(r?.data?.items)) return r.data.items;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.items)) return r.items;
  return [];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export function useLeadVisits(
  leadId?: string,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.leads.visits(leadId || "", params),
    queryFn: () => listLeadVisits(leadId, params),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useAllVisits(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.allVisits.list(params),
    queryFn: () => listAllVisits(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useCreateLeadVisit(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      createLeadVisit(leadId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(leadId || "").concat("visits"),
      });
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
    mutationFn: ({
      visitId,
      data,
    }: {
      visitId: string;
      data: Record<string, unknown> | FormData;
    }) => updateLeadVisit({ leadId, visitId, data }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(leadId || "").concat("visits"),
      });
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(leadId || "").concat("visits"),
      });
      toast.success("Visit deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete visit."));
    },
  });
}
