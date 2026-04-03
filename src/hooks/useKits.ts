import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  listKits,
  getKitDetails,
  createKit,
  updateKit,
  deleteKit,
  associateProductToKit,
  disassociateProductFromKit,
  listKitsByProduct,
  uploadKitPhoto,
  deleteKitPhoto,
} from "@/services/api";

export const useKitsByProduct = (productId?: string) => {
  return useQuery<KitMembership[]>({
    queryKey: ["kits", "product", productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = (await listKitsByProduct(productId)) as ApiResponse<
        KitMembership[]
      >;
      return response.data || [];
    },
    enabled: !!productId,
  });
};

export const useAssociateProductToKit = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse,
    Error,
    { kit_id: string; product_id: string; quantity_per_kit?: number }
  >({
    mutationFn: (payload) => associateProductToKit(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kits", "product", variables.product_id],
      });
      toast.success("Product added to kit");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to associate product to kit");
    },
  });
};

export const useDisassociateProductFromKit = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse,
    Error,
    { kit_id: string; product_id: string }
  >({
    mutationFn: (payload) => disassociateProductFromKit(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kits", "product", variables.product_id],
      });
      toast.success("Product removed from kit");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove product from kit");
    },
  });
};
import { queryKeys } from "@/lib/queryKeys";
import type {
  Kit,
  KitCreatePayload,
  KitUpdatePayload,
  KitListResponse,
  KitDetails,
  KitMembership,
} from "@/types/kits";
import type { ApiResponse } from "@/types/kits";

interface ApiError {
  response?: {
    data?: {
      message?: string;
      details?: Record<string, string[]>;
    };
  };
  message: string;
}

export const useKitList = (params?: Record<string, unknown>) => {
  return useQuery<KitListResponse>({
    queryKey: queryKeys.kits?.list(params) || ["kits", "list", params],
    queryFn: async () => {
      const response = (await listKits(params)) as ApiResponse<KitListResponse>;
      return response.data!;
    },
  });
};

export const useKitDetails = (id?: string) => {
  return useQuery<KitDetails | null>({
    queryKey: queryKeys.kits?.detail(id!) || ["kits", "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const response = (await getKitDetails(id)) as ApiResponse<KitDetails>;
      return response.data!;
    },
    enabled: !!id,
  });
};

export const useCreateKit = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, Error, KitCreatePayload>({
    mutationFn: async (payload) => {
      // Build FormData for multipart-request
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "items") {
          formData.append(key, JSON.stringify(value));
        } else {
          // If value is boolean, convert to string
          const val = typeof value === "boolean" ? String(value) : value;
          formData.append(key, val as any);
        }
      });

      const response = (await createKit(formData)) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success(response.message || "Kit created successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to create kit";
      toast.error(message);
    },
  });
};

export const useUpdateKit = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, Error, KitUpdatePayload>({
    mutationFn: async ({ id, ...payload }) => {
      // Build FormData for multipart-request
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (key === "items") {
          formData.append(key, JSON.stringify(value));
        } else {
          // If value is boolean, convert to string
          const val =
            typeof value === "boolean" ? String(value) : (value as any);
          formData.append(key, val);
        }
      });

      const response = (await updateKit(id, formData)) as ApiResponse<
        unknown
      >;
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success(response.message || "Kit updated successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to update kit";
      toast.error(message);
    },
  });
};

export const useDeleteKit = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: (id) => deleteKit(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success(data?.message || "Kit deleted successfully");
    },
    onError: (error) => {
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to delete kit";
      toast.error(message);
    },
  });
};

export const useUploadKitPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<unknown>,
    ApiError,
    { kitId: string; file: File }
  >({
    mutationFn: async ({ kitId, file }) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = (await uploadKitPhoto(
        kitId,
        formData,
      )) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kits", "detail", variables.kitId],
      });
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success(response.message || "Kit photo uploaded successfully");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload kit photo";
      toast.error(message);
    },
  });
};

export const useDeleteKitPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, ApiError, string>({
    mutationFn: async (kitId) => {
      const response = (await deleteKitPhoto(kitId)) as ApiResponse<unknown>;
      return response;
    },
    onSuccess: (response, kitId) => {
      queryClient.invalidateQueries({ queryKey: ["kits", "detail", kitId] });
      queryClient.invalidateQueries({ queryKey: ["kits"] });
      toast.success(response.message || "Kit photo removed successfully");
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove kit photo";
      toast.error(message);
    },
  });
};
