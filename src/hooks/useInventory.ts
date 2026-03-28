import { useQuery } from "@tanstack/react-query";
import { listInventories, listTransactions } from "@/services/api";
import { ListInventoryParams, ListTransactionParams } from "@/types/inventory";

export const useInventories = (params?: ListInventoryParams) => {
  return useQuery({
    queryKey: ["inventories", params],
    queryFn: () => listInventories(params).then((res) => res.data),
  });
};

export const useInventoryTransactions = (params?: ListTransactionParams) => {
  return useQuery({
    queryKey: ["inventory-transactions", params],
    queryFn: () => listTransactions(params).then((res) => res.data),
    enabled: !!(params?.product_id || params?.kit_id || params?.batch_id),
  });
};
