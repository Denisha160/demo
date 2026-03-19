export interface LeadSource {
    id: string;
    name: string;
    display_order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface LeadSourcePayload {
    name: string;
    display_order?: number;
    is_active?: boolean;
}

export interface UpdateLeadSourcePayload extends LeadSourcePayload {
    id: string;
}

export interface LeadSourceListResponse {
    items: LeadSource[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
    };
}
