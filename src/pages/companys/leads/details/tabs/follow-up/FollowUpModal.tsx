import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, MessageSquare, ClipboardList, UserCheck, Settings } from "lucide-react";
import Modal from "@/components/Modal";

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
    onSave: (data: FollowUp) => void;
}

const FollowUpModal = ({ open, onClose, followUpData, isEditing = false, onSave }: FollowUpModalProps) => {
    const {
        register,
        handleSubmit,
        setValue,
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
            date: new Date().toISOString().split('T')[0],
        }
    });

    useEffect(() => {
        if (open) {
            if (isEditing && followUpData) {
                reset({
                    status: followUpData.status,
                    followUpMethod: followUpData.followUpMethod,
                    purpose: followUpData.purpose,
                    assignedTo: followUpData.assignedTo,
                    createdBy: followUpData.createdBy,
                    date: followUpData.date,
                });
            } else {
                reset({
                    status: "Pending",
                    followUpMethod: "Call",
                    purpose: "",
                    assignedTo: "",
                    createdBy: "",
                    date: new Date().toISOString().split('T')[0],
                });
            }
        }
    }, [open, isEditing, followUpData, reset]);

    const handleFormSubmit = (data: FollowUpFormData) => {
        const finalData: FollowUp = {
            ...data,
            id: followUpData?.id || Math.random().toString(36).substr(2, 9),
        };
        onSave(finalData);
        onClose();
    };

    const status = watch("status");
    const followUpMethod = watch("followUpMethod");

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            maxWidth="sm:max-w-[700px]"
            titleClassName="text-primary"
            title={isEditing ? "Edit Follow Up" : "Add Follow Up"}
            description={`Enter follow up details below to ${isEditing ? 'update' : 'add'} it.`}
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-sm text-sm h-8" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        type="submit"
                        form="follow-up-form"
                        size="sm"
                        className="rounded-sm text-sm h-8 gap-1.5"
                    >
                        {isEditing ? "Update Follow Up" : "Save Follow Up"}
                    </Button>
                </div>
            }
        >
            <form id="follow-up-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Status <span className="text-destructive">*</span>
                        </Label>
                        <Select value={status} onValueChange={(val) => setValue("status", val, { shouldValidate: true })}>
                            <SelectTrigger className={`h-9 ${errors.status ? 'border-destructive focus:ring-destructive/20' : 'border-border'}`}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.status.message}</p>}
                    </div>

                    {/* Follow up Method */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Follow Up Method <span className="text-destructive">*</span>
                        </Label>
                        <Select value={followUpMethod} onValueChange={(val) => setValue("followUpMethod", val, { shouldValidate: true })}>
                            <SelectTrigger className={`h-9 ${errors.followUpMethod ? 'border-destructive focus:ring-destructive/20' : 'border-border'}`}>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Call">Call</SelectItem>
                                <SelectItem value="Email">Email</SelectItem>
                                <SelectItem value="Meeting">Meeting</SelectItem>
                                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.followUpMethod && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.followUpMethod.message}</p>}
                    </div>

                    {/* Purpose */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Purpose <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <ClipboardList className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.purpose ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("purpose")}
                                placeholder="Enter purpose"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.purpose ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.purpose && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.purpose.message}</p>}
                    </div>

                    {/* Assigned To */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Assigned To <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <UserCheck className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.assignedTo ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("assignedTo")}
                                placeholder="Assign to user"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.assignedTo ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.assignedTo && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.assignedTo.message}</p>}
                    </div>

                    {/* Created By */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Created By <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.createdBy ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("createdBy")}
                                placeholder="Created by user"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.createdBy ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.createdBy && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.createdBy.message}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Date
                        </Label>
                        <div className="relative">
                            <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60`} />
                            <Input
                                type="date"
                                {...register("date")}
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm`}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default FollowUpModal;
