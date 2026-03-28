import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
  Mail,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/Modal";
import { useLogin } from "@/hooks/useAuth";
import { useLogoutSession } from "@/hooks/useSession";
import type {
  OtpResponse,
  Session,
  ApiError as LoginApiError,
} from "@/types/Auth";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Session limit modal state
  const [sessionModal, setSessionModal] = useState<{
    token: string;
    sessions: Session[];
  } | null>(null);

  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();
  const { mutate: logoutSession, isPending: isLoggingOut } = useLogoutSession();

  const doNavigateOtp = (data: OtpResponse) => {
    navigate("/verify-otp", { state: { token: data.token, identifier } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { identifier, password },
      {
        onSuccess: doNavigateOtp,
        onError: (error: LoginApiError) => {
          if (error?.details?.process_code === "user_already_logged_in") {
            setSessionModal({
              token: error.details.token ?? "",
              sessions: error.details.sessions ?? [],
            });
          }
        },
      },
    );
  };

  const handleLogoutSession = (sessionId: string) => {
    if (!sessionModal) return;
    logoutSession(
      { sessionId, token: sessionModal.token },
      {
        onSuccess: () => {
          setSessionModal(null);
          login(
            { identifier, password },
            {
              onSuccess: doNavigateOtp,
              onError: (error: LoginApiError) => {
                if (error?.details?.process_code === "user_already_logged_in") {
                  setSessionModal({
                    token: error.details.token ?? "",
                    sessions: error.details.sessions ?? [],
                  });
                }
              },
            },
          );
        },
      },
    );
  };

  return (
    <>
      {/* ── Session limit modal ─────────────────────────────────────────── */}
      <Modal
        open={!!sessionModal}
        onClose={() => setSessionModal(null)}
        title="Session limit reached"
        description={`You have ${sessionModal?.sessions.length ?? 0} active session(s). Sign out of one to continue.`}
        headerBg="bg-destructive/5"
        titleClassName="text-destructive"
        maxWidth="sm:max-w-[480px]"
        footer={
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={() => setSessionModal(null)}
          >
            Cancel
          </Button>
        }
      >
        <div className="space-y-2">
          {sessionModal?.sessions.map((session) => {
            const device = session.user_agent
              ? session.user_agent
                  .replace(/\s*\(.*?\)\s*/g, " ")
                  .trim()
                  .slice(0, 60)
              : "Unknown device";
            const time = new Date(session.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={session.id}
                className="flex items-center justify-between border border-border rounded-sm p-3 gap-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-sm bg-border flex items-center justify-center shrink-0">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {device}
                    </p>
                    <p className="text-xs text-muted-foreground">{time}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 shrink-0"
                  onClick={() => handleLogoutSession(session.id)}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  {isLoggingOut ? "…" : "Sign out"}
                </Button>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* ── Login form ─────────────────────────────────────────────────── */}
      <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-2">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="shadow-card border border-border bg-card p-6 rounded-lg">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 bg-primary flex items-center justify-center rounded-sm">
                  <span className="text-primary-foreground text-sm font-bold">
                    CRM
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  BASALT CRM
                </span>
              </div>
              <h1 className="text-xl font-semibold text-foreground mt-4">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email or mobile */}
              <div className="space-y-1">
                <Label
                  htmlFor="identifier"
                  className="text-sm font-medium text-foreground"
                >
                  Email or mobile number
                </Label>
                <div className="relative">
                  {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? (
                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  )}
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="you@company.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-9 h-9 text-sm rounded-sm"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-9 text-sm rounded-sm"
                    required
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => navigate("/forgot-password")}
                    type="button"
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-sm rounded-sm"
                disabled={isPending}
              >
                {isPending ? "Signing in…" : "Sign in"}
                {!isPending && <ArrowRight className="ml-1 h-3.5 w-3.5" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
