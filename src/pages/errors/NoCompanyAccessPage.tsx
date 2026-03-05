import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useAuth";

const NoCompanyAccessPage = () => {
    const { mutate: logout, isPending } = useLogout();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
            <div className="w-full max-w-md bg-card p-8 rounded-lg border border-border/50 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">Access Denied</h1>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    You do not have permission to access any company spaces.
                    Please contact your system administrator to assign you to a company.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        variant="default"
                        className="w-full gap-2 rounded-sm"
                        onClick={() => logout()}
                        disabled={isPending}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>

            <p className="mt-8 text-xs text-muted-foreground">
                BASALT ERP System &copy; {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default NoCompanyAccessPage;
