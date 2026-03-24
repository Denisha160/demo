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

const normalizeList = <T,>(response: unknown): T[] => {
  const r = response as any;
  if (Array.isArray(r?.data?.reminders)) return r.data.reminders;
  if (Array.isArray(r?.data?.items)) return r.data.items;
  if (Array.isArray(r?.data)) return r.data;
  if (Array.isArray(r?.items)) return r.items;
  return [];
};

export function useLeadReminders(
  leadId?: string,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.leads.reminders(leadId || "", params),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId || "") });
      toast.success("Reminder created successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string; message?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(apiError?.message || "Failed to create reminder.");
      }
    },
  });
}

export function useUpdateLeadReminder(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reminderId,
      ...payload
    }: { reminderId: string } & Record<string, unknown>) =>
      updateLeadReminder({ leadId, reminderId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId || "") });
      toast.success("Reminder updated successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string; message?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(apiError?.message || "Failed to update reminder.");
      }
    },
  });
}

export function useDeleteLeadReminder(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => deleteLeadReminder({ leadId, reminderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId || "") });
      toast.success("Reminder deleted successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { message?: string };
      toast.error(apiError?.message || "Failed to delete reminder.");
    },
  });
}
