import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Handle password reset logic here
    console.log("Reset password for:", email);
    toast.success("Password reset successfully");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-2">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="shadow-card border border-border bg-card p-6 rounded-lg">
          <button
            onClick={() =>
              navigate("/reset-password-otp", { state: { email } })
            }
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>

          <div className="mb-4">
            <h1 className="text-xl font-semibold text-foreground">
              Set new password
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your new password must be different from previous passwords.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="password" title="New Password" />
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-9 text-sm rounded-sm"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-0 h-9 px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <span className="text-xs text-muted-foreground">Hide</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Show</span>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 pr-9 h-9 text-sm rounded-sm"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-9 text-sm rounded-sm">
              Reset password
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
