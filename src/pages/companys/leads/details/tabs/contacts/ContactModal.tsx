import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Modal from "@/components/Modal";
interface Contact {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    notes: string;
    active: boolean;
}

interface ContactModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (contact: Contact) => void;
}

const ContactModal = ({ open, onClose, onSave }: ContactModalProps) => {
    const [form, setForm] = useState<Contact>({
        id: "",
        fullName: "",
        email: "",
        phone: "",
        designation: "",
        department: "",
        notes: "",
        active: true,
    });

    const handleChange = (key: keyof Contact, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (!form.fullName) return;

        const newContact = {
            ...form,
            id: Date.now().toString(),
        };

        onSave(newContact);

        // reset form
        setForm({
            id: "",
            fullName: "",
            email: "",
            phone: "",
            designation: "",
            department: "",
            notes: "",
            active: true,
        });

        onClose();
    };

    return (

        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            maxWidth="sm:max-w-[700px]"
            titleClassName="text-primary"
            title={"Add Contact"}
            description={`Enter your contact details below to add it to your system.`}
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-sm text-sm h-8" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        type="submit"
                        form="account-form"
                        size="sm"
                        className="rounded-sm text-sm h-8 gap-1.5"
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>

                </div>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <Label>Full Name *</Label>
                    <Input
                        value={form.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Email</Label>
                    <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Phone</Label>
                    <Input
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Designation</Label>
                    <Input
                        value={form.designation}
                        onChange={(e) => handleChange("designation", e.target.value)}
                    />
                </div>

                <div>
                    <Label>Department</Label>
                    <Input
                        value={form.department}
                        onChange={(e) => handleChange("department", e.target.value)}
                    />
                </div>

                <div className="col-span-2">
                    <Label>Notes</Label>
                    <Input
                        value={form.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                    />
                </div>
            </div>
        </Modal>




    );
};

export default ContactModal;
