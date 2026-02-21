import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, Trash2, Truck, DollarSign, Star } from "lucide-react";
import SupplierModal, { Supplier } from "./SupplierModal";
import { useNavigate } from "react-router-dom";

const initialSuppliers: Supplier[] = [
    {
        id: 1,
        name: "Acme Electronics",
        category: "Electronics",
        contactPerson: "John Smith",
        email: "sales@acme.com",
        phone: "+91 98765 43210",
        address: "Industrial Area, Phase 1, Mumbai",
        gstNumber: "27AAAAA0000A1Z5",
        paymentTerms: "Net 30",
        status: "Active",
        totalProcurement: "₹1,24,500",
        reliabilityScore: 4.8
    },
    {
        id: 2,
        name: "Global Logistics",
        category: "Logistics",
        contactPerson: "Sarah Lee",
        email: "support@global.com",
        phone: "+91 91234 56789",
        address: "Airport Road, Delhi",
        gstNumber: "07BBBBB1111B2Z6",
        paymentTerms: "Net 15",
        status: "Active",
        totalProcurement: "₹85,200",
        reliabilityScore: 4.5
    },
    {
        id: 3,
        name: "Prime Packaging",
        category: "Packaging",
        contactPerson: "Emma Davis",
        email: "emma@primepack.com",
        phone: "+91 88888 77777",
        address: "Sector 5, Bangalore",
        gstNumber: "29CCCCC2222C3Z7",
        paymentTerms: "Immediate",
        status: "Inactive",
        totalProcurement: "₹42,100",
        reliabilityScore: 4.2
    },
];

const SuppliersPage = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

    const filtered = suppliers.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = (data: Omit<Supplier, 'id' | 'totalProcurement' | 'reliabilityScore'>) => {
        if (selectedSupplier) {
            setSuppliers(suppliers.map((s) => (s.id === selectedSupplier.id ? {
                ...s,
                ...data
            } : s)));
        } else {
            const newItem: Supplier = {
                ...data,
                id: Date.now(),
                totalProcurement: "₹0",
                reliabilityScore: 5.0
            };
            setSuppliers([...suppliers, newItem]);
        }
    };

    const handleEdit = (s: Supplier) => {
        setSelectedSupplier(s);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this supplier?")) {
            setSuppliers(suppliers.filter((s) => s.id !== id));
        }
    };

    const columns: Column<Supplier>[] = [
        {
            key: "name",
            header: "Supplier",
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
        { key: "category", header: "Category" },
        {
            key: "performance",
            header: "Financials",
            render: (s) => (
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">{s.totalProcurement}</p>
                    <p className="text-[10px] text-muted-foreground">{s.paymentTerms}</p>
                </div>
            )
        },
        {
            key: "reliabilityScore",
            header: "Reliability",
            render: (s) => (
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{s.reliabilityScore}</span>
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
                            placeholder="Search suppliers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-64"
                        />
                    </div>
                </div>
                <Button size="sm" className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none" onClick={() => { setSelectedSupplier(null); setModalOpen(true); }}>
                    <Plus className="h-3.5 w-3.5" /> Add Supplier
                </Button>
            </div>

            <div className="border border-border rounded-sm overflow-hidden bg-card shadow-sm">
                <DataTable data={filtered} columns={columns} />
            </div>

            <SupplierModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                supplier={selectedSupplier}
            />
        </div>
    );
};

export default SuppliersPage;
