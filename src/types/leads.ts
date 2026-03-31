export interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  contact: string;
  date: string; // YYYY-MM-DD
  priority?: string;
  isVerified?: boolean;
  isCustomer?: boolean;
  stage?: string; // Optional stage for table view
  stageVariant?: "default" | "info" | "warning" | "success" | "destructive";
  quotationStatus?: "approved" | "rejected" | "pending";
  status_id?: string;
  status_name?: string;
  status_color?: string;
  tags?: { id: string; name: string }[];
  interested_categories?: { id: string; name: string }[];
  phone?: string;
  raw_date?: string;
  expected_revenue?: string | number;
}

export interface PipelineColumn {
  id: string;
  title: string;
  variant: "default" | "info" | "warning" | "success" | "destructive";
  color?: string;
  deals: Deal[];
}

export interface LeadVerificationDetail {
  property_type: "HOTEL" | "RESTAURANT" | "CHAIN_PROPERTY" | "RESORT" | "SPA" | "OTHER";
  property_name: string;
  number_of_properties: number;
  cities_of_operation: string[];
  total_staff?: number;
  years_of_experience?: number;
  annual_turnover: number;
  has_warehouse: boolean;
  warehouse_location?: string | null;
  warehouse_size?: number | null;
  has_showroom: boolean;
  showroom_location?: string | null;
  showroom_size?: number | null;
  has_delivery_vehicles: boolean;
  number_of_vehicles: number;
  vehicle_details: {
    type: string;
    model: string;
    registration: string;
    capacity: string;
  }[];
  customer_type: string;
  verification_notes?: string | null;
}
