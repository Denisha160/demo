import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password initiation logic here
    console.log("Send OTP to:", email);
    // For demo, we navigate to the OTP verification page
    navigate("/reset-password-otp", { state: { email } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-2">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="shadow-card border border-border bg-card p-6 rounded-lg">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to login
          </button>

          <div className="mb-4">
            <h1 className="text-xl font-semibold text-foreground">
              Forgot password?
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email address and we'll send you a code to reset your
              password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-9 text-sm rounded-sm"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-9 text-sm rounded-sm">
              Send reset code
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
