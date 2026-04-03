import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  listStatus,
  createStatus,
  updateStatus,
  deleteStatus,
  updateLeadStatusOrder,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  LeadStatusListResponse,
  LeadStatusPayload,
  UpdateLeadStatusPayload,
} from "@/types/leadStatus";

export function useLeadStatuses(
  filters?: Record<string, unknown>,
  options?: any,
) {
  return useQuery({
    queryKey: queryKeys.leadStatus.list(filters),
    queryFn: async () => {
      const response = await listStatus(filters);
      return response.data as LeadStatusListResponse;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options,
  });
}

export function useCreateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeadStatusPayload) => createStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadStatus.all });
      toast.success("Lead Status created successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to create lead status.");
      }
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLeadStatusPayload) => updateStatus(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadStatus.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leadStatus.detail(variables.id),
      });
      toast.success("Lead Status updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update lead status.");
      }
    },
  });
}

export function useDeleteLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadStatus.all });
      toast.success("Lead Status deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete lead status.");
    },
  });
}

export function useUpdateLeadStatusOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      orders: { id: string; display_order: number }[];
    }) => updateLeadStatusOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leadStatus.all });
      toast.success("Status order updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update status order.");
      }
    },
  });
}
