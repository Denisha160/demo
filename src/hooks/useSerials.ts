import { useQuery, useMutation } from '@tanstack/react-query';
import { listSerials, generateSerials } from '@/services/api';
import type { SerialListResponse, SerialListParams, GenerateSerialParams } from '@/types/serial';

export const useSerials = (params?: SerialListParams) => {
    return useQuery<SerialListResponse>({
        queryKey: ['serials', 'list', params],
        queryFn: async () => {
            const response = await listSerials(params) as { data: SerialListResponse };
            return response.data;
        },
    });
};

export const useGenerateSerials = () => {
    return useMutation({
        mutationFn: (data: GenerateSerialParams) => generateSerials(data),
    });
};
