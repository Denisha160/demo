import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
import UserModal from "./UserModal";
import { useNavigate } from "react-router-dom";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin: string;
    department: string;
}

const initialUsers: User[] = [
    { id: 1, name: "John Doe", email: "john@company.com", role: "Admin", status: "Active", lastLogin: "Today, 10:45 AM", department: "IT" },
    { id: 2, name: "Jane Smith", email: "jane@company.com", role: "Manager", status: "Active", lastLogin: "Yesterday, 3:20 PM", department: "Sales" },
    { id: 3, name: "Robert Wilson", email: "robert@company.com", role: "User", status: "Inactive", lastLogin: "3 days ago", department: "Marketing" },
    { id: 4, name: "Alice Brown", email: "alice@company.com", role: "User", status: "Pending", lastLogin: "Never", department: "Support" },
    { id: 5, name: "Michael Taylor", email: "michael@company.com", role: "Manager", status: "Active", lastLogin: "Today, 9:15 AM", department: "Operations" },
];

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = (userData: Omit<User, 'id' | 'lastLogin' | 'department'>) => {
        if (selectedUser) {
            setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u)));
        } else {
            const newUser: User = {
                ...userData,
                id: Date.now(),
                lastLogin: "Never",
                department: "Operations"
            };
            setUsers([...users, newUser]);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setUsers(users.filter((u) => u.id !== id));
        }
    };

    const columns: Column<User>[] = [
        {
            key: "name",
            header: "User",
            render: (item) => (
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`${item.id}`)} // Navigation on click
                >
                    <div className="h-7 w-7 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground leading-none">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">{item.email}</p>
                    </div>
                </div>
            ),
        },
        { key: "role", header: "Role", render: (item) => <StatusBadge status={item.role} variant={item.role === "Admin" ? "success" : item.role === "Manager" ? "info" : "default"} /> },
        { key: "status", header: "Status", render: (item) => <StatusBadge status={item.status} variant={item.status === "Active" ? "success" : item.status === "Pending" ? "warning" : "destructive"} /> },
        { key: "lastLogin", header: "Last Login", className: "hidden md:table-cell" },
        {
            key: "actions",
            header: "Actions",
            className: "w-[100px] text-right",
            render: (item) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`${item.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-4">
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
                </div>
                <Button size="sm" className="h-8 text-xs rounded-sm gap-2 flex-1 sm:flex-none" onClick={() => { setSelectedUser(null); setModalOpen(true); }}>
                    <Plus className="h-4 w-4" /> Add User
                </Button>
            </div>

            <div className="border border-border rounded-sm overflow-hidden">
                <DataTable data={filtered} columns={columns} />
            </div>

            <UserModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} user={selectedUser} />
        </div>
    );
};

export default Users;
