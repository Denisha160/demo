import { useQuery } from '@tanstack/react-query';
import { listLeadActivities } from '@/services/api';
import { LeadActivitiesApiResponse, LeadActivitiesResponse } from '@/types/activities';

export function useLeadActivities(leadId: string, params?: Record<string, unknown>) {
    return useQuery<LeadActivitiesResponse>({
        queryKey: ['lead-activities', leadId, params],
        queryFn: async () => {
            if (!leadId) return { activities: [], total: 0, limit: 10, offset: 0 };
            const response = await listLeadActivities(leadId, params) as LeadActivitiesApiResponse;
            return response.data || { activities: [], total: 0, limit: 10, offset: 0 };
        },
        enabled: !!leadId,
    });
}
