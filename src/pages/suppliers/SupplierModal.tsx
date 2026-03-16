import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";

export interface Supplier {
    id: number;
    name: string;
    category: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    paymentTerms: string;
    status: string;
    totalProcurement: string;
    reliabilityScore: number;
}

interface SupplierModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<Supplier, 'id' | 'totalProcurement' | 'reliabilityScore'>) => void;
    supplier: Supplier | null;
}

const SupplierModal = ({ open, onClose, onSave, supplier }: SupplierModalProps) => {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        paymentTerms: "Net 30",
        status: "Active"
    });

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                category: supplier.category,
                contactPerson: supplier.contactPerson,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
                gstNumber: supplier.gstNumber,
                paymentTerms: supplier.paymentTerms,
                status: supplier.status
            });
        } else {
            setFormData({
                name: "",
                category: "",
                contactPerson: "",
                email: "",
                phone: "",
                address: "",
                gstNumber: "",
                paymentTerms: "Net 30",
                status: "Active"
            });
        }
    }, [supplier, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary"
            title={supplier ? "Edit Supplier" : "Add New Supplier"}
            description={supplier ? "Update supplier profile and terms" : "Onboard a new supplier to the CRM"}
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" className="h-8 text-xs rounded-sm" onClick={handleSubmit}>
                        {supplier ? "Save Changes" : "Create Supplier"}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supplier Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Acme Manufacturing"
                            required
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                        <Combobox
                            options={[
                                { value: "Raw Materials", label: "Raw Materials" },
                                { value: "Electronics", label: "Electronics" },
                                { value: "Furniture", label: "Furniture" },
                                { value: "Logistics", label: "Logistics" },
                                { value: "Packaging", label: "Packaging" },
                            ]}
                            value={formData.category}
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                            placeholder="Select category"
                            searchPlaceholder="Search category..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Person</Label>
                        <Input
                            id="contactPerson"
                            value={formData.contactPerson}
                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            placeholder="e.g. Robert Smith"
                            required
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gstNumber" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">GST Number</Label>
                        <Input
                            id="gstNumber"
                            value={formData.gstNumber}
                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                            placeholder="27AAAAA0000A1Z5"
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="sales@acme.com"
                            required
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="h-9 text-sm rounded-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Terms</Label>
                        <Combobox
                            options={[
                                { value: "Immediate", label: "Immediate" },
                                { value: "Net 15", label: "Net 15" },
                                { value: "Net 30", label: "Net 30" },
                                { value: "Net 60", label: "Net 60" },
                            ]}
                            value={formData.paymentTerms}
                            onValueChange={(val) => setFormData({ ...formData, paymentTerms: val })}
                            placeholder="Select terms"
                            searchPlaceholder="Search terms..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
                        <Combobox
                            options={[
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" },
                                { value: "On Hold", label: "On Hold" },
                            ]}
                            value={formData.status}
                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                            placeholder="Select status"
                            searchPlaceholder="Search status..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Office Address</Label>
                    <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full office or warehouse address"
                        className="min-h-[80px] text-sm rounded-sm resize-none"
                    />
                </div>
            </form>
        </Modal>
    );
};

export default SupplierModal;
