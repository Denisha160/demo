export type LeadActivityType =
    | 'LEAD_CREATED'
    | 'STATUS_CHANGE'
    | 'OWNER_CHANGE'
    | 'PRIORITY_CHANGE'
    | 'FIELD_UPDATE'
    | 'NOTE_ADDED'
    | 'CALL_LOGGED'
    | 'VISIT_SCHEDULED'
    | 'VISIT_COMPLETED'
    | 'TASK_CREATED'
    | 'TASK_COMPLETED'
    | 'FOLLOW_UP_SCHEDULED'
    | 'FOLLOW_UP_COMPLETED'
    | 'QUOTATION_CREATED'
    | 'QUOTATION_UPDATED'
    | 'ATTACHMENT_ADDED'
    | 'CONVERTED_TO_CUSTOMER'
    | 'SYSTEM_EVENT'
    | 'OTHER';

export interface LeadActivity {
    id: string;
    lead_id: string;
    user_id: string;
    activity_type: LeadActivityType;
    reference_type: string | null;
    reference_id: string | null;
    description: string;
    old_value: unknown;
    new_value: unknown;
    created_at: string;
    user_name: string;
}

export interface LeadActivitiesResponse {
    activities: LeadActivity[];
    total: number;
    limit: number;
    offset: number;
}

export interface LeadActivitiesApiResponse {
    success: boolean;
    data: LeadActivitiesResponse;
    message?: string;
}
