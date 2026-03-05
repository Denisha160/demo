import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import UserModal from "./UserModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUsers, useDeleteUser, useUpdateUser } from "@/hooks/useUsers";
import { User, UserUpdatePayload } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";

// Helper component for the inline shift selector
const ShiftSelect = ({ user }: { user: User }) => {
    const { mutate: updateUser, isPending } = useUpdateUser();

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Select
                value={user.work_shift || "morning"}
                onValueChange={(val: "morning" | "evening" | "night" | "rotating") => {
                    if (val !== user.work_shift) {
                        const payload: UserUpdatePayload = { id: user.id, work_shift: val };
                        updateUser(payload);
                    }
                }}
                disabled={isPending}
            >
                <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="rotating">Rotating</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

const Users = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(search, 500);

    const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">(
        (searchParams.get("status") as "All" | "Active" | "Inactive") || "All"
    );

    const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
    const [limit, setLimit] = useState(parseInt(searchParams.get("limit") || "10", 10));
    const [sortKey, setSortKey] = useState<string | null>(searchParams.get("sortKey"));
    const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
        (searchParams.get("sortDirection") as "asc" | "desc") || null
    );

    const hasFilters = Boolean(
        search || filterStatus !== "All" || sortKey
    );

    const handleClearFilters = () => {
        setSearch("");
        setFilterStatus("All");
        setSortKey(null);
        setSortDirection(null);
        setPage(1);
    };

    // Synchronize states to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);

            if (debouncedSearch) next.set("search", debouncedSearch);
            else next.delete("search");

            if (filterStatus !== "All") next.set("status", filterStatus);
            else next.delete("status");

            if (page > 1) next.set("page", page.toString());
            else next.delete("page");

            if (limit !== 10) next.set("limit", limit.toString());
            else next.delete("limit");

            if (sortKey) next.set("sortKey", sortKey);
            else next.delete("sortKey");

            if (sortDirection) next.set("sortDirection", sortDirection);
            else next.delete("sortDirection");

            return next;
        }, { replace: true });
    }, [debouncedSearch, filterStatus, page, limit, sortKey, sortDirection, setSearchParams]);

    const { data: usersResponse, isLoading } = useUsers({
        search: debouncedSearch.trim() || undefined,
        is_active: filterStatus === "All" ? undefined : filterStatus === "Active" ? true : false,
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
            key: "employee_code",
            header: "Emp Code",
            sortable: true,
            className: "w-[120px]",
            render: (item) => <p className="text-sm font-medium text-foreground">{item.employee_code || "—"}</p>
        },
        {
            key: "phone_number",
            header: "Phone",
            render: (item) => <p className="text-sm text-foreground/80">{item.phone_number || "—"}</p>
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
            render: (item) => <p className="text-sm text-foreground/80">{item.department || "—"}</p> // Use department instead of department_id
        },
        {
            key: "work_shift",
            header: "Shift",
            render: (item) => <ShiftSelect user={item} />
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
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="h-8 pl-7 text-sm rounded-sm w-full sm:w-[280px]"
                        />
                    </div>

                    {/* Select dropdown for filter */}
                    <Select
                        value={filterStatus}
                        onValueChange={(value: "All" | "Active" | "Inactive") => {
                            setFilterStatus(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[130px] h-8 text-sm rounded-sm">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Users</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                                Clear
                            </Button>
                        </div>
                    )}
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
