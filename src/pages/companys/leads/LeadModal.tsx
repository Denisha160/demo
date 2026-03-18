import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { PipelineColumn } from "../../../types/leads";
import { Tag, Plus } from "lucide-react";
import { z } from "zod";

const leadValidationSchema = z.object({
    status: z.string().min(1, { message: "Status is required" }),
    source: z.string().min(1, { message: "Source is required" }),
    title: z.string().min(1, { message: "Name is required" }),
});

interface LeadModalProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    addModalCol: string | null;
    columns: PipelineColumn[];
    newDeal: { title: string; company: string; value: string; contact: string };
    setNewDeal: (deal: { title: string; company: string; value: string; contact: string }) => void;
}

const LeadModal = ({ open, onClose, onSave, addModalCol, columns, newDeal, setNewDeal }: LeadModalProps) => {

    const [status, setStatus] = useState("");
    const [source, setSource] = useState("");
    const [assigned, setAssigned] = useState("charley");
    const [country, setCountry] = useState("");
    const [language, setLanguage] = useState("system");
    const [errors, setErrors] = useState<{ status?: string, source?: string, title?: string }>({});

    useEffect(() => {
        if (open) {
            setStatus("");
            setSource("");
            setAssigned("charley");
            setCountry("");
            setLanguage("system");
            setErrors({});
        }
    }, [open]);

    const handleSave = () => {
        const result = leadValidationSchema.safeParse({ status, source, title: newDeal.title });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                newErrors[issue.path[0] as string] = issue.message;
            });
            setErrors(newErrors);
            return;
        }
        setErrors({});
        onSave();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create Lead"
            description={addModalCol ? `Stage: ${columns.find((c) => c.id === addModalCol)?.title}` : ""}
            headerBg="bg-primary/5"
            maxWidth="sm:max-w-[800px] md:max-w-[900px]"
            titleClassName="text-primary font-bold"
            footer={
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="h-9 px-6 text-xs font-semibold rounded-sm" onClick={onClose}>Cancel</Button>
                    <Button size="sm" className="h-9 px-8 text-xs font-semibold rounded-sm" onClick={handleSave}>Save Lead</Button>
                </div>
            }
        >
            <div className="space-y-6 pt-2 h-[60vh] overflow-y-auto pr-2 custom-scrollbar">

                {/* Top Row: Status, Source, Assigned */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5 flex flex-col w-full">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                            <span className="text-destructive">*</span> Status
                        </Label>
                        <div className="flex gap-1.5">
                            <div className="flex-1 w-full min-w-0 flex">
                                <Combobox
                                    options={[
                                        { value: "new", label: "New" },
                                        { value: "contacted", label: "Contacted" },
                                        { value: "qualified", label: "Qualified" },
                                    ]}
                                    value={status}
                                    onValueChange={(val) => { setStatus(val); if (errors.status) setErrors({ ...errors, status: undefined }); }}
                                    placeholder="Select Status"
                                    className={`h-9 w-full ${errors.status ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.status && <p className="text-[10px] text-destructive m-0 mt-0.5">{errors.status}</p>}
                    </div>

                    <div className="space-y-1.5 flex flex-col w-full">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                            <span className="text-destructive">*</span> Source
                        </Label>
                        <div className="flex gap-1.5">
                            <div className="flex-1 w-full min-w-0 flex">
                                <Combobox
                                    options={[
                                        { value: "organic", label: "Organic Search" },
                                        { value: "referral", label: "Referral" },
                                        { value: "social", label: "Social Media" },
                                    ]}
                                    value={source}
                                    onValueChange={(val) => { setSource(val); if (errors.source) setErrors({ ...errors, source: undefined }); }}
                                    placeholder="Select Source"
                                    className={`h-9 w-full ${errors.source ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                                />
                            </div>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.source && <p className="text-[10px] text-destructive m-0 mt-0.5">{errors.source}</p>}
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Assigned
                        </Label>
                        <Combobox
                            options={[
                                { value: "charley", label: "Charley Dicki" },
                                { value: "john", label: "John Doe" },
                                { value: "jane", label: "Jane Smith" },
                            ]}
                            value={assigned}
                            onValueChange={setAssigned}
                            placeholder="Select User"
                            className="h-9 w-full"
                        />
                    </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                    <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2">
                        <Tag className="h-4 w-4 text-muted-foreground" /> Tags
                    </Label>
                    <div className="relative">
                        <Input
                            placeholder="Tag"
                            className="h-9 text-sm border-0 border-l-[3px] border-primary rounded-none shadow-none focus-visible:ring-0 bg-transparent pl-3"
                        />
                    </div>
                </div>

                {/* Details Grid (12 Mobile, 6 per side Desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 pt-4 border-t border-border/40">

                    {/* Name */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                            <span className="text-destructive">*</span> Name
                        </Label>
                        <Input
                            value={newDeal.title}
                            onChange={(e) => {
                                setNewDeal({ ...newDeal, title: e.target.value });
                                if (errors.title) setErrors({ ...errors, title: undefined });
                            }}
                            className={`h-9 text-xs border-border/60 ${errors.title ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                        />
                        {errors.title && <p className="text-[10px] text-destructive m-0 mt-0.5">{errors.title}</p>}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Email Address
                        </Label>
                        <Input
                            type="email"
                            value={newDeal.contact}
                            onChange={(e) => setNewDeal({ ...newDeal, contact: e.target.value })}
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Phone
                        </Label>
                        <Input
                            type="tel"
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Alternative Phone Number */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Alternative Phone Number
                        </Label>
                        <Input
                            type="tel"
                            className="h-9 text-xs border-border/60"
                        />
                    </div>


                    {/* City */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            City
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* State */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            State
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Country */}
                    <div className="space-y-1.5 flex flex-col min-w-0">
                        <Label className="text-xs font-bold text-foreground">
                            Country
                        </Label>
                        <div className="w-full flex">
                            <Combobox
                                options={[
                                    { value: "in", label: "India" },
                                    { value: "us", label: "United States" },
                                    { value: "uk", label: "United Kingdom" },
                                    { value: "ca", label: "Canada" },
                                ]}
                                value={country}
                                onValueChange={setCountry}
                                placeholder="Select Country"
                                className="h-9 w-full"
                            />
                        </div>
                    </div>

                    {/* Language */}
                    <div className="space-y-1.5 flex flex-col min-w-0">
                        <Label className="text-xs font-bold text-foreground">
                            Language
                        </Label>
                        <div className="w-full flex">
                            <Combobox
                                options={[
                                    { value: "system", label: "System Default" },
                                    { value: "en", label: "English" },
                                    { value: "es", label: "Spanish" },
                                    { value: "fr", label: "French" },
                                ]}
                                value={language}
                                onValueChange={setLanguage}
                                placeholder="Select Language"
                                className="h-9 w-full"
                            />
                        </div>
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Pincode
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Company Name */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Company Name
                        </Label>
                        <Input
                            value={newDeal.company}
                            onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Designation */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Designation
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            Website
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* GST Number */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            GST Number
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* PAN Number */}
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground">
                            PAN Number
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60 uppercase"
                        />
                    </div>


                    {/* Address Line 1 */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                        <Label className="text-xs font-bold text-foreground">
                            Address Line 1
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div className="space-y-1.5 flex flex-col md:col-span-2">
                        <Label className="text-xs font-bold text-foreground">
                            Address Line 2
                        </Label>
                        <Input
                            className="h-9 text-xs border-border/60"
                        />
                    </div>

                </div>
            </div>
        </Modal>
    );
};

export default LeadModal;
