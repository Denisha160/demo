import { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    User, Users, Clock, MapPin, ClipboardList,
    PhoneCall, Package, Paperclip, Activity, FileText, Bell,
    CheckCircle, ShieldCheck
} from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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

import ProfileTab from "./tabs/profile/ProfileTab";
import ContactsTab from "./tabs/contacts/ContactsTab";
import FollowUpTab from "./tabs/follow-up/FollowUpTab";
import VisitsTab from "./tabs/visits/VisitsTab";
import TasksTab from "./tabs/tasks/TasksTab";
import CallLogsTab from "./tabs/callLogs/CallLogsTab";
import ProductsTab from "./tabs/products/ProductsTab";
import AttachmentsTab from "./tabs/attachments/AttachmentsTab";
import ActivityTab from "./tabs/activity/ActivityTab";
import QuotationsTab from "./tabs/quotations/QuotationsTab";
import RemindersTab from "./tabs/reminders/RemindersTab";
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import VerifyLeadModal from "./VerifyLeadModal";
import { useConvertLead } from "@/hooks/useLeadVerification";

export interface LeadProfileFormValues {
    name: string;
    company: string;
    email: string;
    phone: string;
    status_id: string;
    source_id: string;
    assigned_to: string;
    country: string;
    website: string;
    designation: string;
    gstPan: string;
    location: string;
    address: string;
    tags: { id?: string; name: string }[];
}

interface LeadDetailsData {
    id?: string;
    name?: string;
    title?: string;
    company?: string;
    company_name?: string;
    email?: string;
    phone?: string;
    alternate_phone?: string;
    status?: string;
    status_name?: string;
    source?: string;
    source_name?: string;
    assignedTo?: string;
    assigned_to?: string;
    assigned_to_name?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    website?: string;
    designation?: string;
    gstPan?: string;
    gst_pan?: string;
    gst_number?: string;
    pan_number?: string;
    location?: string;
    address?: string;
    address_line1?: string;
    address_line2?: string;
    tags?: any[] | string;
    attachments?: any[];
    is_verified?: boolean;
    customer_id?: string | null;
    lead_type?: string;
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

const mapLeadToProfile = (lead: LeadDetailsData | null | undefined): LeadProfileFormValues => ({
    name: lead?.name || lead?.title || "",
    company: lead?.company || lead?.company_name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    status_id: (lead as any)?.status_id || lead?.status || "",
    source_id: (lead as any)?.source_id || lead?.source || "",
    assigned_to: lead?.assigned_to || lead?.assignedTo || "",
    country: lead?.country || "",
    website: lead?.website || "",
    designation: lead?.designation || "",
    gstPan: lead?.gstPan || lead?.gst_pan || lead?.gst_number || lead?.pan_number || "",
    location: lead?.location || [lead?.city, lead?.state, lead?.pincode].filter(Boolean).join(", "),
    address: lead?.address || [lead?.address_line1, lead?.address_line2].filter(Boolean).join(", "),
    tags: Array.isArray(lead?.tags)
        ? lead.tags.map((tag: any) => typeof tag === "string" ? { name: tag } : { id: tag?.id ? String(tag.id) : undefined, name: tag?.name }).filter((t: any) => !!t.name)
        : [],
});

const LeadDetailsPage = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "profile";
    const setActiveTab = (tab: string) => setSearchParams({ tab }, { replace: true });
    
    const navigate = useNavigate();
    const { data: lead, isLoading } = useLead<LeadDetailsData>(id);
    const updateLeadMutation = useUpdateLead();
    const convertMutation = useConvertLead();
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const leadProfile = useMemo(() => mapLeadToProfile(lead), [lead]);

    const handleConvert = () => {
        if (id) {
            convertMutation.mutate(id, {
                onSuccess: () => setConvertModalOpen(false)
            });
        }
    };

    const setLeadProfile = (profile: LeadProfileFormValues) => {
        if (!id) return;

        const payload: { leadId: string; [key: string]: any } = { leadId: id };

        if (profile.name !== leadProfile.name) payload.name = profile.name;
        if (profile.company !== leadProfile.company) payload.company_name = profile.company;
        if (profile.email !== leadProfile.email) payload.email = profile.email;
        if (profile.phone !== leadProfile.phone) payload.phone = profile.phone;
        if (profile.status_id !== leadProfile.status_id) payload.status_id = profile.status_id;
        if (profile.source_id !== leadProfile.source_id) payload.source_id = profile.source_id;
        if (profile.assigned_to !== leadProfile.assigned_to) payload.assigned_to = profile.assigned_to;
        if (profile.country !== leadProfile.country) payload.country = profile.country;
        if (profile.website !== leadProfile.website) payload.website = profile.website;
        if (profile.designation !== leadProfile.designation) payload.designation = profile.designation;
        if (profile.gstPan !== leadProfile.gstPan) payload.gst_number = profile.gstPan;

        if (profile.location !== leadProfile.location) {
            const [city = "", state = "", pincode = ""] = (profile.location || "").split(",").map((item) => item.trim());
            payload.city = city;
            payload.state = state;
            payload.pincode = pincode;
        }

        if (profile.address !== leadProfile.address) {
            const [address_line1 = "", ...restAddress] = (profile.address || "").split(",");
            payload.address_line1 = address_line1.trim();
            payload.address_line2 = restAddress.join(",").trim();
        }

        const newTags = profile.tags.map((t) => t.id ? String(t.id) : t.name).sort();
        const oldTags = leadProfile.tags.map((t) => t.id ? String(t.id) : t.name).sort();
        if (JSON.stringify(newTags) !== JSON.stringify(oldTags)) {
            payload.tags = profile.tags.map((t) => t.id ? String(t.id) : t.name);
        }

        if (Object.keys(payload).length > 1) {
            updateLeadMutation.mutate(payload);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileTab leadProfile={leadProfile} setLeadProfile={setLeadProfile} isSaving={updateLeadMutation.isPending} />;
            case "contacts": return <ContactsTab />;
            case "follow-up": return id ? <FollowUpTab leadId={id} /> : null;
            case "visits": return id ? <VisitsTab leadId={id} /> : null;
            case "tasks": return id ? <TasksTab leadId={id} /> : null;
            case "call-logs": return <CallLogsTab />;
            case "products": return <ProductsTab />;
            case "attachments": return id ? <AttachmentsTab leadId={id} initialAttachments={lead?.attachments || []} /> : null;
            case "activity": return <ActivityTab />;
            case "quotations": return <QuotationsTab />;
            case "reminders": return id ? <RemindersTab leadId={id} /> : null;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in">

            {/* Header */}
            <div className="mb-4 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    {isLoading ? "Loading..." : (leadProfile.name || "Lead Details")}
                    {lead?.is_verified && <span title="Verified"><ShieldCheck className="h-6 w-6 text-green-500" /></span>}
                    {(lead?.customer_id || lead?.lead_type === "CUSTOMER" || convertMutation.isSuccess) && <span title="Converted to Customer"><CheckCircle className="h-6 w-6 text-blue-500" /></span>}
                </h1>
                
                {id && !lead?.customer_id && lead?.lead_type !== "CUSTOMER" && !convertMutation.isSuccess && (
                  <div className="flex items-center gap-2">
                    {!lead?.is_verified ? (
                      <Button size="sm" onClick={() => setVerifyModalOpen(true)}>Verify Lead</Button>
                    ) : (
                      <Button size="sm" onClick={() => setConvertModalOpen(true)} disabled={convertMutation.isPending}>Convert to Customer</Button>
                    )}
                  </div>
                )}
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

            {id && (
                <VerifyLeadModal
                    open={verifyModalOpen}
                    onClose={() => setVerifyModalOpen(false)}
                    leadId={id}
                />
            )}

            <AlertDialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently convert this lead to a customer.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={convertMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConvert}
                            disabled={convertMutation.isPending}
                        >
                            Convert
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default LeadDetailsPage;
