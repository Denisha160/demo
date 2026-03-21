"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "lucide-react";

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
import { Combobox } from "@/components/ui/combobox";
import { TagSelector } from "@/components/ui/tag-selector";

import { useLeadStatuses } from "@/hooks/useLeadStatus";
import { useLeadSources } from "@/hooks/useLeadSource";
import { useUsers } from "@/hooks/useUsers";
import { useLeadTags } from "@/hooks/useLeadTags";

import type { LeadProfileFormValues } from "../../LeadDetailsPage";

interface ProfileTabProps {
    leadProfile: LeadProfileFormValues;
    setLeadProfile: (profile: LeadProfileFormValues) => void;
    isSaving?: boolean;
}

const leadSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").or(z.literal("")),
    phone: z
        .string()
        .min(1, "Phone is required")
        .regex(/^\d+$/, "Only numbers allowed")
        .min(10, "Must be at least 10 digits"),
    company: z.string().optional(),
    status_id: z.string().optional(),
    source_id: z.string().optional(),
    assigned_to: z.string().optional(),
    country: z.string().optional(),
    website: z.string().optional(),
    designation: z.string().optional(),
    gstPan: z.string().optional(),
    location: z.string().optional(),
    tags: z.array(z.object({ id: z.string().optional(), name: z.string() })).optional(),
    address: z.string().optional(),
});

const ProfileTab = ({ leadProfile, setLeadProfile, isSaving = false }: ProfileTabProps) => {
    const { data: statusResponse } = useLeadStatuses({ limit: 100 });
    const { data: sourceResponse } = useLeadSources({ limit: 100 });
    const { data: usersResponse } = useUsers({ limit: 100 });
    const { data: tagsResponse } = useLeadTags();

    const statusOptions = statusResponse?.items?.map((item: any) => ({ value: item.id, label: item.name })) || [];
    const sourceOptions = sourceResponse?.items?.map((item: any) => ({ value: item.id, label: item.name })) || [];
    const users = usersResponse?.items || usersResponse || [];
    const userOptions = users.map((user: any) => ({ value: user.id, label: user.name }));

    const tagSuggestions = useMemo(() => {
        const tags = Array.isArray(tagsResponse)
            ? tagsResponse
            : Array.isArray((tagsResponse as any)?.items)
                ? (tagsResponse as any).items
                : [];
        return tags.map((tag: any) => ({ id: String(tag.id), name: tag.name }));
    }, [tagsResponse]);

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

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground/80 border-b border-border/50 pb-2">Basic Info</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Name</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter lead name" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Company</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter company name" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Email</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} type="email" className="h-9 text-sm" placeholder="Enter email" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Phone</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} type="tel" className="h-9 text-sm" placeholder="Enter phone number" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Status</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={statusOptions}
                                                value={field.value}
                                                onValueChange={(val) => form.setValue("status_id", val, { shouldDirty: true, shouldValidate: true })}
                                                placeholder="Select Status"
                                                className="h-9 w-full"
                                                disabled={isSaving}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="source_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Source</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={sourceOptions}
                                                value={field.value}
                                                onValueChange={(val) => form.setValue("source_id", val, { shouldDirty: true, shouldValidate: true })}
                                                placeholder="Select Source"
                                                className="h-9 w-full"
                                                disabled={isSaving}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Assignment & Locale */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <h4 className="text-sm font-semibold text-foreground/80 border-b border-border/50 pb-2">Assignment & Locale</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="assigned_to"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Assigned To</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={userOptions}
                                                value={field.value}
                                                onValueChange={(val) => form.setValue("assigned_to", val, { shouldDirty: true, shouldValidate: true })}
                                                placeholder="Assign a user"
                                                className="h-9 w-full"
                                                disabled={isSaving}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Country</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter country" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Website</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} type="url" className="h-9 text-sm" placeholder="Enter website URL" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <h4 className="text-sm font-semibold text-foreground/80 border-b border-border/50 pb-2">Additional Details</h4>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                control={form.control}
                                name="designation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Designation</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter designation" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gstPan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">GST / PAN</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm uppercase" placeholder="Enter GST or PAN details" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Location</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter location" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-2">
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 md:col-span-2 lg:col-span-3">
                                        <FormLabel className="text-xs font-bold flex items-center gap-1.5 pb-1">
                                            <Tag className="h-4 w-4 text-muted-foreground" /> Tags
                                        </FormLabel>
                                        <FormControl>
                                            <TagSelector
                                                suggestions={tagSuggestions}
                                                value={(field.value as any) || []}
                                                onChange={(tags) => form.setValue("tags", tags as any, { shouldValidate: true, shouldDirty: true })}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <div className="pt-2">
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5 md:col-span-2 lg:col-span-3">
                                        <FormLabel className="text-xs font-bold">Address</FormLabel>
                                        <FormControl>
                                            <Textarea disabled={isSaving} className="min-h-[80px] text-sm" placeholder="Enter full address" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-border/50 pt-6">
                    <Button
                        type="submit"
                        size="sm"
                        className="h-9 px-5"
                        disabled={!isDirty || isSaving}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ProfileTab;
