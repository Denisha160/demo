import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeadProfileFormValues } from "../../LeadDetailsPage";

interface ProfileTabProps {
    leadProfile: LeadProfileFormValues;
    setLeadProfile: (profile: LeadProfileFormValues) => void;
}

const fieldGroups: Array<{
    title: string;
    fields: Array<{
        key: keyof LeadProfileFormValues;
        label: string;
        placeholder: string;
        type?: string;
        multiline?: boolean;
    }>;
}> = [
    {
        title: "Basic Info",
        fields: [
            { key: "name", label: "Name", placeholder: "Enter lead name" },
            { key: "company", label: "Company", placeholder: "Enter company name" },
            { key: "email", label: "Email", placeholder: "Enter email", type: "email" },
            { key: "phone", label: "Phone", placeholder: "Enter phone number" },
            { key: "status", label: "Status", placeholder: "Enter lead status" },
            { key: "source", label: "Source", placeholder: "Enter lead source" },
        ],
    },
    {
        title: "Assignment & Locale",
        fields: [
            { key: "assignedTo", label: "Assigned To", placeholder: "Assign a user" },
            { key: "country", label: "Country", placeholder: "Enter country" },
            { key: "language", label: "Language", placeholder: "Enter language" },
            { key: "website", label: "Website", placeholder: "Enter website URL", type: "url" },
        ],
    },
    {
        title: "Additional Details",
        fields: [
            { key: "designation", label: "Designation", placeholder: "Enter designation" },
            { key: "gstPan", label: "GST / PAN", placeholder: "Enter GST or PAN details" },
            { key: "location", label: "Location", placeholder: "Enter location" },
            { key: "tags", label: "Tags", placeholder: "Enter tags separated by comma" },
        ],
    },
    {
        title: "Address",
        fields: [
            {
                key: "address",
                label: "Address",
                placeholder: "Enter full address",
                multiline: true,
            },
        ],
    },
];

const ProfileTab = ({ leadProfile, setLeadProfile }: ProfileTabProps) => {
    const [draftProfile, setDraftProfile] = useState<LeadProfileFormValues>(leadProfile);

    useEffect(() => {
        setDraftProfile(leadProfile);
    }, [leadProfile]);

    const isDirty = useMemo(
        () => JSON.stringify(draftProfile) !== JSON.stringify(leadProfile),
        [draftProfile, leadProfile],
    );

    const handleChange = (key: keyof LeadProfileFormValues, value: string) => {
        setDraftProfile((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = () => {
        setLeadProfile(draftProfile);
    };

    return (
        <div className="w-full animate-fade-in rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">Lead Profile</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Update any lead information below. The save button stays disabled until something changes.
                </p>
            </div>

            <div className="space-y-8">
                {fieldGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <h4 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                            {group.title}
                        </h4>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {group.fields.map((field) => (
                                <div
                                    key={field.key}
                                    className={field.multiline ? "md:col-span-2 lg:col-span-3" : ""}
                                >
                                    <Label className="mb-2 block text-xs font-bold text-foreground">
                                        {field.label}
                                    </Label>

                                    {field.multiline ? (
                                        <Textarea
                                            value={draftProfile[field.key]}
                                            onChange={(event) => handleChange(field.key, event.target.value)}
                                            placeholder={field.placeholder}
                                            className="min-h-[100px] resize-none text-sm"
                                        />
                                    ) : (
                                        <Input
                                            type={field.type || "text"}
                                            value={draftProfile[field.key]}
                                            onChange={(event) => handleChange(field.key, event.target.value)}
                                            placeholder={field.placeholder}
                                            className="h-10 text-sm"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end border-t border-border/50 pt-6">
                <Button size="sm" className="h-9 px-5" onClick={handleSave} disabled={!isDirty}>
                    Save
                </Button>
            </div>
        </div>
    );
};

export default ProfileTab;
