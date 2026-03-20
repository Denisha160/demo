import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInventories, useInventoryTransactions } from "@/hooks/useInventory";
import DataTable, { Column } from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { InventoryTransaction } from "@/types/inventory";

const InventoryDetailPage = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch item details using the inventories list filter
  const { data: inventoryData, isLoading: isLoadingItem } = useInventories({
    limit: 1,
    product_id: type === "product" ? id : undefined,
    kit_id: type === "kit" ? id : undefined,
  });

  const item = inventoryData?.items?.[0];

  const { data: transactionResponse, isLoading: isLoadingTransactions } = useInventoryTransactions({
    product_id: type === "product" ? id : undefined,
    kit_id: type === "kit" ? id : undefined,
    offset: (page - 1) * limit,
    limit,
  });

  const memoizedTransactions = useMemo(() => {
    return transactionResponse?.items || [];
  }, [transactionResponse?.items]);
  const totalTransactions = transactionResponse?.pagination?.total || 0;

  // Extract item info
  const itemInfo = useMemo(() => {
    if (item) {
      return {
        name: item.name,
        code: item.code,
        type: item.inventory_type,
      };
    }
    return null;
  }, [item]);

  const columns: Column<InventoryTransaction>[] = [
    {
      key: "created_at",
      header: "Date & Time",
      render: (t) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{format(new Date(t.created_at), "MMM dd, yyyy")}</span>
          <span className="text-[10px] text-muted-foreground">{format(new Date(t.created_at), "HH:mm:ss")}</span>
        </div>
      )
    },
    {
      key: "type",
      header: "Type",
      render: (t) => (
        <StatusBadge
          status={t.type === 'in' ? 'STOCK IN' : 'STOCK OUT'}
          variant={t.type === 'in' ? 'success' : 'destructive'}
        />
      )
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (t) => (
        <span className={`font-bold ${t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {t.type === 'in' ? '+' : '-'}{t.quantity}
        </span>
      )
    },
    {
      key: "before_stock",
      header: "Previous",
      render: (t) => <span className="text-muted-foreground text-sm">{t.before_stock}</span>
    },
    {
      key: "after_stock",
      header: "Balance",
      render: (t) => <span className="font-bold text-sm">{t.after_stock}</span>
    },
    {
      key: "batch_number",
      header: "Batch Info",
      render: (t) => (
        t.batch_number ? (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded w-fit">
              {t.batch_number}
            </span>
          </div>
        ) : <span className="text-muted-foreground">—</span>
      )
    },
    {
      key: "remark",
      header: "Transaction Notes",
      render: (t) => <p className="text-xs text-muted-foreground max-w-[250px] italic">{t.remark || "No notes provided"}</p>
    },
    {
      key: "user_name",
      header: "Performed By",
      render: (t) => (
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">{t.user_name}</span>
        </div>
      )
    }
  ];

  return (
    <div className="w-full mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8 rounded-sm border border-border shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/10 rounded-lg text-primary flex items-center justify-center border border-primary/20">
              {type === 'product' ? <Box className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{isLoadingItem ? "Loading..." : (itemInfo?.name || "Inventory Detail")}</h1>
                <StatusBadge
                  status={type === 'product' ? 'Product' : 'Kit'}
                  variant={type === 'product' ? 'info' : 'warning'}
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
                {isLoadingItem ? "..." : (itemInfo?.code || "ID: " + id?.slice(0, 8))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="p-0">
          <DataTable
            data={memoizedTransactions}
            columns={columns}
            pageSize={limit}
            isLoading={isLoadingTransactions}
            serverSide={true}
            serverTotal={totalTransactions}
            serverPage={page}
            onServerPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailPage;