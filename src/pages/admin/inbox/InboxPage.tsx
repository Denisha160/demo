import { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Mail, MailOpen, Star, Paperclip, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Email {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  category: "lead" | "client" | "internal" | "billing";
}

const initialEmails: Email[] = [
  {
    id: "m1",
    from: "John Smith",
    subject: "Re: Enterprise proposal",
    preview:
      "Thanks for the updated pricing. I'll review with our team and get back to you by Friday...",
    time: "10:24 AM",
    read: false,
    starred: true,
    hasAttachment: true,
    category: "client",
  },
  {
    id: "m2",
    from: "Sarah Lee",
    subject: "New lead from website",
    preview:
      "Hi, we received a new inquiry from TechStart Inc. They're interested in the premium tier...",
    time: "9:15 AM",
    read: false,
    starred: false,
    hasAttachment: false,
    category: "lead",
  },
  {
    id: "m3",
    from: "Mike Chen",
    subject: "Invoice #1042 - GlobalFin",
    preview:
      "Please find attached the invoice for the Strategic Deal. Payment terms are net 30...",
    time: "Yesterday",
    read: true,
    starred: false,
    hasAttachment: true,
    category: "billing",
  },
  {
    id: "m4",
    from: "Emma Davis",
    subject: "Weekly pipeline review",
    preview:
      "Here's the summary of this week's pipeline activity. We closed 3 deals totaling $62k...",
    time: "Yesterday",
    read: true,
    starred: true,
    hasAttachment: false,
    category: "internal",
  },
  {
    id: "m5",
    from: "Alex Kim",
    subject: "CloudBase contract renewal",
    preview:
      "The CloudBase team has confirmed they'd like to renew for another year. They're requesting...",
    time: "Feb 11",
    read: true,
    starred: false,
    hasAttachment: true,
    category: "client",
  },
  {
    id: "m6",
    from: "Lisa Wang",
    subject: "NetSolutions follow-up",
    preview:
      "I followed up with NetSolutions today. They've moved forward with their evaluation and will...",
    time: "Feb 11",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "lead",
  },
  {
    id: "m7",
    from: "Tom Brown",
    subject: "Team standup notes",
    preview:
      "Notes from today's standup: 1. Sarah closed the TechStart deal 2. Emma is preparing the...",
    time: "Feb 10",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "internal",
  },
  {
    id: "m8",
    from: "Kate Miller",
    subject: "Onboarding checklist",
    preview:
      "Here's the onboarding checklist for the new team member joining next week. Please review...",
    time: "Feb 10",
    read: true,
    starred: false,
    hasAttachment: true,
    category: "internal",
  },
];

const categoryVariant: Record<
  string,
  "info" | "success" | "warning" | "default"
> = {
  lead: "info",
  client: "success",
  internal: "default",
  billing: "warning",
};

const tabs = ["All", "Unread", "Starred"];

const InboxPage = () => {
  const [emails, setEmails] = useState(initialEmails);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>("m1");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleStar = (id: string) => {
    setEmails(
      emails.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)),
    );
  };

  const markRead = (id: string) => {
    setEmails(emails.map((e) => (e.id === id ? { ...e, read: true } : e)));
    setSelectedId(id);
  };

  const filtered = emails.filter((e) => {
    if (activeTab === "Unread" && e.read) return false;
    if (activeTab === "Starred" && !e.starred) return false;
    if (
      searchQuery &&
      !e.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.from.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const selected = emails.find((e) => e.id === selectedId);

  return (
    <div className="space-y-2 animate-fade-in">
      {/* Tabs & Search */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-2 py-1 text-sm rounded-sm transition-all ${
                activeTab === t
                  ? "gradient-active shadow-sm"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 w-40 pl-7 text-sm rounded-sm"
          />
        </div>
      </div>

      {/* Unread count */}
      <div className="text-sm text-muted-foreground">
        {emails.filter((e) => !e.read).length} unread messages
      </div>

      {/* Email List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
        {/* List */}
        <div className="lg:col-span-2 shadow-card border border-border bg-card rounded-sm divide-y divide-border max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
          {filtered.map((email) => (
            <button
              key={email.id}
              onClick={() => markRead(email.id)}
              className={`w-full text-left px-2 py-2 transition-colors ${
                selectedId === email.id ? "bg-primary/5" : "hover:bg-accent/50"
              } ${!email.read ? "bg-accent/30" : ""}`}
            >
              <div className="flex items-start gap-2">
                {email.read ? (
                  <MailOpen className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                ) : (
                  <Mail className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm truncate ${!email.read ? "font-semibold text-foreground" : "text-foreground"}`}
                    >
                      {email.from}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1 shrink-0">
                      {email.time}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${!email.read ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    {email.subject}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {email.preview}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StatusBadge
                      status={email.category}
                      variant={categoryVariant[email.category]}
                    />
                    {email.hasAttachment && (
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  className="shrink-0 mt-0.5"
                >
                  <Star
                    className={`h-3 w-3 ${email.starred ? "fill-warning text-warning" : "text-muted-foreground"}`}
                  />
                </button>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3 shadow-card border border-border bg-card rounded-sm p-3">
          {selected ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {selected.subject}
                </h3>
                <StatusBadge
                  status={selected.category}
                  variant={categoryVariant[selected.category]}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {selected.from}
                </span>
                <span>•</span>
                <span>{selected.time}</span>
                {selected.hasAttachment && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Paperclip className="h-3 w-3" /> Attachment
                    </span>
                  </>
                )}
              </div>
              <div className="border-t border-border pt-2">
                <p className="text-sm text-foreground leading-relaxed">
                  {selected.preview}
                </p>
                <p className="text-sm text-foreground leading-relaxed mt-2">
                  This is the full email body content. In a real application,
                  this would display the complete email message with formatting,
                  inline images, and other rich content.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm text-muted-foreground">
                Select an email to read
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
