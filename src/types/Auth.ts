export interface Session {
  id: string;
  user_agent: string;
  created_at: string;
}

export interface ApiError {
  message?: string;
  details?: {
    process_code?: string;
    process?: string;
    token?: string;
    sessions?: Session[];
  };
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone_number: string;
  role_id: string | null;
  is_root_user: boolean;
  companies?: { id: string }[];
}

export interface LoginResponse {
  token_type: "access";
  token: string;
  expires_in: string;
  user: User;
}

export interface OtpResponse {
  token_type: "otp";
  token: string;
  user: User;
}

export interface VerifyLoginPayload {
  token: string;
  code: string;
}

export interface VerifyOtpLocationState {
  token?: string;
  identifier?: string;
}
