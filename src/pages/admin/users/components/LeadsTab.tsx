import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { format } from "date-fns";
import {
  TrendingUp,
  IndianRupee,
  PieChart,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { UserDetailData } from "@/types/user";

interface LeadsTabProps {
  userData: UserDetailData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const activityColumns: Column<Record<string, unknown>>[] = [
  {
    key: "id",
    header: "ID",
    render: (v) => (
      <span className="text-[10px] text-muted-foreground">
        {(v as Record<string, string>).id?.split("-")[0]?.toUpperCase() ||
          "N/A"}
      </span>
    ),
  },
  { key: "name", header: "Deal Name" },
  {
    key: "stage",
    header: "Stage",
    render: (q) => (
      <StatusBadge
        status={(q as Record<string, string>).stage as string}
        variant={
          q.stage === "Closed Won" ||
          q.stage === "Converted" ||
          q.stage === "Delivered"
            ? "success"
            : "info"
        }
      />
    ),
  },
  {
    key: "created_at",
    header: "Date",
    render: (v) => (
      <span className="text-xs">
        {(v as Record<string, string>).created_at
          ? format(new Date((v as Record<string, string>).created_at), "MMM dd")
          : "-"}
      </span>
    ),
  },
];

const LeadsTab = ({ userData }: LeadsTabProps) => {
  const { data, isLoading } = useAnalytics({ user_id: userData.id });

  if (isLoading) {
    return (
      <div className="animate-pulse p-8 text-center text-muted-foreground w-full">
        Loading analytics data...
      </div>
    );
  }

  const counters = data?.counters;
  const pipeline = data?.dealsByStage || [];
  const activities = data?.recentDeals || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          title="Total Leads"
          value={counters?.totalLeads?.toString() || "0"}
          change={`${counters?.activeDeals || 0} active`}
          changeType="positive"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Conversion"
          value={`${counters?.conversionRate || 0}%`}
          change={`${counters?.totalCustomers || 0} customers`}
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(counters?.pipelineValue || 0)}
          change="Expected Revenue"
          changeType="neutral"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Closed Revenue"
          value={formatCurrency(counters?.totalRevenue || 0)}
          change="Won Deals"
          changeType="positive"
          icon={<IndianRupee className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="space-y-2">
          {/* Lead Pipeline Distribution */}
          <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <PieChart className="h-3 w-3 text-primary" /> Lead Pipeline
                Distribution
              </h3>
              <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                5-Stage Workflow
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer
                width="100%"
                height={180}
                className="md:w-1/2"
              >
                <RePieChart>
                  <Pie
                    data={pipeline}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                    paddingAngle={2}
                  >
                    {pipeline.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.color || "hsl(215, 60%, 50%)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Leads"]} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-y-2 w-full md:w-1/2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {pipeline.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-muted/20 border border-border/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: s.color || "hsl(215, 60%, 50%)",
                        }}
                      />
                      <span className="text-[11px] font-semibold text-foreground">
                        {s.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-primary">
                      {s.value} leads
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Business Activity */}
          <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <IndianRupee className="h-3 w-3 text-primary" /> Recent Business
                Activity
              </h3>
            </div>
            <DataTable data={activities} columns={activityColumns} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsTab;
