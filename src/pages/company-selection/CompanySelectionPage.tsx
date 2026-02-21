import { useNavigate } from "react-router-dom";
import { Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const companies = [
    {
        id: "basalt-amenities",
        name: "Basalt Amenities ",
        initials: "BA",
        color: "bg-green-600",
    },
    {
        id: "smart-home",
        name: "Smart Home Automation",
        initials: "SHA",
        color: "bg-purple-600",
    },
];

const CompanySelection = () => {
    const navigate = useNavigate();

    const handleSelect = (companyId: string) => {
        localStorage.setItem("currentCompanyId", companyId);
        navigate(`/${companyId}/dashboard`);
    };

    const goToAdmin = () => {
        navigate("/admin/tasks");
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
            <div className="w-full max-w-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground">Welcome back, John!</h1>
                    <p className="text-muted-foreground mt-2">Please select a company to manage or access the admin panel</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Cards */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Managed Companies</h2>
                        {companies.map((company) => (
                            <button
                                key={company.id}
                                onClick={() => handleSelect(company.id)}
                                className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group group"
                            >
                                <div className={`h-12 w-12 ${company.color} text-white flex items-center justify-center rounded-md shrink-0 shadow-sm`}>
                                    <span className="text-lg font-bold">{company.initials}</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-foreground">{company.name}</h3>
                                    <p className="text-xs text-muted-foreground">Active Dashboard</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>

                    {/* Admin panel / More options */}
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Global Access</h2>
                        <button
                            onClick={goToAdmin}
                            className="w-full flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:border-primary/40 hover:shadow-md transition-all group h-[196px] flex-col justify-center text-center"
                        >
                            <div className="h-16 w-16 bg-primary text-primary-foreground flex items-center justify-center rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-foreground">Admin Portal</h3>
                                <p className="text-sm text-muted-foreground mt-1">Global settings, tasks, and system-wide inbox</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Button variant="ghost" onClick={() => navigate("/login")} className="text-muted-foreground">
                        Sign out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CompanySelection;
