import { useState } from "react";
import { CalendarDays, Edit, MapPin, Plus, Search, Trash2 } from "lucide-react";

import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import VisitsModal, { Visit, VisitFormData } from "./VisitsMode";

const initialVisits: Visit[] = [
    {
        id: "1",
        title: "Factory Visit",
        description: "Visited customer factory and discussed machinery upgrade requirements.",
        visit_type: "site_visit",
        status: "SCHEDULED",
        scheduled_time: "2026-03-20T11:00",
        actual_check_in: "",
        actual_check_out: "",
        location_address: "Peenya Industrial Area, Bengaluru",
        location_latitude: "13.0285",
        location_longitude: "77.5194",
        visit_image: "",
        visit_image_name: "",
        outcome_summary: "",
        next_steps: "Share updated proposal and book second demo.",
        customer_rating: "4",
        contact_person_name: "Rohan Mehta",
        contact_person_designation: "Purchase Manager",
        contact_person_phone: "9876543210",
    },
    {
        id: "2",
        title: "Product Demo Visit",
        description: "On-site demo completed for the sales and operations team.",
        visit_type: "demo",
        status: "COMPLETED",
        scheduled_time: "2026-03-18T15:30",
        actual_check_in: "2026-03-18T15:25",
        actual_check_out: "2026-03-18T16:40",
        location_address: "MG Road, Bengaluru",
        location_latitude: "12.9756",
        location_longitude: "77.6050",
        visit_image: "",
        visit_image_name: "",
        outcome_summary: "Customer liked the reporting module and asked for pricing.",
        next_steps: "Send quotation by tomorrow.",
        customer_rating: "5",
        contact_person_name: "Anita Rao",
        contact_person_designation: "Operations Head",
        contact_person_phone: "9123456780",
    },
];

const formatDateTime = (value?: string) => {
    if (!value) return "-";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsed);
};

const getStatusVariant = (status: string) => {
    switch (status) {
        case "COMPLETED":
            return "success";
        case "SCHEDULED":
        case "RESCHEDULED":
            return "info";
        case "CANCELLED":
        case "MISSED":
            return "destructive";
        case "CHECKED_IN":
        case "IN_PROGRESS":
            return "warning";
        default:
            return "default";
    }
};

const VisitsTab = () => {
    const [visits, setVisits] = useState<Visit[]>(initialVisits);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
    const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);

    const filteredVisits = visits.filter((visit) => {
        const query = search.toLowerCase();

        return (
            visit.title.toLowerCase().includes(query) ||
            visit.visit_type.toLowerCase().includes(query) ||
            visit.status.toLowerCase().includes(query) ||
            visit.location_address.toLowerCase().includes(query) ||
            visit.contact_person_name.toLowerCase().includes(query)
        );
    });

    const handleCreate = () => {
        setEditingVisit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (visit: Visit) => {
        setEditingVisit(visit);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setVisits((prev) => prev.filter((visit) => visit.id !== id));
        setVisitToDelete(null);
    };

    const handleSaveVisit = (formData: VisitFormData) => {
        if (editingVisit) {
            setVisits((prev) =>
                prev.map((visit) => (visit.id === editingVisit.id ? { ...visit, ...formData } : visit)),
            );
        } else {
            const newVisit: Visit = {
                id: crypto.randomUUID(),
                ...formData,
            };

            setVisits((prev) => [newVisit, ...prev]);
        }

        setIsModalOpen(false);
        setEditingVisit(null);
    };

    const columns: Column<Visit>[] = [
        {
            key: "scheduled_time",
            header: "Visit Date",
            render: (item) => (
                <div className="flex items-start gap-2">
                    <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                        <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                            {formatDateTime(item.scheduled_time)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Check in: {formatDateTime(item.actual_check_in)}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "title",
            header: "Visit Details",
            render: (item) => (
                <div className="flex items-start gap-3">
                    {item.visit_image ? (
                        <img
                            src={item.visit_image}
                            alt={item.visit_image_name || item.title}
                            className="h-12 w-12 rounded-md border border-border/60 object-cover"
                        />
                    ) : null}
                    <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">{item.title}</span>
                        <span className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (item) => (
                <div className="space-y-1">
                    <StatusBadge
                        status={item.status.replace(/_/g, " ")}
                        variant={getStatusVariant(item.status)}
                    />
                    <div className="text-[11px] text-muted-foreground capitalize">
                        {item.visit_type.replace("_", " ")}
                    </div>
                </div>
            ),
        },
        {
            key: "contact_person_name",
            header: "Contact",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{item.contact_person_name}</span>
                    <span className="text-[11px] text-muted-foreground">
                        {item.contact_person_designation || "-"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{item.contact_person_phone}</span>
                </div>
            ),
        },
        {
            key: "location_address",
            header: "Location",
            render: (item) => (
                <div className="flex items-start gap-2 max-w-xs">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div className="flex flex-col">
                        <span className="text-xs text-foreground line-clamp-2">{item.location_address}</span>
                        <span className="text-[11px] text-muted-foreground">
                            Rating: {item.customer_rating || "-"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "id",
            header: "Actions",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleEdit(item)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setVisitToDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Button size="sm" className="h-9 gap-2 px-4" onClick={handleCreate}>
                    <Plus className="h-4 w-4" />
                    Add Visit
                </Button>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search visits..."
                        className="h-9 w-[250px] pl-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <DataTable columns={columns} data={filteredVisits} pageSize={10} />

            {isModalOpen && (
                <VisitsModal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingVisit(null);
                    }}
                    visitData={editingVisit}
                    onSave={handleSaveVisit}
                />
            )}

            <AlertDialog open={!!visitToDelete} onOpenChange={(open) => !open && setVisitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the visit "{visitToDelete?.title}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => visitToDelete && handleDelete(visitToDelete.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default VisitsTab;
