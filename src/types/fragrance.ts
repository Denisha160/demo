export interface Fragrance {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface FragranceCreatePayload {
    name: string;
    description?: string | null;
    is_active: boolean;
}

export interface FragranceUpdatePayload extends Partial<FragranceCreatePayload> {
    id: string;
}

export interface FragranceListResponse {
    items: Fragrance[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
    };
}

export interface FragranceComboboxResponse {
    fragrances: Fragrance[];
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
