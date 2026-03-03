export interface User {
    id: string;
    name: string;
    phone_number: string;
    email: string;
    personal_email?: string | null;
    password?: string;
    employee_code?: string | null;
    date_of_joining: string;
    department: string;
    region: string;
    work_shift: "morning" | "evening" | "night" | "rotating";
    is_root_user: boolean;
    is_active: boolean;
    gender: "male" | "female";
    date_of_birth?: string | null;
    marital_status: "single" | "married" | "divorced" | "widowed";
    anniversary_date?: string | null;
    basic_salary: number;
    opening_balance: number;
    pan_number?: string | null;
    gst_number?: string | null;
    address?: string | null;
    image_url?: string | null;
    role?: string;
    department_id?: string;
    created_at: string;
    updated_at: string;
}

export interface UserCreatePayload {
    name: string;
    phone_number: string;
    email: string;
    personal_email?: string | null;
    password?: string; // Required for creation
    employee_code?: string | null;
    date_of_joining: string;
    department: string;
    region: string;
    work_shift: "morning" | "evening" | "night" | "rotating";
    is_root_user?: boolean;
    is_active?: boolean;
    gender: "male" | "female" | "other" | "prefer_not_to_say";
    date_of_birth?: string | null;
    marital_status: "single" | "married" | "divorced" | "widowed";
    anniversary_date?: string | null;
    basic_salary?: number;
    opening_balance?: number;
    pan_number?: string | null;
    gst_number?: string | null;
    address?: string | null;
    image_url?: string | null;
}

export type UserUpdatePayload = Partial<UserCreatePayload> & { id: string };

export interface UserDetailData extends Partial<User> {
    id: string; // Ensure id is always present
    revenue?: string;
    target?: string;
    attainment?: string;
    totalLeads?: number;
    conversionRate?: string;
    avgProductionTime?: string;
    fulfillmentRate?: string;
    sessions?: {
        id: number;
        device: string;
        ip: string;
        lastActive: string;
        current: boolean;
    }[];
}

// Utility to get local YYYY-MM-DD string without UTC shifting
export function getLocalDateString(dateStr?: string | Date | null): string {
    if (!dateStr) return "";
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    // If it contains a Time component, safely convert to local date
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Fallback
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Simplified Interface to support flexible error extraction without TS complaints
export interface ApiErrorResponse {
    message?: string;
    code?: string;
    details?: {
        body?: Record<string, string>;
    };
    response?: {
        data?: ApiErrorResponse;
    };
    error?: {
        message?: string;
    };
}
