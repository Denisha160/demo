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
