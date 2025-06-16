'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface Booking {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    tool: {
        id: number;
        name: string;
    };
    user: {
        username: string;
    };
}

interface EventType {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource: string;
}

const localizer = momentLocalizer(moment);

const BookingCalendarPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const { data: bookings, isLoading, isError, error } = useQuery<Booking[]>({
        queryKey: ['bookings'],
        queryFn: () => api.get('/bookings').then(res => res.data),
        enabled: isAuthenticated,
    });
    
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    const events = useMemo(() => {
        return bookings?.map(booking => ({
            id: booking.id,
            title: booking.tool.name,
            start: new Date(booking.startDate),
            end: new Date(booking.endDate),
            resource: booking.status
        })) || [];
    }, [bookings]);
    
    const eventStyleGetter = (event: EventType) => {
        const status = event.resource;
        let backgroundColor = '#3174ad'; // Default for 'booked'
        if (status === 'active') {
            backgroundColor = '#31ad74';
        } else if (status === 'completed') {
            backgroundColor = '#757575';
        }
        return { style: { backgroundColor } };
    };

    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    if (isError) {
        return <div className="container mx-auto p-4">Error: {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch bookings'}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Booking Calendar</h1>
            <div className="bg-white p-6 rounded shadow-md" style={{ height: '500px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                />
            </div>
        </div>
    );
};

export default BookingCalendarPage; 