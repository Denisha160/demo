export interface Bom {
    id: string;
    finished_product_id: string;
    raw_material_id: string;
    raw_quantity: number;
    raw_unit: string;
    raw_unit_category: string;

}

export interface BomListResponse {
    items: Bom[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface BomCreatePayload {
    finished_product_id: string;
    raw_material_id: string;
    raw_quantity: number;
    raw_unit: string;
    raw_unit_category: string;
}

export type BomUpdatePayload = Partial<BomCreatePayload> & { id: string };
