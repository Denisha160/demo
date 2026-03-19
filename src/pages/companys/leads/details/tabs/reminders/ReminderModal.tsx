import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
const reminderSchema = z.object({
    remind_date: z.string().min(1, "Reminder date is required"),
    remind_time: z.string().min(1, "Reminder time is required"),
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;

export interface Reminder extends ReminderFormData {
    id: string;
}

interface ReminderModalProps {
    open: boolean;
    onClose: () => void;
    reminderData?: Reminder | null;
    onSave: (data: ReminderFormData, setError: UseFormSetError<ReminderFormData>) => void;
    isSubmitting?: boolean;
}

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

const ReminderModal = ({
    open,
    onClose,
    reminderData,
    onSave,
    isSubmitting,
}: ReminderModalProps) => {
    const form = useForm<ReminderFormData>({
        resolver: zodResolver(reminderSchema),
        defaultValues: {
            remind_date: getTodayDate(),
            remind_time: getCurrentTime(),
            title: "",
            description: "",
        },
    });

    useEffect(() => {
        if (!open) return;

        if (reminderData) {
            form.reset({
                remind_date: reminderData.remind_date || getTodayDate(),
                remind_time: reminderData.remind_time || getCurrentTime(),
                title: reminderData.title || "",
                description: reminderData.description || "",
            });
            return;
        }

        form.reset({
            remind_date: getTodayDate(),
            remind_time: getCurrentTime(),
            title: "",
            description: "",
        });
    }, [open, reminderData, form]);

    const onSubmit = (data: ReminderFormData) => {
        onSave(data, form.setError);
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                form.reset();
                onClose();
            }}
            headerBg="bg-primary/10"
            title={reminderData ? "Edit Reminder" : "Add Reminder"}
            description={
                reminderData
                    ? "Update the reminder date and details."
                    : "Set a reminder with date, title, and description."
            }
            maxWidth="sm:max-w-lg"
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
                        {isSubmitting
                            ? reminderData
                                ? "Updating..."
                                : "Saving..."
                            : reminderData
                                ? "Update Reminder"
                                : "Save Reminder"}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="remind_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Reminder Date
                                    </FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            value={field.value}
                                            onChange={(value: string) => field.onChange(value || null)}
                                            className="h-8 text-sm rounded-sm"
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remind_time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold flex gap-1">
                                        <span className="text-destructive">*</span> Reminder Time
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="time" className="h-9 text-xs" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[10px]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold flex gap-1">
                                    <span className="text-destructive">*</span> Title
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter reminder title"
                                        className="h-9 text-xs"
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
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold flex gap-1">
                                    <span className="text-destructive">*</span> Description
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Enter reminder description"
                                        className="min-h-[100px] resize-none text-xs"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </Modal>
    );
};

export default ReminderModal;
