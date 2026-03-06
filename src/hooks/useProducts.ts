import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { createProduct, listProducts, updateProduct, getProductDetails } from '@/services/api';
import type { ProductCreatePayload, ProductUpdatePayload } from '@/types/products';

export function useProducts(params?: Record<string, unknown>) {
    return useQuery({
        queryKey: queryKeys.products.list(params),
        queryFn: async () => {
            const response = await listProducts(params);
            return response.data;
        },
    });
}

export function useProduct(id?: string) {
    return useQuery({
        queryKey: queryKeys.products.detail(id),
        queryFn: async () => {
            if (!id || id === 'new') return null;
            const response = await getProductDetails(id);
            return response.data;
        },
        enabled: !!id && id !== 'new',
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ProductCreatePayload) => createProduct(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
        onError: (error: unknown) => {
            console.error('Create product failed:', error);
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...payload }: ProductUpdatePayload) => updateProduct(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
        onError: (error: unknown) => {
            console.error('Update product failed:', error);
        },
    });
}