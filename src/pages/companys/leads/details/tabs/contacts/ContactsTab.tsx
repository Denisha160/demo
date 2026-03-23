import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import ContactModal from "./ContactModal";
import { useLeadContacts, useDeleteLeadContact, useUpdateLeadContact } from "@/hooks/useLeadContacts";
import { LeadContact } from "@/types/contacts";

const ContactsTab = () => {
    const { id: leadId = "" } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [editingContact, setEditingContact] = useState<LeadContact | null>(null);

    // Synchronize search to URL
    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (debouncedSearch) next.set("search", debouncedSearch);
            else next.delete("search");
            return next;
        }, { replace: true });
    }, [debouncedSearch, setSearchParams]);

    const { data, isLoading } = useLeadContacts(leadId, {
        search: debouncedSearch
    });
    
    const deleteMutation = useDeleteLeadContact();
    const updateMutation = useUpdateLeadContact();

    const contacts = data?.contacts || [];

    const handleEdit = (contact: LeadContact) => {
        setEditingContact(contact);
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            deleteMutation.mutate({ leadId, contactId: id });
        }
    };

    const handleTogglePrimary = (contact: LeadContact, checked: boolean) => {
        updateMutation.mutate({
            leadId,
            contactId: contact.id,
            is_primary: checked
        });
    };

    const columns: Column<LeadContact>[] = [
        {
            key: "name",
            header: "Full Name",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold font-mono text-xs">
                        {item.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">{item.name}</span>
                        {item.is_primary && (
                            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Primary Contact</span>
                        )}
                    </div>
                </div>
            )
        },
        { key: "email", header: "Email", render: (item) => <span className="text-sm">{item.email || "-"}</span> },
        { key: "phone", header: "Phone", render: (item) => <span className="text-sm">{item.phone || "-"}</span> },
        { key: "designation", header: "Designation", render: (item) => <span className="text-sm">{item.designation || "-"}</span> },
        { key: "department", header: "Department", render: (item) => <span className="text-sm">{item.department || "-"}</span> },
        {
            key: "is_primary",
            header: "Primary",
            render: (item) => (
                <Switch 
                    checked={item.is_primary} 
                    className="scale-75 origin-left" 
                    onCheckedChange={(checked) => handleTogglePrimary(item, checked)}
                />
            )
        },
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
                        setEditingContact(null);
                        setOpen(true);
                    }} 
                    size="sm" 
                    className="gap-2 h-9 px-4"
                >
                    <Plus className="h-4 w-4" />
                    New Contact
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            className="h-9 pl-9 w-[250px] text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={contacts}
                pageSize={25}
                isLoading={isLoading}
            />
            <ContactModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setEditingContact(null);
                }}
                initialData={editingContact}
            />
        </div>
    );
};

export default ContactsTab;
