import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  createPackage,
  listPackages,
  updatePackage,
  getPackageDetails,
  deletePackage,
} from "@/services/api";
import type {
  PackageCreatePayload,
  PackageUpdatePayload,
  ApiErrorResponse,
  PackageType,
  PackageListResponse,
  ApiResponse,
} from "@/types/packages";
import { toast } from "react-toastify";

export function usePackages(params?: Record<string, unknown>) {
  return useQuery<PackageListResponse>({
    queryKey: queryKeys.packages.list(params),
    queryFn: async () => {
      const response = (await listPackages(
        params,
      )) as ApiResponse<PackageListResponse>;
      return response.data!;
    },
  });
}

export function usePackagesCombobox(filters?: Record<string, unknown>) {
  return useQuery<PackageType[]>({
    queryKey: queryKeys.packages.list({ ...filters, combobox: true }),
    queryFn: async () => {
      const response = (await listPackages({
        ...filters,
        combobox: true,
      })) as ApiResponse<PackageListResponse>;
      return response.data?.items ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePackage(id?: string) {
  return useQuery<PackageType | null>({
    queryKey: queryKeys.packages.detail(id!),
    queryFn: async () => {
      if (!id || id === "new") return null;
      const response = (await getPackageDetails(id)) as ApiResponse<{
        package: PackageType;
      }>;
      return response.data?.package ?? null;
    },
    enabled: !!id && id !== "new",
  });
}

interface CreatePackageResponse extends ApiResponse {
  package?: PackageType;
  message?: string;
}

interface UpdatePackageResponse extends ApiResponse {
  package?: PackageType;
  message?: string;
}

export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation<
    CreatePackageResponse,
    ApiErrorResponse,
    PackageCreatePayload
  >({
    mutationFn: (payload: PackageCreatePayload) => createPackage(payload),
    onSuccess: (data: CreatePackageResponse) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      toast.success(data?.message || "Package created successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const errorData = error?.response?.data || error?.details || error || {};
      const message =
        (errorData as { message?: string })?.message ||
        (errorData as { error?: { message?: string } })?.error?.message ||
        "Failed to create package.";
      toast.error(message);
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdatePackageResponse,
    ApiErrorResponse,
    PackageUpdatePayload
  >({
    mutationFn: (payload: PackageUpdatePayload) => updatePackage(payload),
    onSuccess: (data: UpdatePackageResponse) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      toast.success(data?.message || "Package updated successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const errorData = error?.response?.data || error?.details || error || {};

      // Handle validation errors specifically for the modal to catch
      if ((errorData as { code?: string })?.code === "validation_error") {
        return; // Let the component handle validation errors for specific fields
      }

      const message =
        (errorData as { message?: string })?.message ||
        (errorData as { error?: { message?: string } })?.error?.message ||
        "Failed to update package.";
      toast.error(message);
    },
  });
}

interface DeleteResponse extends ApiResponse {
  success?: boolean;
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation<DeleteResponse, ApiErrorResponse, string>({
    mutationFn: (id: string) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.packages.all });
      toast.success("Package deleted successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      const errorData = error?.response?.data || error || {};
      const message =
        (errorData as { message?: string })?.message ||
        (error as { message?: string })?.message ||
        "Failed to delete package.";
      toast.error(message);
    },
  });
}
