import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createLeadTask,
  deleteLeadTask,
  listLeadTasks,
  updateLeadTask,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

const normalizeList = <T,>(response: any): T[] => {
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export function useLeadTasks(leadId?: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.leads.tasks(leadId || ""),
    queryFn: () => listLeadTasks(leadId, params),
    enabled: !!leadId,
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
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.tasks(leadId || "") });
      toast.success(response?.message || "Task created successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to create task.");
      }
    },
  });
}

export function useUpdateLeadTask(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, ...payload }: { taskId: string } & Record<string, unknown>) =>
      updateLeadTask({ leadId, taskId, ...payload }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.tasks(leadId || "") });
      toast.success(response?.message || "Task updated successfully.");
    },
    onError: (error: any) => {
      if (error?.code !== "validation_error") {
        toast.error(error?.message || "Failed to update task.");
      }
    },
  });
}

export function useDeleteLeadTask(leadId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteLeadTask({ leadId, taskId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.tasks(leadId || "") });
      toast.success(response?.message || "Task deleted successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete task.");
    },
  });
}
