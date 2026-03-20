"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { LeadProfileFormValues } from "../../LeadDetailsPage";

interface ProfileTabProps {
    leadProfile: LeadProfileFormValues;
    setLeadProfile: (profile: LeadProfileFormValues) => void;
    isSaving?: boolean;
}

const leadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    phone: z
        .string()
        .min(1, "Phone is required")
        .regex(/^\d+$/, "Only numbers allowed")
        .length(10, "Must be 10 digits"),
    company: z.string(),
    status: z.string(),
    source: z.string(),
    assignedTo: z.string(),
    country: z.string(),
    website: z.string(),
    designation: z.string(),
    gstPan: z.string(),
    location: z.string(),
    tags: z.string(),
    address: z.string(),
});

const fieldGroups = [
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

const ProfileTab = ({ leadProfile, setLeadProfile, isSaving = false }: ProfileTabProps) => {
    const form = useForm<LeadProfileFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: leadProfile,
        mode: "onChange",
    });

    useEffect(() => {
        form.reset(leadProfile);
    }, [form, leadProfile]);

    const onSubmit = (data: LeadProfileFormValues) => {
        setLeadProfile(data);
    };

    const isDirty = form.formState.isDirty;
    const isValid = form.formState.isValid;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full animate-fade-in rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
            >
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-foreground">
                        Lead Profile
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update any lead information below.
                    </p>
                </div>

                <div className="space-y-8">
                    {fieldGroups.map((group) => (
                        <div key={group.title} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {group.fields.map((field) => (
                                    <FormField
                                        key={field.key}
                                        control={form.control}
                                        name={field.key as any}
                                        render={({ field: formField }) => (
                                            <FormItem
                                                className={
                                                    field.multiline
                                                        ? "md:col-span-2 lg:col-span-3"
                                                        : ""
                                                }
                                            >
                                                <FormLabel className="text-xs font-bold">
                                                    {field.label}
                                                </FormLabel>

                                                <FormControl>
                                                    {field.multiline ? (
                                                        <Textarea
                                                            {...formField}
                                                            placeholder={field.placeholder}
                                                            className="min-h-[100px] text-sm"
                                                            disabled={isSaving}
                                                        />
                                                    ) : (
                                                        <Input
                                                            {...formField}
                                                            type={field.type || "text"}
                                                            placeholder={field.placeholder}
                                                            className="h-10 text-sm"
                                                            disabled={isSaving}
                                                        />
                                                    )}
                                                </FormControl>

                                                {/* ✅ Error message */}
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end border-t border-border/50 pt-6">
                    <Button
                        type="submit"
                        size="sm"
                        className="h-9 px-5"
                        disabled={!isDirty || !isValid || isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ProfileTab;
