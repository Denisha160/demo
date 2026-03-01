import { useNavigate } from "react-router-dom";
import { ArrowRight, LayoutDashboard } from "lucide-react";

const companies = [
    {
        id: "basalt-amenities",
        name: "Basalt Amenities",
        initials: "BA",
        description: "Amenities management and operations",
        color: "bg-green-600",
        accentBg: "bg-green-50 dark:bg-green-950/30",
        accentBorder: "border-green-200 dark:border-green-800",
        accentText: "text-green-700 dark:text-green-400",
    },
    {
        id: "smart-home",
        name: "Smart Home Automation",
        initials: "SHA",
        description: "Home automation solutions and support",
        color: "bg-purple-600",
        accentBg: "bg-purple-50 dark:bg-purple-950/30",
        accentBorder: "border-purple-200 dark:border-purple-800",
        accentText: "text-purple-700 dark:text-purple-400",
    },
];

const CompaniesPage = () => {
    const navigate = useNavigate();

    const handleSelect = (companyId: string) => {
        localStorage.setItem("currentCompanyId", companyId);
        navigate(`/${companyId}/dashboard`);
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-base font-semibold text-foreground">Select a company</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Choose which workspace you'd like to open.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companies.map((company) => (
                    <button
                        key={company.id}
                        onClick={() => handleSelect(company.id)}
                        className="group flex flex-col items-start gap-4 p-5 rounded-lg border border-border bg-card text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40"
                    >
                        <div className="flex items-center gap-3 w-full">
                            <div className={`h-11 w-11 ${company.color} text-white flex items-center justify-center rounded-md shrink-0 shadow-sm`}>
                                <span className="text-base font-bold">{company.initials}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-foreground truncate">
                                    {company.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                    {company.description}
                                </p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <LayoutDashboard className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Open Dashboard</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CompaniesPage;
