import { ApiResponse } from "./products";

export interface LeadContact {
  id: string;
  lead_id: string;
  name: string;
  designation: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  department: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  notes: string;
  active: boolean;
}

export interface ContactsResponse {
  contacts: LeadContact[];
  total: number;
  limit: number;
  offset: number;
}

export type ContactsApiResponse = ApiResponse<ContactsResponse>;
