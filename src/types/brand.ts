export interface Brand {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface BrandCreatePayload {
  name: string;
  description?: string | null;
  is_active: boolean;
}

export interface BrandUpdatePayload extends Partial<BrandCreatePayload> {
  id: string;
}

export interface BrandListResponse {
  items: Brand[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface BrandComboboxResponse {
  brands: Brand[];
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
