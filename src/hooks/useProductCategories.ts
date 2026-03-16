import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    listProductCategories,
    getProductCategoryDetails,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
} from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Category, CategoryPayload, UpdateCategoryPayload, CategoryListResponse } from '@/types/productCategories';
export type { Category, CategoryPayload, UpdateCategoryPayload };

export function useCategories(filters?: Record<string, unknown>) {
    return useQuery({
        queryKey: queryKeys.categories.list(filters),
        queryFn: () => listProductCategories(filters),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        select: (data): CategoryListResponse | undefined => data?.data,
    });
}

export function useCategoriesCombobox(filters?: Record<string, unknown>) {
    return useQuery({
        queryKey: queryKeys.categories.list({ ...filters, combobox: true }),
        queryFn: () => listProductCategories({ ...filters, combobox: true }),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        select: (data): Category[] => data?.data?.categories ?? [],
    });
}

export function useCategoryDetails(id?: string) {
    return useQuery({
        queryKey: queryKeys.categories.detail(id!),
        queryFn: () => getProductCategoryDetails(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        select: (data) => data?.data,
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CategoryPayload) => createProductCategory(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
            toast.success('Category created successfully.');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            const msg = err?.response?.data?.message || err?.message || 'Failed to create category.';
            toast.error(msg);
        },
    });
}

// ── Update ─────────────────────────────────────────────────────────────────────

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateCategoryPayload) => updateProductCategory(payload),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(variables.id) });
            toast.success('Category updated successfully.');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            const msg = err?.response?.data?.message || err?.message || 'Failed to update category.';
            toast.error(msg);
        },
    });
}

// ── Delete ─────────────────────────────────────────────────────────────────────

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteProductCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
            toast.success('Category deleted successfully.');
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            const msg = err?.response?.data?.message || err?.message || 'Failed to delete category.';
            toast.error(msg);
        },
    });
}
