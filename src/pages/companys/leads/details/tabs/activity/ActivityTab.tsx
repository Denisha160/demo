import {
    ArrowRightLeft,
    CalendarClock,
    CircleDot,
    Flag,
    MessageSquarePlus,
    PencilLine,
    Phone,
    RefreshCcw,
    UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ActivityType =
    | "LEAD_CREATED"
    | "STATUS_CHANGE"
    | "OWNER_CHANGE"
    | "PRIORITY_CHANGE"
    | "FIELD_UPDATE"
    | "NOTE_ADDED"
    | "CALL_LOGGED"
    | "VISIT_SCHEDULED"

type ActivityItem = {
    id: string;
    userName: string;
    userRole: string;
    avatar?: string;
    action: ActivityType;
    message: string;
    recordName: string;
    time: string;
};

const activities: ActivityItem[] = [
    {
        id: "1",
        userName: "Arjun Patel",
        userRole: "Sales Executive",
        avatar: "https://i.pravatar.cc/100?img=12",
        action: "LEAD_CREATED",
        message: 'created this lead for "Jerde Inc" from the website enquiry.',
        recordName: "Lead",
        time: "Today, 10:45 AM",
    },
    {
        id: "2",
        userName: "Neha Verma",
        userRole: "Sales Manager",
        avatar: "https://i.pravatar.cc/100?img=32",
        action: "STATUS_CHANGE",
        message: 'changed the lead status from "New" to "Qualified".',
        recordName: "Status",
        time: "Today, 09:20 AM",
    },
    {
        id: "3",
        userName: "Vikram Singh",
        userRole: "CRM Admin",
        action: "OWNER_CHANGE",
        message: 'assigned this lead to Neha Verma for follow-up.',
        recordName: "Owner",
        time: "Yesterday, 06:10 PM",
    },
    {
        id: "4",
        userName: "Arjun Patel",
        userRole: "Sales Executive",
        avatar: "https://i.pravatar.cc/100?img=12",
        action: "NOTE_ADDED",
        message: 'added a note: "Customer requested a quotation before Monday."',
        recordName: "Note",
        time: "Yesterday, 03:35 PM",
    },
    {
        id: "5",
        userName: "Neha Verma",
        userRole: "Sales Manager",
        avatar: "https://i.pravatar.cc/100?img=32",
        action: "CALL_LOGGED",
        message: 'logged a call and marked the customer as interested in premium models.',
        recordName: "Call Log",
        time: "Mar 17, 2026, 11:05 AM",
    },
];

const colorPalettes = [
    {
        badgeClassName: "border-emerald-200 bg-emerald-500/10 text-emerald-700",
        iconClassName: "bg-emerald-500/10 text-emerald-600",
    },
    {
        badgeClassName: "border-sky-200 bg-sky-500/10 text-sky-700",
        iconClassName: "bg-sky-500/10 text-sky-600",
    },
    {
        badgeClassName: "border-amber-200 bg-amber-500/10 text-amber-700",
        iconClassName: "bg-amber-500/10 text-amber-600",
    },
    {
        badgeClassName: "border-violet-200 bg-violet-500/10 text-violet-700",
        iconClassName: "bg-violet-500/10 text-violet-600",
    },
    {
        badgeClassName: "border-rose-200 bg-rose-500/10 text-rose-700",
        iconClassName: "bg-rose-500/10 text-rose-600",
    },
    {
        badgeClassName: "border-cyan-200 bg-cyan-500/10 text-cyan-700",
        iconClassName: "bg-cyan-500/10 text-cyan-600",
    },
];

const activityConfig: Record<
    ActivityType,
    {
        label: string;
        icon: typeof CircleDot;
    }
> = {
    LEAD_CREATED: {
        label: "Lead Created",
        icon: UserPlus,
    },
    STATUS_CHANGE: {
        label: "Status Change",
        icon: RefreshCcw,
    },
    OWNER_CHANGE: {
        label: "Owner Change",
        icon: ArrowRightLeft,
    },
    PRIORITY_CHANGE: {
        label: "Priority Change",
        icon: Flag,
    },
    FIELD_UPDATE: {
        label: "Field Update",
        icon: PencilLine,
    },
    NOTE_ADDED: {
        label: "Note Added",
        icon: MessageSquarePlus,
    },
    CALL_LOGGED: {
        label: "Call Logged",
        icon: Phone,
    },
    VISIT_SCHEDULED: {
        label: "Visit Scheduled",
        icon: CalendarClock,
    },

};

const getInitials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const getPaletteBySeed = (seed: string) => {
    const hash = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
    return colorPalettes[hash % colorPalettes.length];
};

const ActivityTab = () => {
    return (
        <div className="bg-card rounded-lg border border-border/50 shadow-sm p-4 md:p-5 w-full animate-fade-in">
            <div className="mb-4">
                <div className="font-medium text-sm text-foreground">Activity Log</div>
                <p className="text-xs text-muted-foreground mt-1">
                    All lead changes from users are shown here, including added, updated, and deleted records.
                </p>
            </div>

            <div className="space-y-4">
                {activities.map((activity, index) => {
                    const config = activityConfig[activity.action];
                    const palette = getPaletteBySeed(`${activity.id}-${activity.action}-${index}`);

                    return (
                        <div key={activity.id} className="relative flex gap-3">


                            <div className="flex-1 rounded-xl border border-border/60 bg-background/80 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-11 w-11 border border-border/60">
                                            <AvatarImage src={activity.avatar} alt={activity.userName} />
                                            <AvatarFallback className="text-xs font-semibold">
                                                {getInitials(activity.userName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-semibold text-foreground">
                                                    {activity.userName}
                                                </span>
                                                <Badge variant="outline" className={palette.badgeClassName}>
                                                    {config.label}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.recordName}
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {activity.userRole}
                                            </p>

                                            <p className="text-sm leading-6 text-foreground/90">
                                                {activity.userName} {activity.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground whitespace-nowrap pl-14 md:pl-0">
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityTab;
