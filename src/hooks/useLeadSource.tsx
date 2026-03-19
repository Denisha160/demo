import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    listSource,
    createSource,
    updateSource,
    deleteSource,
} from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type { LeadSourceListResponse, LeadSourcePayload, UpdateLeadSourcePayload } from '@/types/leadSource';

export function useLeadSources(filters?: Record<string, unknown>) {
    return useQuery({
        queryKey: queryKeys.leadSource.list(filters),
        queryFn: () => listSource(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        select: (data): LeadSourceListResponse | undefined => data?.data,
    });
}

export function useCreateLeadSource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: LeadSourcePayload) => createSource(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leadSource.all });
            toast.success('Lead Source created successfully.');
        },
        onError: (error: any) => {
            if (error?.code !== 'validation_error') {
                toast.error(error?.message || 'Failed to create lead source.');
            }
        },
    });
}

export function useUpdateLeadSource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateLeadSourcePayload) => updateSource(payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leadSource.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.leadSource.detail(variables.id) });
            toast.success('Lead Source updated successfully.');
        },
        onError: (error: any) => {
            if (error?.code !== 'validation_error') {
                toast.error(error?.message || 'Failed to update lead source.');
            }
        },
    });
}

export function useDeleteLeadSource() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteSource(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leadSource.all });
            toast.success('Lead Source deleted successfully.');
        },
        onError: (error: any) => {
            toast.error(error?.message || 'Failed to delete lead source.');
        },
    });
}
