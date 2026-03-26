import { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  PhoneCall,
  Package,
  Paperclip,
  Activity,
  FileText,
  Bell,
  CheckCircle,
  ShieldCheck,
  ArrowLeft,
  User,
  Users,
  Clock,
  MapPin,
  ClipboardList,
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
import VerifyLeadPage from "./tabs/verifyLead/VerifyLeadPage";
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import VerifyLeadModal from "./tabs/verifyLead/VerifyLeadModal";
import { useConvertLead } from "@/hooks/useLeadVerification";
import { useHasPermission } from "@/hooks/useAuth";

export interface LeadProfileFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  alternate_phone: string;
  status_id: string;
  source_id: string;
  assigned_to: string;
  priority: string;
  country_id: string;
  state_id: string;
  city_id: string;
  pincode: string;
  website: string;
  designation: string;
  gst_number: string;
  pan_number: string;
  address_line1: string;
  address_line2: string;
  tags: { id?: string; name: string }[];
  interested_category_id: { id?: string; name: string }[];
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
  country_id?: string;
  state_id?: string;
  city_id?: string;
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
  verification_details?: any;
}

const TABS = [
  { id: "profile", label: "Profile", icon: User }, // always visible
  {
    id: "verify",
    label: "Verify",
    icon: ShieldCheck,
    permission: "lead-verification.update",
    showIf: (lead: any) => !!lead?.is_verified,
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: Users,
    permission: "lead-contact.read",
  },
  {
    id: "follow-up",
    label: "Follow Up",
    icon: Clock,
    permission: "lead-followup.read",
  },
  {
    id: "visits",
    label: "Visits",
    icon: MapPin,
    permission: "lead-visit.read",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ClipboardList,
    permission: "lead-task.read",
  },
  { id: "call-logs", label: "Call Logs", icon: PhoneCall }, // no specific backend perm yet
  {
    id: "products",
    label: "Interested Products",
    icon: Package,
    permission: "lead-interested-product.read",
  },
  {
    id: "attachments",
    label: "Attachment",
    icon: Paperclip,
    permission: "lead-attachment.read",
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
    permission: "lead-activity.read",
  },
  // { id: "quotations", label: "Quotations", icon: FileText },
  {
    id: "reminders",
    label: "Reminder",
    icon: Bell,
    permission: "lead-reminder.read",
  },
];

const mapLeadToProfile = (
  lead: LeadDetailsData | null | undefined,
): LeadProfileFormValues => ({
  name: lead?.name || lead?.title || "",
  company: lead?.company || lead?.company_name || "",
  email: lead?.email || "",
  phone: lead?.phone || "",
  alternate_phone: lead?.alternate_phone || "",
  status_id: (lead as any)?.status_id || lead?.status || "",
  source_id: (lead as any)?.source_id || lead?.source || "",
  assigned_to: lead?.assigned_to || lead?.assignedTo || "",
  priority: (lead as any)?.priority || "HOT",
  country_id: (lead as any)?.country_id || "",
  state_id: (lead as any)?.state_id || "",
  city_id: (lead as any)?.city_id || "",
  pincode: lead?.pincode || "",
  website: lead?.website || "",
  designation: lead?.designation || "",
  gst_number: lead?.gst_number || "",
  pan_number: (lead as any)?.pan_number || lead?.pan_number || "",
  address_line1: lead?.address_line1 || "",
  address_line2: lead?.address_line2 || "",
  tags: Array.isArray(lead?.tags)
    ? lead.tags
      .map((tag: any) =>
        typeof tag === "string"
          ? { name: tag }
          : { id: tag?.id ? String(tag.id) : undefined, name: tag?.name },
      )
      .filter((t: any) => !!t.name)
    : [],
  interested_category_id: Array.isArray((lead as any)?.interested_category_id)
    ? (lead as any).interested_category_id.map((id: any) =>
      typeof id === "string" ? { id, name: id } : { id: String(id?.id), name: id?.name || id?.id },
    )
    : [],
});

const LeadDetailsPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";
  const setActiveTab = (tab: string) =>
    setSearchParams({ tab }, { replace: true });

  const navigate = useNavigate();
  const { data: lead, isLoading } = useLead<LeadDetailsData>(id);
  const updateLeadMutation = useUpdateLead();
  const convertMutation = useConvertLead();
  const { hasPermission } = useHasPermission();
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const leadProfile = useMemo(() => mapLeadToProfile(lead), [lead]);
  const canVerify = hasPermission("lead-verification.update");

  const handleConvert = () => {
    if (id) {
      convertMutation.mutate(id, {
        onSuccess: () => setConvertModalOpen(false),
      });
    }
  };

  const setLeadProfile = (profile: LeadProfileFormValues) => {
    if (!id) return;

    const payload: { leadId: string;[key: string]: any } = { leadId: id };

    if (profile.name !== leadProfile.name) payload.name = profile.name;
    if (profile.company !== leadProfile.company)
      payload.company_name = profile.company;
    if (profile.email !== leadProfile.email) payload.email = profile.email;
    if (profile.phone !== leadProfile.phone) payload.phone = profile.phone;
    if (profile.alternate_phone !== leadProfile.alternate_phone)
      payload.alternate_phone = profile.alternate_phone;
    if (profile.status_id !== leadProfile.status_id)
      payload.status_id = profile.status_id;
    if (profile.source_id !== leadProfile.source_id)
      payload.source_id = profile.source_id;
    if (profile.assigned_to !== leadProfile.assigned_to)
      payload.assigned_to = profile.assigned_to;
    if (profile.priority !== leadProfile.priority)
      payload.priority = profile.priority;
    if (profile.country_id !== leadProfile.country_id)
      payload.country_id = profile.country_id;
    if (profile.state_id !== leadProfile.state_id)
      payload.state_id = profile.state_id;
    if (profile.city_id !== leadProfile.city_id)
      payload.city_id = profile.city_id;
    if (profile.pincode !== leadProfile.pincode)
      payload.pincode = profile.pincode;
    if (profile.website !== leadProfile.website)
      payload.website = profile.website;
    if (profile.designation !== leadProfile.designation)
      payload.designation = profile.designation;
    if (profile.gst_number !== leadProfile.gst_number)
      payload.gst_number = profile.gst_number;
    if (profile.pan_number !== leadProfile.pan_number)
      payload.pan_number = profile.pan_number;
    if (profile.address_line1 !== leadProfile.address_line1)
      payload.address_line1 = profile.address_line1;
    if (profile.address_line2 !== leadProfile.address_line2)
      payload.address_line2 = profile.address_line2;

    const compareTags = (a: any[], b: any[]) =>
      JSON.stringify(a.map((x) => x.id || x.name).sort()) ===
      JSON.stringify(b.map((x) => x.id || x.name).sort());

    if (!compareTags(profile.tags, leadProfile.tags)) {
      payload.tags = profile.tags.map((t) => (t.id ? String(t.id) : t.name));
    }

    if (
      !compareTags(
        profile.interested_category_id,
        leadProfile.interested_category_id,
      )
    ) {
      payload.interested_category_id = profile.interested_category_id.map(
        (t) => t.name,
      );
    }

    if (Object.keys(payload).length > 1) {
      updateLeadMutation.mutate(payload);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileTab
            leadProfile={leadProfile}
            setLeadProfile={setLeadProfile}
            isSaving={updateLeadMutation.isPending}
          />
        );
      case "verify":
        return lead?.verification_details ? (
          <VerifyLeadPage
            leadId={id as string}
            details={(lead as any).verification_details}
          />
        ) : null;
      case "contacts":
        return <ContactsTab />;
      case "follow-up":
        return id ? (
          <FollowUpTab
            leadId={id}
            defaultAssignedTo={{
              id: leadProfile.assigned_to,
              name: (lead as any)?.assigned_to_name || leadProfile.assigned_to,
            }}
          />
        ) : null;
      case "visits":
        return id ? <VisitsTab leadId={id} /> : null;
      case "tasks":
        return id ? (
          <TasksTab
            leadId={id}
            defaultAssignedTo={{
              id: leadProfile.assigned_to,
              name: (lead as any)?.assigned_to_name || leadProfile.assigned_to,
            }}
          />
        ) : null;
      case "call-logs":
        return <CallLogsTab />;
      case "products":
        return <ProductsTab />;
      case "attachments":
        return id ? (
          <AttachmentsTab
            leadId={id}
            initialAttachments={lead?.attachments || []}
          />
        ) : null;
      case "activity":
        return <ActivityTab />;
      case "quotations":
        return <QuotationsTab />;
      case "reminders":
        return id ? <RemindersTab leadId={id} /> : null;
      default:
        return null;
    }
  };

  const filteredTabs = useMemo(() => {
    return TABS.filter((tab) => {
      if (tab.permission && !hasPermission(tab.permission)) return false;
      if (tab.showIf && !tab.showIf(lead)) return false;
      return true;
    });
  }, [lead, hasPermission]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] mx-auto w-full animate-fade-in">
      {/* Header */}
      <div className="mb-4 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            {isLoading ? "Loading..." : leadProfile.name || "Lead Details"}
            {lead?.is_verified && (
              <span title="Verified">
                <ShieldCheck className="h-6 w-6 text-green-500" />
              </span>
            )}
            {(lead?.customer_id ||
              lead?.lead_type === "CUSTOMER" ||
              convertMutation.isSuccess) && (
                <span title="Converted to Customer">
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                </span>
              )}
          </h1>
        </div>

        {id &&
          canVerify &&
          !lead?.customer_id &&
          lead?.lead_type !== "CUSTOMER" &&
          !convertMutation.isSuccess && (
            <div className="flex items-center gap-2">
              {!lead?.is_verified ? (
                <Button size="sm" onClick={() => setVerifyModalOpen(true)}>
                  Verify Lead
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setConvertModalOpen(true)}
                  disabled={convertMutation.isPending}
                >
                  Convert to Customer
                </Button>
              )}
            </div>
          )}
      </div>

      {/* Mobile Dropdown */}
      <div className="block md:hidden mb-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue>
              {filteredTabs.find((t) => t.id === activeTab)?.label ||
                "Select Tab"}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {filteredTabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row gap-2 flex-1 w-full min-h-0">
        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex w-[260px] flex-shrink-0 flex-col gap-1 pr-2 overflow-y-auto border-r border-border/50 pb-10">
          {filteredTabs.map((tab) => {
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
                <Icon
                  className={`h-[18px] w-[18px] ${isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                />
                <span className="flex-1 text-left">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-y-auto pb-10 pr-2">
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
              This will permanently convert this lead to a customer. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={convertMutation.isPending}>
              Cancel
            </AlertDialogCancel>
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
