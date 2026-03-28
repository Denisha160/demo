import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag, Edit2, Save, X as CloseIcon } from "lucide-react";

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
import { Combobox } from "@/components/ui/combobox";
import { TagSelector } from "@/components/ui/tag-selector";

import { useLeadStatuses } from "@/hooks/useLeadStatus";
import { useLeadSources } from "@/hooks/useLeadSource";
import { useUsers } from "@/hooks/useUsers";
import { useLeadTags } from "@/hooks/useLeadTags";
import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import {
  useCountries,
  useStates,
  useCities,
} from "@/hooks/useCityStateCountry";
import { useDebounce } from "@/hooks/useDebounce";

const InterestedCategorySelect = ({
  value = [],
  onValueChange,
  disabled,
}: {
  value?: any[];
  onValueChange: (val: any[]) => void;
  disabled?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: categories = [] } = useCategoriesCombobox({
    search: debouncedSearch,
  });

  const suggestions = (categories as any[])
    .filter((cat: any) => !cat.parent_name)
    .map((cat: any) => ({
      id: String(cat.id),
      name: cat.name,
    }));

  const displayValue = (Array.isArray(value) ? value : [])
    .map((val: any) => {
      if (typeof val === "string") return { id: val, name: val };
      const id = val?.id || String(val);
      const categoryMatch = (categories as any[]).find(
        (c) => String(c.id) === id,
      );
      return categoryMatch
        ? { id, name: categoryMatch.name }
        : val?.name
          ? { id, name: val.name }
          : null;
    })
    .filter((v: any): v is { id: string; name: string } => !!v);

  return (
    <TagSelector
      suggestions={suggestions}
      value={displayValue}
      onChange={onValueChange}
      onSearchChange={setSearch}
      searchValue={search}
      disabled={disabled}
      creatable={false}
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
  phone: z.union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => val.length > 0, "Phone is required")
    .refine((val) => /^\d+$/.test(val), "Only numbers allowed")
    .refine((val) => val.length >= 10, "Must be at least 10 digits"),
  alternate_phone: z.union([z.string(), z.number()])
    .transform((val) => (val ? String(val) : ""))
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      "Must be exactly 10 digits",
    )
    .or(z.literal("")),
  company: z.string().optional(),
  status_id: z.string().optional(),
  source_id: z.string().optional(),
  assigned_to: z.string().optional(),
  priority: z.string().optional(),
  country_id: z.string().optional(),
  state_id: z.string().optional(),
  city_id: z.string().optional(),
  pincode: z.string().optional(),
  website: z.string().optional(),
  designation: z.string().optional(),
  gst_number: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(
          val,
        ),
      "Invalid GST Number format",
    )
    .or(z.literal("")),
  pan_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
      "Invalid PAN Number format (e.g. ABCDE1234F)",
    )
    .or(z.literal("")),
  tags: z
    .array(z.object({ id: z.string().optional(), name: z.string() }))
    .optional(),
  interested_category_id: z
    .array(z.object({ id: z.string().optional(), name: z.string() }))
    .optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  expected_revenue: z.union([z.string(), z.number()])
    .transform((val) => (val !== undefined && val !== null ? String(val) : ""))
    .optional()
    .refine((val) => !val || /^[0-9.]+$/.test(val), "Must be a number")
    .or(z.literal("")),
});

const ProfileTab = ({
  leadProfile,
  setLeadProfile,
  isSaving = false,
}: ProfileTabProps) => {
  const { data: statusResponse } = useLeadStatuses({ limit: 100 });
  const { data: sourceResponse } = useLeadSources({ limit: 100 });
  const { data: usersResponse } = useUsers({ limit: 100 });
  const { data: tagsResponse } = useLeadTags();

  const statusOptions =
    (statusResponse as any)?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];
  const sourceOptions =
    (sourceResponse as any)?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];
  const users = (usersResponse as any)?.items || (usersResponse as any) || [];
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null,
  );
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const debouncedCountrySearch = useDebounce(countrySearch, 500);
  const debouncedStateSearch = useDebounce(stateSearch, 500);
  const debouncedCitySearch = useDebounce(citySearch, 500);

  const { data: countriesData } = useCountries({
    search: debouncedCountrySearch,
    combobox: true,
    limit: 250,
  });
  const { data: statesData } = useStates(selectedCountryId || undefined, {
    search: debouncedStateSearch,
    combobox: true,
    limit: 1000,
  });
  const { data: citiesData } = useCities(selectedStateId || undefined, {
    search: debouncedCitySearch,
    combobox: true,
    limit: 500,
  });

  const countryOptions =
    (countriesData as any)?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const stateOptions =
    (statesData as any)?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const cityOptions =
    (citiesData as any)?.items?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

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

  useEffect(() => {
    if (
      leadProfile.country_id &&
      leadProfile.country_id !== selectedCountryId
    ) {
      setSelectedCountryId(leadProfile.country_id);
    }
  }, [leadProfile.country_id, selectedCountryId]);

  useEffect(() => {
    if (leadProfile.state_id && leadProfile.state_id !== selectedStateId) {
      setSelectedStateId(leadProfile.state_id);
    }
  }, [leadProfile.state_id, selectedStateId]);

  useEffect(() => {
    if (leadProfile.city_id && leadProfile.city_id !== selectedCityId) {
      setSelectedCityId(leadProfile.city_id);
    }
  }, [leadProfile.city_id, selectedCityId]);

  // Handle initialization of labels for existing data
  useEffect(() => {
    if (
      leadProfile.country_id &&
      countryOptions.length > 0 &&
      !selectedCountryName
    ) {
      const label = countryOptions.find(
        (o) => o.value === leadProfile.country_id,
      )?.label;
      if (label) setSelectedCountryName(label);
    }
  }, [leadProfile.country_id, countryOptions, selectedCountryName]);

  useEffect(() => {
    if (leadProfile.state_id && stateOptions.length > 0 && !selectedStateName) {
      const label = stateOptions.find(
        (o) => o.value === leadProfile.state_id,
      )?.label;
      if (label) setSelectedStateName(label);
    }
  }, [leadProfile.state_id, stateOptions, selectedStateName]);

  useEffect(() => {
    if (leadProfile.city_id && cityOptions.length > 0 && !selectedCityName) {
      const label = cityOptions.find(
        (o) => o.value === leadProfile.city_id,
      )?.label;
      if (label) setSelectedCityName(label);
    }
  }, [leadProfile.city_id, cityOptions, selectedCityName]);

  const onSubmit = (data: LeadProfileFormValues) => {
    setLeadProfile(data);
    setIsEditing(false);
  };

  const isDirty = form.formState.isDirty;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full animate-fade-in rounded-sm border border-border/50 bg-card p-4 shadow-sm"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              {isEditing ? "Edit Lead Profile" : "Lead Profile"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Modify lead information and click update to save."
                : "View lead information. Click edit to make changes."}
            </p>
          </div>

          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9 px-4 flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.reset(leadProfile);
                  setIsEditing(false);
                }}
                className="h-9 px-4 flex items-center gap-2"
                disabled={isSaving}
              >
                <CloseIcon className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                className="h-9 px-5 flex items-center gap-2"
                disabled={isSaving || !isDirty}
              >
                <Save className="h-3.5 w-3.5" />{" "}
                {isSaving ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {/* Basic Info */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm"
                        placeholder="Enter lead name"
                        {...field}
                      />
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
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm"
                        placeholder="Enter company name"
                        {...field}
                      />
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
                      <Input
                        disabled={!isEditing || isSaving}
                        type="email"
                        className="h-9 text-sm"
                        placeholder="Enter email"
                        {...field}
                      />
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
                      <Input
                        disabled={!isEditing || isSaving}
                        type="tel"
                        className="h-9 text-sm"
                        placeholder="Enter phone number"
                        {...field}
                      />
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
                        onValueChange={(val) =>
                          form.setValue("status_id", val, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Select Status"
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving}
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
                        onValueChange={(val) =>
                          form.setValue("source_id", val, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Select Source"
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving}
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
                    <FormLabel className="text-xs font-bold">
                      Priority
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "HOT", label: "Hot" },
                          { value: "WARM", label: "Warm" },
                          { value: "COLD", label: "Cold" },
                        ]}
                        value={field.value}
                        onValueChange={(val) =>
                          form.setValue("priority", val, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Select Priority"
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Assignment & Locale */}
          <div className="space-y-2 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Assigned To
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={userOptions}
                        value={field.value}
                        onValueChange={(val) =>
                          form.setValue("assigned_to", val, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        placeholder="Assign a user"
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">Country</FormLabel>
                    <FormControl>
                      <Combobox
                        options={countryOptions}
                        value={field.value}
                        searchValue={countrySearch}
                        onSearchChange={setCountrySearch}
                        selectedLabel={selectedCountryName}
                        onValueChange={(id) => {
                          const label = countryOptions.find(
                            (o) => o.value === id,
                          )?.label;
                          setSelectedCountryName(label || "");
                          field.onChange(id);
                          setSelectedCountryId(id);
                          setSelectedStateName("");
                          setSelectedCityName("");
                          setSelectedStateId(null);
                          setSelectedCityId(null);
                          form.setValue("state_id", "");
                          form.setValue("city_id", "");
                        }}
                        placeholder="Select Country"
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">State</FormLabel>
                    <FormControl>
                      <Combobox
                        options={stateOptions}
                        value={field.value}
                        searchValue={stateSearch}
                        onSearchChange={setStateSearch}
                        selectedLabel={selectedStateName}
                        onValueChange={(id) => {
                          const label = stateOptions.find(
                            (o) => o.value === id,
                          )?.label;
                          setSelectedStateName(label || "");
                          field.onChange(id);
                          setSelectedStateId(id);
                          setSelectedCityName("");
                          setSelectedCityId(null);
                          form.setValue("city_id", "");
                          setCitySearch("");
                        }}
                        placeholder={
                          selectedCountryId
                            ? "Select State"
                            : "Select Country first"
                        }
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving || !selectedCountryId}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">City</FormLabel>
                    <FormControl>
                      <Combobox
                        options={cityOptions}
                        value={field.value}
                        searchValue={citySearch}
                        onSearchChange={setCitySearch}
                        selectedLabel={selectedCityName}
                        onValueChange={(id) => {
                          const label = cityOptions.find(
                            (o) => o.value === id,
                          )?.label;
                          setSelectedCityName(label || "");
                          field.onChange(id);
                          setSelectedCityId(id);
                          setCitySearch("");
                        }}
                        placeholder={
                          selectedStateId ? "Select City" : "Select State first"
                        }
                        className="h-9 w-full"
                        disabled={!isEditing || isSaving || !selectedStateId}
                      />
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
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm"
                        placeholder="Enter pincode"
                        {...field}
                      />
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
                      <Input
                        disabled={!isEditing || isSaving}
                        type="url"
                        className="h-9 text-sm"
                        placeholder="Enter website URL"
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      Alternative Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        type="tel"
                        className="h-9 text-sm"
                        placeholder="Enter alternative phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Designation
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm"
                        placeholder="Enter designation"
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      GST Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm uppercase"
                        placeholder="Enter GST details"
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      PAN Card Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm uppercase"
                        placeholder="Enter PAN Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expected_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Expected Revenue
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        type="number"
                        className="h-9 text-sm"
                        placeholder="Enter Expected Revenue"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
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
                        disabled={!isEditing || isSaving}
                        value={(Array.isArray(field.value)
                          ? field.value
                          : []
                        ).map((val: any) => {
                          const id =
                            typeof val === "string"
                              ? val
                              : val?.id || val?.name;
                          const found = tagSuggestions.find((s) => s.id === id);
                          return (
                            found ||
                            (typeof val === "string"
                              ? { id: val, name: val }
                              : val)
                          );
                        })}
                        onChange={(tags) =>
                          form.setValue("tags", tags as any, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
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
                    <FormLabel className="text-xs font-bold pb-1">
                      Interested Category
                    </FormLabel>
                    <FormControl>
                      <InterestedCategorySelect
                        value={field.value as any}
                        onValueChange={(val) =>
                          form.setValue("interested_category_id", val, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        disabled={!isEditing || isSaving}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 pt-2">
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold">
                      Address Line 1
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm"
                        placeholder="Enter address line 1"
                        {...field}
                      />
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
                    <FormLabel className="text-xs font-bold">
                      Address Line 2
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={!isEditing || isSaving}
                        className="h-9 text-sm"
                        placeholder="Enter address line 2"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default ProfileTab;
