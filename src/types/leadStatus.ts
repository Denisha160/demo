export interface LeadStatus {
    id: string;
    name: string;
    color?: string;
    description?: string;
    display_order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface UpdateLeadStatusPayload {
    id: string;
    name?: string;
    color?: string;
    description?: string;
    is_active?: boolean;
}

export interface LeadStatusListResponse {
    items: LeadStatus[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
    };
}
