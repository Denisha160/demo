import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import ContactModal from "./ContactModal";
// Mock Contacts Table
const mockContacts = [
    {
        id: "1",
        fullName: "Vance Johnson",
        email: "hattie.rosenbaum@example.net",
        position: "Anthropology Teacher",
        phone: "620-578-5185",
        active: true,
        lastLogin: "",
    }
];

const ContactsTab = () => {
    const [open, setOpen] = useState(false);
    const [contacts, setContacts] = useState(mockContacts);

    const handleSave = (contact) => {
        setContacts((prev) => [contact, ...prev]);
    };
    const columns: Column<any>[] = [
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
                        <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <button className="hover:text-primary transition-colors">Edit</button>
                            <span>|</span>
                            <button className="hover:text-destructive transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )
        },
        { key: "email", header: "Email" },
        { key: "position", header: "Position" },
        { key: "phone", header: "Phone" },
        {
            key: "active",
            header: "Active",
            render: (item) => (
                <Switch checked={item.active} className="scale-75 origin-left" />
            )
        },
        { key: "lastLogin", header: "Last Login", render: () => <span className="text-muted-foreground">-</span> },
    ];

    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => setOpen(true)} size="sm" className="gap-2 h-9 px-4">
                    <Plus className="h-4 w-4" />
                    New Contact
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts..."
                            className="h-9 pl-9 w-[250px] text-sm"
                        />
                    </div>
                </div>
            </div>
            <DataTable
                columns={columns}
                data={mockContacts}
                pageSize={25}
            />
            <ContactModal
                open={open}
                onClose={() => setOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default ContactsTab;
