export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftListResponse {
  items?: Shift[];
  shifts?: Shift[];
  pagination?: {
    total: number;
    offset: number;
    limit: number;
  };
}

export interface ShiftUser {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  employee_code?: string;
  department?: string | null;
  region?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ShiftDetailResponse {
  shift: Shift;
  users: ShiftUser[];
  total_users: number;
}
