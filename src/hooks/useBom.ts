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
import type { Bom, BomCreatePayload, BomUpdatePayload, BomListResponse } from '@/types/bom';

export type { Bom, BomCreatePayload, BomUpdatePayload };

export const useBOMList = (params?: Record<string, unknown>) => {
    return useQuery<BomListResponse>({
        queryKey: queryKeys.bom.list(params),
        queryFn: () => listBOM(params),
    });
};

export const useBOMDetails = (id: string) => {
    return useQuery<Bom>({
        queryKey: queryKeys.bom.detail(id),
        queryFn: () => getBOMDetails(id),
    });
};

export const useCreateBOM = () => {
    const queryClient = useQueryClient();
    return useMutation<Bom, Error, BomCreatePayload>({
        mutationFn: (payload) => createBOM(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bom.list() });
            toast.success('BOM created successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};

export const useUpdateBOM = () => {
    const queryClient = useQueryClient();
    return useMutation<Bom, Error, BomUpdatePayload>({
        mutationFn: ({ id, ...payload }) => updateBOM(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bom.list() });
            toast.success('BOM updated successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};

export const useDeleteBOM = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: (id) => deleteBOM(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bom.list() });
            toast.success('BOM deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};
