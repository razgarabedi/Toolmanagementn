'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Tool {
    id: number;
    name: string;
    condition: string;
}

interface Booking {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    tool: {
        id: number;
        name: string;
    };
}

const UserDashboard = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const { data: checkedOutTools, isLoading: toolsLoading } = useQuery<Tool[]>({
        queryKey: ['my-tools'],
        queryFn: () => api.get('/tools/my-tools').then(res => res.data),
        enabled: isAuthenticated,
    });

    const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
        queryKey: ['my-bookings'],
        queryFn: () => api.get('/bookings/my-bookings').then(res => res.data),
        enabled: isAuthenticated,
    });

    if (authLoading || toolsLoading || bookingsLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }
    
    const upcomingBookings = bookings?.filter(b => new Date(b.startDate) > new Date() && b.status === 'booked');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('dashboard.welcome', { username: user?.username })}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4">{t('dashboard.checkedOutTools.title')}</h2>
                    <div className="bg-white p-6 rounded shadow-md">
                        {checkedOutTools && checkedOutTools.length > 0 ? (
                             <ul className="divide-y divide-gray-200">
                                {checkedOutTools.map(tool => (
                                    <li key={tool.id} className="py-4">
                                        <Link href={`/tools/${tool.id}`} className="text-blue-600 hover:underline font-semibold">{tool.name}</Link>
                                        <p>{t('dashboard.checkedOutTools.condition')}: {tool.condition}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{t('dashboard.checkedOutTools.noTools')}</p>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-4">{t('dashboard.upcomingBookings.title')}</h2>
                    <div className="bg-white p-6 rounded shadow-md">
                        {upcomingBookings && upcomingBookings.length > 0 ? (
                             <ul className="divide-y divide-gray-200">
                                {upcomingBookings.map(booking => (
                                    <li key={booking.id} className="py-4">
                                        <Link href={`/tools/${booking.tool.id}`} className="text-blue-600 hover:underline font-semibold">{booking.tool.name}</Link>
                                        <p>{t('dashboard.upcomingBookings.from')}: {new Date(booking.startDate).toLocaleDateString()}</p>
                                        <p>{t('dashboard.upcomingBookings.to')}: {new Date(booking.endDate).toLocaleDateString()}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{t('dashboard.upcomingBookings.noBookings')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard; 