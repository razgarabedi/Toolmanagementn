'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { Grid, List, Search, SlidersHorizontal, User, Check, X, Ban } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { TFunction } from 'i18next';
import toast from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';

interface Booking {
  id: number;
  tool: {
    id: number;
    name: string;
    rfid: string;
  };
  user: {
    id: number;
    username: string;
  };
  startDate: string;
  endDate: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
}

const BookingActions = ({ booking, t }: { booking: Booking, t: TFunction }) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['tools'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t('bookings.genericError'));
        }
    };

    const approveMutation = useMutation({ ...mutationOptions, mutationFn: () => api.put(`/bookings/${booking.id}/approve`), });
    const rejectMutation = useMutation({ ...mutationOptions, mutationFn: () => api.put(`/bookings/${booking.id}/reject`), });
    const cancelMutation = useMutation({ ...mutationOptions, mutationFn: () => api.put(`/bookings/${booking.id}/cancel`), });
    const checkoutMutation = useMutation({ ...mutationOptions, mutationFn: () => api.put(`/bookings/${booking.id}/checkout`), });
    const checkinMutation = useMutation({ ...mutationOptions, mutationFn: () => api.put(`/bookings/${booking.id}/checkin`), });

    const isCheckoutAllowed = new Date(booking.startDate) <= new Date();

    if (user?.role !== 'admin' && user?.role !== 'manager') return null;

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {booking.status === 'pending' && (
                <>
                    <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending} className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center justify-center gap-1">
                        <Check size={16}/> {t('bookings.approve')}
                    </button>
                    <button onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending} className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1">
                        <X size={16}/> {t('bookings.reject')}
                    </button>
                </>
            )}
            {booking.status === 'approved' && (
                <>
                    <button onClick={() => checkoutMutation.mutate()} disabled={!isCheckoutAllowed || checkoutMutation.isPending} className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-1">
                        {t('bookings.checkout')}
                    </button>
                    <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-1">
                         <Ban size={16}/> {t('bookings.cancel')}
                    </button>
                </>
            )}
            {booking.status === 'active' && (
                 <button onClick={() => checkinMutation.mutate()} disabled={checkinMutation.isPending} className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center justify-center gap-1">
                    {t('bookings.checkin')}
                </button>
            )}
        </div>
    )
}

const BookingCard = ({ booking, t }: { booking: Booking, t: TFunction }) => {
  const getStatusClasses = (status: string) => {
    switch(status){
        case 'pending': return 'bg-orange-200 text-orange-800';
        case 'approved': return 'bg-blue-200 text-blue-800';
        case 'active': return 'bg-yellow-200 text-yellow-800';
        case 'completed': return 'bg-green-200 text-green-800';
        case 'rejected':
        case 'cancelled': return 'bg-red-200 text-red-800';
        default: return 'bg-gray-200 text-gray-800';
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{booking.tool.name}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(booking.status)}`}>
                {t(`bookings.statusValues.${booking.status}`)}
            </span>
        </div>
        <p className="text-sm text-gray-500">{t('bookings.rfid')}: {booking.tool.rfid}</p>
        <div className="mt-4 text-sm space-y-2">
          <p><span className="font-semibold">{t('bookings.bookedBy')}:</span> {booking.user.username}</p>
          <p><span className="font-semibold">{t('bookings.period')}:</span> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
          <p><span className="font-semibold">{t('bookings.bookedOn')}:</span> {new Date(booking.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <BookingActions booking={booking} t={t} />
    </div>
  );
};

const BookingsPage = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: bookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['bookings', statusFilter],
    queryFn: () => api.get('/bookings', { params: { status: statusFilter } }).then(res => res.data),
  });

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
  if (isError) return <div className="text-center mt-10">{t('bookings.loadError')}</div>;

  const bookingStatuses = ['pending', 'approved', 'active', 'completed', 'rejected', 'cancelled'];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('nav.bookings')}</h1>
        <div className="flex items-center gap-2">
            <span>{t('bookings.viewOptions')}:</span>
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-purple-200 text-purple-700' : ''}`}>
                <Grid size={20} />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-purple-200 text-purple-700' : ''}`}>
                <List size={20} />
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.status.title')}</label>
             <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 block w-full p-2 border border-gray-300 rounded-md appearance-none" 
                    autoComplete="off"
                >
                    <option value="">{t('bookings.status.all')}</option>
                    {bookingStatuses.map(status => (
                        <option key={status} value={status}>{t(`bookings.statusValues.${status}`)}</option>
                    ))}
                </select>
            </div>
          </div>
          {/* Other filters can be added here */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings?.map(booking => (
          <BookingCard key={booking.id} booking={booking} t={t} />
        ))}
        {bookings?.length === 0 && <p className="text-center col-span-full">{t('bookings.noBookingsFound')}</p>}
      </div>
    </div>
  );
};

export default BookingsPage; 