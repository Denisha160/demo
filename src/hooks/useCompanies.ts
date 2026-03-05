import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    listCompanies,
    getCompanyDetails,
    updateCompany
} from "@/services/api";
import { CompanyUpdatePayload, ApiErrorResponse } from "@/types/company";
import { queryKeys } from "@/lib/queryKeys";

export const useCompanies = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: queryKeys.companies.list(params),
        queryFn: async () => {
            const response = await listCompanies(params);
            return response.data;
        },
    });
};

export const useCompany = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.companies.detail(id),
        queryFn: async () => {
            const response = await getCompanyDetails(id);
            return response;
        },
        enabled: enabled && !!id,
    });
};

export const useUpdateCompany = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CompanyUpdatePayload) => {
            const response = await updateCompany(data);
            return response;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
            toast.success("Company details updated successfully!");
        },
        onError: (error: unknown) => {
            const err = error as ApiErrorResponse;
            const errorData = (err?.response?.data || err?.details || err || {}) as ApiErrorResponse;
            const message = errorData?.message || errorData?.error?.message || "Failed to update company.";
            toast.error(message);
        }
    });
};
