import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    listBOM,
    getBOMDetails,
    createBOM,
    updateBOM,
    deleteBOM,
} from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Bom, BomCreatePayload, BomUpdatePayload, BomListResponse, RawMaterialItem } from '@/types/bom';
import type { ApiResponse } from '@/types/packages';

interface ApiError {
    response?: {
        data?: {
            message?: string;
            details?: Record<string, string[]>;
        };
    };
    message: string;
}

export type { Bom, BomCreatePayload, BomUpdatePayload };

export interface BomDetailsResponse {
    finished_product: {
        id: string;
        product_name: string;
        code: string;
        selling_price: number | null;
        base_unit: string;
        unit_category: string;
    };
    raw_materials: Array<{
        id: string;
        raw_product_id: string;
        raw_product: string;
        cost_price: number | null;
        raw_quantity: number;
        raw_unit: string;
        raw_unit_category: string;
        created_at: string;
    }>;
}

export const useBOMList = (params?: Record<string, unknown>) => {
    return useQuery<BomListResponse>({
        queryKey: queryKeys.bom.list(params),
        queryFn: async () => {
            const response = await listBOM(params) as ApiResponse<BomListResponse>;
            return response.data!;
        },
    });
};

export const useBOMDetails = (bom_id?: string) => {
    return useQuery<BomDetailsResponse | null>({
        queryKey: queryKeys.bom.detail(bom_id!),
        queryFn: async () => {
            if (!bom_id) return null;
            const response = await getBOMDetails(bom_id) as ApiResponse<BomDetailsResponse>;
            return response.data!;
        },
        enabled: !!bom_id,
    });
};

export const useCreateBOM = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, BomCreatePayload>({
        mutationFn: async (payload) => {
            const response = await createBOM(payload) as ApiResponse<unknown>;
            return response;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bom.all });
            toast.success(response.message || 'BOM created successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to create BOM';
            toast.error(message);
        },
    });
};

export const useUpdateBOM = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, BomUpdatePayload>({
        mutationFn: async (payload) => {
            const response = await updateBOM({ bom_id: payload.bom_id, ...payload }) as ApiResponse<unknown>;
            return response;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bom.all });
            toast.success(response.message || 'BOM updated successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to update BOM';
            toast.error(message);
        },
    });
};

export const useDeleteBOM = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, string>({
        mutationFn: (bom_id) => deleteBOM(bom_id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bom.all });
            toast.success(data?.message || 'BOM deleted successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to delete BOM';
            toast.error(message);
        },
    });
};
