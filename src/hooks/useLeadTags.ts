import { useQuery } from '@tanstack/react-query';
import { listLeadTags } from '@/services/api';

export function useLeadTags(filters?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['leads', 'tags', filters],
        queryFn: () => listLeadTags(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        select: (data) => {
            const res = data?.data;
            if (Array.isArray(res)) return res;
            if (res?.tags && Array.isArray(res.tags)) return res.tags;
            if (res?.items && Array.isArray(res.items)) return res.items;
            if (res?.data && Array.isArray(res.data)) return res.data;
            return [];
        },
    });
}
