import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { createProduct } from '@/services/api';
import type { ProductCreatePayload } from '@/types/products';
import { ApiErrorResponse } from '@/types/user';

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