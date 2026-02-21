import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";

interface Contact {
    id: number;
    name: string;
    email: string;
    company: string;
    phone: string;
    status: string;
    lastContact: string;
}

interface ContactDetailProps {
    contact: Contact | null;
    onClose: () => void;
}

const ContactDetail = ({ contact, onClose }: ContactDetailProps) => {
    return (
        <Modal
            open={!!contact}
            onClose={onClose}
            title={contact?.name || ""}
            description={contact?.company}
            footer={
                <Button variant="outline" size="sm" className="rounded-sm text-sm h-8" onClick={onClose}>
                    Close
                </Button>
            }
        >
            {contact && (
                <div className="space-y-2">
                    {[
                        { label: "Email", value: contact.email },
                        { label: "Phone", value: contact.phone },
                        { label: "Company", value: contact.company },
                        { label: "Status", value: contact.status },
                        { label: "Last Contact", value: contact.lastContact },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                            <span className="text-sm text-muted-foreground">{row.label}</span>
                            <span className="text-sm text-foreground font-medium">{row.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default ContactDetail;
