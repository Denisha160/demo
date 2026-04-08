import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  createProduct,
  listProducts,
  listAllProducts,
  updateProduct,
  getProductDetails,
  uploadProductPhoto,
  deleteProductPhoto,
  uploadFile,
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

export function useAllProducts(params?: Record<string, unknown>) {
  type AllProductsProduct = {
    id: string;
    product_name: string;
    image_url?: string | null;
    images?: string[];
    [key: string]: unknown;
  };

  type AllProductsKit = {
    id: string;
    name: string;
    image_url?: string | null;
    kit_image_url?: string | null;
    kit_image?: string | null;
    kit_products?: Array<{
      images?: string[];
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };

  return useQuery<
    {
      id: string;
      name: string;
      type: "product" | "kit";
      image_url?: string;
      images?: string[];
      original: AllProductsProduct | AllProductsKit;
    }[]
  >({
    queryKey: queryKeys.products.allItems(params),
    queryFn: async () => {
      const response = (await listAllProducts(params)) as ApiResponse<{
        products: AllProductsProduct[];
        kits: AllProductsKit[];
      }>;

      const products = (response.data?.products ?? []).map((p) => ({
        id: p.id,
        name: p.product_name,
        type: "product" as const,
        image_url: p.image_url,
        images: (p.images || []).filter(Boolean),
        original: p,
      }));

      const kits = (response.data?.kits ?? []).map((k) => ({
        id: k.id,
        name: k.name,
        type: "kit" as const,
        image_url: k.image_url || k.kit_image_url || k.kit_image,
        images: (k.kit_products || [])
          .flatMap((p) => p.images || [])
          .filter(Boolean),
        original: k,
      }));

      return [...products, ...kits];
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
    mutationFn: async ({
      productId,
      file,
    }: {
      productId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "products");

      const uploadResponse = (await uploadFile(formData)) as unknown as {
        file: string;
      };

      return uploadProductPhoto(productId, {
        image_url: uploadResponse.file,
        originalname: file.name,
      });
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
