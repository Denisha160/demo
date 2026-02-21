import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      navigate("/verify-otp", { state: { email } });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-2">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="shadow-card border border-border bg-card p-6 rounded-lg">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-7 w-7 bg-primary flex items-center justify-center rounded-sm">
                <span className="text-primary-foreground text-sm font-bold">CRM</span>
              </div>
              <span className="text-sm font-semibold text-foreground">CRM Suite</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground mt-4">Sign in to your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your email to receive a one-time password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
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
              Continue
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
