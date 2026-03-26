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
