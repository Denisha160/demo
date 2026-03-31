import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  listHierarchy,
  getAllHierarchy,
  createHierarchy,
  updateHierarchy,
  deleteHierarchy,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";

export function useAllHierarchy<T = any>(
  params?: Record<string, unknown>,
  options?: any,
) {
  return useQuery({
    queryKey: [...queryKeys.hierarchy.all, "all", params],
    queryFn: () => getAllHierarchy(params),
    staleTime: 5 * 60 * 1000,
    select: (data: any): T[] => normalizeList(data),
    ...options,
  });
}

const normalizeList = <T>(response: any): T[] => {
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
};

export function useHierarchySearch(
  params?: string | Record<string, unknown>,
  options?: any,
) {
  return useQuery({
    queryKey: queryKeys.hierarchy.list(params),
    queryFn: () => listHierarchy(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data: any) => ({
      items: normalizeList(data),
      total:
        data?.data?.pagination?.total ||
        data?.pagination?.total ||
        data?.data?.total ||
        data?.total ||
        0,
    }),
    ...options,
  });
}

export function useCreateHierarchy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => createHierarchy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      toast.success("Member added to hierarchy successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add member to hierarchy.");
    },
  });
}

export function useUpdateHierarchy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Record<string, unknown>) =>
      updateHierarchy({ id, ...payload }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hierarchy.detail(variables.id),
      });
      toast.success("Hierarchy updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update hierarchy.");
    },
  });
}

export function useDeleteHierarchy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHierarchy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      toast.success("Member removed from hierarchy successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to remove member from hierarchy.");
    },
  });
}
