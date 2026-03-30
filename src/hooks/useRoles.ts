import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listRoles,
  getRoleDetails,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
} from "@/services/api";
import { Role } from "@/types/Role";
import { toast } from "react-toastify";

interface RoleListResponse {
  items?: Role[];
  pagination?: {
    total?: number;
  };
}

export const useRoles = (
  queryParams: Record<string, unknown> = {},
  options: { enabled?: boolean } = {},
) => {
  return useQuery<RoleListResponse>({
    queryKey: ["roles", queryParams],
    queryFn: async () => {
      const response = await listRoles(queryParams);
      return response.data as RoleListResponse;
    },
    ...options,
  });
};

export const useRoleDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ["roles", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getRoleDetails(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAvailablePermissions = () => {
  return useQuery({
    queryKey: ["permissions", "available"],
    queryFn: async () => {
      const response = await getAvailablePermissions();
      return response.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Role>) => {
      const response = await createRole(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Role>) => {
      const response = await updateRole({ id, ...data });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", variables.id] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await deleteRole(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully.");
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete role.";
      toast.error(msg);
    },
  });
};
