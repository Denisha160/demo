import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Edit } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import StatusFormModal from "./StatusFormModal";
import { useLeadStatuses, useUpdateLeadStatus, useDeleteLeadStatus } from "@/hooks/useLeadStatus";
import { LeadStatus } from "@/types/leadStatus";
import StatusBadge from "@/components/StatusBadge";

const StatusPage = () => {
    const [search, setSearch] = useState("");
    const { data, isLoading } = useLeadStatuses();
    const updateStatusMutation = useUpdateLeadStatus();
    const deleteStatusMutation = useDeleteLeadStatus();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<LeadStatus | null>(null);

    const statuses = data?.items || [];

    const filteredStatuses = statuses.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (statusItem: LeadStatus) => {
        setEditingStatus(statusItem);
        setIsFormModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this status?")) {
            deleteStatusMutation.mutate(id);
        }
    };

    const handleSaveStatus = (formData: any) => {
        if (editingStatus) {
            updateStatusMutation.mutate({ id: editingStatus.id, ...formData }, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingStatus(null);
                }
            });
        }
    };

    const columns: Column<LeadStatus>[] = [
        {
            key: "name",
            header: "Name",
            sortable: true,
            className: "font-semibold",
        },
        {
            key: "color",
            header: "Color",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full border border-border/50 shadow-sm"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground uppercase text-[10px] tracking-wider">{item.color}</span>
                </div>
            )
        },
        {
            key: "display_order",
            header: "Display Order",
            sortable: true,
        },
        {
            key: "is_active",
            header: "Status",
            render: (item) => (
                <StatusBadge 
                    status={item.is_active ? "Active" : "Inactive"}
                    variant={item.is_active ? "success" : "destructive"}
                />
            )
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) => (
                <div className="flex bg-transparent items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary hover:bg-primary/10 rounded-sm"
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-sm text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="w-full mx-auto space-y-4 animate-fade-in pb-10">
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-sm">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search Status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-7 text-xs rounded-sm w-full sm:w-[250px]"
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-md shadow-sm border border-border/50">
                <DataTable
                    columns={columns}
                    data={filteredStatuses}
                    pageSize={10}
                    isLoading={isLoading}
                />
            </div>

            {isFormModalOpen && (
                <StatusFormModal
                    open={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    statusData={editingStatus}
                    onSave={handleSaveStatus}
                    isSubmitting={updateStatusMutation.isPending}
                />
            )}
        </div>
    );
};

export default StatusPage;