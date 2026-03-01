import { useState } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { TrendingUp, Wallet } from "lucide-react";

interface SalaryModalProps {
    open: boolean;
    onClose: () => void;
    employeeName: string;
    employeeId: string | number;
}

const SalaryModal = ({ open, onClose, employeeName, employeeId }: SalaryModalProps) => {
    const [selectedMonth, setSelectedMonth] = useState("February");
    const [selectedYear, setSelectedYear] = useState("2024");

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const years = ["2023", "2024", "2025"];

    const baseSalary = 120000;
    const hra = baseSalary * 0.2;
    const allowance = 5000;
    const pf = baseSalary * 0.12;
    const loanEmi = 5000;
    const tax = baseSalary * 0.1;

    const totalEarnings = baseSalary + hra + allowance;
    const totalDeductions = pf + loanEmi + tax;
    const netPay = totalEarnings - totalDeductions;

    const handleSubmit = () => {
        // Handle processing logic here
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/5"
            titleClassName="text-primary uppercase tracking-widest text-[10px] font-black"
            maxWidth="sm:max-w-[500px]"
            title={`Process Salary - ${employeeName}`}
            description={`Generate payroll for employee ID: EMP-${employeeId}`}
            footer={
                <>
                    <Button variant="outline" size="sm" className="rounded-sm text-xs h-8" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" className="rounded-sm text-xs h-8 bg-primary" onClick={handleSubmit}>
                        Complete Process
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Select Month</label>
                        <Combobox
                            options={months.map(m => ({ value: m, label: m }))}
                            value={selectedMonth}
                            onValueChange={setSelectedMonth}
                            placeholder="Select month"
                            searchPlaceholder="Search month..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground">Select Year</label>
                        <Combobox
                            options={years.map(y => ({ value: y, label: y }))}
                            value={selectedYear}
                            onValueChange={setSelectedYear}
                            placeholder="Select year"
                            searchPlaceholder="Search year..."
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-3 rounded-sm border border-border bg-muted/20">
                        <h4 className="text-[10px] font-bold uppercase tracking-tight text-foreground border-b border-border pb-2 flex items-center gap-2 mb-2">
                            <TrendingUp className="h-3 w-3 text-primary" /> Earnings
                        </h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs"><span>Basic Pay</span><span className="font-semibold">₹{baseSalary.toLocaleString()}</span></div>
                            <div className="flex justify-between text-[11px] text-muted-foreground"><span>HRA</span><span>₹{hra.toLocaleString()}</span></div>
                            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Allowances</span><span>₹{allowance.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="p-3 rounded-sm border border-border bg-red-50/10">
                        <h4 className="text-[10px] font-bold uppercase tracking-tight text-destructive border-b border-border/50 pb-2 flex items-center gap-2 mb-2">
                            <Wallet className="h-3 w-3" /> Deductions
                        </h4>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs"><span>EPF (12%)</span><span className="font-semibold">- ₹{pf.toLocaleString()}</span></div>
                            <div className="flex justify-between text-[11px] text-destructive"><span>Loan EMI</span><span>- ₹{loanEmi.toLocaleString()}</span></div>
                            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Income Tax</span><span>- ₹{tax.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="p-4 rounded-sm bg-primary/10 border border-primary/20 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold uppercase text-primary">Final Net Pay</p>
                            <p className="text-xl font-black text-foreground">₹{netPay.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SalaryModal;
