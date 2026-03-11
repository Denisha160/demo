import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    listKits,
    getKitDetails,
    createKit,
    updateKit,
    deleteKit,
} from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Kit, KitCreatePayload, KitUpdatePayload, KitListResponse, KitDetails } from '@/types/kits';
import type { ApiResponse } from '@/types/kits';

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
        queryKey: queryKeys.kits?.list(params) || ['kits', 'list', params],
        queryFn: async () => {
            const response = await listKits(params) as ApiResponse<KitListResponse>;
            return response.data!;
        },
    });
};

export const useKitDetails = (id?: string) => {
    return useQuery<KitDetails | null>({
        queryKey: queryKeys.kits?.detail(id!) || ['kits', 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const response = await getKitDetails(id) as ApiResponse<KitDetails>;
            return response.data!;
        },
        enabled: !!id,
    });
};

export const useCreateKit = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, KitCreatePayload>({
        mutationFn: async (payload) => {
            const response = await createKit(payload) as ApiResponse<unknown>;
            return response;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['kits'] });
            toast.success(response.message || 'Kit created successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to create kit';
            toast.error(message);
        },
    });
};

export const useUpdateKit = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<unknown>, Error, KitUpdatePayload>({
        mutationFn: async (payload) => {
            const response = await updateKit(payload) as ApiResponse<unknown>;
            return response;
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['kits'] });
            toast.success(response.message || 'Kit updated successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to update kit';
            toast.error(message);
        },
    });
};

export const useDeleteKit = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse, Error, string>({
        mutationFn: (id) => deleteKit(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['kits'] });
            toast.success(data?.message || 'Kit deleted successfully');
        },
        onError: (error) => {
            const apiError = error as ApiError;
            const message = apiError.response?.data?.message || apiError.message || 'Failed to delete kit';
            toast.error(message);
        },
    });
};
