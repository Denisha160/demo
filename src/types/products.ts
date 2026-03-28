export type ProductType = "RAW_MATERIAL" | "SEMI_FINISHED" | "FINISHED_GOOD";
export type UnitCategory = "weight" | "volume" | "count";
export type BaseUnit = "kg" | "g" | "ltr" | "ml" | "pcs";
export type DimensionUnit = "mm" | "cm" | "m" | "in" | "ft";
export interface ProductImage {
  id?: string;
  url?: string;
  image?: { url: string };
  image_url?: { url: string };
  [key: string]: unknown;
}

export interface Product {
  id: string;
  code: string;
  product_name: string;
  secret_name: string | null;
  category_id: string | null;
  product_type: ProductType;
  is_brand: boolean;
  base_unit: BaseUnit;
  unit_category: UnitCategory;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  size_value: number | null;
  dimension_unit: DimensionUnit | null;
  packaging_id: string | null;
  hsn_code: string | null;
  shape: string | null;
  capacity: string | null;
  material: string | null;
  cost_price: number | null;
  selling_price: number | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  stock?: number;
  category_name?: string;
  brand_id?: string | null;
  brand_name?: string;
  fragrance_id?: string | null;
  fragrance_name?: string;
  image_url?: string | null;
  images?: ProductImage[];
}

export type ProductCreatePayload = Omit<
  Product,
  "id" | "created_at" | "updated_at"
>;
export type ProductUpdatePayload = Partial<ProductCreatePayload> & {
  id: string;
};

export interface BOMItem {
  id?: string;
  finished_product_id: string;
  raw_product_id: string;
  raw_quantity: number;
  raw_unit: BaseUnit;
  raw_unit_category: UnitCategory;
  // UI helper fields
  raw_product_name?: string;
}

// Keep Variant temporarily for compatibility or if needed later
export interface Variant {
  id: string;
  variant_name: string;
  sku: string;
  weight_volume: number;
  unit: string;
  cost_price: number;
  selling_price: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      code?: string;
      details?: unknown;
    };
  };
  message?: string;
}

export interface ProductListResponse {
  items: Product[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface ProductComboboxResponse {
  products: Product[];
}
