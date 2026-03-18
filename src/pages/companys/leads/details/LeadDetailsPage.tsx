import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
    User, Users, Clock, MapPin, ClipboardList, 
    PhoneCall, Package, Paperclip, Activity, FileText, Bell, Search, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { Column } from "@/components/DataTable";
import { Switch } from "@/components/ui/switch"; // Fallback to checkbox if Switch not explicitly imported, we'll try Switch.

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "follow-up", label: "Follow Up", icon: Clock },
  { id: "visits", label: "Visits", icon: MapPin },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "call-logs", label: "Call Logs", icon: PhoneCall },
  { id: "products", label: "Interested Products", icon: Package },
  { id: "attachments", label: "Attachment", icon: Paperclip },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "quotations", label: "Quotations", icon: FileText },
  { id: "reminders", label: "Reminder", icon: Bell },
];

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
                <Button size="sm" className="gap-2 h-9 px-4">
                    <Plus className="h-4 w-4" />
                    New Contact
                </Button>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search..." 
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
        </div>
    );
};


const LeadDetailsPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("contacts"); // Default to contacts based on user image

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in">
            
            {/* Header Section */}
            <div className="mb-6 px-1">
                <div className="text-[13px] font-medium text-muted-foreground mb-1">
                    Customer from Lead - <Link to="/leads" className="text-primary hover:underline">View</Link>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    #{id || "21"} Jerde Inc
                </h1>
            </div>

            <div className="flex gap-6 flex-1 w-full min-h-0">
                {/* Left Sidebar Menu */}
                <div className="w-[240px] flex-shrink-0 flex flex-col gap-1 pr-2 overflow-y-auto scrollbar-hide border-r border-border/50 pb-10">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium rounded-md transition-all duration-200 ${
                                    isActive 
                                    ? "bg-primary/5 text-primary" 
                                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                                }`}
                            >
                                <Icon className={`h-[18px] w-[18px] ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="flex-1 text-left">{tab.label}</span>
                                {tab.id === "contacts" && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                        isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    }`}>
                                        1
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Right Content Area */}
                <div className="flex-1 min-w-0 overflow-y-auto pb-10 pr-2">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-foreground">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                    </div>

                    {activeTab === "contacts" ? (
                        <ContactsTab />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 bg-card rounded-lg border border-border/50 border-dashed text-muted-foreground">
                            {TABS.find(t => t.id === activeTab)?.icon({ className: "h-12 w-12 opacity-20 mb-4" })}
                            <p className="font-medium">No {TABS.find(t => t.id === activeTab)?.label?.toLowerCase()} available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadDetailsPage;
