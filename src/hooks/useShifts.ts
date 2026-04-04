import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import * as api from "@/services/api";
import { Shift, ShiftListResponse, ShiftDetailResponse } from "@/types/shift";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: string }).message;
    if (message) return message;
  }
  return fallback;
};

export const SHIFTS_QUERY_KEY = "shifts";

export const useShifts = (
  params?: Record<string, unknown>,
  options?: UseQueryOptions<ShiftListResponse, unknown>,
) => {
  return useQuery({
    queryKey: [SHIFTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await api.listShifts(params);
      const data = response.data as ShiftListResponse;
      return {
        ...data,
        shifts: data.shifts || data.items || [],
      } as ShiftListResponse;
    },
    ...options,
  });
};

export const useShiftDetails = (
  id: string,
  params?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: [SHIFTS_QUERY_KEY, id, params],
    queryFn: async () => {
      const response = await api.getShiftDetails(id, params);
      return response.data as ShiftDetailResponse;
    },
    enabled: !!id,
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Shift>) => api.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_QUERY_KEY] });
      toast.success("Shift created successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create shift."));
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Shift> & { id: string }) =>
      api.updateShift(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [SHIFTS_QUERY_KEY, variables.id],
      });
      toast.success("Shift updated successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update shift."));
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_QUERY_KEY] });
      toast.success("Shift deleted successfully.");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete shift."));
    },
  });
};
