import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Salesman {
    id: number;
    name: string;
    email: string;
    phone: string;
    region: string;
    status: string;
}

interface SalesmanModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<Salesman, 'id'>) => void;
    salesman: Salesman | null;
}

const SalesmanModal = ({ open, onClose, onSave, salesman }: SalesmanModalProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [region, setRegion] = useState("");

    useEffect(() => {
        if (salesman) {
            setName(salesman.name);
            setEmail(salesman.email);
            setPhone(salesman.phone);
            setRegion(salesman.region);
        } else {
            setName("");
            setEmail("");
            setPhone("");
            setRegion("");
        }
    }, [salesman, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            email,
            phone,
            region,
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
            title={salesman ? "Edit Salesman" : "Add New Salesman"}
            description={salesman ? "Update salesman profile" : "Create a new salesman profile"}
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" className="h-8 text-xs rounded-sm" onClick={handleSubmit}>
                        {salesman ? "Save Changes" : "Create Salesman"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Michael Scott"
                            required
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="michael@company.com"
                            required
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="region" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Region / Territory</Label>
                        <Input
                            id="region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            placeholder="e.g. North East"
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default SalesmanModal;
