import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type Condition = 'new' | 'good' | 'fair' | 'poor';

export const useToolActions = () => {
    const queryClient = useQueryClient();

    const checkinMutation = useMutation({
        mutationFn: (data: { bookingId: number, toolId: number, condition: Condition, notes?: string }) => 
            api.put(`/bookings/${data.bookingId}/checkin`, { condition: data.condition, notes: data.notes }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tools']});
            queryClient.invalidateQueries({ queryKey: ['tool', variables.toolId] });
            toast.success("Tool checked in successfully!");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to check in tool."),
    });

    const checkoutMutation = useMutation({
        mutationFn: (data: { toolId: number, userId?: number, endDate: Date, notes?: string }) => {
            const { toolId, userId, endDate, notes } = data;
            return api.post('/bookings', {
                toolId,
                userId,
                startDate: new Date(),
                endDate,
                status: 'active',
                notes
            });
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tools']});
            queryClient.invalidateQueries({ queryKey: ['tool', variables.toolId] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success("Tool checked out successfully!");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to checkout tool."),
    });

    return { checkinMutation, checkoutMutation };
}; 