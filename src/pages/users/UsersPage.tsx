import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react";
import UserModal from "./UserModal";
import { useNavigate } from "react-router-dom";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { User, UserUpdatePayload } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";

const Users = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

    const { data: usersResponse, isLoading } = useUsers({
        search: debouncedSearch || undefined,
        sort_by: sortKey || undefined,
        sort_direction: sortDirection || undefined,
        offset: (page - 1) * limit,
        limit,
    });

    const { mutate: deleteUser } = useDeleteUser();
    const users = usersResponse?.items || [];
    const totalItems = usersResponse?.pagination?.total || 0;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSave = () => {
        // Form logic is handled within the modal using the dedicated hooks
        setModalOpen(false);
        setSelectedUser(null);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleDelete = (id: string | undefined) => {
        if (!id) return;
        if (confirm("Are you sure you want to delete this user?")) {
            deleteUser(id);
        }
    };

    const columns: Column<User>[] = [
        {
            key: "name",
            header: "User",
            sortable: true,
            className: "w-[300px]",
            render: (item) => (
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Assuming companyId might not always be present based on previous route structures
                        navigate(`${item.id}`);
                    }}
                >
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20">
                        {item.name ? item.name.split(" ").map((n) => n[0]).join("") : "?"}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "role",
            header: "Role",
            sortable: true,
            render: (item) => <StatusBadge status={item.role || "User"} variant={item.role === "Admin" ? "success" : item.role === "Manager" ? "info" : "default"} />
        },
        {
            key: "is_active",
            header: "Status",
            sortable: true,
            render: (item) => <StatusBadge status={item.is_active ? "Active" : "Inactive"} variant={item.is_active ? "success" : "destructive"} />
        },
        {
            key: "department_id",
            header: "Department",
            className: "hidden md:table-cell",
            render: (item) => <p className="text-sm text-foreground/80">{item.department_id || "—"}</p>
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-[120px]",
            render: (item) => (
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => navigate(`${item.id}`)}>
                        <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(item)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
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

            <div className="border border-border/60 rounded-sm shadow-sm">
                <DataTable
                    data={users}
                    columns={columns}
                    isLoading={isLoading}
                    pageSize={limit}
                    serverSide={true}
                    serverTotal={totalItems}
                    serverPage={page}
                    serverSortKey={sortKey || undefined}
                    serverSortDirection={sortDirection}
                    onServerPageChange={setPage}
                    onServerPageSizeChange={(newSize) => {
                        setLimit(newSize);
                        setPage(1);
                    }}
                    onServerSortChange={(key, direction) => {
                        setSortKey(key);
                        setSortDirection(direction);
                        setPage(1);
                    }}
                    onRowClick={(item) => navigate(`${item.id}`)}
                />
            </div>

            <UserModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} user={selectedUser} />
        </div>
    );
};

export default Users;
