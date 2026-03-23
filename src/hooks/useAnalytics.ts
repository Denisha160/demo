import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/api";

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // getDashboardStats() returns response.data directly due to axios interceptor
      const response = await getDashboardStats();
      return response;
    },
    // The server response is { data: { counters, dealsByStage, ... } }
    select: (response: any) => response.data,
  });
};
