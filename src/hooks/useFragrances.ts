import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  listFragrance,
  createFragrance,
  updateFragrance,
  deleteFragrance,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  Fragrance,
  FragranceCreatePayload,
  FragranceUpdatePayload,
  FragranceListResponse,
  FragranceComboboxResponse,
  ApiResponse,
} from "@/types/fragrance";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      details?: Record<string, string[]>;
    };
  };
  message: string;
}

export const useFragranceList = (params?: Record<string, unknown>) => {
  return useQuery<FragranceListResponse>({
    queryKey: queryKeys.fragrances.list(params),
    queryFn: async () => {
      const response = (await listFragrance(
        params,
      )) as ApiResponse<FragranceListResponse>;
      return response.data!;
    },
  });
};

export const useFragranceCombobox = (params?: Record<string, unknown>) => {
  return useQuery<Fragrance[]>({
    queryKey: queryKeys.fragrances.list({ ...params, combobox: true }),
    queryFn: async () => {
      const response = (await listFragrance({
        ...params,
        combobox: true,
      })) as ApiResponse<FragranceComboboxResponse>;
      return response.data?.fragrances ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFragrance = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, Error, FragranceCreatePayload>({
    mutationFn: async (payload) => {
      const response = (await createFragrance(payload)) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fragrances.all });
      toast.success(response.message || "Fragrance created successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to create fragrance";
      toast.error(message);
    },
  });
};

export const useUpdateFragrance = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, Error, FragranceUpdatePayload>({
    mutationFn: async ({ id, ...payload }) => {
      const response = (await updateFragrance(
        id,
        payload,
      )) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fragrances.all });
      toast.success(response.message || "Fragrance updated successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to update fragrance";
      toast.error(message);
    },
  });
};

export const useDeleteFragrance = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: (id) => deleteFragrance(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fragrances.all });
      toast.success(data?.message || "Fragrance deleted successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to delete fragrance";
      toast.error(message);
    },
  });
};
