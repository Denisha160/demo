import { useNavigate } from "react-router-dom";
import { useCompanies } from "@/hooks/useCompanies";
import { Company } from "@/types/company";
import { useCurrentUser } from "@/hooks/useAuth";
import { ArrowRight, LayoutDashboard, Settings } from "lucide-react";
import { getCompanyTheme } from "@/data/companyData";

const CompaniesPage = () => {
    const navigate = useNavigate();
    const user = useCurrentUser();
    const { data, isLoading } = useCompanies();

    const companies: Company[] = data?.items || [];

    const handleSelect = (companyId: string) => {
        localStorage.setItem("currentCompanyId", companyId);
        navigate(`/${companyId}/dashboard`);
    };

    const handleEdit = (e: React.MouseEvent, companyId: string) => {
        e.stopPropagation();
        navigate(`/admin/companies/${companyId}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h2 className="text-base font-semibold text-foreground">Select a company</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Choose which workspace you'd like to open.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {companies.map((company) => {
                    const theme = getCompanyTheme(company.id, company.display_name || company.legal_name);

                    return (
                        <div
                            key={company.id}
                            className="group flex flex-col items-start gap-4 p-5 rounded-lg border border-border bg-card text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 relative"
                        >
                            <div className="flex items-center gap-3 w-full cursor-pointer" onClick={() => handleSelect(company.id)}>
                                <div className="h-11 w-11 text-white flex items-center justify-center rounded-md shrink-0 shadow-sm" style={{ backgroundColor: `hsl(${theme.primary})` }}>
                                    <span className="text-base font-bold">{theme.initials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-foreground truncate">
                                        {company.display_name || company.legal_name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {company.industry || "No industry specified"}
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>

                            <div className="flex items-center justify-between w-full mt-2 pt-4 border-t border-border/50">
                                <button
                                    onClick={() => handleSelect(company.id)}
                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <LayoutDashboard className="h-3 w-3" />
                                    <span>Open Workspace</span>
                                </button>

                                {user?.is_root_user && (
                                    <button
                                        onClick={(e) => handleEdit(e, company.id)}
                                        className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded-md"
                                    >
                                        <Settings className="h-3 w-3" />
                                        <span>Edit Profile</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CompaniesPage;
