import { useMemo } from "react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBOMDetails } from "@/hooks/useBom";
import { 
    Loader2, 
    Calculator, 
    TrendingUp, 
    ChevronRight,
    FlaskConical,
    AlertCircle
} from "lucide-react";

interface BatchBomModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
}

const BatchBomModal = ({ isOpen, onClose, productId, productName }: BatchBomModalProps) => {
    const { data: bomDetails, isLoading } = useBOMDetails(productId);

    const totalCost = useMemo(() => {
        if (!bomDetails?.raw_materials) return 0;
        return bomDetails.raw_materials.reduce((sum, m) => sum + ((m.raw_quantity || 0) * (m.cost_price || 0)), 0);
    }, [bomDetails]);

    const sellingPrice = bomDetails?.finished_product?.selling_price || 0;
    const profit = sellingPrice - totalCost;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            headerBg="bg-primary/10"
            titleClassName="text-primary font-bold"
            maxWidth="sm:max-w-[750px]"
            title="Manufacturing Recipe (BOM)"
            description={`Viewing ingredients for ${productName}`}
            footer={
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-sm text-xs h-8"
                    onClick={onClose}
                >
                    Close
                </Button>
            }
        >
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                        <p className="text-xs text-muted-foreground animate-pulse font-medium tracking-wide uppercase">Fetching recipe details...</p>
                    </div>
                ) : !bomDetails ? (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-muted/20 border border-dashed rounded-lg">
                        <AlertCircle className="h-8 w-8 text-muted-foreground opacity-30" />
                        <div className="text-center">
                            <p className="text-sm font-semibold text-foreground">No Recipe Found</p>
                            <p className="text-xs text-muted-foreground">This product doesn't have a configured Bill of Materials.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="border rounded-md overflow-hidden bg-card/30 backdrop-blur-sm shadow-inner overflow-x-auto">
                            <table className="w-full text-xs min-w-[500px]">
                                <thead className="bg-secondary/50 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Raw Material</th>
                                        <th className="px-4 py-3 text-center">Batch Qty</th>
                                        <th className="px-4 py-3 text-center">Unit</th>
                                        <th className="px-4 py-3 text-right">Est. Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {bomDetails.raw_materials.map((m, index) => (
                                        <tr key={index} className="hover:bg-accent/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-foreground">{m.raw_product}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">#{m.raw_product_id.split('-')[0].toUpperCase()}</div>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">
                                                {m.raw_quantity.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="outline" className="text-[9px] font-bold rounded-sm bg-muted/30">
                                                    {m.raw_unit}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                                                ₹{((m.raw_quantity || 0) * (m.cost_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Cost Summary Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-4 bg-primary/5 rounded-md border border-primary/10 space-y-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <Calculator className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Material Cost</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold font-mono text-primary">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium italic">Per Finish Unit</span>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-md border border-border space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Selling Price</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold font-mono text-foreground">₹{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium italic text-emerald-600">Unit Price</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-md border space-y-2 ${profit >= 0 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-destructive/5 border-destructive/10'}`}>
                                <div className={`flex items-center gap-2 ${profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                                    <TrendingUp className={`h-4 w-4 ${profit < 0 ? 'rotate-180' : ''}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Margin ({margin.toFixed(1)}%)</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-lg font-bold font-mono ${profit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                                        {profit >= 0 ? '+' : ''}₹{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium italic">Profit/Unit</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-muted/10 rounded-lg border border-border/50">
                            <FlaskConical className="h-4 w-4 text-primary" />
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                This recipe defines the standard consumption of raw materials for producing <span className="font-bold text-foreground">1 single unit</span> of this finished good. 
                                Inventories will be deducted based on the batch quantity produced.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default BatchBomModal;
