import { useEffect } from "react";
import { z } from "zod";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    ClipboardList,
    UserCheck,
    User
} from "lucide-react";
import Modal from "@/components/Modal";
import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { useUsers } from "@/hooks/useUsers";

const followUpSchema = z.object({
    status: z.string().min(1, "Status is required"),
    followUpMethod: z.string().min(1, "Follow up method is required"),
    purpose: z.string().min(1, "Purpose is required"),
    assignedTo: z.string().min(1, "Assigned to is required"),
    createdBy: z.string().min(1, "Created by is required"),
    scheduled_at: z.string().optional(),
});

export type FollowUpFormData = z.infer<typeof followUpSchema>;

export interface FollowUp extends FollowUpFormData {
    id: string;
    assigned_to_name?: string;
    assigned_to?: string;
    created_by?: string;
}

interface FollowUpModalProps {
    open: boolean;
    onClose: () => void;
    followUpData?: FollowUp | null;
    isEditing?: boolean;
    onSave: (data: FollowUpFormData, setError: UseFormSetError<FollowUpFormData>) => void;
    isSubmitting?: boolean;
}

const FollowUpModal = ({
    open,
    onClose,
    followUpData,
    isEditing = false,
    onSave,
    isSubmitting = false,
}: FollowUpModalProps) => {
    const { data: usersResponse } = useUsers({ limit: 100 });
    const users = usersResponse?.items || usersResponse || [];
    const userOptions = users.map((user: any) => ({
        value: user.id,
        label: user.name,
    }));

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        watch,
        reset,
        formState: { errors }
    } = useForm<FollowUpFormData>({
        resolver: zodResolver(followUpSchema),
        defaultValues: {
            status: "TODO",
            followUpMethod: "Call",
            purpose: "",
            assignedTo: "",
            createdBy: "",
            scheduled_at: new Date().toISOString().split("T")[0],
        }
    });

    useEffect(() => {
        if (open) {
            if (isEditing && followUpData) {
                reset({
                    status: followUpData.status || "TODO",
                    followUpMethod: followUpData.followUpMethod || "Call",
                    purpose: followUpData.purpose || "",
                    assignedTo: followUpData.assignedTo || followUpData.assigned_to || "",
                    createdBy: followUpData.createdBy || followUpData.created_by || "",
                    scheduled_at: followUpData.scheduled_at || new Date().toISOString().split("T")[0],
                });
            } else {
                reset({
                    status: "TODO",
                    followUpMethod: "Call",
                    purpose: "",
                    assignedTo: "",
                    createdBy: "",
                    scheduled_at: new Date().toISOString().split("T")[0],
                });
            }
        }
    }, [open, isEditing, followUpData, reset]);

    const handleFormSubmit = (data: FollowUpFormData) => {
        onSave(data, setError);
    };

    const status = watch("status");
    const followUpMethod = watch("followUpMethod");
    const date = watch("scheduled_at"); // ✅ important

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Follow Up" : "Add Follow Up"}
            description="Enter follow up details"
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                    <Button type="submit" form="follow-up-form" size="sm" disabled={isSubmitting}>
                        {isEditing ? "Update" : "Save"}
                    </Button>
                </div>
            }
        >
            <form
                id="follow-up-form"
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
            >
                <div className="grid grid-cols-2 gap-4">

                    {/* Status */}
                    <div>
                        <Label>Status</Label>
                        <Select
                            value={status}
                            onValueChange={(val) =>
                                setValue("status", val, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TODO">TODO</SelectItem>
                                <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                                <SelectItem value="IN_REVIEW">IN_REVIEW</SelectItem>
                                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                    </div>

                    {/* Method */}
                    <div>
                        <Label>Method</Label>
                        <Select
                            value={followUpMethod}
                            onValueChange={(val) =>
                                setValue("followUpMethod", val, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.followUpMethod && <p className="text-xs text-red-500">{errors.followUpMethod.message}</p>}
                    </div>

                    {/* Purpose */}
                    <div className="col-span-2">
                        <Label>Purpose</Label>
                        <Input {...register("purpose")} placeholder="Enter purpose" />
                        {errors.purpose && <p className="text-xs text-red-500">{errors.purpose.message}</p>}
                    </div>

                    {/* Assigned */}
                    <div>
                        <Label>Assigned To</Label>
                        <Combobox
                            options={userOptions}
                            value={watch("assignedTo")}
                            onValueChange={(value) => setValue("assignedTo", value, { shouldValidate: true })}
                            placeholder="Search and select a user..."
                            disabled={isSubmitting}
                            className={errors.assignedTo ? "border-destructive" : ""}
                        />
                        {errors.assignedTo && <p className="text-xs text-red-500">{errors.assignedTo.message}</p>}
                    </div>

                    {/* Created */}
                    <div>
                        <Label>Created By</Label>
                        <Input {...register("createdBy")} />
                        {errors.createdBy && <p className="text-xs text-red-500">{errors.createdBy.message}</p>}
                    </div>

                    {/* Date ✅ FIXED */}
                    <div className="col-span-2">
                        <Label>Date</Label>
                        <DatePicker
                            value={date} // ✅ string value
                            onChange={(val: string) =>
                                setValue("scheduled_at", val, { shouldValidate: true })
                            }
                            disabled={isSubmitting}
                        />
                        {errors.scheduled_at && <p className="text-xs text-red-500">{errors.scheduled_at.message}</p>}
                    </div>

                </div>
            </form>
        </Modal>
    );
};

export default FollowUpModal;
