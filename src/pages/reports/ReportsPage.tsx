import StatCard from "@/components/StatCard";
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const topPerformers = [
  { name: "Sarah Lee", deals: 12, revenue: "$68,400", trend: "up" },
  { name: "John Smith", deals: 9, revenue: "$52,100", trend: "up" },
  { name: "Emma Davis", deals: 8, revenue: "$41,800", trend: "down" },
  { name: "Alex Kim", deals: 7, revenue: "$38,200", trend: "up" },
];

const Reports = () => {
  return (
    <div className="space-y-2 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          title="Monthly Revenue"
          value="$184,200"
          change="+8.2% vs last month"
          changeType="positive"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          title="New Leads"
          value="142"
          change="+23 this week"
          changeType="positive"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Win Rate"
          value="27%"
          change="+3% improvement"
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Deal Size"
          value="$12,400"
          change="-$800 vs last month"
          changeType="negative"
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        {/* Top Performers */}
        <div className="shadow-card border border-border bg-card rounded-sm p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Top Performers
          </h3>
          <div className="space-y-1.5">
            {topPerformers.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-4">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {p.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {p.deals} deals closed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">
                    {p.revenue}
                  </span>
                  {p.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
