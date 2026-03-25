import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PartyModalProps {
  open: boolean;
  onClose: () => void;
}

const PartyModal = ({ open, onClose }: PartyModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Contact" // Keeping original title as per Parties.tsx
      description="Fill in the contact details below"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={onClose}
          >
            Save Contact
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        {[
          { id: "name", label: "Full Name", placeholder: "John Doe" },
          { id: "email", label: "Email", placeholder: "john@company.com" },
          { id: "company", label: "Company", placeholder: "Acme Corp" },
          { id: "phone", label: "Phone", placeholder: "+1 234-567-8900" },
        ].map((field) => (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
            </Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              className="h-8 text-sm rounded-sm"
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default PartyModal;
