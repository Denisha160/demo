import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ResetPasswordOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "user@example.com";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete code");
      return;
    }
    // Navigate to reset password page
    navigate("/reset-password", { state: { email, otp: code } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-2">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="shadow-card border border-border bg-card p-6 rounded-lg">
          <button
            onClick={() => navigate("/forgot-password")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>

          <div className="mb-4">
            <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-sm mb-3">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              Verify OTP
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              We sent a 6-digit code to{" "}
              <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="h-11 w-11 text-center text-lg font-semibold border border-border bg-background rounded-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground transition-all"
                />
              ))}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full h-9 text-sm rounded-sm">
              Verify Code
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Didn't receive the code?{" "}
            <button className="text-primary hover:underline font-medium">
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordOtp;
