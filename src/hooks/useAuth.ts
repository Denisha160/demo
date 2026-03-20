import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { accountLogin, accountLogout, verifyLogin, getPermissions } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';
import type {
    ApiError,
    LoginCredentials,
    User,
    LoginResponse,
    VerifyLoginPayload
} from '@/types/Auth';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DETAILS_KEY = 'user_details';
const COOKIE_EXPIRY_DAYS = 1; // backend token expires in 24h

function saveAuthToCookies(data: LoginResponse) {
    Cookies.set(AUTH_TOKEN_KEY, data.token, { expires: COOKIE_EXPIRY_DAYS });
    Cookies.set(USER_DETAILS_KEY, JSON.stringify(data.user), { expires: COOKIE_EXPIRY_DAYS });
}

function clearAuthCookies() {
    Cookies.remove(AUTH_TOKEN_KEY);
    Cookies.remove(USER_DETAILS_KEY);
}

export function useCurrentUser(): User | null {
    const raw = Cookies.get(USER_DETAILS_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

export function useIsAuthenticated() {
    const token = Cookies.get(AUTH_TOKEN_KEY);
    return {
        isAuthenticated: !!token,
        user: useCurrentUser(),
    };
}

export function useLogin() {
    return useMutation({
        mutationFn: (credentials: LoginCredentials) => accountLogin(credentials),
        onError: (error: ApiError) => {
            if (error?.details?.process_code === 'user_already_logged_in') {
                return;
            }
            const message = error?.message || 'Login failed. Please check your credentials.';
            toast.error(message);
        },
    });
}

export function useVerifyLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: VerifyLoginPayload) => verifyLogin(payload),
        onSuccess: (data: LoginResponse) => {
            saveAuthToCookies(data);

            queryClient.setQueryData(queryKeys.auth.user(), data.user);

            toast.success(`Welcome, ${data.user.name}!`);

            // Redirect based on role and companies
            if (data.user.is_root_user) {
                window.location.href = '/admin';
            } else if (data.user.companies && data.user.companies.length > 0) {
                window.location.href = `/${data.user.companies[0].id}/dashboard`;
            } else {
                window.location.href = '/no-access';
            }
        },
        onError: (error: ApiError) => {
            const message = error?.message || 'Verification failed. Please try again.';
            toast.error(message);
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: accountLogout,
        onSettled: () => {
            clearAuthCookies();
            queryClient.clear();

            toast.success('You have been logged out successfully.');

            window.location.href = '/login';
        },
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: queryKeys.auth.permissions(),
        queryFn: getPermissions,
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: !!Cookies.get(AUTH_TOKEN_KEY),
    });
}

export function useHasPermission() {
    const { data: permissions, isLoading } = usePermissions();
    const user = useCurrentUser();

    const hasPermission = (permission: string | string[]) => {
        if (user?.is_root_user) return true;
        if (!permissions) return false;

        const perms: string[] = Array.isArray(permissions) 
            ? permissions 
            : (permissions as { items?: string[] }).items || [];
        
        if (Array.isArray(permission)) {
            return permission.some(p => perms.includes(p));
        }
        return perms.includes(permission);
    };

    return { 
        hasPermission, 
        isLoading, 
        permissions: (Array.isArray(permissions) ? permissions : (permissions as { items?: string[] })?.items || []) as string[]
    };
}
