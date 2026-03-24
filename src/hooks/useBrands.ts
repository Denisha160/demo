import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  listBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/services/api";
import { queryKeys } from "@/lib/queryKeys";
import type {
  Brand,
  BrandCreatePayload,
  BrandUpdatePayload,
  BrandListResponse,
  BrandComboboxResponse,
  ApiResponse,
} from "@/types/brand";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      details?: Record<string, string[]>;
    };
  };
  message: string;
}

export const useBrandList = (params?: Record<string, unknown>) => {
  return useQuery<BrandListResponse>({
    queryKey: queryKeys.brands.list(params),
    queryFn: async () => {
      const response = (await listBrands(
        params,
      )) as ApiResponse<BrandListResponse>;
      return response.data!;
    },
  });
};

export const useBrandCombobox = (params?: Record<string, unknown>) => {
  return useQuery<Brand[]>({
    queryKey: queryKeys.brands.list({ ...params, combobox: true }),
    queryFn: async () => {
      const response = (await listBrands({
        ...params,
        combobox: true,
      })) as ApiResponse<BrandComboboxResponse>;
      return response.data?.brands ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, Error, BrandCreatePayload>({
    mutationFn: async (payload) => {
      const response = (await createBrand(payload)) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      toast.success(response.message || "Brand created successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to create brand";
      toast.error(message);
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, Error, BrandUpdatePayload>({
    mutationFn: async ({ id, ...payload }) => {
      const response = (await updateBrand(id, payload)) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      toast.success(response.message || "Brand updated successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to update brand";
      toast.error(message);
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: (id) => deleteBrand(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      toast.success(data?.message || "Brand deleted successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to delete brand";
      toast.error(message);
    },
  });
};
