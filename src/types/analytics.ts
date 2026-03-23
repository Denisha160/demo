export interface DashboardCounters {
  totalLeads: number;
  totalCustomers: number;
  totalRevenue: number;
  pipelineValue: number;
  activeDeals: number;
  conversionRate: number;
}

export interface DealByStage {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  action: string;
  detail: string;
  time: string;
}

export interface RecentDeal {
  id: string;
  name: string;
  contact: string;
  created_at: string;
  stage: string;
  value: number;
}

export interface ConversionTrend {
  month: string;
  rate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  counters: DashboardCounters;
  dealsByStage: DealByStage[];
  recentActivities: RecentActivity[];
  recentDeals: RecentDeal[];
  monthlyRevenue: MonthlyRevenue[];
  conversionTrend: ConversionTrend[];
}

export interface DashboardStatsResponse {
  data: DashboardStats;
}
