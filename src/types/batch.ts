export type BatchStatus = 'active' | 'expired' | 'depleted' | 'blocked';

export interface Batch {
    id: string;
    batch_number: string;
    product_id: string;
    product_name: string;
    product_code: string;
    unit: string | null;
    manufacturing_date: string;
    expiry_date: string | null;
    initial_quantity: number;
    remaining_quantity: number;
    location: string | null;
    status: BatchStatus;
    notes: string | null;
    image_url?: string | null;
    created_at: string;
    updated_at: string;
}

export interface BatchListResponse {
    items: Batch[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
    };
}

export interface BatchCreatePayload {
    product_id: string;
    batch_number: string;
    manufacturing_date: string;
    expiry_date?: string | null;
    supplier_id?: string | null;
    location?: string | null;
    initial_quantity: number;
    status?: BatchStatus;
    notes?: string | null;
    component_batches?: Array<{
        raw_product_id: string;
        batch_id: string;
        quantity: number;
    }>;
}

export interface BatchUpdatePayload extends Partial<BatchCreatePayload> {
    id: string;
}

export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    success?: boolean;
}
