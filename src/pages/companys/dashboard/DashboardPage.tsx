import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Users, IndianRupee, TrendingUp, Target, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const recentDeals = [
  { name: "Acme Corp", contact: "John Smith", value: "₹12,500", stage: "Negotiation", date: "Feb 12" },
  { name: "TechStart Inc", contact: "Sarah Lee", value: "₹8,200", stage: "Qualified", date: "Feb 11" },
  { name: "GlobalFin", contact: "Mike Chen", value: "₹45,000", stage: "Closed Won", date: "Feb 10" },
  { name: "DataFlow", contact: "Emma Davis", value: "₹6,800", stage: "Proposal", date: "Feb 09" },
  { name: "CloudBase", contact: "Alex Kim", value: "₹22,000", stage: "Negotiation", date: "Feb 08" },
  { name: "NetSolutions", contact: "Lisa Wang", value: "₹15,300", stage: "Qualified", date: "Feb 07" },
  { name: "SmartApps", contact: "Tom Brown", value: "₹9,900", stage: "Closed Lost", date: "Feb 06" },
  { name: "InnoTech", contact: "Kate Miller", value: "₹31,000", stage: "Closed Won", date: "Feb 05" },
];

const stageVariant = (stage: string) => {
  const map: Record<string, "success" | "warning" | "info" | "destructive" | "default"> = {
    "Closed Won": "success",
    "Closed Lost": "destructive",
    Negotiation: "warning",
    Qualified: "info",
    Proposal: "default",
  };
  return map[stage] || "default";
};

const columns: Column<typeof recentDeals[0]>[] = [
  { key: "name", header: "Company" },
  { key: "contact", header: "Contact", className: "hidden sm:table-cell" },
  { key: "value", header: "Value" },
  {
    key: "stage",
    header: "Stage",
    render: (item) => <StatusBadge status={item.stage} variant={stageVariant(item.stage)} />,
  },
  { key: "date", header: "Date", className: "hidden md:table-cell" },
];

const recentActivities = [
  { action: "New lead added", detail: "Sarah Lee from TechStart Inc", time: "2 min ago" },
  { action: "Deal closed", detail: "GlobalFin — ₹45,000", time: "1 hour ago" },
  { action: "Email sent", detail: "Follow-up to Acme Corp", time: "3 hours ago" },
  { action: "Meeting scheduled", detail: "CloudBase — Tomorrow 10:00 AM", time: "5 hours ago" },
];

const monthlyRevenue = [
  { month: "Aug", revenue: 32000 },
  { month: "Sep", revenue: 28000 },
  { month: "Oct", revenue: 41000 },
  { month: "Nov", revenue: 35000 },
  { month: "Dec", revenue: 48000 },
  { month: "Jan", revenue: 52000 },
  { month: "Feb", revenue: 46000 },
];

const conversionData = [
  { month: "Aug", rate: 18 },
  { month: "Sep", rate: 22 },
  { month: "Oct", rate: 19 },
  { month: "Nov", rate: 25 },
  { month: "Dec", rate: 28 },
  { month: "Jan", rate: 24 },
  { month: "Feb", rate: 27 },
];

const dealsByStage = [
  { name: "Qualified", value: 12, color: "hsl(220, 70%, 50%)" },
  { name: "Proposal", value: 8, color: "hsl(220, 10%, 60%)" },
  { name: "Negotiation", value: 6, color: "hsl(38, 92%, 50%)" },
  { name: "Closed Won", value: 14, color: "hsl(142, 60%, 40%)" },
];

const Dashboard = () => {
  return (
    <div className="space-y-2 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          title="Total Contacts"
          value="2,847"
          change="+12% from last month"
          changeType="positive"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Revenue"
          value="₹184,200"
          change="+8% from last month"
          changeType="positive"
          icon={< IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          title="Conversion Rate"
          value="24.5%"
          change="-2% from last month"
          changeType="negative"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Active Deals"
          value="38"
          change="+5 new this week"
          changeType="positive"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Revenue Chart */}
        <div className="shadow-card border border-border bg-card rounded-sm p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(220, 70%, 50%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Chart */}
        <div className="shadow-card border border-border bg-card rounded-sm p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">Conversion Rate (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 10%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip formatter={(v: number) => [`${v}%`, "Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="hsl(220, 70%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Deals by Stage */}
        <div className="lg:col-span-1 shadow-card border border-border bg-card rounded-sm p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">Deals by Stage</h3>
          <div className="flex items-center gap-2">
            <ResponsiveContainer width="60%" height={160}>
              <PieChart>
                <Pie data={dealsByStage} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                  {dealsByStage.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 min-w-0 flex-1">
              {dealsByStage.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground truncate">{s.name}</span>
                  <span className="font-medium text-foreground ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-2">
          {/* Recent Deals */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1.5">Recent Deals</h2>
            <DataTable data={recentDeals} columns={columns} pageSize={5} />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-1.5">Recent Activity</h2>
        <div className="shadow-card border border-border bg-card rounded-sm divide-y divide-border">
          {recentActivities.map((activity, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <div>
                <p className="text-sm text-foreground">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.detail}</p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
