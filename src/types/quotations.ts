export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "REVISED"
  | "CANCELLED";

export interface QuotationItem {
  product_id?: string | null;
  kit_id?: string | null;
  item_code?: string | null;
  item_name: string;
  item_description?: string | null;
  fragrance_name?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  quantity: number;
  unit_price: number;
  gst_percentage?: number;
  gst_amount?: number;
}

export interface Quotation {
  id: string;
  quotation_number: string | number;
  lead_id: string;
  lead_name: string;
  lead_email?: string;
  lead_phone?: string;
  company_name: string | null;
  quotation_date: string;
  status: QuotationStatus;
  amount_in_words?: string | null;
  notes?: string | null;
  items: QuotationItem[];
  sub_total: number;
  tax_total: number;
  grand_total: number;
  created_at: string;
  updated_at: string;
}

export type QuotationCreatePayload = Omit<
  Quotation,
  | "id"
  | "created_at"
  | "updated_at"
  | "sub_total"
  | "total_tax_amount"
  | "grand_total"
>;

export type QuotationUpdatePayload = Partial<QuotationCreatePayload> & {
  id: string;
};

export interface QuotationListResponse {
  items: Quotation[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
}
