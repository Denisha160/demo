import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  listQuotation,
  getQuotationDetails,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  downloadQuotation,
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

export function useDownloadQuotation() {
  return useMutation({
    mutationFn: ({
      quotationId,
      quotationNumber,
    }: {
      quotationId: string;
      quotationNumber?: string;
    }) => downloadQuotation(quotationId),
    onSuccess: (data: unknown, { quotationNumber }) => {
      const url = window.URL.createObjectURL(new Blob([data as BlobPart]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Quotation_${quotationNumber || new Date().getTime()}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Quotation PDF downloaded successfully");
    },
    onError: (error: Error | any) => {
      toast.error(error?.message || "Failed to download PDF");
    },
  });
}

export function usePrintQuotation() {
  return useMutation({
    mutationFn: (id: string) => downloadQuotation(id, { preview: "true" }),
    onSuccess: (data: unknown) => {
      const blob = new Blob([data as BlobPart], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    },
    onError: (error: Error | any) => {
      toast.error(error?.message || "Failed to open print preview");
    },
  });
}
