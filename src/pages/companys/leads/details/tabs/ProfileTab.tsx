import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface LeadModalProps {
    newDeal: {
        title: string;
        company: string;
        value: string;
        contact: string;
    };
    setNewDeal: (deal: {
        title: string;
        company: string;
        value: string;
        contact: string;
    }) => void;
}

const ProfileTab = ({ newDeal }: LeadModalProps) => {
    return (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-6 w-full animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Lead Profile</h3>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        Status: New
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                        Source: Organic
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Basic Info</h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                            <p className="text-sm font-medium">{newDeal.title || "Jerde Inc"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Company</p>
                            <p className="text-sm font-medium">{newDeal.company || "Jerde Corporation"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                            <p className="text-sm font-medium">{newDeal.contact || "info@jerde.com"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                            <p className="text-sm font-medium">+1 234 567 890</p>
                        </div>
                    </div>
                </div>

                {/* Assignment & Location */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assignment & Locale</h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Assigned To</p>
                            <p className="text-sm font-medium">Charley Dicki</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Country</p>
                            <p className="text-sm font-medium">India</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Language</p>
                            <p className="text-sm font-medium">English (System)</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Website</p>
                            <p className="text-sm font-medium text-primary hover:underline cursor-pointer">https://jerde.com</p>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Additional Details</h4>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Designation</p>
                            <p className="text-sm font-medium">Senior Manager</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">GST / PAN</p>
                            <p className="text-sm font-medium">GSTIN1234567890 / ABCDE1234F</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Location</p>
                            <p className="text-sm font-medium">Mumbai, Maharashtra (400001)</p>
                        </div>
                    </div>
                </div>

                {/* Address - Full Width */}
                <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-border/50">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">Address</h4>
                    <p className="text-sm font-medium">
                        123 Business Avenue, Suite 100, Tech City, Building 4, North Wing
                    </p>
                </div>

                {/* Tags */}
                <div className="md:col-span-2 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-3">
                        <Tag size={14} className="text-muted-foreground" />
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {["Priority", "Follow-up", "Tech", "Enterprise"].map((tag, i) => (
                            <span key={i} className="px-2.5 py-1 text-[11px] font-semibold bg-muted text-muted-foreground rounded-md uppercase tracking-tight">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
                <Button variant="outline" size="sm">Edit Lead Information</Button>
            </div>
        </div>
    );
};

export default ProfileTab;
