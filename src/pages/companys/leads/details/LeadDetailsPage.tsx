import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User, Users, Clock, MapPin, ClipboardList,
    PhoneCall, Package, Paperclip, Activity, FileText, Bell
} from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import ProfileTab from "./tabs/profile/ProfileTab";
import ContactsTab from "./tabs/contacts/ContactsTab";
import FollowUpTab from "./tabs/follow-up/FollowUpTab";
import VisitsTab from "./tabs/visits/VisitsTab";
import TasksTab from "./tabs/tasks/TasksTab";
import CallLogsTab from "./tabs/callLogs/CallLogsTab";
import ProductsTab from "./tabs/products/ProductsTab";
import AttachmentsTab from "./attachments/AttachmentsTab";
import ActivityTab from "./tabs/activity/ActivityTab";
import QuotationsTab from "./tabs/quotations/QuotationsTab";
import RemindersTab from "./tabs/reminders/RemindersTab";
import { useLead, useUpdateLead } from "@/hooks/useLeads";

export interface LeadProfileFormValues {
    name: string;
    company: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    assignedTo: string;
    country: string;
    website: string;
    designation: string;
    gstPan: string;
    location: string;
    address: string;
    tags: string;
}

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

const mapLeadToProfile = (lead: any): LeadProfileFormValues => ({
    name: lead?.name || lead?.title || "",
    company: lead?.company || lead?.company_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    status: lead?.status || "",
    source: lead?.source || "",
    assignedTo: lead?.assignedTo || lead?.assigned_to || "",
    country: lead?.country || "",
    website: lead?.website || "",
    designation: lead?.designation || "",
    gstPan: lead?.gstPan || lead?.gst_pan || "",
    location: lead?.location || "",
    address: lead?.address || "",
    tags: Array.isArray(lead?.tags) ? lead.tags.join(", ") : lead?.tags || "",
});

const LeadDetailsPage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("profile");
    const navigate = useNavigate();
    const { data: lead, isLoading } = useLead(id);
    const updateLeadMutation = useUpdateLead();
    const leadProfile = useMemo(() => mapLeadToProfile(lead), [lead]);

    const setLeadProfile = (profile: LeadProfileFormValues) => {
        if (!id) return;

        updateLeadMutation.mutate({
            leadId: id,
            name: profile.name,
            company: profile.company,
            company_name: profile.company,
            email: profile.email,
            phone: profile.phone,
            status: profile.status,
            source: profile.source,
            assignedTo: profile.assignedTo,
            assigned_to: profile.assignedTo,
            country: profile.country,
            website: profile.website,
            designation: profile.designation,
            gstPan: profile.gstPan,
            gst_pan: profile.gstPan,
            location: profile.location,
            address: profile.address,
            tags: profile.tags,
            title: profile.name,
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileTab leadProfile={leadProfile} setLeadProfile={setLeadProfile} />;
            case "contacts": return <ContactsTab />;
            case "follow-up": return id ? <FollowUpTab leadId={id} /> : null;
            case "visits": return id ? <VisitsTab leadId={id} /> : null;
            case "tasks": return id ? <TasksTab leadId={id} /> : null;
            case "call-logs": return <CallLogsTab />;
            case "products": return <ProductsTab />;
            case "attachments": return <AttachmentsTab />;
            case "activity": return <ActivityTab />;
            case "quotations": return <QuotationsTab />;
            case "reminders": return <RemindersTab />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in">

            {/* Header */}
            <div className="mb-4 px-1">
                <div className="text-[13px] font-medium text-muted-foreground mb-1">
                    Customer from Lead -{" "}
                    <span
                        onClick={() => navigate(-1)}
                        className="text-primary hover:underline cursor-pointer"
                    >
                        View
                    </span>
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    #{id || "21"} {isLoading ? "Loading..." : (leadProfile.name || "Lead Details")}
                </h1>
            </div>

            {/* Mobile Dropdown */}
            <div className="block md:hidden mb-4">
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger className="w-full">
                        <SelectValue>
                            {TABS.find(t => t.id === activeTab)?.label}
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {TABS.map((tab) => (
                            <SelectItem key={tab.id} value={tab.id}>
                                {tab.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Layout */}
            <div className="flex flex-col md:flex-row gap-6 flex-1 w-full min-h-0">

                {/* Sidebar (Desktop only) */}
                <div className="hidden md:flex w-[260px] flex-shrink-0 flex-col gap-1 pr-2 overflow-y-auto border-r border-border/50 pb-10">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-[13px] font-medium rounded-md transition-all duration-200 ${isActive
                                    ? "bg-primary/5 text-primary"
                                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground"
                                    }`}
                            >
                                <Icon className={`h-[18px] w-[18px] ${isActive ? "text-primary" : "text-muted-foreground"
                                    }`} />
                                <span className="flex-1 text-left">{tab.label}</span>

                                {tab.id === "contacts" && (
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive
                                        ? "bg-primary/20 text-primary"
                                        : "bg-muted text-muted-foreground"
                                        }`}>
                                        1
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 overflow-y-auto pb-10 pr-2">

                    {/* Title (Desktop only) */}
                    <div className="hidden md:block mb-4">
                        <h2 className="text-lg font-bold text-foreground">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                    </div>

                    {/* Content */}
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default LeadDetailsPage;
