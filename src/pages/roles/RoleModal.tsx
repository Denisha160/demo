import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Role {
    id: number;
    name: string;
    description: string;
    status: string;
}

interface RoleModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (roleData: Omit<Role, 'id'>) => void;
    role: Role | null;
}

const RoleModal = ({ open, onClose, onSave, role }: RoleModalProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

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
        onSave({
            name,
            description,
            status: "Active"
        });
        onClose();
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
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. HR Manager"
                        required
                        className="h-9 text-sm rounded-sm"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what this role can do..."
                        className="min-h-[100px] text-sm rounded-sm resize-none"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default RoleModal;
