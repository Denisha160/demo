import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { 
    listContacts, 
    createLeadContacts, 
    updateLeadContacts, 
    deleteLeadContacts 
} from "@/services/api";
import { LeadContact, ContactsApiResponse, ContactsResponse } from "@/types/contacts";
import { ApiResponse, ApiErrorResponse } from "@/types/products";

export function useLeadContacts(leadId: string, params?: Record<string, unknown>) {
    return useQuery<ContactsResponse>({
        queryKey: ["lead-contacts", leadId, params],
        queryFn: async () => {
            if (!leadId) return { contacts: [], total: 0, limit: 10, offset: 0 };
            const response = await listContacts(leadId, params) as ContactsApiResponse;
            return response.data || { contacts: [], total: 0, limit: 10, offset: 0 };
        },
        enabled: !!leadId,
    });
}

export function useCreateLeadContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ leadId, data }: { leadId: string; data: Partial<LeadContact> }) =>
            createLeadContacts(leadId, data),
        onSuccess: (response: ApiResponse<unknown>, variables) => {
            queryClient.invalidateQueries({ queryKey: ["lead-contacts", variables.leadId] });
            toast.success(response?.message || "Contact added successfully!");
        },
        onError: (error: ApiErrorResponse) => {
            toast.error(error?.response?.data?.message || "Failed to add contact.");
        },
    });
}

export function useUpdateLeadContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { leadId: string; contactId: string } & Record<string, unknown>) =>
            updateLeadContacts(payload),
        onSuccess: (response: ApiResponse<unknown>, variables) => {
            queryClient.invalidateQueries({ queryKey: ["lead-contacts", variables.leadId] });
            toast.success(response?.message || "Contact updated successfully!");
        },
        onError: (error: ApiErrorResponse) => {
            toast.error(error?.response?.data?.message || "Failed to update contact.");
        },
    });
}

export function useDeleteLeadContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { leadId: string; contactId: string }) =>
            deleteLeadContacts(payload),
        onSuccess: (response: ApiResponse<unknown>, variables) => {
            queryClient.invalidateQueries({ queryKey: ["lead-contacts", variables.leadId] });
            toast.success(response?.message || "Contact deleted successfully!");
        },
        onError: (error: ApiErrorResponse) => {
            toast.error(error?.response?.data?.message || "Failed to delete contact.");
        },
    });
}
