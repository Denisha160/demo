import { Package, Loader2, Edit, Box } from "lucide-react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKitDetails } from "@/hooks/useKits";
import { format } from "date-fns";
import React from "react";

interface KitViewModalProps {
  open: boolean;
  onClose: () => void;
  kitId?: string;
  onEdit?: (id: string) => void;
}

const KitViewModal = ({ open, onClose, kitId, onEdit }: KitViewModalProps) => {
  const { data: kit, isLoading } = useKitDetails(kitId);
  const totalItems = kit?.items?.length || 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary"
      maxWidth="sm:max-w-[640px]"
      title={isLoading ? "Loading..." : (kit?.name ?? "Kit Details")}
      description={
        kit
          ? `SKU: ${kit.sku || "No SKU"} · Created ${format(new Date(kit.created_at), "dd MMM yyyy")}`
          : "View kit details and included products"
      }
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm text-sm h-8"
            onClick={onClose}
          >
            Close
          </Button>
          {kit && onEdit && (
            <Button
              size="sm"
              className="rounded-sm text-sm h-8 gap-1.5"
              onClick={() => {
                onClose();
                onEdit(kit.id);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Kit
            </Button>
          )}
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : kit ? (
        <div className="space-y-5 mt-2">
          {/* Kit Header Image Overview */}
          {(kit.image_url || kit.kit_image_url || kit.kit_image) && (
            <div className="w-full aspect-video rounded-sm overflow-hidden border border-border shadow-sm">
              <img
                src={kit.image_url || kit.kit_image_url || kit.kit_image!}
                alt={kit.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-sm p-3 border border-border/60 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </p>
              <Badge
                variant={kit.is_active ? "success" : "secondary"}
                className="text-[10px] uppercase font-bold"
              >
                {kit.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="bg-muted/30 rounded-sm p-3 border border-border/60 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                Components
              </p>
              <p className="text-lg font-bold text-foreground leading-none">
                {totalItems}
              </p>
            </div>
            <div className="bg-primary/5 rounded-sm p-3 border border-primary/10 space-y-1">
              <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wide">
                Kit Price
              </p>
              <p className="text-lg font-bold text-primary leading-none">
                ₹
                {Number(kit.kit_price || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Included Products */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Included Products
            </p>
            {kit.items && kit.items.length > 0 ? (
              <div className="rounded-sm border border-border/60 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b border-border/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground">
                        Product
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-muted-foreground w-[80px]">
                        Qty
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-foreground w-[100px]">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {kit.items.map((item, i) => (
                      <tr
                        key={item.id || i}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={
                                  item.product_name ||
                                  item.finished_product_name
                                }
                                className="h-7 w-7 object-cover rounded-sm border border-border shrink-0"
                              />
                            ) : (
                              <div className="h-7 w-7 bg-muted rounded-sm flex items-center justify-center shrink-0 border border-border">
                                <Box className="h-3.5 w-3.5 text-muted-foreground opacity-50" />
                              </div>
                            )}
                            <span className="font-medium text-foreground">
                              {item.product_name ||
                                item.finished_product_name ||
                                "Unknown Product"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold text-foreground">
                          {item.quantity_per_kit}
                        </td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground font-mono">
                          ₹
                          {Number(item.price || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border/60 rounded-sm text-muted-foreground gap-2">
                <Package className="h-6 w-6 opacity-30" />
                <p className="text-xs">No products included in this kit.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default KitViewModal;
