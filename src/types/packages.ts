export interface PackageType {
    id: string;
    package_code: string;
    package_name: string;
    package_type: string | null;
    description?: string | null;
    length_cm: number | null;
    width_cm: number | null;
    height_cm: number | null;
    volume_cubic_cm?: number | null;
    cbm?: number | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface PackageListResponse {
    items: PackageType[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface PackageCreatePayload {
    package_code: string;
    package_name: string;
    package_type: string;
    description?: string;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    is_active?: boolean;
}

export type PackageUpdatePayload = Partial<PackageCreatePayload> & { id: string };

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