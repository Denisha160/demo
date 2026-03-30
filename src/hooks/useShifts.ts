import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/services/api";
import { Shift, ShiftListResponse } from "@/types/shift";

export const SHIFTS_QUERY_KEY = "shifts";

export const useShifts = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [SHIFTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await api.listShifts(params);
      return response.data as ShiftListResponse;
    },
  });
};

export const useShiftDetails = (id: string) => {
  return useQuery({
    queryKey: [SHIFTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await api.getShiftDetails(id);
      return response.data as Shift;
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
    },
  });
};

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Shift> & { id: string }) => api.updateShift(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHIFTS_QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFTS_QUERY_KEY] });
    },
  });
};
