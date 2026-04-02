import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Activity, Plus, Loader2 } from "lucide-react";
import { useBOMDetails } from "@/hooks/useBom";
import BomModal from "@/pages/common/bom/components/BomModal";

interface RecipesTabProps {
  productId?: string;
  productType?: string;
  isNew: boolean;
  sellingPrice: number;
}

export const RecipesTab = ({ productId, productType, isNew, sellingPrice }: RecipesTabProps) => {
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const { data: bom, isLoading } = useBOMDetails(isNew ? undefined : productId);

  if (isNew) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border transition-all hover:bg-muted/20">
        <Box className="h-8 w-8 text-primary opacity-40 mb-3" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Save Product First</h3>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Recipes can only be defined once the product record is created. Please save your changes and return to this tab.
        </p>
      </div>
    );
  }

  if (productType === "RAW_MATERIAL") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border">
        <Activity className="h-8 w-8 text-muted-foreground opacity-30 mb-3" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Recipes Unavailable</h3>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Recipes are only applicable to <span className="text-primary font-bold">Finished Goods</span> and <span className="text-primary font-bold">Semi Finished Items</span>.
          Raw materials are used as components within recipes.
        </p>
      </div>
    );
  }

  const totalCost = bom?.raw_materials?.reduce((sum: number, m: any) => sum + m.raw_quantity * (m.cost_price || 0), 0) || 0;
  const profit = sellingPrice - totalCost;
  const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : !bom || !bom.raw_materials || bom.raw_materials.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center p-12 text-center bg-muted/5 rounded-sm border border-dashed border-border group hover:bg-muted/10 transition-all cursor-pointer"
          onClick={() => setIsBomModalOpen(true)}
        >
          <div className="h-12 w-12 bg-primary/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6 text-primary/40" />
          </div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">No Recipe Defined</h3>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
            This finished good doesn't have a Bill of Materials yet. Click to define the raw materials required for production.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-sm border border-primary/10 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Base Material Cost</p>
              <p className="text-xl font-bold font-mono text-primary">₹{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-sm border border-border/60 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selling Price</p>
              <p className="text-xl font-bold font-mono text-foreground">₹{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`p-4 rounded-sm border space-y-1 ${profit >= 0 ? "bg-emerald-500/5 border-emerald-500/10" : "bg-destructive/5 border-destructive/10"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>Est. Margin ({margin.toFixed(1)}%)</p>
              <p className={`text-xl font-bold font-mono ${profit >= 0 ? "text-emerald-600" : "text-destructive"}`}>{profit >= 0 ? "+" : ""}₹{profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-primary rounded-full"></div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Formula Ingredients</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBomModalOpen(true)}
                className="h-7 text-[10px] font-bold uppercase tracking-wider border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              >
                {bom ? "Manage Recipe" : "Create Recipe"}
              </Button>
            </div>
            <div className="rounded-sm border border-border/60 overflow-hidden shadow-inner bg-card">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground border-b border-border/60">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Material</th>
                    <th className="px-4 py-2.5 text-center w-[120px]">Quantity</th>
                    <th className="px-4 py-2.5 text-right w-[150px]">Cost Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {bom.raw_materials.map((m: any) => (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Box className="h-3 w-3 text-primary/60" />
                          </div>
                          <span className="font-semibold text-foreground">{m.raw_product}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="secondary" className="font-mono text-[10px] font-bold">{m.raw_quantity} {m.raw_unit}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary/80">₹{(m.raw_quantity * (m.cost_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <BomModal isOpen={isBomModalOpen} onClose={() => setIsBomModalOpen(false)} bomId={productId} />
    </div>
  );
};
