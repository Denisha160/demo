export type SerialStatus = 'in_stock' | 'reserved' | 'sold' | 'returned' | 'damaged' | 'lost';

export interface SerialNumber {
    id: string;
    serial_number: string;
    status: SerialStatus;
    product_id: string;
    product_name: string;
    product_code: string;
    batch_id: string;
    batch_number: string;
    location?: string | null;
    image_url?: string | null;
    created_at: string;
    updated_at: string;
}

export interface SerialListResponse {
    items: SerialNumber[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
        pages: number;
    };
}

export interface SerialListParams {
    search?: string;
    product_id?: string;
    batch_id?: string;
    status?: string;
    offset?: number;
    limit?: number;
    sort_by?: string;
    sort_direction?: string;
}

export interface GenerateSerialParams {
    batch_id: string;
    pattern: string;
    starting_number: number;
    quantity: number;
    location?: string;
}
