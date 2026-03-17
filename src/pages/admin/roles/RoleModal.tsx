import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Role } from "@/types/Role";


const roleSchema = z.object({
    name: z.string().min(2, "Role Name must be at least 2 characters"),
    description: z.string().optional(),
});

interface RoleModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (roleData: Partial<Role>) => void;
    role: Role | null;
}

const RoleModal = ({ open, onClose, onSave, role }: RoleModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description);
        } else {
            setName("");
            setDescription("");
        }
    }, [role, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            roleSchema.parse({ name, description });
            setErrors({});
            onSave({
                name,
                description
            });
            onClose();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary"
            title={role ? "Edit Role" : "Add New Role"}
            description={role ? "Update role details below" : "Fill in the role details below"}
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-sm text-sm h-8" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-sm text-sm h-8" onClick={handleSubmit}>
                        {role ? "Save Changes" : "Create Role"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        placeholder="e.g. HR Manager"
                        className={`h-9 text-sm rounded-sm ${errors.name ? "border-destructive" : ""}`}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            if (errors.description) setErrors({ ...errors, description: "" });
                        }}
                        placeholder="Describe what this role can do..."
                        className={`min-h-[100px] text-sm rounded-sm resize-none ${errors.description ? "border-destructive" : ""}`}
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>
            </form>
        </Modal>
    );
};

export default RoleModal;
