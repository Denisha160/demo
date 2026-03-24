import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadTask,
  deleteLeadTask,
  listLeadTasks,
  updateLeadTask,
  listAllTasks,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T,>(response: unknown): T[] => {
  const r = response as any;
  if (Array.isArray(r?.data?.tasks)) return r.data.tasks;
  if (Array.isArray(r?.tasks)) return r.tasks;
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

export function useLeadTasks(
  leadId?: string,
  params?: Record<string, unknown>,
) {
  return useQuery({
    queryKey: queryKeys.leads.tasks(leadId || "", params),
    queryFn: () => listLeadTasks(leadId, params),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useAllTasks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.allTasks.list(params),
    queryFn: () => listAllTasks(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (data) => normalizeList(data),
  });
}

export function useCreateLeadTask(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createLeadTask(leadId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId || "") });
      toast.success("Task created successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(getErrorMessage(error, "Failed to create task."));
      }
    },
  });
}

export function useUpdateLeadTask(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      ...payload
    }: { taskId: string } & Record<string, unknown>) =>
      updateLeadTask({ leadId, taskId, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId || "") });
      toast.success("Task updated successfully.");
    },
    onError: (error: unknown) => {
      const apiError = error as { code?: string };
      if (apiError?.code !== "validation_error") {
        toast.error(getErrorMessage(error, "Failed to update task."));
      }
    },
  });
}

export function useDeleteLeadTask(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteLeadTask({ leadId, taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(leadId || "") });
      toast.success("Task deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete task."));
    },
  });
}
