export interface Bom {
    id?: string;
    finished_product_id: string;
    finished_product_name: string;
    images?: Array<{ url: string;[key: string]: unknown }>;
    total_materials: number;
    total_cost: number;
    last_used_date: string;
    raw_material_id?: string;
    raw_quantity?: number;
    raw_unit?: string;
    raw_unit_category?: string;
}

export interface BomListResponse {
    items: Bom[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface RawMaterialItem {
    raw_product_id: string;
    raw_quantity: number;
    raw_unit: string;
    raw_unit_category: string;
    cost_price?: number; // Optional metadata for frontend calculations
    product_name?: string; // Optional metadata for frontend display
}

export interface BomCreatePayload {
    finished_product_id: string;
    raw_materials: RawMaterialItem[];
}

export interface BomUpdatePayload {
    finished_product_id: string;
    raw_materials: RawMaterialItem[];
}
