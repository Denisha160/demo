import { BaseUnit } from "./products";

export interface KitItem {
    id?: string;
    kit_id?: string;
    finished_product_id: string;
    finished_product_name?: string;
    product_name?: string;
    quantity_per_kit: number;
    price: number;
    unit?: BaseUnit;
    created_at?: string;
    image_url?: string | null;
}

export interface Kit {
    id: string;
    name: string;
    sku: string | null;
    is_active: boolean;
    kit_price: number | null;
    packaging_id: string | null;
    total_items: number;
    created_at: string;
    updated_at: string;
}

export interface KitMembership extends Kit {
    quantity_per_kit: number;
    associated_at: string;
}

export interface KitDetails extends Kit {
    items: KitItem[];
}

export interface KitCreatePayload {
    name: string;
    sku?: string | null;
    is_active: boolean;
    kit_price?: number | null;
    packaging_id?: string | null;
    items: {
        finished_product_id: string;
        quantity_per_kit: number;
    }[];
}

export interface KitUpdatePayload extends Partial<KitCreatePayload> {
    id: string;
}

export interface KitListResponse {
    items: Kit[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
    };
}

export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    success?: boolean;
}

export interface ApiErrorResponse {
    message?: string;
    code?: string;
    details?: {
        body?: Record<string, string>;
        params?: Record<string, string>;
    };
    response?: {
        data?: ApiErrorResponse;
    };
}
