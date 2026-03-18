import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import SourceModal from "./SourceModal";

export interface LeadSource {
    id: string;
    name: string;
    category: string;
    isActive: boolean;
    displayOrder: number;
    createdBy: string;
    updatedBy: string;
}

const STATIC_SOURCES: LeadSource[] = [
    {
        id: "1",
        name: "Organic Search",
        category: "Inbound",
        isActive: true,
        displayOrder: 1,
        createdBy: "System",
        updatedBy: "System",
    },
    {
        id: "2",
        name: "Referral",
        category: "Partner",
        isActive: true,
        displayOrder: 2,
        createdBy: "Admin User",
        updatedBy: "Admin User",
    },
    {
        id: "3",
        name: "Trade Show",
        category: "Event",
        isActive: false,
        displayOrder: 3,
        createdBy: "System",
        updatedBy: "Jane Smith",
    },
];

const SourcePage = () => {
    const [search, setSearch] = useState("");
    const [sources, setSources] = useState<LeadSource[]>(STATIC_SOURCES);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<LeadSource | null>(null);

    const filteredSources = sources.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (sourceItem: LeadSource) => {
        setEditingSource(sourceItem);
        setIsFormModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setSources(sources.filter(s => s.id !== id));
    };

    const handleSaveSource = (data: any) => {
        if (editingSource) {
            setSources(sources.map(s =>
                s.id === editingSource.id ? { ...s, ...data, updatedBy: "Current User" } : s
            ));
        }
        setIsFormModalOpen(false);
        setEditingSource(null);
    };

    const columns: Column<LeadSource>[] = [
        {
            key: "name",
            header: "Name",
            sortable: true,
            className: "font-semibold",
        },
        {
            key: "category",
            header: "Category",
            sortable: true,
        },
        {
            key: "isActive",
            header: "Status",
            render: (item) => (
                <Badge variant={item.isActive ? "success" : "secondary"} className="rounded-full px-2 py-0 text-[10px] uppercase tracking-wider font-bold">
                    {item.isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
        {
            key: "displayOrder",
            header: "Display Order",
            sortable: true,
        },
        {
            key: "createdBy",
            header: "Created By",
        },
        {
            key: "updatedBy",
            header: "Updated By",
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
                            placeholder="Search Sources..."
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
                    data={filteredSources}
                    pageSize={10}
                />
            </div>

            {isFormModalOpen && (
                <SourceModal
                    open={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    sourceData={editingSource}
                    onSave={handleSaveSource}
                />
            )}
        </div>
    );
};

export default SourcePage;