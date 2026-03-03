import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    listUsers,
    getUserDetails,
    createUser,
    updateUser,
    deleteUser
} from "@/services/api";
import { User, UserCreatePayload, UserUpdatePayload, ApiErrorResponse } from "@/types/user";
import { queryKeys } from "@/lib/queryKeys";

export const useUsers = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: queryKeys.users.list(params),
        queryFn: async () => {
            const response = await listUsers(params);
            return response.data;
        },
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
            const errorData = (err?.response?.data || err?.details || err || {}) as ApiErrorResponse;
            const message = errorData?.message || errorData?.error?.message || "Failed to create user.";
            toast.error(message);
        }
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
            // Only invalidate list specifically instead of ALL user keys, which would include detail twice
            queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
            toast.success("User updated successfully!");
        },
        onError: (error: unknown) => {
            const err = error as ApiErrorResponse;
            const errorData = (err?.response?.data || err?.details || err || {}) as ApiErrorResponse;
            const message = errorData?.message || errorData?.error?.message || "Failed to update user.";
            toast.error(message);
        }
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
        onError: (error: Error | { response?: { data?: { message?: string } } }) => {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Failed to delete user.");
        }
    });
};
