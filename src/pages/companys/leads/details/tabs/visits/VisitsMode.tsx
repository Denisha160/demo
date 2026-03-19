import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, LocateFixed, Trash2 } from "lucide-react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const visitSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().min(1, "Description is required"),
    visit_type: z.string().min(1, "Visit type is required"),
    status: z.string().min(1, "Status is required"),
    scheduled_time: z.string().min(1, "Scheduled time is required"),
    actual_check_in: z.string().optional().or(z.literal("")),
    actual_check_out: z.string().optional().or(z.literal("")),
    location_address: z.string().min(1, "Location address is required"),
    location_latitude: z.string().optional().or(z.literal("")),
    location_longitude: z.string().optional().or(z.literal("")),
    visit_image: z.string().optional().or(z.literal("")),
    visit_image_name: z.string().optional().or(z.literal("")),
    outcome_summary: z.string().optional().or(z.literal("")),
    next_steps: z.string().optional().or(z.literal("")),
    customer_rating: z.string().optional().or(z.literal("")),
    contact_person_name: z.string().min(1, "Contact person name is required"),
    contact_person_designation: z.string().optional().or(z.literal("")),
    contact_person_phone: z.string().min(1, "Contact person phone is required"),
});

export type VisitFormData = z.infer<typeof visitSchema>;

export interface Visit extends VisitFormData {
    id: string;
}

interface VisitsModalProps {
    open: boolean;
    onClose: () => void;
    visitData?: Visit | null;
    onSave: (data: VisitFormData, setError: UseFormSetError<VisitFormData>) => void;
    isSubmitting?: boolean;
}

const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const VisitsModal = ({
    open,
    onClose,
    visitData,
    onSave,
    isSubmitting,
}: VisitsModalProps) => {
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationMessage, setLocationMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<VisitFormData>({
        resolver: zodResolver(visitSchema),
        defaultValues: {
            title: "",
            description: "",
            visit_type: "site_visit",
            status: "SCHEDULED",
            scheduled_time: getDefaultDateTime(),
            actual_check_in: "",
            actual_check_out: "",
            location_address: "",
            location_latitude: "",
            location_longitude: "",
            visit_image: "",
            visit_image_name: "",
            outcome_summary: "",
            next_steps: "",
            customer_rating: "",
            contact_person_name: "",
            contact_person_designation: "",
            contact_person_phone: "",
        },
    });

    useEffect(() => {
        if (!open) return;

        if (visitData) {
            form.reset({
                title: visitData.title || "",
                description: visitData.description || "",
                visit_type: visitData.visit_type || "site_visit",
                status: visitData.status || "SCHEDULED",
                scheduled_time: visitData.scheduled_time || getDefaultDateTime(),
                actual_check_in: visitData.actual_check_in || "",
                actual_check_out: visitData.actual_check_out || "",
                location_address: visitData.location_address || "",
                location_latitude: visitData.location_latitude || "",
                location_longitude: visitData.location_longitude || "",
                visit_image: visitData.visit_image || "",
                visit_image_name: visitData.visit_image_name || "",
                outcome_summary: visitData.outcome_summary || "",
                next_steps: visitData.next_steps || "",
                customer_rating: visitData.customer_rating || "",
                contact_person_name: visitData.contact_person_name || "",
                contact_person_designation: visitData.contact_person_designation || "",
                contact_person_phone: visitData.contact_person_phone || "",
            });
            return;
        }

        form.reset({
            title: "",
            description: "",
            visit_type: "site_visit",
            status: "SCHEDULED",
            scheduled_time: getDefaultDateTime(),
            actual_check_in: "",
            actual_check_out: "",
            location_address: "",
            location_latitude: "",
            location_longitude: "",
            visit_image: "",
            visit_image_name: "",
            outcome_summary: "",
            next_steps: "",
            customer_rating: "",
            contact_person_name: "",
            contact_person_designation: "",
            contact_person_phone: "",
        });
        setLocationMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [open, visitData, form]);

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            form.setValue("visit_image", String(reader.result || ""), { shouldDirty: true });
            form.setValue("visit_image_name", file.name, { shouldDirty: true });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        form.setValue("visit_image", "", { shouldDirty: true });
        form.setValue("visit_image_name", "", { shouldDirty: true });
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleUseLiveLocation = () => {
        if (!navigator.geolocation) {
            setLocationMessage("Live location is not supported in this browser.");
            return;
        }

        setLocationLoading(true);
        setLocationMessage("Requesting location permission...");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                form.setValue("location_latitude", position.coords.latitude.toFixed(6), { shouldDirty: true });
                form.setValue("location_longitude", position.coords.longitude.toFixed(6), { shouldDirty: true });
                setLocationMessage("Live location captured successfully.");
                setLocationLoading(false);
            },
            (error) => {
                const message =
                    error.code === error.PERMISSION_DENIED
                        ? "Location permission denied."
                        : error.code === error.POSITION_UNAVAILABLE
                            ? "Location information is unavailable."
                            : error.code === error.TIMEOUT
                                ? "Location request timed out."
                                : "Unable to fetch live location.";
                setLocationMessage(message);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            },
        );
    };

    const onSubmit = (data: VisitFormData) => {
        onSave(data, form.setError);
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                form.reset();
                setLocationMessage("");
                if (fileInputRef.current) fileInputRef.current.value = "";
                onClose();
            }}
            headerBg="bg-primary/10"
            title={visitData ? "Edit Visit" : "Add Visit"}
            description={visitData ? "Update visit details." : "Enter visit details for this lead."}
            maxWidth="sm:max-w-4xl"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            form.reset();
                            onClose();
                        }}
                        className="h-9"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={form.handleSubmit(onSubmit)}
                        className="h-9"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? (visitData ? "Updating..." : "Saving...") : (visitData ? "Update Visit" : "Save Visit")}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Visit title" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="visit_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Visit Type
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select visit type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="site_visit">Site Visit</SelectItem>
                                            <SelectItem value="meeting">Meeting</SelectItem>
                                            <SelectItem value="demo">Demo</SelectItem>
                                            <SelectItem value="installation">Installation</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="visit_image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold">Visit Image</FormLabel>
                                <FormControl>
                                    <div className="space-y-3">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            disabled={isSubmitting}
                                        />

                                        {field.value ? (
                                            <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/20">
                                                <img
                                                    src={field.value}
                                                    alt={form.getValues("visit_image_name") || "Visit"}
                                                    className="h-52 w-full object-cover"
                                                />
                                                <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-background/90 p-3">
                                                    <span className="truncate text-xs text-muted-foreground">
                                                        {form.getValues("visit_image_name") || "Uploaded image"}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-8 gap-1"
                                                        onClick={handleRemoveImage}
                                                        disabled={isSubmitting}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isSubmitting}
                                                className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                                            >
                                                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                                                    <ImagePlus className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">Upload visit image</span>
                                                <span className="mt-1 text-xs text-muted-foreground">
                                                    Click to choose an image for this visit
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold flex gap-1">
                                    <span className="text-destructive">*</span> Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter visit description"
                                        className="min-h-[90px] resize-none text-xs"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Status
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                        <FormControl>
                                            <SelectTrigger className="h-9 text-xs">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SCHEDULED">SCHEDULED</SelectItem>
                                            <SelectItem value="CHECKED_IN">CHECKED_IN</SelectItem>
                                            <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                            <SelectItem value="MISSED">MISSED</SelectItem>
                                            <SelectItem value="RESCHEDULED">RESCHEDULED</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="scheduled_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Scheduled Time
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="actual_check_in"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Actual Check In</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="actual_check_out"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Actual Check Out</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="location_address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold flex gap-1">
                                    <span className="text-destructive">*</span> Location Address
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter visit location address"
                                        className="min-h-[80px] resize-none text-xs"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                            <div>
                                <div className="text-xs font-bold text-foreground">Live Location</div>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    Allow permission to capture current latitude and longitude.
                                </p>
                                {locationMessage && (
                                    <p className="mt-2 text-[11px] text-muted-foreground">{locationMessage}</p>
                                )}
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-9 gap-2"
                                onClick={handleUseLiveLocation}
                                disabled={isSubmitting || locationLoading}
                            >
                                {locationLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <LocateFixed className="h-4 w-4" />
                                )}
                                Use Live Location
                            </Button>
                        </div>

                        <FormField
                            control={form.control}
                            name="location_latitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Latitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="12.9716"
                                            className="h-9 bg-muted/30 text-xs"
                                            readOnly
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location_longitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Longitude</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="77.5946"
                                            className="h-9 bg-muted/30 text-xs"
                                            readOnly
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="customer_rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Customer Rating</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="5"
                                            placeholder="1 to 5"
                                            className="h-9 text-xs"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="contact_person_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Contact Person Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter contact person name" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_person_designation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Designation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Manager" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_person_phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Contact Phone
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter phone number" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="outcome_summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Outcome Summary</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter visit outcome summary"
                                            className="min-h-[90px] resize-none text-xs"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="next_steps"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold">Next Steps</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter next steps"
                                            className="min-h-[90px] resize-none text-xs"
                                            disabled={isSubmitting}
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

export default VisitsModal;
