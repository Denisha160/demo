import { useEffect, useMemo } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "lucide-react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PipelineColumn } from "../../../types/leads";
import { useLeadSources } from "@/hooks/useLeadSource";
import { useLeadStatuses } from "@/hooks/useLeadStatus";
import { useUsers } from "@/hooks/useUsers";
import { useCategoriesCombobox } from "@/hooks/useProductCategories";
import { TagSelector } from "@/components/ui/tag-selector";
import { useLeadTags } from "@/hooks/useLeadTags";
import {
  useCountries,
  useStates,
  useCities,
} from "@/hooks/useCityStateCountry";
import { useState } from "react";
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

  const { data: categories = [], isLoading } = useCategoriesCombobox({
    search: debouncedSearch,
  });
  const suggestions = categories
    .filter((cat: any) => !cat.parent_name)
    .map((cat: any) => ({
      id: String(cat.id),
      name: cat.name,
    }));

  const displayValue = (Array.isArray(value) ? value : [])
    .map((val: any) => {
      const id = typeof val === "string" ? val : val?.id || String(val);
      const categoryMatch = categories.find((c) => String(c.id) === id);
      return categoryMatch
        ? { id, name: categoryMatch.name }
        : typeof val === "object" && val?.name
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

const formSchema = z.object({
  status_id: z.string().min(1, { message: "Status is required" }),
  source_id: z.string().min(1, { message: "Source is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  company_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits"),
  alternate_phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      "Must be exactly 10 digits",
    )
    .or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city_id: z.string().optional().or(z.literal("")),
  state_id: z.string().optional().or(z.literal("")),
  country_id: z.string().optional().or(z.literal("")),
  pincode: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
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
  priority: z.string().optional().or(z.literal("")),
  assigned_to: z.string().optional().or(z.literal("")),
  interested_category_id: z
    .array(z.object({ id: z.string().optional(), name: z.string() }))
    .optional(),
  tags: z
    .array(z.object({ id: z.string().optional(), name: z.string() }))
    .optional(),
});

export type LeadFormData = z.infer<typeof formSchema>;

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LeadFormData, setError: UseFormSetError<LeadFormData>) => void;
  addModalCol: string | null;
  columns: PipelineColumn[];
  isSubmitting?: boolean;
}

const LeadModal = ({
  open,
  onClose,
  onSave,
  addModalCol,
  columns,
  isSubmitting = false,
}: LeadModalProps) => {
  const form = useForm<LeadFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status_id: "",
      source_id: "",
      name: "",
      company_name: "",
      email: "",
      phone: "",
      alternate_phone: "",
      address_line1: "",
      address_line2: "",
      city_id: "",
      state_id: "",
      country_id: "",
      pincode: "",
      designation: "",
      website: "",
      gst_number: "",
      pan_number: "",
      priority: "HOT",
      assigned_to: "",
      interested_category_id: [],
      tags: [],
    },
  });

  const { data: leadTagsData } = useLeadTags(undefined, { enabled: open });
  const leadTags = Array.isArray(leadTagsData)
    ? leadTagsData
    : Array.isArray((leadTagsData as any)?.items)
      ? (leadTagsData as any).items
      : [];

  const tagSuggestions = leadTags.map((tag: any) => ({
    id: String(tag.id),
    name: tag.name,
  }));

  const { data: statusResponse } = useLeadStatuses(
    { limit: 100 },
    { enabled: open },
  );
  const { data: sourceResponse } = useLeadSources(
    { limit: 100 },
    { enabled: open },
  );
  const { data: usersResponse } = useUsers({ limit: 100 }, { enabled: open });
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null,
  );
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");

  const debouncedCountrySearch = useDebounce(countrySearch, 500);
  const debouncedStateSearch = useDebounce(stateSearch, 500);
  const debouncedCitySearch = useDebounce(citySearch, 500);

  const { data: countriesData } = useCountries(
    {
      search: debouncedCountrySearch,
      combobox: true,
      limit: 100,
    },
    { enabled: open },
  );
  const { data: statesData } = useStates(
    selectedCountryId || undefined,
    {
      search: debouncedStateSearch,
      combobox: true,
      limit: 100,
    },
    { enabled: open && !!selectedCountryId },
  );
  const { data: citiesData } = useCities(
    selectedStateId || undefined,
    {
      search: debouncedCitySearch,
      combobox: true,
      limit: 100,
    },
    { enabled: open && !!selectedStateId },
  );

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

  const users = (usersResponse as any)?.items || usersResponse || [];
  const userOptions = users.map((user: any) => ({
    value: user.id,
    label: user.name,
  }));

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

  useEffect(() => {
    if (!open) return;

    const defaultColumn = columns.find((column) => column.id === addModalCol);
    form.reset({
      status_id: defaultColumn?.id || "",
      source_id: "",
      name: "",
      company_name: "",
      email: "",
      phone: "",
      alternate_phone: "",
      address_line1: "",
      address_line2: "",
      city_id: "",
      state_id: "",
      country_id: "",
      pincode: "",
      designation: "",
      website: "",
      gst_number: "",
      pan_number: "",
      priority: "HOT",
      assigned_to: "",
      interested_category_id: [],
      tags: [],
    });
    setSelectedCountryId(null);
    setSelectedStateId(null);
    setCountrySearch("");
    setStateSearch("");
    setCitySearch("");
  }, [open, addModalCol, columns, form]);

  const handleSubmit = (data: LeadFormData) => {
    const payload = {
      ...data,
      interested_category_id: data.interested_category_id?.length
        ? data.interested_category_id.map((c: any) =>
          c.id ? String(c.id) : c.name,
        )
        : [],
      tags: data.tags?.length
        ? data.tags.map((t: any) => (t.id ? String(t.id) : t.name))
        : [],
    };

    onSave(payload as any, form.setError);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Lead"
      description={
        addModalCol
          ? `Stage: ${columns.find((c) => c.id === addModalCol)?.title}`
          : ""
      }
      headerBg="bg-primary/5"
      maxWidth="sm:max-w-[800px] md:max-w-[900px]"
      titleClassName="text-primary font-bold"
      footer={
        <div className="flex w-full gap-2 sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-6 text-xs font-semibold rounded-sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 px-8 text-xs font-semibold rounded-sm"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            Save Lead
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form
          className="custom-scrollbar h-[60vh] space-y-4 overflow-y-auto pr-2 pt-2"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <FormField
              control={form.control}
              name="status_id"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Status <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={statusOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Status"
                      className="h-9 w-full"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Source <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={sourceOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Source"
                      className="h-9 w-full"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
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
                      onValueChange={field.onChange}
                      placeholder="Select Priority"
                      className="h-9 w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Assigned To
                  </FormLabel>
                  <FormControl>
                    <Combobox
                      options={userOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Assignee"
                      className="h-9 w-full"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-1.5 border-t border-border/40 pt-2">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2">
                    <Tag className="h-4 w-4 text-muted-foreground" /> Tags
                  </FormLabel>
                  <FormControl>
                    <TagSelector
                      suggestions={tagSuggestions}
                      value={(Array.isArray(field.value)
                        ? field.value
                        : []
                      ).map((val: any) => {
                        const id =
                          typeof val === "string" ? val : val?.id || val?.name;
                        const found = tagSuggestions.find((s) => s.id === id);
                        return (
                          found ||
                          (typeof val === "string"
                            ? { id: val, name: val }
                            : val)
                        );
                      })}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-2 gap-y-2 border-t border-border/40 pt-2 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Name"
                      className="h-9 text-xs border-border/60"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Email Address"
                      type="email"
                      className="h-9 text-xs border-border/60"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Phone <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Phone Number"
                      type="tel"
                      className="h-9 text-xs border-border/60"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Alternative Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Alternative Phone Number"
                      type="tel"
                      className="h-9 text-xs border-border/60"
                      {...field}
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Country
                  </FormLabel>
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
                        form.setValue("state_id", "");
                        form.setValue("city_id", "");
                      }}
                      placeholder="Select Country"
                      className="h-9 w-full"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    State
                  </FormLabel>
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
                        form.setValue("city_id", "");
                        setCitySearch("");
                      }}
                      placeholder={
                        selectedCountryId
                          ? "Select State"
                          : "Select Country first"
                      }
                      className="h-9 w-full"
                      disabled={!selectedCountryId}
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    City
                  </FormLabel>
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
                      }}
                      placeholder={
                        selectedStateId ? "Select City" : "Select State first"
                      }
                      className="h-9 w-full"
                      disabled={!selectedStateId}
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Pincode
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Pincode"
                      className="h-9 text-xs border-border/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Company Name"
                      className="h-9 text-xs border-border/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Designation
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Designation"
                      className="h-9 text-xs border-border/60"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Website
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Website URL"
                      className="h-9 text-xs border-border/60"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    GST Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter GST Number"
                      className="h-9 text-xs border-border/60"
                      {...field}
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
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Interested Category
                  </FormLabel>
                  <FormControl>
                    <InterestedCategorySelect
                      value={field.value as any}
                      onValueChange={field.onChange}
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    PAN Card Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter PAN Number"
                      className="h-9 text-xs border-border/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_line1"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Address Line 1
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Address Line 1"
                      className="h-9 text-xs border-border/60"
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
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    Address Line 2
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Address Line 2"
                      className="h-9 text-xs border-border/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </Modal>
  );
};

export default LeadModal;
