import { useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

interface LoanModalProps {
    open: boolean;
    onClose: () => void;
    employeeName: string;
    employeeId: string | number;
}

const LoanModal = ({ open, onClose, employeeName, employeeId }: LoanModalProps) => {
    const [formData, setFormData] = useState({
        type: "Personal Loan",
        amount: "",
        tenure: "12",
        interest: "0"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle loan assignment logic here
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/5"
            titleClassName="text-primary uppercase tracking-widest text-[10px] font-black"
            maxWidth="sm:max-w-[450px]"
            title={`Assign Loan - ${employeeName}`}
            description={`Create a new loan record for EMP-${employeeId}`}
            footer={
                <>
                    <Button variant="outline" size="sm" className="rounded-sm text-xs h-8" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-sm text-xs h-8 bg-primary" onClick={handleSubmit}>
                        Assign Loan
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Loan Type</Label>
                    <Combobox
                        options={[
                            { value: "Personal Loan", label: "Personal Loan" },
                            { value: "Advance Salary", label: "Advance Salary" },
                            { value: "Medical Loan", label: "Medical Loan" },
                            { value: "Education Loan", label: "Education Loan" },
                        ]}
                        value={formData.type}
                        onValueChange={(v) => setFormData({ ...formData, type: v })}
                        placeholder="Select loan type"
                        searchPlaceholder="Search loan type..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Loan Amount (₹)</Label>
                        <Input
                            type="number"
                            placeholder="50000"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="h-9 text-xs rounded-sm"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Tenure (Months)</Label>
                        <Input
                            type="number"
                            placeholder="12"
                            value={formData.tenure}
                            onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                            className="h-9 text-xs rounded-sm"
                            required
                        />
                    </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-sm border border-border/50">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Estimated EMI</p>
                    <p className="text-lg font-bold text-foreground">
                        ₹{formData.amount && formData.tenure
                            ? (Number(formData.amount) / Number(formData.tenure)).toLocaleString(undefined, { maximumFractionDigits: 0 })
                            : "0"}
                        <span className="text-[10px] font-normal text-muted-foreground lowercase ml-1">/ month</span>
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default LoanModal;
