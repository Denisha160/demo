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
  uploadFile,
} from "@/services/api";

export const useKitsByProduct = (productId?: string) => {
  return useQuery<KitMembership[]>({
    queryKey: ["kits", "product", productId],
    queryFn: async () => {
      if (!productId) return [];
      const response = (await listKitsByProduct(productId)) as ApiResponse<
        KitMembership[] | { items: KitMembership[] }
      >;
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (
        data &&
        typeof data === "object" &&
        "items" in data &&
        Array.isArray((data as any).items)
      ) {
        return (data as any).items;
      }
      return [];
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
      let image_url = payload.image_url;

      // Step 1: Upload image if provided
      if (payload.kit_image instanceof File) {
        const formData = new FormData();
        formData.append("file", payload.kit_image);
        formData.append("folder", "kits");
        const uploadRes = (await uploadFile(formData)) as any;
        image_url = uploadRes.file;
      }

      // Step 2: Create kit with JSON
      const { kit_image, ...payloadWithoutFile } = payload;
      const response = (await createKit({
        ...payloadWithoutFile,
        image_url,
      })) as ApiResponse<unknown>;
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
    mutationFn: async (payload) => {
      let image_url = payload.image_url;

      // Step 1: Upload image if provided
      if (payload.kit_image instanceof File) {
        const formData = new FormData();
        formData.append("file", payload.kit_image);
        formData.append("folder", "kits");
        const uploadRes = (await uploadFile(formData)) as any;
        image_url = uploadRes.file;
      }

      // Step 2: Update kit with JSON
      const { id, kit_image, ...payloadWithoutFile } = payload;
      const response = (await updateKit({
        id,
        ...payloadWithoutFile,
        image_url,
      })) as ApiResponse<unknown>;
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
