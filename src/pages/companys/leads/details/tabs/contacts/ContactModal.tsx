import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";

const contactSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address").min(1, "Email is required"),
    phone: z.string().regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number format").min(1, "Phone number is required"),
    designation: z.string().min(1, "Designation is required"),
    department: z.string().min(1, "Department is required"),
    notes: z.string().optional().or(z.literal("")),
    active: z.boolean().default(true),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export interface Contact extends ContactFormData {
    id: string;
}

interface ContactModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (contact: Contact) => void;
    initialData?: Contact | null;
}

const ContactModal = ({ open, onClose, onSave, initialData }: ContactModalProps) => {
    const form = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            designation: "",
            department: "",
            notes: "",
            active: true,
        },
    });

    // Reset form when initialData changes or modal opens/closes
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    fullName: initialData.fullName,
                    email: initialData.email,
                    phone: initialData.phone,
                    designation: initialData.designation,
                    department: initialData.department,
                    notes: initialData.notes || "",
                    active: initialData.active,
                });
            } else {
                form.reset({
                    fullName: "",
                    email: "",
                    phone: "",
                    designation: "",
                    department: "",
                    notes: "",
                    active: true,
                });
            }
        }
    }, [open, initialData, form]);

    const onSubmit = (data: ContactFormData) => {
        const contactData = {
            ...data,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
        };
        onSave(contactData);
        form.reset();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                form.reset();
                onClose();
            }}
            headerBg="bg-primary/10"
            maxWidth="sm:max-w-[700px]"
            titleClassName="text-primary"
            title={initialData ? "Edit Contact" : "Add Contact"}
            description={initialData ? "Update the contact details below." : "Enter your contact details below to add it to your system."}
            footer={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-sm text-sm h-8"
                        onClick={() => {
                            form.reset();
                            onClose();
                        }}
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        className="rounded-sm text-sm h-8 gap-1.5"
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {initialData ? "Update" : "Save"}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter email address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Designation *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter designation" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter department" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-2">
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter notes" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-2">
                                <div className="space-y-0.5">
                                    <FormLabel>Active Status</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </Modal>
    );
};

export default ContactModal;
