export type CategoryType = 'main' | 'sub';

export interface Category {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    parent_name?: string | null;
}

export interface CategoryListResponse {
    items: Category[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
    };
}

export interface ProductCategory {
    id: string;
    name: string;
    type: CategoryType;
    mainCategoryId?: string;
    parent_id?: string | null;
    parent_name?: string | null;
}

export interface CategoryPayload {
    name: string;
    parent_id?: string | null;
}

export interface UpdateCategoryPayload extends CategoryPayload {
    id: string;
}
