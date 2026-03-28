import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  listUsers,
  getUserDetails,
  getUserHierarchy,
  getSystemHierarchy,
  createUser,
  updateUser,
  listUserSessions,
  deleteUser,
  updateUserPermissions,
} from "@/services/api";
import {
  User,
  UserCreatePayload,
  UserUpdatePayload,
  ApiErrorResponse,
  UserSession,
  UserSessionListResponse,
} from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";

export const useUsers = (params?: Record<string, unknown>, options?: any) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const response = await listUsers(params);
      return response.data;
    },
    ...options,
  });
};

export const useUser = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await getUserDetails(id);
      return response;
    },
    enabled: enabled && !!id,
  });
};

export const useUserHierarchy = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.users.hierarchy(id),
    queryFn: async () => {
      const response = await getUserHierarchy(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

export const useSystemHierarchy = (params?: { is_active?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.users.systemHierarchy(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await getSystemHierarchy(params);
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserCreatePayload) => {
      const response = await createUser(data);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(data.message || "User created successfully!");
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      const errorData = (err?.response?.data ||
        err?.details ||
        err ||
        {}) as ApiErrorResponse;

      let message =
        errorData?.message ||
        errorData?.error?.message ||
        "Failed to create user.";

      if (errorData?.code === "validation_error" && errorData.details?.body) {
        const firstError = Object.values(errorData.details.body)[0];
        if (firstError) message = firstError;
      }

      toast.error(message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserUpdatePayload) => {
      const response = await updateUser(data);
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
      toast.success("User updated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      const errorData = (err?.response?.data ||
        err?.details ||
        err ||
        {}) as ApiErrorResponse;

      let message =
        errorData?.message ||
        errorData?.error?.message ||
        "Failed to update user.";

      // If it's a validation error, try to show the first detail for better immediate feedback
      if (errorData?.code === "validation_error" && errorData.details?.body) {
        const firstError = Object.values(errorData.details.body)[0];
        if (firstError) message = firstError;
      }

      toast.error(message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUser(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User deleted successfully!");
    },
    onError: (
      error: Error | { response?: { data?: { message?: string } } },
    ) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to delete user.");
    },
  });
};

export const useUpdateUserPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      allocations,
    }: {
      id: string;
      allocations: { company_id: string; role_id: string }[];
    }) => {
      const response = await updateUserPermissions(id, { allocations });
      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      toast.success("User permissions updated successfully!");
    },
    onError: (error: unknown) => {
      const err = error as ApiErrorResponse;
      const errorData = (err?.response?.data ||
        err?.details ||
        err ||
        {}) as ApiErrorResponse;
      const message =
        errorData?.message ||
        errorData?.error?.message ||
        "Failed to update user permissions.";
      toast.error(message);
    },
  });
};

export const useUserSessions = (
  id: string,
  params?: Record<string, unknown>,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: queryKeys.users.sessions(id, params),
    queryFn: async () => {
      const response = await listUserSessions(id, params);
      return response.data as UserSessionListResponse;
    },
    enabled: enabled && !!id,
  });
};
