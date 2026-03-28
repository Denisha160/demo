import { useState } from "react";
import {
  Loader2,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUserSessions } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import DataTable, { Column } from "@/components/DataTable";
import { UserSession } from "@/types/user";
import StatusBadge from "@/components/StatusBadge";

const SessionsTab = ({ user_id }: { user_id: string }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: listResponse, isLoading } = useUserSessions(user_id, {
    offset: (page - 1) * limit,
    limit,
  });

  const sessions = listResponse?.items || [];
  const totalItems = listResponse?.pagination?.total || 0;

  const parseUserAgent = (ua: string) => {
    if (!ua) return { device: "Unknown", os: "Unknown", browser: "Unknown" };

    let device = "Desktop";
    if (/mobile/i.test(ua)) device = "Mobile";
    else if (/tablet/i.test(ua)) device = "Tablet";

    let os = "Unknown OS";
    if (/windows/i.test(ua)) os = "Windows";
    else if (/mac os/i.test(ua)) os = "macOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/linux/i.test(ua)) os = "Linux";

    let browser = "Unknown Browser";
    if (/chrome|crios/i.test(ua)) browser = "Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";
    else if (/edg/i.test(ua)) browser = "Edge";

    return { device, os, browser };
  };

  const columns: Column<UserSession>[] = [
    {
      key: "device",
      header: "Device / Browser",
      render: (session) => {
        const { device, os, browser } = parseUserAgent(session.user_agent);
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                session.is_deleted
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {device === "Mobile" ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">
                {browser} on {os}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {device}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "ip_address",
      header: "IP Address",
      render: (session) => (
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Globe className="h-3 w-3 text-muted-foreground/60" />
          {session.ip_address.replace("::ffff:", "")}
        </div>
      ),
    },
    {
      key: "is_deleted",
      header: "Status",
      render: (session) => (
        <div className="flex items-center gap-2">
          {session.is_deleted ? (
            <StatusBadge status="Inactive" variant="error" />
          ) : (
            <StatusBadge status="Active" variant="success" />
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (session) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(session.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <span className="text-[9px] opacity-60">
            {new Date(session.created_at).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "expires_at",
      header: "Expires",
      render: (session) => (
        <div className="text-muted-foreground">
          {new Date(session.expires_at).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
            Logged In Sessions
          </h3>
        </div>
      </div>

      <DataTable
        data={sessions}
        columns={columns}
        isLoading={isLoading}
        pageSize={limit}
        serverSide={true}
        serverTotal={totalItems}
        serverPage={page}
        onServerPageChange={setPage}
        onServerPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
      />
    </div>
  );
};

export default SessionsTab;
