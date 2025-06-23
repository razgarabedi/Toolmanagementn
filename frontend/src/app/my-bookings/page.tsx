'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import CheckinForm from '@/components/CheckinForm';

interface Tool {
    id: number;
    name: string;
    rfid?: string;
    condition: Condition;
}

interface Booking {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    tool: Tool;
}
type Condition = 'new' | 'good' | 'fair' | 'poor';

const MyBookingsPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isCheckinModalOpen, setCheckinModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const { data: bookings, isLoading, isError, error } = useQuery<Booking[]>({
        queryKey: ['my-bookings'],
        queryFn: () => api.get('/bookings/my-bookings').then(res => res.data),
        enabled: isAuthenticated,
    });
    
    const cancelMutation = useMutation({
        mutationFn: (bookingId: number) => {
            return api.put(`/bookings/${bookingId}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            toast.success('Booking cancelled successfully!');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    });

    const checkOutMutation = useMutation({
        mutationFn: (bookingId: number) => api.put(`/bookings/${bookingId}/checkout`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            toast.success('Tool checked out successfully!');
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'Failed to check out tool.');
        }
    });

    const checkInMutation = useMutation({
        mutationFn: (data: { bookingId: number, condition: Condition, notes?: string }) => 
            api.put(`/bookings/${data.bookingId}/checkin`, { condition: data.condition, notes: data.notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            toast.success('Tool checked in successfully!');
            setCheckinModalOpen(false);
            setSelectedBooking(null);
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'Failed to check in tool.');
        }
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    const handleCheckinClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setCheckinModalOpen(true);
    };

    const handleCheckinSubmit = (data: { condition: Condition; notes?: string }) => {
        if (selectedBooking) {
            checkInMutation.mutate({ bookingId: selectedBooking.id, ...data });
        }
    };

    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    if (isError) {
        return <div className="container mx-auto p-4">Error: {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch bookings'}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
            <div className="bg-white p-6 rounded shadow-md">
                {bookings && bookings.length > 0 ? (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2">Tool</th>
                                <th className="py-2">Start Date</th>
                                <th className="py-2">End Date</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="border px-4 py-2">
                                        <Link href={`/tools/${booking.tool.id}`} className="text-blue-600 hover:underline">
                                            {booking.tool.name}
                                        </Link>
                                    </td>
                                    <td className="border px-4 py-2">{new Date(booking.startDate).toLocaleDateString()}</td>
                                    <td className="border px-4 py-2">{new Date(booking.endDate).toLocaleDateString()}</td>
                                    <td className="border px-4 py-2">{booking.status}</td>
                                    <td className="border px-4 py-2">
                                        {booking.status === 'booked' && (
                                            <>
                                                <button 
                                                    onClick={() => checkOutMutation.mutate(booking.id)}
                                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                                    disabled={checkOutMutation.isPending}
                                                >
                                                    Check Out
                                                </button>
                                                <button 
                                                    onClick={() => cancelMutation.mutate(booking.id)}
                                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'active' && (
                                            <button
                                                onClick={() => handleCheckinClick(booking)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                                disabled={checkInMutation.isPending}
                                            >
                                                Check In
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have no bookings.</p>
                )}
            </div>
            {isCheckinModalOpen && selectedBooking && (
                <CheckinForm
                    tool={selectedBooking.tool}
                    booking={selectedBooking}
                    onClose={() => setCheckinModalOpen(false)}
                    onSubmit={handleCheckinSubmit}
                />
            )}
        </div>
    );
};

export default MyBookingsPage; 