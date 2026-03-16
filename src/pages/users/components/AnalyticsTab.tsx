import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const AnalyticsTab = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
            <div className="lg:col-span-2 space-y-2">
                <div className="p-5 border border-border rounded-sm bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <Package className="h-3 w-3 text-primary" /> Branding Workflow Tracking
                        </h3>
                        <Button variant="ghost" size="sm" className="h-6 text-[9px] px-2 font-bold uppercase tracking-tighter">View Stages &bull; 8 Total</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="p-4 bg-muted/30 border border-border rounded-sm">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Active Stage</p>
                            <p className="text-sm font-bold text-foreground">Material Quality Assurance</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm font-bold border border-amber-200">IN PROGRESS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsTab;
