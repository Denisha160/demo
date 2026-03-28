export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  label: string;
}

export interface PermissionGroup {
  module: string;
  permissions: {
    id: string;
    label: string;
    enabled: boolean;
  }[];
}
