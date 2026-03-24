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

export interface LeadStatusPayload {
  name: string;
  color?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateLeadStatusPayload extends LeadStatusPayload {
  id: string;
}

export interface LeadStatusListResponse {
  items: LeadStatus[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}
