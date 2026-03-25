import {
  FlaskConical,
  Loader2,
  Edit,
  Calendar,
  MapPin,
  Package,
  Box,
} from "lucide-react";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBatchDetails } from "@/hooks/useBatch";
import { format, differenceInDays, isPast } from "date-fns";

type StatusVariant =
  | "success"
  | "secondary"
  | "destructive"
  | "warning"
  | "info";

const statusVariantMap: Record<string, StatusVariant> = {
  active: "success",
  expired: "destructive",
  depleted: "secondary",
  blocked: "warning",
  quarantine: "info",
};

const getExpiryInfo = (expiryDate: string | null) => {
  if (!expiryDate)
    return { label: "No expiry set", className: "text-muted-foreground" };
  const days = differenceInDays(new Date(expiryDate), new Date());
  if (isPast(new Date(expiryDate)))
    return { label: "Expired", className: "text-destructive font-bold" };
  if (days <= 30)
    return {
      label: `Expires in ${days} days ⚠️`,
      className: "text-amber-500 font-bold",
    };
  return {
    label: format(new Date(expiryDate), "dd MMM yyyy"),
    className: "text-foreground",
  };
};

const getStockPercent = (remaining: number, initial: number) =>
  initial ? Math.min(100, Math.round((remaining / initial) * 100)) : 0;

interface BatchViewModalProps {
  open: boolean;
  onClose: () => void;
  batchId?: string;
  onEdit?: (id: string) => void;
}

const BatchViewModal = ({
  open,
  onClose,
  batchId,
  onEdit,
}: BatchViewModalProps) => {
  const { data: batch, isLoading } = useBatchDetails(batchId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      headerBg="bg-primary/10"
      titleClassName="text-primary font-bold"
      maxWidth="sm:max-w-[600px]"
      title={
        isLoading ? "Loading..." : (batch?.batch_number ?? "Batch Details")
      }
      description={
        batch
          ? `${batch.product_name} · ${batch.product_code}`
          : "View batch details"
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
          {batch && onEdit && (
            <Button
              size="sm"
              className="rounded-sm text-sm h-8 gap-1.5"
              onClick={() => {
                onClose();
                onEdit(batch.id);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit Batch
            </Button>
          )}
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : batch ? (
        <div className="space-y-5 mt-2">
          {/* Product + Batch header */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-sm border border-border/60">
            {batch.image_url ? (
              <img
                src={batch.image_url}
                alt={batch.product_name}
                className="h-12 w-12 object-cover rounded-sm border border-border shrink-0"
              />
            ) : (
              <div className="h-10 w-10 bg-primary/10 text-primary border border-primary/20 rounded-sm flex items-center justify-center shrink-0">
                <FlaskConical className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-foreground">
                {batch.product_name}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {batch.product_code}
              </p>
            </div>
            <div className="ml-auto">
              <Badge
                variant={statusVariantMap[batch.status] ?? "info"}
                className="text-[10px] uppercase font-bold"
              >
                {batch.status}
              </Badge>
            </div>
          </div>

          {/* Stock Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Stock Level
              </span>
              <span className="font-bold text-foreground">
                {Number(batch.remaining_quantity).toLocaleString()} /{" "}
                {Number(batch.initial_quantity).toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              {(() => {
                const pct = getStockPercent(
                  Number(batch.remaining_quantity),
                  Number(batch.initial_quantity),
                );
                return (
                  <div
                    className={`h-full rounded-full transition-all ${pct > 50 ? "bg-emerald-500" : pct > 15 ? "bg-amber-400" : "bg-destructive"}`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })()}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {getStockPercent(
                Number(batch.remaining_quantity),
                Number(batch.initial_quantity),
              )}
              % remaining
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Manufacturing Date",
                icon: <Calendar className="h-3 w-3" />,
                value: format(
                  new Date(batch.manufacturing_date),
                  "dd MMM yyyy",
                ),
              },
              {
                label: "Expiry Date",
                icon: <Calendar className="h-3 w-3" />,
                value: (
                  <span className={getExpiryInfo(batch.expiry_date).className}>
                    {getExpiryInfo(batch.expiry_date).label}
                  </span>
                ),
              },
              {
                label: "Location",
                icon: <MapPin className="h-3 w-3" />,
                value: batch.location || (
                  <span className="italic text-muted-foreground/50">
                    Not specified
                  </span>
                ),
              },
              {
                label: "Unit",
                icon: <Box className="h-3 w-3" />,
                value: batch.unit || "—",
              },
              {
                label: "Created",
                icon: <Package className="h-3 w-3" />,
                value: format(new Date(batch.created_at), "dd MMM yyyy"),
              },
              {
                label: "Last Updated",
                icon: <Package className="h-3 w-3" />,
                value: format(new Date(batch.updated_at), "dd MMM yyyy HH:mm"),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="bg-muted/20 rounded-sm p-3 border border-border/50 space-y-1"
              >
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  {row.icon}
                  {row.label}
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {row.value}
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          {batch.notes && (
            <div className="rounded-sm border border-border/60 bg-muted/20 p-3">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                Notes
              </p>
              <p className="text-xs text-foreground">{batch.notes}</p>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default BatchViewModal;
