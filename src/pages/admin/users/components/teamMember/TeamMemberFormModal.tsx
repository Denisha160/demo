import { useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Info, Loader2 } from "lucide-react";
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
import { Combobox } from "@/components/ui/combobox";

const memberSchema = z.object({
    user_id: z.string().min(1, "User selection is required"),
    relationship_type: z.string().min(1, "Relationship type is required"),
});

export type MemberFormData = z.infer<typeof memberSchema>;

interface TeamMemberFormModalProps {
    open: boolean;
    onClose: () => void;
    editingMember?: any;
    onSave: (data: MemberFormData) => void;
    isSubmitting: boolean;
    userOptions: { value: string; label: string; role: string }[];
}

const TeamMemberFormModal = ({
    open,
    onClose,
    editingMember,
    onSave,
    isSubmitting,
    userOptions,
}: TeamMemberFormModalProps) => {
    const form = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            user_id: "",
            relationship_type: "",
        },
    });

    useEffect(() => {
        if (open) {
            if (editingMember) {
                form.reset({
                    user_id: editingMember.user_id || "",
                    relationship_type: editingMember.relationship_type || "",
                });
            } else {
                form.reset({
                    user_id: "",
                    relationship_type: "",
                });
            }
        }
    }, [open, editingMember, form]);

    const onSubmit = (data: MemberFormData) => {
        onSave(data);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/5"
            title={editingMember ? "Edit Team Member" : "Add Team Member"}
            description={editingMember ? `Update relationship for ${editingMember.user_name || "member"}.` : "Assign a user to report to this manager."}
            maxWidth="sm:max-w-md"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="h-9">
                        Cancel
                    </Button>
                    <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} className="h-9">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? "Saving..." : (editingMember ? "Update Member" : "Add Member")}
                    </Button>
                </div>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2 px-1">
                    <FormField
                        control={form.control}
                        name="user_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" /> Select Employee <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Combobox
                                        options={userOptions}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Search by name or email..."
                                        className="h-10 w-full"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage className="text-[10px]" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="relationship_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold flex items-center gap-2">
                                    <Info className="h-3.5 w-3.5" /> Relationship Type <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Sales Executive, Lead Developer..."
                                        className="h-9 text-xs focus-visible:ring-primary/20"
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

export default TeamMemberFormModal;
