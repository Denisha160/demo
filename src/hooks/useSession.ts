import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { logoutSession } from '@/services/api';
import { queryKeys } from '@/lib/queryKeys';

export function useLogoutSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, token }: { sessionId: string; token?: string }) =>
            logoutSession(sessionId, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions() });
        },
        onError: (error: { message?: string }) => {
            const message = error?.message || 'Failed to logout session';
            toast({ title: 'Error', description: message, variant: 'destructive' });
        },
    });
}