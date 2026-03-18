import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import ContactModal, { Contact } from "./ContactModal";

// Initial Mock Contacts
const initialContacts: Contact[] = [
    {
        id: "1",
        fullName: "Vance Johnson",
        email: "hattie.rosenbaum@example.net",
        designation: "Anthropology Teacher",
        phone: "620-578-5185",
        active: true,
        notes: "",
        department: "Education",
    }
];

const ContactsTab = () => {
    const [open, setOpen] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const handleSave = (contact: Contact) => {
        if (editingContact) {
            setContacts((prev) => prev.map((c) => (c.id === contact.id ? contact : c)));
        } else {
            setContacts((prev) => [contact, ...prev]);
        }
        setEditingContact(null);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            setContacts((prev) => prev.filter((c) => c.id !== id));
        }
    };

    const filteredContacts = contacts.filter((contact) =>
        contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns: Column<Contact>[] = [
        {
            key: "fullName",
            header: "Full Name",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold font-mono">
                        {item.fullName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">{item.fullName}</span>
                    </div>
                </div>
            )
        },
        { key: "email", header: "Email" },
        { key: "phone", header: "Phone" },
        { key: "designation", header: "Designation" },
        { key: "department", header: "Department" },
        {
            key: "active",
            header: "Active",
            render: (item) => (
                <Switch 
                    checked={item.active} 
                    className="scale-75 origin-left" 
                    onCheckedChange={(checked) => {
                        setContacts(prev => prev.map(c => c.id === item.id ? { ...c, active: checked } : c));
                    }}
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
                data={filteredContacts}
                pageSize={25}
            />
            <ContactModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setEditingContact(null);
                }}
                onSave={handleSave}
                initialData={editingContact}
            />
        </div>
    );
};

export default ContactsTab;
