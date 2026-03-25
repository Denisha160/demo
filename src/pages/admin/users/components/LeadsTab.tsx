import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
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

const leadPipelineData = [
  { name: "Lead", value: 40, color: "hsl(215, 60%, 50%)" },
  { name: "Verified", value: 30, color: "hsl(220, 70%, 45%)" },
  { name: "Quotation", value: 15, color: "hsl(38, 92%, 50%)" },
  { name: "Win", value: 10, color: "hsl(142, 60%, 40%)" },
  { name: "Lose", value: 5, color: "hsl(0, 70%, 50%)" },
];

const activities = [
  {
    id: "ORD-5521",
    partner: "Radisson Blue",
    value: "₹24,500",
    type: "Custom Branding",
    status: "In Production",
    date: "Feb 18",
  },
  {
    id: "ORD-5515",
    partner: "Hyatt Regency",
    value: "₹12,200",
    type: "Standard",
    status: "Dispatched",
    date: "Feb 17",
  },
  {
    id: "ORD-5499",
    partner: "Marriott Int",
    value: "₹18,000",
    type: "Custom Branding",
    status: "Delivered",
    date: "Feb 15",
  },
];

const activityColumns: Column<Record<string, unknown>>[] = [
  { key: "id", header: "Order ID" },
  { key: "partner", header: "Client / Dealer" },
  {
    key: "type",
    header: "Order Type",
    render: (v) => (
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${v.type === "Custom Branding" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-700 border border-slate-200"}`}
      >
        {v.type as string}
      </span>
    ),
  },
  { key: "value", header: "Value" },
  {
    key: "status",
    header: "Status",
    render: (q) => (
      <StatusBadge
        status={q.status as string}
        variant={
          q.status === "Delivered" || q.status === "Dispatched"
            ? "success"
            : "info"
        }
      />
    ),
  },
  { key: "date", header: "Date" },
];

const LeadsTab = ({ userData }: LeadsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          title="Total Leads"
          value={userData.totalLeads?.toString() || "0"}
          change="+12 this week"
          changeType="positive"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title="Conversion"
          value={userData.conversionRate || "0%"}
          change="+2.4% vs avg"
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Avg. Prod Time"
          value={userData.avgProductionTime || "N/A"}
          change="Custom Branding"
          changeType="neutral"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue View"
          value={userData.revenue || "₹0"}
          change="Contribution"
          changeType="neutral"
          icon={<IndianRupee className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="lg:col-span-2 space-y-2">
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
                    data={leadPipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                    paddingAngle={2}
                  >
                    {leadPipelineData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-y-2 w-full md:w-1/2">
                {leadPipelineData.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-muted/20 border border-border/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color }}
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

          <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <IndianRupee className="h-3 w-3 text-primary" /> Recent Business
                activity
              </h3>
            </div>
            <DataTable data={activities} columns={activityColumns} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="p-5 border border-border rounded-sm bg-card shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="text-5xl text-primary rotate-12 inline-block font-bold">
                ₹
              </span>
            </div>
            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">
              Revenue Contribution
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-foreground">
                  {userData.revenue || "₹0"} achieved
                </span>
                <span className="text-muted-foreground">
                  {userData.target || "₹0"} goal
                </span>
              </div>
              <div className="h-2 w-full bg-muted border border-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: userData.attainment || "0%" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5 text-success" />{" "}
                {userData.attainment || "0%"} of quota met
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsTab;
