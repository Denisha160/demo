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

const followUpSchema = z.object({
    status: z.string().min(1, "Status is required"),
    followUpMethod: z.string().min(1, "Follow up method is required"),
    purpose: z.string().min(1, "Purpose is required"),
    assignedTo: z.string().min(1, "Assigned to is required"),
    createdBy: z.string().min(1, "Created by is required"),
    date: z.string().optional(),
});

export type FollowUpFormData = z.infer<typeof followUpSchema>;

export interface FollowUp extends FollowUpFormData {
    id: string;
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
            status: "Pending",
            followUpMethod: "Call",
            purpose: "",
            assignedTo: "",
            createdBy: "",
            date: new Date().toISOString().split("T")[0],
        }
    });

    useEffect(() => {
        if (open) {
            if (isEditing && followUpData) {
                reset(followUpData);
            } else {
                reset({
                    status: "Pending",
                    followUpMethod: "Call",
                    purpose: "",
                    assignedTo: "",
                    createdBy: "",
                    date: new Date().toISOString().split("T")[0],
                });
            }
        }
    }, [open, isEditing, followUpData, reset]);

    const handleFormSubmit = (data: FollowUpFormData) => {
        onSave(data, setError);
    };

    const status = watch("status");
    const followUpMethod = watch("followUpMethod");
    const date = watch("date"); // ✅ important

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
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                        <Input {...register("assignedTo")} />
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
                                setValue("date", val, { shouldValidate: true })
                            }
                            disabled={isSubmitting}
                        />
                        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                    </div>

                </div>
            </form>
        </Modal>
    );
};

export default FollowUpModal;
