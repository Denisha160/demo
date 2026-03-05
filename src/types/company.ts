export interface Company {
    id: string;
    company_code: string;
    legal_name: string;
    display_name: string;
    industry?: string | null;
    registration_number?: string | null;
    tax_number?: string | null;
    website?: string | null;
    logo_url?: string | null;
    email?: string | null;
    phone?: string | null;
    alternate_phone?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type CompanyUpdatePayload = Partial<Company> & { id: string };

// Reusing ApiErrorResponse for now from the existing codebase standard
export interface ApiErrorResponse {
    message?: string;
    code?: string;
    details?: {
        body?: Record<string, string>;
    };
    response?: {
        data?: ApiErrorResponse;
    };
    error?: {
        message?: string;
    };
}
