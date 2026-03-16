import { useQuery, useMutation } from "@tanstack/react-query";
import { listSerials, generateSerials, bulkSyncSerials } from '@/services/api';
import type { SerialListResponse, SerialListParams, GenerateSerialParams, BulkSyncSerialParams } from '@/types/serial';

export const useSerials = (params?: SerialListParams, options?: { enabled?: boolean }) => {
    return useQuery<SerialListResponse>({
        queryKey: ['serials', 'list', params],
        queryFn: async () => {
            const response = await listSerials(params) as { data: SerialListResponse };
            return response.data;
        },
        ...options
    });
};

export const useGenerateSerials = () => {
    return useMutation({
        mutationFn: (data: GenerateSerialParams) => generateSerials(data),
    });
};

export const useBulkSyncSerials = () => {
    return useMutation({
        mutationFn: (data: BulkSyncSerialParams) => bulkSyncSerials(data),
    });
};
