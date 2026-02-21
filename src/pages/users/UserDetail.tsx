import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import {
    ArrowLeft, Edit, Mail, Shield, MapPin,
    Clock, Monitor, Globe, ChevronRight,
    TrendingUp, Target, IndianRupee, Package,
    PieChart, BarChart3, Phone
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import RoleSelectionModal from "./RoleSelectionModal";
import UserModal from "./UserModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for the user (including potential dealer/supplier/salesman fields)
    const [userData, setUserData] = useState({
        name: "John Doe",
        email: "john@basalt.com",
        role: "Dealer",
        status: "Active",
        department: "Sales Operations",
        company: "Basalt Amenities",
        gstNumber: "27AAAAA0000A1Z5",
        region: "Western India",
        joinedDate: "2023-10-12",
        phone: "+91 98765 43210",
        gender: "Male",
        basicSalary: "₹ 85,000",
        // Personal Details
        dob: "1992-05-15",
        fatherName: "Richard Doe",
        pan: "ABCDE1234F",
        personalEmail: "john.personal@gmail.com",
        address: "123, Silver Oak Apartments, Andheri West, Mumbai - 400053",
        // Performance Metrics
        revenue: "₹1,42,500",
        target: "₹2,00,000",
        attainment: "71%",
        totalLeads: 124,
        conversionRate: "18.5%",
        avgProductionTime: "42 Hours",
        fulfillmentRate: "98.2%",
        sessions: [
            { id: 1, device: "Chrome / MacOS", ip: "192.168.1.1", lastActive: "Just now", current: true },
            { id: 2, device: "Safari / iPhone 15", ip: "172.20.10.4", lastActive: "2 hours ago", current: false }
        ]
    });

    const [userRole, setUserRole] = useState(userData.role);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // CRM 5-Stage Lead Pipeline Data
    const leadPipelineData = [
        { name: "Lead", value: 40, color: "hsl(215, 60%, 50%)" },
        { name: "Verified", value: 30, color: "hsl(220, 70%, 45%)" },
        { name: "Quotation", value: 15, color: "hsl(38, 92%, 50%)" },
        { name: "Win", value: 10, color: "hsl(142, 60%, 40%)" },
        { name: "Lose", value: 5, color: "hsl(0, 70%, 50%)" },
    ];

    const activities = [
        { id: "ORD-5521", partner: "Radisson Blue", value: "₹24,500", type: "Custom Branding", status: "In Production", date: "Feb 18" },
        { id: "ORD-5515", partner: "Hyatt Regency", value: "₹12,200", type: "Standard", status: "Dispatched", date: "Feb 17" },
        { id: "ORD-5499", partner: "Marriott Int", value: "₹18,000", type: "Custom Branding", status: "Delivered", date: "Feb 15" },
    ];

    const activityColumns: Column<any>[] = [
        { key: "id", header: "Order ID" },
        { key: "partner", header: "Client / Dealer" },
        {
            key: "type",
            header: "Order Type",
            render: (v) => <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${v.type === "Custom Branding" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>{v.type}</span>
        },
        { key: "value", header: "Value" },
        {
            key: "status",
            header: "Status",
            render: (q) => <StatusBadge status={q.status} variant={q.status === "Delivered" || q.status === "Dispatched" ? "success" : "info"} />
        },
        { key: "date", header: "Date" }
    ];

    const roleVariant = (role: string) => {
        const map: Record<string, "success" | "info" | "default"> = {
            Admin: "success", Manager: "info", User: "default", Dealer: "info", Supplier: "success"
        };
        return map[role] || "default";
    };

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">

            {/* 1. Navigation & Actions Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest text-primary">
                            User Profile Analytics
                        </h2>
                        <p className="text-[10px] text-muted-foreground mt-1">ID: USR-{id || "7721"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Role Assignment Trigger */}
                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-sm border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase pl-1.5">Role:</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-3 text-xs bg-background border border-border shadow-sm hover:bg-muted font-bold flex items-center gap-2"
                            onClick={() => setRoleModalOpen(true)}
                        >
                            <Shield className="h-3 w-3 text-primary" />
                            {userRole}
                            <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
                        </Button>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm flex-1 sm:flex-none">
                        Deactivate
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none text-white bg-primary hover:bg-primary/90 shadow-sm"
                        onClick={() => setEditModalOpen(true)}
                    >
                        <Edit className="h-3.5 w-3.5" /> Maintain Information
                    </Button>
                </div>
            </div>

            {/* 3. Content Layout wrapped in Tabs */}
            <Tabs defaultValue="overview" className="w-full space-y-4">
                <TabsList className="bg-transparent border-b border-border rounded-none h-11 w-full justify-start gap-6 p-0">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="leads" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all">Leads</TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Professional Details Card */}
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm relative group">
                                <Button
                                    variant="ghost" size="icon"
                                    className="absolute top-4 right-4 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-sm border border-border"
                                    onClick={() => setEditModalOpen(true)}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                                    <div className="h-14 w-14 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xl font-bold border border-primary/20 shrink-0">
                                        {userData.name.split(" ").map((n) => n[0]).join("")}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <h3 className="text-lg font-bold text-foreground truncate leading-tight">{userData.name}</h3>
                                            <StatusBadge status={userData.status} variant="success" />
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5" /> {userData.email}</span>
                                            {userData.phone && (
                                                <>
                                                    <span className="hidden sm:inline text-muted-foreground/30">|</span>
                                                    <span className="flex items-center gap-1.5 truncate"><Phone className="h-3.5 w-3.5" /> {userData.phone}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4 border-t border-border pt-6">
                                    <DetailItem label="Role" value={userRole} badge variant={roleVariant(userRole)} />
                                    <DetailItem label="Gender" value={userData.gender} />
                                    <DetailItem label="Date of Joining" value={userData.joinedDate} />
                                    <DetailItem label="Basic Salary" value={userData.basicSalary} />

                                    <DetailItem label="Associated Company" value={userData.company} />
                                    <DetailItem label="Department" value={userData.department || "—"} />
                                    <DetailItem label="GST Number" value={userData.gstNumber || "—"} />
                                    <DetailItem label="Region / Zone" value={userData.region} />
                                </div>
                            </div>

                            {/* Personal Information Card */}
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm relative group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5 text-primary" />
                                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Personal Details</h3>
                                    </div>
                                    <Button
                                        variant="ghost" size="icon"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50 hover:bg-primary/10 hover:text-primary rounded-sm border border-border"
                                        onClick={() => setEditModalOpen(true)}
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <DetailItem label="Date of Birth" value={userData.dob} />
                                    <DetailItem label="Father's Name" value={userData.fatherName} />
                                    <DetailItem label="PAN Number" value={userData.pan} />
                                    <div className="md:col-span-2">
                                        <DetailItem label="Personal Email" value={userData.personalEmail} />
                                    </div>
                                    <div className="md:col-span-3 pt-2">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1.5 tracking-wider">Residence Address</p>
                                        <p className="text-xs font-semibold leading-relaxed text-foreground/80">{userData.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm h-full">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Security & Sessions</h3>
                                </div>

                                <div className="space-y-4">
                                    {userData.sessions.map((session) => (
                                        <div key={session.id} className="flex gap-3 items-start border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                            <Monitor className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-xs font-semibold text-foreground truncate">{session.device}</p>
                                                    {session.current && (
                                                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-bold">CURRENT</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-muted-foreground mt-1">
                                                    <span className="flex items-center gap-1 shrink-0"><Globe className="h-2.5 w-2.5" /> {session.ip}</span>
                                                    <span>•</span>
                                                    <span>{session.lastActive}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="leads" className="space-y-4 animate-in fade-in-50 duration-300">
                    {/* Key Metrics Row (Moved from Global to Leads Tab) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        <StatCard title="Total Leads" value={userData.totalLeads.toString()} change="+12 this week" changeType="positive" icon={<BarChart3 className="h-4 w-4" />} />
                        <StatCard title="Conversion" value={userData.conversionRate} change="+2.4% vs avg" changeType="positive" icon={<TrendingUp className="h-4 w-4" />} />
                        <StatCard title="Avg. Prod Time" value={userData.avgProductionTime} change="Custom Branding" changeType="neutral" icon={<Clock className="h-4 w-4" />} />
                        <StatCard title="Revenue View" value={userData.revenue} change="Contribution" changeType="neutral" icon={<IndianRupee className="h-4 w-4" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Performance Visualization - 5 Stage Lead Pipeline */}
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <PieChart className="h-3 w-3 text-primary" /> Lead Pipeline Distribution
                                    </h3>
                                    <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">5-Stage Workflow</span>
                                </div>
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <ResponsiveContainer width="100%" height={180} className="md:w-1/2">
                                        <RePieChart>
                                            <Pie
                                                data={leadPipelineData}
                                                cx="50%" cy="50%"
                                                innerRadius={45} outerRadius={75}
                                                dataKey="value" stroke="none"
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
                                            <div key={s.name} className="flex items-center justify-between p-2.5 rounded-sm bg-muted/20 border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                                    <span className="text-[11px] font-semibold text-foreground">{s.name}</span>
                                                </div>
                                                <span className="text-[11px] font-bold text-primary">{s.value} leads</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Business activity Table */}
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <IndianRupee className="h-3 w-3 text-primary" /> Recent Business activity
                                    </h3>
                                </div>
                                <DataTable data={activities} columns={activityColumns} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Revenue Contribution (Moved from Analytics to Leads) */}
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <span className="text-5xl text-primary rotate-12 inline-block font-bold">₹</span>
                                </div>
                                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Revenue Contribution</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-foreground">{userData.revenue} achieved</span>
                                        <span className="text-muted-foreground">{userData.target} goal</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted border border-border rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: userData.attainment }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                                        <TrendingUp className="h-2.5 w-2.5 text-success" /> {userData.attainment} of quota met
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Lead Velocity</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-border/50">
                                        <span className="text-xs text-muted-foreground">New Leads</span>
                                        <span className="text-sm font-bold text-foreground">12</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-border/50">
                                        <span className="text-xs text-muted-foreground">Qualified</span>
                                        <span className="text-sm font-bold text-foreground">45</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">Conversion Goal</span>
                                        <span className="text-sm font-bold text-success">25%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-2 animate-in fade-in-50 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Operational Details (CRM Custom Branding Workflow) */}
                            <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Package className="h-3 w-3 text-primary" /> Branding Workflow Tracking
                                    </h3>
                                    <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 font-bold uppercase tracking-tighter">View Stages &bull; 8 Total</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 border border-border rounded-sm">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Active Stage</p>
                                        <p className="text-sm font-bold text-foreground">Material Quality Assurance</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm font-bold border border-amber-200">IN PROGRESS</span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> 4.5 hrs consumed</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/30 border border-border rounded-sm">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Workflow Efficiency</p>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-foreground">Completion Progress</span>
                                            <span className="text-xs text-primary">62.5%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted border border-border rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: "62.5%" }} />
                                        </div>
                                        <p className="text-[9px] text-muted-foreground mt-2">Stage 5 of 8 completed (Filling & Labelling Next)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <RoleSelectionModal
                open={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                onSelect={setUserRole}
                currentRole={userRole}
            />

            <UserModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={(updatedUser) => {
                    const newUserData = {
                        ...userData,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        status: updatedUser.status,
                        company: updatedUser.companyName || "",
                        gstNumber: updatedUser.gstNumber || "",
                        phone: updatedUser.phone || "",
                        region: updatedUser.region || "",
                        department: updatedUser.department || "",
                        gender: updatedUser.gender || "",
                        joinedDate: updatedUser.dateOfJoining || "",
                        basicSalary: updatedUser.basicSalary || "",
                        dob: updatedUser.dateOfBirth || "",
                        fatherName: updatedUser.fatherName || "",
                        pan: updatedUser.panNumber || "",
                        personalEmail: updatedUser.personalEmail || "",
                        address: updatedUser.residenceAddress || ""
                    };
                    setUserData(newUserData);
                    setUserRole(updatedUser.role || "User");
                }}
                user={{
                    name: userData.name,
                    email: userData.email,
                    role: userRole,
                    status: userData.status,
                    companyName: userData.company,
                    gstNumber: userData.gstNumber,
                    phone: userData.phone,
                    region: userData.region,
                    department: userData.department,
                    gender: userData.gender,
                    dateOfJoining: userData.joinedDate,
                    basicSalary: userData.basicSalary,
                    dateOfBirth: userData.dob,
                    fatherName: userData.fatherName,
                    panNumber: userData.pan,
                    personalEmail: userData.personalEmail,
                    residenceAddress: userData.address
                }}
            />
        </div>
    );
};

export default UserDetailPage;

/* Helper Component for consistent spacing and responsive text */
const DetailItem = ({ label, value, badge, variant }: { label: string; value: string; badge?: boolean; variant?: string }) => (
    <div className="space-y-2 min-w-0">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block truncate">
            {label}
        </span>
        {badge ? (
            <div className="flex">
                <StatusBadge status={value} variant={variant} />
            </div>
        ) : (
            <p className="text-sm font-semibold text-foreground truncate">{value || "—"}</p>
        )}
    </div>
);
