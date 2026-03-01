import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { logoutSession } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export interface Session {
    id: string;
    user_agent: string;
    created_at: string;
}

// Hook to logout a specific session
export function useLogoutSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, token }: { sessionId: string; token?: string }) =>
            logoutSession(sessionId, token),
        onSuccess: () => {
            // Invalidate sessions query if logged in
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions() });
        },
        onError: (error: { message?: string }) => {
            const message = error?.message || 'Failed to logout session';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        },
    });
}