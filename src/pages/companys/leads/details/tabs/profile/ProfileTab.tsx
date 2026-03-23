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
import { useLeadTags } from "@/hooks/useLeadTags"; import { useCategoriesCombobox } from "@/hooks/useProductCategories";

const InterestedCategorySelect = ({ value = [], onValueChange, disabled }: { value?: any[], onValueChange: (val: any[]) => void, disabled?: boolean }) => {
    const { data: categories = [] } = useCategoriesCombobox();
    const suggestions = categories
        .filter((cat: any) => !!cat.parent_name)
        .map((cat: any) => ({
            id: String(cat.id),
            name: cat.name,
        }));

    return (
        <TagSelector
            suggestions={suggestions}
            value={value}
            onChange={onValueChange}
        />
    );
};

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
    alternate_phone: z.string().optional().refine(val => !val || /^[0-9]{10}$/.test(val), "Must be exactly 10 digits").or(z.literal("")),
    company: z.string().optional(),
    status_id: z.string().optional(),
    source_id: z.string().optional(),
    assigned_to: z.string().optional(),
    priority: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().optional(),
    website: z.string().optional(),
    designation: z.string().optional(),
    gst_number: z.string().optional().refine(val => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(val), "Invalid GST Number format").or(z.literal("")),
    pan_number: z.string().optional().refine(val => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), "Invalid PAN Number format (e.g. ABCDE1234F)").or(z.literal("")),
    tags: z.array(z.object({ id: z.string().optional(), name: z.string() })).optional(),
    interested_category_id: z.array(z.object({ id: z.string().optional(), name: z.string() })).optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
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

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Priority</FormLabel>
                                        <FormControl>
                                            <Combobox
                                                options={[
                                                    { value: "HOT", label: "Hot" },
                                                    { value: "WARM", label: "Warm" },
                                                    { value: "COLD", label: "Cold" }
                                                ]}
                                                value={field.value}
                                                onValueChange={(val) => form.setValue("priority", val, { shouldDirty: true, shouldValidate: true })}
                                                placeholder="Select Priority"
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
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">State</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter state" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">City</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter city" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pincode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Pincode</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter pincode" {...field} />
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

                            <FormField
                                control={form.control}
                                name="alternate_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Alternative Phone</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} type="tel" className="h-9 text-sm" placeholder="Enter alternative phone" {...field} />
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
                                name="gst_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">GST Number</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm uppercase" placeholder="Enter GST details" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pan_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">PAN Card Number</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm uppercase" placeholder="Enter PAN Number" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pan_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">PAN Card Number</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm uppercase" placeholder="Enter PAN Number" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold flex items-center gap-1.5 pb-1">
                                            <Tag className="h-4 w-4 text-muted-foreground" /> Tags
                                        </FormLabel>
                                        <FormControl>
                                            <TagSelector
                                                suggestions={tagSuggestions}
                                                value={useMemo(() => {
                                                    return (Array.isArray(field.value) ? field.value : []).map(val => {
                                                        if (typeof val === 'string') {
                                                            const found = tagSuggestions.find(s => s.id === val);
                                                            return found || { name: val };
                                                        }
                                                        return val;
                                                    });
                                                }, [field.value, tagSuggestions])}
                                                onChange={(tags) => form.setValue("tags", tags as any, { shouldValidate: true, shouldDirty: true })}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interested_category_id"
                                render={({ field }) => (
                                    <FormItem className="space-y-1.5">
                                        <FormLabel className="text-xs font-bold pb-1">Interested Category</FormLabel>
                                        <FormControl>
                                            <InterestedCategorySelect
                                                value={field.value as any}
                                                onValueChange={(val) => form.setValue("interested_category_id", val, { shouldValidate: true, shouldDirty: true })}
                                                disabled={isSaving}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                            <FormField
                                control={form.control}
                                name="address_line1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Address Line 1</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter address line 1" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[10px]" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address_line2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold">Address Line 2</FormLabel>
                                        <FormControl>
                                            <Input disabled={isSaving} className="h-9 text-sm" placeholder="Enter address line 2" {...field} />
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
