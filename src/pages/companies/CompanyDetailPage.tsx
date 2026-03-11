import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Building, Building2, MapPin, Tag, Globe, Phone, Mail, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { CompanyUpdatePayload, Company, ApiErrorResponse } from "@/types/company";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { toast } from "react-toastify";

const companySchema = z.object({
    legal_name: z.string().min(2, "Legal name is required"),
    display_name: z.string().min(2, "Display name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().regex(/^[0-9+\-\s]{10,15}$/, "Invalid phone number").optional().or(z.literal("")),
    alternate_phone: z.string().regex(/^[0-9+\-\s]{10,15}$/, "Invalid phone number").optional().or(z.literal(""))
});

const CompanyInput = ({
    label,
    value,
    error,
    isEditing = true,
    onChange,
    placeholder,
    type = "text"
}: {
    label: string;
    value: string | number;
    error?: string;
    isEditing?: boolean;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
}) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-muted-foreground">{label}</label>
        <Input
            type={type}
            value={value?.toString() || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
            disabled={!isEditing}
        />
        {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
);

const CompanyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [companyData, setCompanyData] = useState<Partial<Company>>({
        id: id || "",
        legal_name: "",
        display_name: "",
        company_code: "",
        industry: "",
        registration_number: "",
        tax_number: "",
        website: "",
        email: "",
        phone: "",
        alternate_phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);

    const { data: fetchedCompany, isLoading } = useCompany(id as string, !!id);
    const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();

    useEffect(() => {
        if (fetchedCompany && fetchedCompany.id) {
            setCompanyData(prev => {
                const newData = { ...prev, ...fetchedCompany };
                if (JSON.stringify(prev) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prev;
            });
        }
    }, [fetchedCompany]);

    const handleChange = (field: keyof Company, value: string | boolean | number | null) => {
        setCompanyData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
        if (apiError) setApiError(null);
    };

    const handleSave = () => {
        try {
            companySchema.parse({
                legal_name: companyData.legal_name,
                display_name: companyData.display_name,
                email: companyData.email,
                phone: companyData.phone,
                alternate_phone: companyData.alternate_phone
            });

            setErrors({});
            setApiError(null);

            const payload: CompanyUpdatePayload = {
                id: companyData.id!,
                legal_name: companyData.legal_name,
                display_name: companyData.display_name,
                industry: companyData.industry,
                registration_number: companyData.registration_number,
                tax_number: companyData.tax_number,
                website: companyData.website,
                email: companyData.email,
                phone: companyData.phone,
                alternate_phone: companyData.alternate_phone,
                address_line_1: companyData.address_line_1,
                address_line_2: companyData.address_line_2,
                city: companyData.city,
                state: companyData.state,
                country: companyData.country,
                postal_code: companyData.postal_code,
            };

            updateCompany(payload, {
                onError: (error: unknown) => {
                    const err = error as ApiErrorResponse;
                    const errorData = (err?.details || err?.response?.data || err || {}) as ApiErrorResponse;

                    if (errorData?.code === "validation_error" && errorData.details?.body) {
                        const formattedErrors: Record<string, string> = {};
                        Object.entries(errorData.details.body).forEach(([key, msg]) => {
                            let cleanMsg = msg.replace(/"/g, '').replace(/_/g, ' ');
                            cleanMsg = cleanMsg.charAt(0).toUpperCase() + cleanMsg.slice(1);
                            formattedErrors[key] = cleanMsg;
                        });
                        setErrors(formattedErrors);
                    } else if (errorData?.code === "duplicate_key_value") {
                        const msg = errorData.message || "A duplicate record exists.";
                        setApiError(msg);

                        if (msg.toLowerCase().includes("email")) {
                            setErrors(prev => ({ ...prev, email: msg }));
                        } else if (msg.toLowerCase().includes("phone")) {
                            setErrors(prev => ({ ...prev, phone: msg }));
                        } else if (msg.toLowerCase().includes("tax") || msg.toLowerCase().includes("gst")) {
                            setErrors(prev => ({ ...prev, tax_number: msg }));
                        } else if (msg.toLowerCase().includes("registration")) {
                            setErrors(prev => ({ ...prev, registration_number: msg }));
                        }
                    } else if (errorData?.message) {
                        setApiError(errorData.message);
                    } else {
                        setApiError("An unexpected error occurred while saving.");
                    }
                }
            });

        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 pt-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading company details...</p>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto space-y-2 animate-fade-in">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-2">
                <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-sm border border-border shrink-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-foreground leading-none truncate uppercase tracking-widest text-primary">
                            Edit Company Profile
                        </h2>
                    </div>
                </div>
            </div>

            <div className="p-5 border border-border rounded-sm bg-card shadow-sm space-y-2">
                {/* Header Section with Company Logo/Initials and Basic Info */}
                <div className="flex flex-col sm:flex-row items-start gap-5 pb-6 border-b border-border/50">
                    <div className="h-24 w-24 bg-primary/10 text-primary rounded-sm flex items-center justify-center text-4xl font-bold border border-primary/20 shrink-0">
                        {companyData.display_name?.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() || "CO"}
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold text-foreground truncate leading-none">
                                {companyData.display_name}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">{companyData.legal_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Tag className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">{companyData.industry || "Industry not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">{companyData.email || "Email not provided"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate">{companyData.phone || "Phone not provided"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Business Identity Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Building className="h-4 w-4 text-primary" />
                        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Business Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <CompanyInput
                            label="Display Name"
                            value={companyData.display_name}
                            error={errors.display_name}
                            isEditing={true}
                            onChange={(val) => handleChange("display_name", val)}
                            placeholder="Enter display name"
                        />
                        <CompanyInput
                            label="Legal Name"
                            value={companyData.legal_name}
                            error={errors.legal_name}
                            isEditing={true}
                            onChange={(val) => handleChange("legal_name", val)}
                            placeholder="Enter legal name"
                        />
                        <CompanyInput
                            label="Industry"
                            value={companyData.industry || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("industry", val)}
                            placeholder="Enter industry"
                        />
                        <CompanyInput
                            label="Tax / GST Number"
                            value={companyData.tax_number || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("tax_number", val)}
                            placeholder="Enter tax/GST number"
                        />
                        <CompanyInput
                            label="Registration Number"
                            value={companyData.registration_number || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("registration_number", val)}
                            placeholder="Enter registration number"
                        />
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Phone className="h-4 w-4 text-primary" />
                        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Contact Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        <CompanyInput
                            label="Primary Email"
                            value={companyData.email || ""}
                            error={errors.email}
                            isEditing={true}
                            onChange={(val) => handleChange("email", val)}
                            type="email"
                            placeholder="Enter primary email"
                        />
                        <CompanyInput
                            label="Primary Phone"
                            value={companyData.phone || ""}
                            error={errors.phone}
                            isEditing={true}
                            onChange={(val) => handleChange("phone", val)}
                            placeholder="Enter primary phone"
                        />
                        <CompanyInput
                            label="Alternate Phone"
                            value={companyData.alternate_phone || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("alternate_phone", val)}
                            placeholder="Enter alternate phone"
                        />
                        <CompanyInput
                            label="Website"
                            value={companyData.website || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("website", val)}
                            placeholder="Enter website URL"
                            type="url"
                        />
                    </div>
                </div>

                {/* Registered Address Section */}
                <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">Registered Address</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                            <CompanyInput
                                label="Address Line 1"
                                value={companyData.address_line_1 || ""}
                                isEditing={true}
                                onChange={(val) => handleChange("address_line_1", val)}
                                placeholder="Enter address line 1"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <CompanyInput
                                label="Address Line 2"
                                value={companyData.address_line_2 || ""}
                                isEditing={true}
                                onChange={(val) => handleChange("address_line_2", val)}
                                placeholder="Enter address line 2"
                            />
                        </div>
                        <CompanyInput
                            label="City"
                            value={companyData.city || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("city", val)}
                            placeholder="Enter city"
                        />
                        <CompanyInput
                            label="State / Province"
                            value={companyData.state || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("state", val)}
                            placeholder="Enter state/province"
                        />
                        <CompanyInput
                            label="Country"
                            value={companyData.country || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("country", val)}
                            placeholder="Enter country"
                        />
                        <CompanyInput
                            label="Postal Code"
                            value={companyData.postal_code || ""}
                            isEditing={true}
                            onChange={(val) => handleChange("postal_code", val)}
                            placeholder="Enter postal code"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex flex-wrap justify-end gap-3 items-center">

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs rounded-sm"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isUpdating} size="sm" className="h-8 text-xs rounded-sm gap-2">
                            {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetailPage;