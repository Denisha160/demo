import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Box, Layers, Plus, Trash2, Package, Loader2 } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import {
  useKitsByProduct,
  useKitList,
  useAssociateProductToKit,
  useDisassociateProductFromKit,
} from "@/hooks/useKits";
import { useDebounce } from "@/hooks/useDebounce";
import { Kit, KitMembership } from "@/types/kits";
import KitViewModal from "@/pages/common/kits/KitViewModal";

interface KitsTabProps {
  productId?: string;
  productType?: string;
  isNew: boolean;
  disabled?: boolean;
}

export const KitsTab = ({
  productId,
  productType,
  isNew,
  disabled,
}: KitsTabProps) => {
  const [kitSearch, setKitSearch] = useState("");
  const debouncedKitSearch = useDebounce(kitSearch, 300);
  const [selectedKitId, setSelectedKitId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [viewKitId, setViewKitId] = useState<string | undefined>();

  const { data: kitsByProduct = [], isLoading: isLoadingAssoc } =
    useKitsByProduct(isNew ? undefined : productId);
  const { data: allKitsData } = useKitList({
    search: debouncedKitSearch,
    combobox: true,
  });
  const { mutate: associate, isPending: isAssociating } =
    useAssociateProductToKit();
  const { mutate: disassociate, isPending: isDisassociating } =
    useDisassociateProductFromKit();

  const allKitsOptions = (allKitsData?.items || []).map((k: Kit) => ({
    label: k.sku ? `${k.name} (${k.sku})` : k.name,
    value: k.id,
  }));

  const handleAdd = () => {
    const qty = parseFloat(quantity);
    if (!selectedKitId || !productId || isNaN(qty) || qty <= 0) return;
    associate(
      { kit_id: selectedKitId, product_id: productId, quantity_per_kit: qty },
      {
        onSuccess: () => {
          setSelectedKitId("");
          setQuantity("1");
        },
      },
    );
  };

  const columns: Column<KitMembership>[] = [
    {
      key: "name",
      header: "Kit Information",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-primary/10 text-primary rounded flex items-center justify-center shrink-0 border border-primary/20">
            <Package className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">
              {item.name}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate">
              {item.sku || "NO-SKU"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "quantity_per_kit",
      header: "Qty / Kit",
      className: "w-[120px]",
      render: (item) => (
        <span className="text-xs font-bold font-mono text-primary">
          {item.quantity_per_kit}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
      className: "w-[80px] text-right",
      render: (item) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              disassociate({ kit_id: item.id!, product_id: productId! })
            }
            disabled={disabled || isDisassociating}
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isNew) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border transition-all hover:bg-muted/20">
        <Box className="h-8 w-8 text-primary opacity-40 mb-3" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
          Save Product First
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Kits can only be associated once the product record is created. Please
          save your changes and return to this tab.
        </p>
      </div>
    );
  }

  if (productType === "RAW_MATERIAL") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/10 rounded-lg border border-dashed border-border">
        <Layers className="h-8 w-8 text-muted-foreground opacity-30 mb-3" />
        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
          Kits Unavailable
        </h3>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Raw materials cannot be bundled into kits. Manage them via Recipes for
          Finished or Semi-Finished goods.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-sm blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-card border border-border/80 rounded-sm shadow-sm p-4 space-y-4">
          <div className="flex flex-col lg:flex-row items-end gap-3">
            <div className="flex-[3] w-full space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
                Find Kit to Join
              </Label>
              <Combobox
                options={allKitsOptions}
                value={selectedKitId}
                onValueChange={setSelectedKitId}
                placeholder="Search kits or SKU..."
                searchValue={kitSearch}
                onSearchChange={setKitSearch}
                className="h-9 text-xs"
                disabled={disabled}
              />
            </div>
            <div className="flex-1 w-full lg:w-[120px] space-y-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
                Qty / Kit
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1.00"
                  className="h-9 text-xs font-mono pr-7"
                  disabled={disabled}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground uppercase">
                  Unit
                </span>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={disabled || !selectedKitId || isAssociating}
              className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 group transition-all"
            >
              {isAssociating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                Add Association
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-primary rounded-full"></div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Current Kit Memberships
          </span>
        </div>
        <div className="rounded-sm border border-border/60 overflow-hidden shadow-inner bg-muted/5">
          <DataTable
            data={kitsByProduct}
            columns={columns}
            isLoading={isLoadingAssoc}
            pageSize={5}
            onRowClick={(item) => setViewKitId(item.id)}
          />
        </div>
      </div>

      <KitViewModal
        open={!!viewKitId}
        onClose={() => setViewKitId(undefined)}
        kitId={viewKitId}
      />
    </div>
  );
};
