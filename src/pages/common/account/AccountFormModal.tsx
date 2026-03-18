import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Hash, MapPin, User, IndianRupee, Landmark } from "lucide-react";
import Modal from "@/components/Modal";
import { BankAccount } from "./AccountPage";

const accountSchema = z.object({
    accountName: z.string().min(1, "Account name is required"),
    accountHolderName: z.string().min(1, "Account holder name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    accountType: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    ifscCode: z.string().optional(),
    upiId: z.string().optional(),
    openingBalance: z.coerce.number().optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormModalProps {
    open: boolean;
    onClose: () => void;
    accountData?: BankAccount | null;
    isEditing?: boolean;
    onSave: (data: AccountFormData) => void;
}

const AccountFormModal = ({ open, onClose, accountData, isEditing = false, onSave }: AccountFormModalProps) => {

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors }
    } = useForm<AccountFormData>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            accountName: "",
            accountHolderName: "",
            accountNumber: "",
            accountType: "Savings",
            bankName: "",
            branchName: "",
            ifscCode: "",
            upiId: "",
            openingBalance: 0
        }
    });

    useEffect(() => {
        if (open) {
            if (isEditing && accountData) {
                reset({
                    accountName: accountData.accountName,
                    accountHolderName: accountData.accountHolderName,
                    accountNumber: accountData.accountNumber,
                    accountType: accountData.accountType,
                    bankName: accountData.bankName,
                    branchName: accountData.branchName,
                    ifscCode: accountData.ifscCode,
                    upiId: accountData.upiId,
                    openingBalance: accountData.openingBalance
                });
            } else {
                reset({
                    accountName: "",
                    accountHolderName: "",
                    accountNumber: "",
                    accountType: "Savings",
                    bankName: "",
                    branchName: "",
                    ifscCode: "",
                    upiId: "",
                    openingBalance: 0
                });
            }
        }
    }, [open, isEditing, accountData, reset]);

    const handleFormSubmit = (data: AccountFormData) => {
        onSave(data);
    };

    const accountType = watch("accountType");

    return (
        <Modal
            open={open}
            onClose={onClose}
            headerBg="bg-primary/10"
            maxWidth="sm:max-w-[700px]"
            titleClassName="text-primary"
            title={isEditing ? "Edit Bank Account" : "Add Bank Account"}
            description={`Enter your bank account details below to ${isEditing ? 'update' : 'add'} it to your system.`}
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
                    >
                        {isEditing ? "Update Account" : "Add Account"}
                    </Button>

                </div>
            }
        >
            <form id="account-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Account Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Account Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.accountName ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("accountName")}
                                placeholder="Enter account name"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm font-medium ${errors.accountName ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.accountName && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.accountName.message}</p>}
                    </div>

                    {/* Account Holder Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Account Holder Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.accountHolderName ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("accountHolderName")}
                                placeholder="Enter account holder name"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.accountHolderName ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.accountHolderName && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.accountHolderName.message}</p>}
                    </div>

                    {/* Account Number */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Account Number <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                            <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.accountNumber ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("accountNumber")}
                                placeholder="Enter account number"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.accountNumber ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.accountNumber && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.accountNumber.message}</p>}
                    </div>

                    {/* Account Type */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Account Type
                        </Label>
                        <Select value={accountType} onValueChange={(val) => setValue("accountType", val, { shouldValidate: true })}>
                            <SelectTrigger className={`h-9 ${errors.accountType ? 'border-destructive focus:ring-destructive/20' : 'border-border'}`}>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Savings">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Landmark className="h-3.5 w-3.5 text-muted-foreground/80" /> Savings
                                    </div>
                                </SelectItem>
                                <SelectItem value="Current">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Landmark className="h-3.5 w-3.5 text-muted-foreground/80" /> Current
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.accountType && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.accountType.message}</p>}
                    </div>

                    {/* Bank Name */}
                    <div className="space-y-1.5 xs:col-span-1">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Bank Name
                        </Label>
                        <div className="relative">
                            <Landmark className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.bankName ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("bankName")}
                                placeholder="Enter bank name"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.bankName ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.bankName && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.bankName.message}</p>}
                    </div>

                    {/* Branch Name */}
                    <div className="space-y-1.5 xs:col-span-1">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Branch Name
                        </Label>
                        <div className="relative">
                            <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.branchName ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("branchName")}
                                placeholder="Enter branch name"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.branchName ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.branchName && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.branchName.message}</p>}
                    </div>

                    {/* IFSC Code */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            IFSC Code
                        </Label>
                        <div className="relative">
                            <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.ifscCode ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("ifscCode")}
                                placeholder="Enter IFSC code"
                                className={`pl-9 h-9 uppercase border-border focus-visible:ring-primary/20 text-sm ${errors.ifscCode ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.ifscCode && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.ifscCode.message}</p>}
                    </div>

                    {/* UPI ID */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            UPI ID
                        </Label>
                        <div className="relative">
                            <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.upiId ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                {...register("upiId")}
                                placeholder="Enter UPI ID"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm ${errors.upiId ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.upiId && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.upiId.message}</p>}
                    </div>

                    {/* Opening Balance */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold flex items-center gap-1 text-foreground">
                            Opening Balance
                        </Label>
                        <div className="relative">
                            <IndianRupee className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.openingBalance ? 'text-destructive' : 'text-muted-foreground/60'}`} />
                            <Input
                                type="number"
                                step="any"
                                {...register("openingBalance")}
                                placeholder="0"
                                className={`pl-9 h-9 border-border focus-visible:ring-primary/20 text-sm font-medium ${errors.openingBalance ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                            />
                        </div>
                        {errors.openingBalance && <p className="text-[10px] text-destructive flex items-center gap-1 mt-1">{errors.openingBalance.message}</p>}
                    </div>
                </div>



            </form>
        </Modal>
    );
};

export default AccountFormModal;
