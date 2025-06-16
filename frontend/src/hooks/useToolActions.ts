import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export const useToolActions = () => {
    const queryClient = useQueryClient();

    const checkoutMutation = useMutation({
        mutationFn: (id: number) => {
            return api.post(`/tools/${id}/checkout`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            toast.success('Tool checked out successfully!');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    });

    const checkinMutation = useMutation({
        mutationFn: (id: number) => {
            return api.post(`/tools/${id}/checkin`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            toast.success('Tool checked in successfully!');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    });

    return { checkoutMutation, checkinMutation };
} 