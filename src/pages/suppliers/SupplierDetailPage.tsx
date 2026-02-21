import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import DataTable, { Column } from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft, Edit, Mail, Phone, MapPin,
    Truck, DollarSign, Star, FileText,
    History, AlertTriangle, ChevronRight,
    PackageCheck, Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const SupplierDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Mock data for the supplier
    const supplier = {
        name: "Acme Electronics",
        category: "Electronics",
        contactPerson: "John Smith",
        email: "sales@acme.com",
        phone: "+91 98765 43210",
        address: "Industrial Area, Phase 1, Mumbai, MH - 400001",
        status: "Active",
        totalProcurement: "₹1,24,500",
        outstandingBalance: "₹15,000",
        reliabilityScore: 4.8,
        leadTime: "4.2 days",
        paymentTerms: "Net 30",
        gstNumber: "27AAAAA0000A1Z5"
    };

    const performanceData = [
        { month: "Sep", score: 4.2 },
        { month: "Oct", score: 4.5 },
        { month: "Nov", score: 4.4 },
        { month: "Dec", score: 4.7 },
        { month: "Jan", score: 4.8 },
        { month: "Feb", score: 4.8 },
    ];

    const orders = [
        { id: "PO-2024-001", items: "Circuit Boards (x500)", value: "₹45,000", status: "Delivered", date: "Feb 12" },
        { id: "PO-2024-005", items: "Connectors (x2000)", value: "₹12,200", status: "In Transit", date: "Feb 18" },
        { id: "PO-2023-142", items: "LCD Modules (x100)", value: "₹67,300", status: "Delivered", date: "Jan 25" },
    ];

    const orderColumns: Column<typeof orders[0]>[] = [
        { key: "id", header: "Order ID" },
        { key: "items", header: "Items" },
        { key: "value", header: "Value" },
        {
            key: "status",
            header: "Status",
            render: (o) => <StatusBadge status={o.status} variant={o.status === "Delivered" ? "success" : "info"} />
        },
        { key: "date", header: "Date" }
    ];

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in">
            {/* Top Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm border border-border shrink-0"
                        onClick={() => navigate("/suppliers")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground leading-none truncate font-mono uppercase tracking-widest text-primary">Supplier Profile</h2>
                        <p className="text-[10px] text-muted-foreground mt-1">{supplier.name} • {supplier.category}</p>
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

            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <StatCard title="Total Procurement" value={supplier.totalProcurement} icon={<DollarSign className="h-4 w-4" />} />
                <StatCard title="Reliability Score" value={`${supplier.reliabilityScore}/5.0`} change="+0.2 this quarter" changeType="positive" icon={<Star className="h-4 w-4 text-yellow-400" />} />
                <StatCard title="Avg Lead Time" value={supplier.leadTime} change="-0.5 days imp." changeType="positive" icon={<Clock className="h-4 w-4" />} />
                <StatCard title="Outstanding" value={supplier.outstandingBalance} change="3 bills pending" changeType="neutral" icon={<AlertTriangle className="h-4 w-4" />} />
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-4">
                <TabsList className="bg-transparent border-b border-border rounded-none h-11 w-full justify-start gap-6 p-0">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="orders" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 px-1 font-bold text-[10px] uppercase tracking-[0.15em] transition-all">Orders</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Basic Info & Contact */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="p-6 border border-border rounded-sm bg-card shadow-sm">
                                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <FileText className="h-3 w-3" /> Supplier Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <DetailItem label="Contact Person" value={supplier.contactPerson} icon={<Mail className="h-3 w-3" />} />
                                        <DetailItem label="Email" value={supplier.email} />
                                        <DetailItem label="Phone" value={supplier.phone} icon={<Phone className="h-3 w-3" />} />
                                    </div>
                                    <div className="space-y-4">
                                        <DetailItem label="Payment Terms" value={supplier.paymentTerms} />
                                        <DetailItem label="GST Number" value={supplier.gstNumber} />
                                        <DetailItem label="Address" value={supplier.address} icon={<MapPin className="h-3 w-3" />} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border border-border rounded-sm bg-card shadow-sm">
                                <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <History className="h-3 w-3" /> Recent Transactions
                                </h3>
                                <DataTable data={orders} columns={orderColumns} />
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="space-y-4">
                            <div className="p-6 border border-border rounded-sm bg-card shadow-sm text-center">
                                <div className="h-20 w-20 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-3xl font-bold border border-primary/20 mx-auto mb-4 shadow-sm font-mono tracking-tighter">
                                    {supplier.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <h4 className="font-bold text-lg text-foreground">{supplier.name}</h4>
                                <StatusBadge status={supplier.status} variant="success" className="mt-1" />
                                <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 gap-2 text-left">
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Active since</p>
                                        <p className="text-xs font-semibold">Jan 2023</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Orders count</p>
                                        <p className="text-xs font-semibold">42 orders</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="mt-0">
                    <div className="p-6 border border-border rounded-sm bg-card shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Truck className="h-3 w-3" /> Procurement History
                            </h3>
                            <Button size="sm" className="h-8 text-xs rounded-sm">Create Purchase Order</Button>
                        </div>
                        <DataTable data={orders} columns={orderColumns} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const DetailItem = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3 group">
        <div className="h-8 w-8 rounded bg-muted/30 border border-border flex items-center justify-center shrink-0 group-hover:bg-muted/50 transition-colors">
            {icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
        <div className="min-w-0">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{label}</p>
            <p className="text-xs font-semibold text-foreground truncate">{value}</p>
        </div>
    </div>
);

export default SupplierDetailPage;
