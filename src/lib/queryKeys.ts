export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        user: () => [...queryKeys.auth.all, 'user'] as const,
        sessions: () => [...queryKeys.auth.all, 'sessions'] as const,
        permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
    },
    parties: {
        all: ['parties'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.parties.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.parties.all, 'detail', id] as const,
    },
    products: {
        all: ['products'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.products.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    },
    orders: {
        all: ['orders'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.orders.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    },
    categories: {
        all: ['categories'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.categories.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
    },
    users: {
        all: ['users'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.users.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    },
    companies: {
        all: ['companies'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.companies.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.companies.all, 'detail', id] as const,
    },
    packages: {
        all: ['packages'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.packages.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.packages.all, 'detail', id] as const,
    },
    bom: {
        all: ['bom'] as const,
        list: (filters?: Record<string, unknown>) => [...queryKeys.bom.all, 'list', filters] as const,
        detail: (id: string) => [...queryKeys.bom.all, 'detail', id] as const,
    },
} as const;
