import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { listBatch, createBatch, getBatch, updateBatch } from '@/services/api';
import type { Batch, BatchListResponse, BatchCreatePayload, BatchUpdatePayload, ApiResponse } from '@/types/batch';

interface ApiError {
    response?: { data?: { message?: string } };
    message: string;
}

interface UseBatchesParams {
    product_id?: string;
    status?: string;
    search?: string;
    offset?: number;
    limit?: number;
    sort_by?: string;
    sort_direction?: string;
    product_type?: string;
}

export const useBatches = (params?: UseBatchesParams) => {
    return useQuery<BatchListResponse>({
        queryKey: ['batches', 'list', params],
        queryFn: async () => {
            const response = await listBatch(params) as ApiResponse<BatchListResponse>;
            return response.data!;
        },
    });
};

export const useBatchesCombobox = (params?: UseBatchesParams) => {
    return useQuery<Batch[]>({
        queryKey: ['batches', 'list', { ...params, combobox: true }],
        queryFn: async () => {
            const response = await listBatch({ ...params, combobox: true }) as ApiResponse<BatchListResponse>;
            return response.data?.items ?? [];
        },
    });
};

export const useBatchDetails = (id?: string) => {
    return useQuery<Batch | null>({
        queryKey: ['batches', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getBatch(id) as ApiResponse<Batch>;
            return response.data!;
        },
        enabled: !!id,
    });
};

export const useCreateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Batch>, Error, BatchCreatePayload>({
        mutationFn: async (payload) => {
            const response = await createBatch(payload) as ApiResponse<Batch>;
            return response;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            toast.success(response.message || 'Batch created successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to create batch';
            toast.error(message);
        },
    });
};

export const useUpdateBatch = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Batch>, Error, BatchUpdatePayload>({
        mutationFn: async (payload) => {
            const response = await updateBatch(payload) as ApiResponse<Batch>;
            return response;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            toast.success(response.message || 'Batch updated successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to update batch';
            toast.error(message);
        },
    });
};
