import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLead,
  getLeadDetails,
  listLeads,
  updateLead,
  updateLeadStatus,
  bulkUpdateLeads,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

export function useBulkUpdateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { lead_ids: string[]; updates: Record<string, unknown> }) =>
      bulkUpdateLeads(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update leads.");
    },
  });
}


const normalizeList = <T>(response: any): T[] => {
  if (Array.isArray(response?.data?.lead)) return response.data.lead;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

const normalizeDetail = <T>(response: any): T | null => {
  if (response?.data?.lead && !Array.isArray(response.data.lead))
    return response.data.lead;
  if (response?.lead && !Array.isArray(response.lead)) return response.lead;
  if (response?.data && !Array.isArray(response.data)) return response.data;
  if (response && !Array.isArray(response)) return response;
  return null;
};

export function useLeads<T = any[]>(
  params?: Record<string, unknown>,
  select?: (data: any) => T,
) {
  return useQuery({
    queryKey: queryKeys.leads.list(params),
    queryFn: () => listLeads(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: select || ((data) => normalizeList(data) as any),
  });
}

export function useLead<T = any>(leadId?: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(leadId || ""),
    queryFn: () => getLeadDetails(leadId),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data): T | null => normalizeDetail<T>(data),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createLead(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      toast.success("Lead created successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to create lead.");
      }
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      ...payload
    }: { leadId: string } & Record<string, unknown>) =>
      updateLead({ leadId, ...payload }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(variables.leadId),
      });
      toast.success("Lead updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update lead.");
      }
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      ...payload
    }: { leadId: string } & Record<string, unknown>) =>
      updateLeadStatus({ leadId, ...payload }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leads.detail(variables.leadId),
      });
      toast.success("Lead updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update lead.");
      }
    },
  });
}
