export type SerialStatus = 'in_stock' | 'reserved' | 'sold' | 'returned' | 'damaged' | 'lost';

export interface Serial {
    id: string;
    serial_number: string;
    status: 'in_stock' | 'reserved' | 'sold' | 'returned' | 'damaged' | 'lost';
    batch_id: string;
    product_id: string;
    product_name?: string;
    batch_number?: string;
    product_code?: string;
    location?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface SerialListResponse {
    items: Serial[];
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
    starting_number?: number;
    quantity: number;
    location?: string;
    serials?: string[];
}

export interface BulkSyncSerialParams {
    batch_id: string;
    serials: {
        id?: string;
        serial_number: string;
        location?: string;
    }[];
}
