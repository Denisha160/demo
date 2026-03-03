import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyLogin } from "@/hooks/useAuth";
import type { VerifyOtpLocationState } from "@/types/Auth";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? {}) as VerifyOtpLocationState;
  const otpToken = state.token ?? "";
  const identifier = state.identifier ?? "";

  const { mutate: verifyLogin, isPending } = useVerifyLogin();

  useEffect(() => {
    // Redirect to login if there's no token to verify
    if (!otpToken) {
      navigate("/login", { replace: true });
      return;
    }
    inputRefs.current[0]?.focus();
  }, [otpToken, navigate]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    verifyLogin(
      { token: otpToken, code },
      {
        onError: (err: { message?: string }) => {
          const msg = err?.message ?? "Verification failed. Please try again.";
          setError(msg);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-2">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="shadow-card border border-border bg-card p-6 rounded-lg">
          {/* Back button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>

          {/* Header */}
          <div className="mb-5">
            <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-sm mb-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Verify your identity</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the 6-digit code
              {identifier && (
                <>
                  {" "}sent to{" "}
                  <span className="text-foreground font-medium">{identifier}</span>
                </>
              )}
            </p>
          </div>

          {/* OTP inputs */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isPending}
                  className="h-11 w-11 text-center text-lg font-semibold border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground transition-all disabled:opacity-50"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-9 text-sm rounded-sm"
              disabled={isPending || otp.join("").length < 6}
            >
              {isPending ? "Verifying…" : "Verify & Sign in"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Go back and try again
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
