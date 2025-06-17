'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import { X } from 'lucide-react';

interface Booking {
    id: number;
    startDate: string;
    endDate: string;
}

interface BookingFormProps {
    toolId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const BookingForm = ({ toolId, onClose, onSuccess }: BookingFormProps) => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(null);
    const queryClient = useQueryClient();

    const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['tool-bookings', toolId],
        queryFn: () => api.get(`/bookings/tool/${toolId}`).then(res => res.data),
        enabled: !!toolId
    });

    const mutation = useMutation({
        mutationFn: (newBooking: { toolId: number, startDate: Date, endDate: Date }) => {
            return api.post('/bookings', newBooking);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tool-bookings', toolId] });
            toast.success('Tool booked successfully!');
            onSuccess();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (startDate && endDate) {
            mutation.mutate({ toolId, startDate, endDate });
        }
    };
    
    const excludedDates = bookings?.map(b => ({
        start: new Date(b.startDate),
        end: new Date(b.endDate)
    }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mt-4 w-full max-w-md relative">
                <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-4">Book this Tool</h3>
                {bookingsLoading && <Spinner />}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">From</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        minDate={new Date()}
                        excludeDateIntervals={excludedDates}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">To</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate || new Date()}
                        excludeDateIntervals={excludedDates}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Booking...' : 'Book Now'}
                </button>
            </form>
        </div>
    );
};

export default BookingForm; 