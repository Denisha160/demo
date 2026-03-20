export interface Inventory {
  inventory_id: string;
  product_id?: string;
  kit_id?: string;
  stock: number;
  min_stock: number;
  location?: string;
  name: string;
  code: string;
  product_type?: string;
  base_unit?: string;
  unit_category?: string;
  inventory_type: "PRODUCT" | "KIT";
  total_in: number;
  total_out: number;
}

export interface InventoryTransaction {
  id: string;
  product_id?: string;
  kit_id?: string;
  batch_id?: string;
  type: "in" | "out";
  quantity: number;
  before_stock: number;
  after_stock: number;
  remark?: string;
  created_at: string;
  user_name: string;
  batch_number?: string;
  product_name?: string;
  kit_name?: string;
}

export interface ListInventoryParams {
  search?: string;
  offset?: number;
  limit?: number;
  type?: "PRODUCT" | "KIT" | "all";
  product_id?: string;
  kit_id?: string;
  sort_by?: "name" | "code" | "stock" | "created_at";
  sort_direction?: "asc" | "desc";
}

export interface ListTransactionParams {
  product_id?: string;
  kit_id?: string;
  batch_id?: string;
  type?: "in" | "out" | "all";
  offset?: number;
  limit?: number;
}