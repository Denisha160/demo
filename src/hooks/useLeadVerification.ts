import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { verifyLead, convertLead, updateVerifyLead } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export function useVerifyLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, data }: { leadId: string, data: any }) => verifyLead(leadId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.leadId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
            toast.success('Lead verified successfully.');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to verify lead.');
        },
    });
}

export function useUpdateVerifyLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, data }: { leadId: string, data: any }) => updateVerifyLead(leadId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables.leadId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
            toast.success('Lead verification updated successfully.');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update lead verification.');
        },
    });
}

export function useConvertLead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (leadId: string) => convertLead(leadId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(variables) });
            queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
            toast.success('Lead successfully converted to customer.');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to convert lead.');
        },
    });
}
