import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listInterestedProducts,
  addInterestedProduct,
  removeInterestedProduct,
} from "@/services/api";
import {
  InterestedProductsApiResponse,
  InterestedProduct,
} from "@/types/interestedProducts";
import { ApiResponse, ApiErrorResponse } from "@/types/products";
import { toast } from "react-toastify";

export function useLeadInterestedProducts(leadId: string) {
  return useQuery<InterestedProduct[]>({
    queryKey: ["lead-interested-products", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const response = (await listInterestedProducts(
        leadId,
      )) as InterestedProductsApiResponse;
      return response.data?.interestedProducts || [];
    },
    enabled: !!leadId,
  });
}

export function useAddInterestedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      productId,
    }: {
      leadId: string;
      productId: string;
    }) => addInterestedProduct(leadId, { product_id: productId }),
    onSuccess: (response: ApiResponse<unknown>, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lead-interested-products", variables.leadId],
      });
      toast.success(response?.message || "Product added successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const message =
        error?.response?.data?.message || "Failed to add product.";
      toast.error(message);
    },
  });
}

export function useRemoveInterestedProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      productId,
    }: {
      leadId: string;
      productId: string;
    }) => removeInterestedProduct(leadId, { product_id: productId }),
    onSuccess: (response: ApiResponse<unknown>, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lead-interested-products", variables.leadId],
      });
      toast.success(response?.message || "Product removed successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const message =
        error?.response?.data?.message || "Failed to remove product.";
      toast.error(message);
    },
  });
}
