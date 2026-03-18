import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { useState } from "react";
import FollowUpModal, { FollowUp } from "./FollowUpModal";
import StatusBadge from "@/components/StatusBadge";

const FollowUpTab = () => {
    const [open, setOpen] = useState(false);
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

    const handleSave = (data: FollowUp) => {
        if (editingFollowUp) {
            setFollowUps((prev) => prev.map((item) => (item.id === data.id ? data : item)));
        } else {
            setFollowUps((prev) => [data, ...prev]);
        }
        setEditingFollowUp(null);
    };

    const handleEdit = (item: FollowUp) => {
        setEditingFollowUp(item);
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this follow up?")) {
            setFollowUps((prev) => prev.filter((item) => item.id !== id));
        }
    };

    const filteredData = followUps.filter((item) =>
        item.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: Column<FollowUp>[] = [
        { key: "date", header: "Date" },
        { 
            key: "status", 
            header: "Status",
            render: (item) => (
                <StatusBadge 
                    status={item.status} 
                    variant={item.status === "Completed" ? "success" : item.status === "Pending" ? "warning" : "destructive"} 
                />
            )
        },
        { key: "followUpMethod", header: "Method" },
        { key: "purpose", header: "Purpose" },
        { key: "assignedTo", header: "Assigned To" },
        { key: "createdBy", header: "Created By" },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <Button 
                    onClick={() => {
                        setEditingFollowUp(null);
                        setOpen(true);
                    }} 
                    size="sm" 
                    className="gap-2 h-9 px-4"
                >
                    <Plus className="h-4 w-4" />
                    Add Follow Up
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search follow ups..." 
                            className="h-9 pl-9 w-[250px] text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={filteredData}
                pageSize={10}
            />
            <FollowUpModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setEditingFollowUp(null);
                }}
                onSave={handleSave}
                followUpData={editingFollowUp}
                isEditing={!!editingFollowUp}
            />
        </div>
    );
};

export default FollowUpTab;
