import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Users, IndianRupee, TrendingUp, Target, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { RecentDeal } from "@/types/analytics";
import { format } from "date-fns";

const stageVariant = (stage: string) => {
  const map: Record<string, "success" | "warning" | "info" | "destructive" | "default"> = {
    "Won": "success",
    "Closed Won": "success",
    "Lost": "destructive",
    "Closed Lost": "destructive",
    "Negotiation": "warning",
    "Qualified": "info",
    "Proposal Sent": "default",
    "New": "default",
    "Converted": "success",
  };
  return map[stage] || "default";
};

const columns: Column<RecentDeal>[] = [
  { key: "name", header: "Company" },
  { key: "contact", header: "Contact", className: "hidden sm:table-cell", render: (item) => item.contact || "-" },
  { 
    key: "value", 
    header: "Value", 
    render: (item) => `₹${(item.value || 0).toLocaleString()}` 
  },
  {
    key: "stage",
    header: "Stage",
    render: (item) => <StatusBadge status={item.stage} variant={stageVariant(item.stage)} />,
  },
  { 
    key: "created_at", 
    header: "Date", 
    className: "hidden md:table-cell",
    render: (item) => item.created_at ? format(new Date(item.created_at), "MMM dd") : "-"
  },
];

const Dashboard = () => {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard data...</div>;
  }

  const counters = data?.counters;
  const dealsByStage = data?.dealsByStage || [];
  const recentActivities = data?.recentActivities || [];
  const recentDeals = data?.recentDeals || [];
  const monthlyRevenue = data?.monthlyRevenue || [];

  // Mocking conversion data for the line chart if real data isn't available over time
  const conversionData = [
    { month: "Sep", rate: 18 },
    { month: "Oct", rate: 22 },
    { month: "Nov", rate: 19 },
    { month: "Dec", rate: 25 },
    { month: "Jan", rate: 28 },
    { month: "Feb", rate: 24 },
    { month: "Mar", rate: (counters?.conversionRate || 27) },
  ];

  const totalContacts = (counters?.totalLeads || 0) + (counters?.totalCustomers || 0);

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Contacts"
          value={totalContacts.toLocaleString()}
          change={`${counters?.totalLeads || 0} Leads / ${counters?.totalCustomers || 0} Customers`}
          changeType="neutral"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Pipeline Value"
          value={`₹${(counters?.pipelineValue || 0).toLocaleString()}`}
          change={`Actual Revenue: ₹${(counters?.totalRevenue || 0).toLocaleString()}`}
          changeType="positive"
          icon={< IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          title="Conversion Rate"
          value={`${counters?.conversionRate || 0}%`}
          change="Leads to Customers"
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Active Deals"
          value={(counters?.activeDeals || 0).toString()}
          change="In progress stages"
          changeType="positive"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="shadow-sm border border-border bg-card rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Monthly Revenue (Accepted)</h3>
            <span className="text-xs text-muted-foreground">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyRevenue.length > 0 ? monthlyRevenue : [{ month: "No Data", revenue: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]} 
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Chart */}
        <div className="shadow-sm border border-border bg-card rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Conversion Performance (%)</h3>
            <span className="text-xs text-muted-foreground">Trend Analysis</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                 contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '4px' }}
                 formatter={(v: number) => [`${v}%`, "Rate"]} 
              />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deals by Stage */}
        <div className="lg:col-span-1 shadow-sm border border-border bg-card rounded-md p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Deals by Stage</h3>
          <div className="flex flex-col items-center gap-6">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie 
                  data={dealsByStage.length > 0 ? dealsByStage : [{ name: "No Data", value: 1, color: "hsl(var(--muted))" }]} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  dataKey="value" 
                  paddingAngle={4}
                  stroke="none"
                >
                  {dealsByStage.map((entry, i) => (
                    <Cell key={i} fill={entry.color || `hsl(var(--primary) / ${1 - (i * 0.15)})`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
              {dealsByStage.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground truncate">{s.name}</span>
                  <span className="font-medium text-foreground ml-auto">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Recent Deals */}
          <div className="shadow-sm border border-border bg-card rounded-md p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Recent Deals</h2>
              <button className="text-xs text-primary font-medium hover:underline">View All</button>
            </div>
            <DataTable data={recentDeals} columns={columns} pageSize={5} />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="shadow-sm border border-border bg-card rounded-md">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border overflow-y-auto max-h-[400px]">
          {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                 <Layers className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">{activity.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.detail}</p>
              </div>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                {format(new Date(activity.time), "MMM dd, HH:mm")}
              </span>
            </div>
          )) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No recent activities available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
