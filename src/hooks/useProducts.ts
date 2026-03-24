import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  createProduct,
  listProducts,
  updateProduct,
  getProductDetails,
  uploadProductPhoto,
  deleteProductPhoto,
} from "@/services/api";
import type {
  Product,
  ProductCreatePayload,
  ProductUpdatePayload,
  ApiResponse,
  ProductListResponse,
  ProductComboboxResponse,
  ApiErrorResponse,
} from "@/types/products";
import { toast } from "react-toastify";

export function useProducts(params?: Record<string, unknown>) {
  return useQuery<ProductListResponse>({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const response = (await listProducts(
        params,
      )) as ApiResponse<ProductListResponse>;
      return response.data!;
    },
  });
}

export function useProductsCombobox(params?: Record<string, unknown>) {
  return useQuery<Product[]>({
    queryKey: queryKeys.products.list({ ...params, combobox: true }),
    queryFn: async () => {
      const response = (await listProducts({
        ...params,
        combobox: true,
      })) as ApiResponse<ProductComboboxResponse>;
      return response.data?.products ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      if (!id || id === "new") return null;
      const response = (await getProductDetails(id)) as ApiResponse<Product>;
      return response.data;
    },
    enabled: !!id && id !== "new",
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProductCreatePayload) => createProduct(payload),
    onSuccess: (response: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(response?.message || "Product created successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      console.error("Create product failed:", error);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: ProductUpdatePayload) =>
      updateProduct(id, payload),
    onSuccess: (response: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(response?.message || "Product updated successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      console.error("Update product failed:", error);
    },
  });
}

export function useUploadProductPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);
      return uploadProductPhoto(productId, formData);
    },
    onSuccess: (_response: ApiResponse<unknown>, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success("Photo uploaded successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const errorData = error?.response?.data || error || {};
      const message =
        (errorData as { message?: string })?.message ||
        "Failed to upload photo.";
      toast.error(message);
      console.error("Upload photo failed:", error);
    },
  });
}

export function useDeleteProductPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => deleteProductPhoto(productId, imageId),
    onSuccess: (_response: ApiResponse<unknown>, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.detail(variables.productId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success("Photo removed successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const errorData = error?.response?.data || error || {};
      const message =
        (errorData as { message?: string })?.message ||
        "Failed to remove photo.";
      toast.error(message);
      console.error("Delete photo failed:", error);
    },
  });
}
