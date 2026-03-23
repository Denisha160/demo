import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadReminder,
  deleteLeadReminder,
  listLeadReminders,
  updateLeadReminder,
  listAllReminders,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T,>(response: any): T[] => {
  if (Array.isArray(response?.data?.reminders)) return response.data.reminders;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export function useLeadReminders(leadId?: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.leads.reminders(leadId || ""),
    queryFn: () => listLeadReminders(leadId, params),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useAllReminders(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.allReminders.list(params),
    queryFn: () => listAllReminders(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useCreateLeadReminder(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createLeadReminder(leadId, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.reminders(leadId || "") });
      toast.success("Reminder created successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to create reminder.");
      }
    },
  });
}

export function useUpdateLeadReminder(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reminderId, ...payload }: { reminderId: string } & Record<string, unknown>) =>
      updateLeadReminder({ leadId, reminderId, ...payload }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.reminders(leadId || "") });
      toast.success("Reminder updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update reminder.");
      }
    },
  });
}

export function useDeleteLeadReminder(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => deleteLeadReminder({ leadId, reminderId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.reminders(leadId || "") });
      toast.success("Reminder deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete reminder.");
    },
  });
}
