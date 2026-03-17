import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import PartyModal from "./PartyModal";
import PartyDetail from "./PartyDetail";

interface Contact {
    id: number;
    name: string;
    email: string;
    company: string;
    phone: string;
    status: string;
    lastContact: string;
}

const generateContacts = (): Contact[] => {
    const names = ["Alice Johnson", "Bob Williams", "Charlie Brown", "Diana Prince", "Ethan Hunt", "Fiona Apple", "George Lucas", "Hannah Montana", "Ian Malcolm", "Jane Foster", "Kevin Hart", "Laura Palmer", "Mark Spencer", "Nina Simone", "Oscar Wilde", "Paul Walker", "Quinn Hughes", "Rachel Green", "Steve Rogers", "Tina Turner", "Uma Thurman", "Vince Vaughn", "Wendy Darling", "Xavier Charles", "Yara Shah", "Zoe Clark"];
    const companies = ["Acme Corp", "TechStart", "GlobalFin", "DataFlow", "CloudBase", "NetSolutions", "SmartApps", "InnoTech"];
    const statuses = ["Active", "Inactive", "Lead", "Customer"];

    return names.map((name, i) => ({
        id: i + 1,
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
        company: companies[i % companies.length],
        phone: `+1 ${String(Math.floor(Math.random() * 900 + 100))}-${String(Math.floor(Math.random() * 900 + 100))}-${String(Math.floor(Math.random() * 9000 + 1000))}`,
        status: statuses[i % statuses.length],
        lastContact: `Feb ${String(Math.max(1, 13 - i)).padStart(2, "0")}`,
    }));
};

const allContacts = generateContacts();

const statusVariant = (s: string) => {
    const map: Record<string, "success" | "warning" | "info" | "default"> = {
        Active: "success", Customer: "info", Lead: "warning", Inactive: "default",
    };
    return map[s] || "default";
};

const PartiesPage = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);
    const [detailContact, setDetailContact] = useState<Contact | null>(null);

    const filtered = allContacts.filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            c.company.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "All" || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const columns: Column<Contact>[] = [
        {
            key: "name",
            header: "Name",
            render: (item) => (
                <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground sm:hidden">{item.email}</p>
                </div>
            ),
        },
        { key: "email", header: "Email", className: "hidden sm:table-cell" },
        { key: "company", header: "Company", className: "hidden md:table-cell" },
        { key: "phone", header: "Phone", className: "hidden lg:table-cell" },
        {
            key: "status",
            header: "Status",
            render: (item) => <StatusBadge status={item.status} variant={statusVariant(item.status)} />,
        },
        { key: "lastContact", header: "Last Contact", className: "hidden md:table-cell" },
    ];

    const statuses = ["All", "Active", "Lead", "Customer", "Inactive"];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-56"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-2 py-1 text-sm rounded-sm transition-colors ${filterStatus === s
                                    ? "text-primary font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <Button size="sm" className="h-8 text-sm rounded-sm" onClick={() => setModalOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Contact
                </Button>
            </div>

            <DataTable
                data={filtered}
                columns={columns}
                pageSize={10}
                onRowClick={(c) => setDetailContact(c)}
            />

            <PartyModal open={modalOpen} onClose={() => setModalOpen(false)} />
            <PartyDetail contact={detailContact} onClose={() => setDetailContact(null)} />
        </div>
    );
};

export default PartiesPage;
