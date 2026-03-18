import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PipelineColumn } from "../../../types/leads";
import { Tag, Plus } from "lucide-react";
import { z } from "zod";

const leadValidationSchema = z.object({
    status: z.string().refine(val => val !== "nothing", { message: "Status is required" }),
    source: z.string().refine(val => val !== "nothing", { message: "Source is required" }),
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

    const [status, setStatus] = useState("nothing");
    const [source, setSource] = useState("nothing");
    const [errors, setErrors] = useState<{ status?: string, source?: string, title?: string }>({});

    useEffect(() => {
        if (open) {
            setStatus("nothing");
            setSource("nothing");
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
                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                            <span className="text-destructive">*</span> Status
                        </Label>
                        <div className="flex gap-1.5">
                            <Select value={status} onValueChange={(val) => { setStatus(val); if (errors.status) setErrors({ ...errors, status: undefined }); }}>
                                <SelectTrigger className={`h-9 text-xs border-border/60 bg-background flex-1 ${status === 'nothing' ? 'text-muted-foreground' : 'text-foreground'} ${errors.status ? 'border-destructive focus:ring-destructive/20' : ''}`}>
                                    <SelectValue placeholder="Nothing selected" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nothing">Nothing selected</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.status && <p className="text-[10px] text-destructive m-0 mt-0.5">{errors.status}</p>}
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1">
                            <span className="text-destructive">*</span> Source
                        </Label>
                        <div className="flex gap-1.5">
                            <Select value={source} onValueChange={(val) => { setSource(val); if (errors.source) setErrors({ ...errors, source: undefined }); }}>
                                <SelectTrigger className={`h-9 text-xs border-border/60 bg-background flex-1 ${source === 'nothing' ? 'text-muted-foreground' : 'text-foreground'} ${errors.source ? 'border-destructive focus:ring-destructive/20' : ''}`}>
                                    <SelectValue placeholder="Nothing selected" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nothing">Nothing selected</SelectItem>
                                    <SelectItem value="organic">Organic Search</SelectItem>
                                    <SelectItem value="referral">Referral</SelectItem>
                                    <SelectItem value="social">Social Media</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <Select defaultValue="charley">
                            <SelectTrigger className="h-9 text-xs border-border/60 bg-background w-full">
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="charley">Charley Dicki</SelectItem>
                                <SelectItem value="john">John Doe</SelectItem>
                                <SelectItem value="jane">Jane Smith</SelectItem>
                            </SelectContent>
                        </Select>
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

                {/* 2-Column Details Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 pt-4 border-t border-border/40">

                    {/* LEFT COLUMN */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Position
                            </Label>
                            <Input
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Website
                            </Label>
                            <Input
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Phone
                            </Label>
                            <Input
                                type="tel"
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Lead value
                            </Label>
                            <div className="flex">
                                <Input
                                    value={newDeal.value.replace('₹', '')}
                                    onChange={(e) => {
                                        const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
                                        setNewDeal({ ...newDeal, value: cleanVal ? `₹${cleanVal}` : '' });
                                    }}
                                    className="h-9 text-xs border-border/60 rounded-r-none border-r-0 focus-visible:z-10"
                                />
                                <div className="h-9 px-3 flex items-center justify-center border border-border/60 bg-muted/20 rounded-r-sm text-xs font-medium text-muted-foreground shrink-0">
                                    $
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Company
                            </Label>
                            <Input
                                value={newDeal.company}
                                onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Description
                            </Label>
                            <Textarea
                                className="min-h-[100px] text-xs border-border/60 resize-none shadow-sm"
                            />
                        </div>

                        <div className="flex items-center gap-6 pt-2 pb-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="public" className="border-border/60" />
                                <Label htmlFor="public" className="text-xs font-bold cursor-pointer">
                                    Public
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="contacted" defaultChecked className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                                <Label htmlFor="contacted" className="text-xs font-bold cursor-pointer">
                                    Contacted Today
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Address
                            </Label>
                            <Textarea
                                className="min-h-[72px] text-xs border-border/60 resize-none shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                City
                            </Label>
                            <Input
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                State
                            </Label>
                            <Input
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Country
                            </Label>
                            <Select defaultValue="nothing">
                                <SelectTrigger className="h-9 text-xs border-border/60 bg-background text-muted-foreground w-full">
                                    <SelectValue placeholder="Nothing selected" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nothing">Nothing selected</SelectItem>
                                    <SelectItem value="us">United States</SelectItem>
                                    <SelectItem value="uk">United Kingdom</SelectItem>
                                    <SelectItem value="in">India</SelectItem>
                                    <SelectItem value="ca">Canada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Zip Code
                            </Label>
                            <Input
                                className="h-9 text-xs border-border/60"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-foreground">
                                Default Language
                            </Label>
                            <Select defaultValue="system">
                                <SelectTrigger className="h-9 text-xs border-border/60 bg-background text-foreground w-full">
                                    <SelectValue placeholder="System Default" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">System Default</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>
            </div>
        </Modal>
    );
};

export default LeadModal;
