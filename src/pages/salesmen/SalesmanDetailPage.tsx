import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft, Edit, Mail, Phone, MapPin,
    TrendingUp, Target, IndianRupee, Package,
    PieChart, BarChart3, ChevronRight, Clock,
    CheckCircle2, AlertCircle, Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from "recharts";

const SalesmanDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for the salesman
    const salesman = {
        name: "Sarah Lee",
        email: "sarah@company.com",
        phone: "+1 (555) 123-4567",
        region: "West Coast",
        status: "Active",
        totalRevenue: "$142,500",
        target: "$200,000",
        attainment: "71%",
        conversionRate: "18.4%",
        joinedDate: "Oct 12, 2023",
        department: "Sales"
    };

    const leadConversionData = [
        { name: "Qualified", value: 45, color: "hsl(var(--primary))" },
        { name: "Proposal", value: 25, color: "hsl(var(--primary) / 0.7)" },
        { name: "Negotiation", value: 15, color: "hsl(38, 92%, 50%)" },
        { name: "Closed Won", value: 15, color: "hsl(142, 60%, 40%)" },
    ];

    const quotations = [
        { id: "QT-8821", partner: "Acme Corp", value: "$12,500", status: "Accepted", date: "Feb 12" },
        { id: "QT-8815", partner: "TechStart", value: "$8,200", status: "Draft", date: "Feb 11" },
        { id: "QT-8799", partner: "GlobalFin", value: "$45,000", status: "Sent", date: "Feb 10" },
    ];

    const attendanceLogs = [
        { date: "Feb 21, 2024", checkIn: "09:05 AM", checkOut: "06:15 PM", status: "Present", workTime: "9h 10m" },
        { date: "Feb 20, 2024", checkIn: "08:55 AM", checkOut: "06:30 PM", status: "Present", workTime: "9h 35m" },
        { date: "Feb 19, 2024", checkIn: "09:15 AM", checkOut: "06:05 PM", status: "Late", workTime: "8h 50m" },
        { date: "Feb 16, 2024", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "Present", workTime: "9h 00m" },
    ];

    const quoteColumns: Column<typeof quotations[0]>[] = [
        { key: "id", header: "Quote ID" },
        { key: "partner", header: "Partner" },
        { key: "value", header: "Value" },
        {
            key: "status",
            header: "Status",
            render: (q) => <StatusBadge status={q.status} variant={q.status === "Accepted" ? "success" : q.status === "Sent" ? "info" : "default"} />
        },
        { key: "date", header: "Date" }
    ];

    const attendanceColumns: Column<typeof attendanceLogs[0]>[] = [
        { key: "date", header: "Date" },
        { key: "checkIn", header: "Check In" },
        { key: "checkOut", header: "Check Out" },
        { key: "workTime", header: "Work Time" },
        {
            key: "status",
            header: "Status",
            render: (a) => <StatusBadge status={a.status} variant={a.status === "Present" ? "success" : "warning"} />
        }
    ];

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            {/* 1. Top Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                        onClick={() => navigate("/salesmen")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest text-primary">Salesman Dashboard</h2>
                        <p className="text-[10px] text-muted-foreground mt-1">{salesman.name} • {salesman.region} Region</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm">
                        Deactivate
                    </Button>
                    <Button size="sm" className="h-8 text-xs rounded-sm gap-2">
                        <Edit className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                </div>
            </div>

            {/* 2. Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2 space-y-2">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <StatCard title="Total Revenue" value={salesman.totalRevenue} change="+8.2% vs target" icon={<IndianRupee className="h-4 w-4" />} changeType="positive" />
                        <StatCard title="Win Rate" value={salesman.conversionRate} change="+2.1% this month" icon={<TrendingUp className="h-4 w-4" />} changeType="positive" />
                        <StatCard title="Open Leads" value="12" change="4 nearing deadline" icon={<Target className="h-4 w-4" />} changeType="negative" />
                        <StatCard title="Quota attainment" value={salesman.attainment} icon={<BarChart3 className="h-4 w-4" />} changeType="neutral" />
                    </div>

                    {/* Performance Summary */}
                    <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-6">
                            <BarChart3 className="h-3 w-3 text-primary" /> Performance Summary
                        </h3>
                        <div className="space-y-2">
                            <div className="relative group">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs font-semibold text-foreground">Quarterly Quota</span>
                                    <span className="text-[10px] font-bold text-primary">{salesman.attainment} Attained</span>
                                </div>
                                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50">
                                    <div
                                        className="h-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.3)] transition-all duration-1000"
                                        style={{ width: salesman.attainment }}
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                    <span>₹0 Achieved</span>
                                    <span>₹200,000 Target</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leads Chart */}
                    <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <PieChart className="h-3 w-3 text-primary" /> Lead Stage Distribution
                            </h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-[200px] w-full md:w-1/2 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={leadConversionData}
                                            cx="50%" cy="50%"
                                            innerRadius={65} outerRadius={95}
                                            dataKey="value" stroke="none"
                                            paddingAngle={4}
                                        >
                                            {leadConversionData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-foreground tracking-tighter">124</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Total Leads</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-y-2 w-full md:w-1/2">
                                {leadConversionData.map((s) => (
                                    <div key={s.name} className="flex items-center justify-between p-2 rounded-sm bg-muted/10 border border-border/30">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-[11px] font-semibold text-foreground">{s.name}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-foreground">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quotations */}
                    <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                <Package className="h-3 w-3 text-primary" /> Recent Quotations
                            </h3>
                        </div>
                        <DataTable data={quotations} columns={quoteColumns} />
                    </div>

                    {/* Attendance */}
                    <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-3 w-3 text-primary" /> Attendance Log
                            </h3>
                        </div>
                        <DataTable data={attendanceLogs} columns={attendanceColumns} />
                    </div>
                </div>

                <div className="space-y-2">
                    {/* Profile Summary */}
                    <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                        <div className="text-center pb-6 border-b border-border mb-6">
                            <div className="h-16 w-16 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-2xl font-bold border border-primary/20 mx-auto mb-3 shadow-inner">
                                {salesman.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <h3 className="text-lg font-bold text-foreground leading-tight">{salesman.name}</h3>
                            <StatusBadge status={salesman.status} variant="success" className="mt-1" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-sm bg-muted/30 border border-border flex items-center justify-center shrink-0">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Email</p>
                                    <p className="text-xs font-semibold text-foreground truncate">{salesman.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-sm bg-muted/30 border border-border flex items-center justify-center shrink-0">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Phone</p>
                                    <p className="text-xs font-semibold text-foreground truncate">{salesman.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-sm bg-muted/30 border border-border flex items-center justify-center shrink-0">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Region</p>
                                    <p className="text-xs font-semibold text-foreground truncate">{salesman.region}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesmanDetailPage;
