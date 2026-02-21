import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, Trash2, UserCheck, IndianRupee, Target } from "lucide-react";
import SalesmanModal from "./SalesmanModal";
import { useNavigate } from "react-router-dom";

interface Salesman {
    id: number;
    name: string;
    email: string;
    phone: string;
    region: string;
    status: string;
    totalRevenue: string;
    activeLeads: number;
}

const initialSalesmen: Salesman[] = [
    { id: 1, name: "Sarah Lee", email: "sarah@company.com", phone: "+1 (555) 123-4567", region: "West Coast", status: "Active", totalRevenue: "$142,500", activeLeads: 12 },
    { id: 2, name: "John Smith", email: "john@company.com", phone: "+1 (555) 234-5678", region: "East Coast", status: "Active", totalRevenue: "$98,200", activeLeads: 8 },
    { id: 3, name: "Emma Davis", email: "emma@company.com", phone: "+1 (555) 345-6789", region: "Midwest", status: "Active", totalRevenue: "$76,400", activeLeads: 15 },
    { id: 4, name: "Alex Kim", email: "alex@company.com", phone: "+1 (555) 456-7890", region: "South", status: "Inactive", totalRevenue: "$42,100", activeLeads: 5 },
];

const SalesmenPage = () => {
    const navigate = useNavigate();
    const [salesmen, setSalesmen] = useState<Salesman[]>(initialSalesmen);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSalesman, setSelectedSalesman] = useState<Salesman | null>(null);

    const filtered = salesmen.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.region.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = (data: Omit<Salesman, 'id' | 'totalRevenue' | 'activeLeads'>) => {
        if (selectedSalesman) {
            setSalesmen(salesmen.map((s) => (s.id === selectedSalesman.id ? { ...s, ...data } : s)));
        } else {
            const newItem: Salesman = {
                ...data,
                id: Date.now(),
                totalRevenue: "$0",
                activeLeads: 0
            };
            setSalesmen([...salesmen, newItem]);
        }
    };

    const handleEdit = (s: Salesman) => {
        setSelectedSalesman(s);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this salesman?")) {
            setSalesmen(salesmen.filter((s) => s.id !== id));
        }
    };

    const columns: Column<Salesman>[] = [
        {
            key: "name",
            header: "Salesman",
            render: (s) => (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`${s.id}`)}
                >
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xs font-bold border border-primary/20">
                        {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-foreground leading-none">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.email}</p>
                    </div>
                </div>
            )
        },
        { key: "region", header: "Region" },
        {
            key: "performance",
            header: "Performance",
            render: (s) => (
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">{s.totalRevenue}</p>
                    <p className="text-[10px] text-muted-foreground">{s.activeLeads} active leads</p>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            render: (s) => <StatusBadge status={s.status} variant={s.status === "Active" ? "success" : "destructive"} />
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-[120px] text-right",
            render: (s) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`${s.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(s)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search salesmen..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-64"
                        />
                    </div>
                </div>
                <Button size="sm" className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none" onClick={() => { setSelectedSalesman(null); setModalOpen(true); }}>
                    <Plus className="h-3.5 w-3.5" /> Add Salesman
                </Button>
            </div>

            <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
                <DataTable data={filtered} columns={columns} />
            </div>

            <SalesmanModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                salesman={selectedSalesman}
            />
        </div>
    );
};

export default SalesmenPage;
