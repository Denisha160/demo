import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/api";
import { DashboardStatsResponse } from "@/types/analytics";

export const useAnalytics = (params?: { user_id?: string }) => {
  return useQuery({
    queryKey: ["dashboard-stats", params],
    queryFn: async () => {
      // getDashboardStats() returns response.data directly due to axios interceptor
      const response = await getDashboardStats(params);
      return response;
    },
    // The server response is { data: { counters, dealsByStage, ... } }
    select: (response: DashboardStatsResponse) => response.data,
  });
};
