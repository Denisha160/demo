import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  listQuotation,
  getQuotationDetails,
  createQuotation,
  updateQuotation,
  deleteQuotation,
} from "@/services/api";
import {
  Quotation,
  QuotationCreatePayload,
  QuotationUpdatePayload,
  QuotationListResponse,
} from "@/types/quotations";
import { ApiResponse, ApiErrorResponse } from "@/types/products";
import { toast } from "react-toastify";

export function useQuotations(params?: Record<string, unknown>) {
  return useQuery<QuotationListResponse>({
    queryKey: queryKeys.quotations.list(params),
    queryFn: async () => {
      const response = (await listQuotation(
        params,
      )) as ApiResponse<QuotationListResponse>;
      return response.data!;
    },
  });
}

export function useQuotation(id?: string) {
  return useQuery({
    queryKey: queryKeys.quotations.detail(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = (await getQuotationDetails(
        id,
      )) as ApiResponse<Quotation>;
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuotationCreatePayload) => createQuotation(payload),
    onSuccess: (response: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all });
      toast.success(response?.message || "Quotation created successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      console.error("Create quotation failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create quotation",
      );
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: QuotationUpdatePayload) => updateQuotation(payload),
    onSuccess: (response: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all });
      toast.success(response?.message || "Quotation updated successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      console.error("Update quotation failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update quotation",
      );
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: (response: ApiResponse<unknown>) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations.all });
      toast.success(response?.message || "Quotation deleted successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      console.error("Delete quotation failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete quotation",
      );
    },
  });
}
