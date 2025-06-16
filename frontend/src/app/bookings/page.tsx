'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { Grid, List, Search, SlidersHorizontal, User } from 'lucide-react';
import Spinner from '@/components/Spinner';
import { TFunction } from 'i18next';

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
  status: 'booked' | 'active' | 'completed' | 'cancelled' | 'pending_approval';
  notes: string;
}

const BookingCard = ({ booking, t }: { booking: Booking, t: TFunction }) => {
  const isPending = booking.status === 'pending_approval';
  const isCheckedOut = booking.status === 'active';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-lg">{booking.tool.name}</h3>
        <p className="text-sm text-gray-500">RFID: {booking.tool.rfid}</p>
        <div className="mt-4 text-sm space-y-2">
          <p><span className="font-semibold">{t('bookings.bookedBy')}:</span> {booking.user.username}</p>
          <p><span className="font-semibold">{t('bookings.period')}:</span> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
          <p><span className="font-semibold">{t('bookings.bookedOn')}:</span> {new Date(booking.createdAt).toLocaleString()}</p>
          {booking.notes && <p><span className="font-semibold">{t('bookings.notes')}:</span> {booking.notes}</p>}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        {isPending && (
          <>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm w-full">{t('bookings.approvalPending')}</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm w-full">{t('bookings.approve')}</button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md text-sm w-full">{t('bookings.decline')}</button>
          </>
        )}
        {isCheckedOut && (
          <>
            <button className="bg-yellow-400 text-yellow-800 px-4 py-2 rounded-md text-sm w-full">{t('bookings.checkedOut')}</button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm w-full">{t('bookings.checkIn')}</button>
          </>
        )}
      </div>
    </div>
  );
};

const BookingsPage = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid');

  const { data: bookings, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: () => api.get('/bookings').then(res => res.data),
  });

  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
  if (isError) return <div className="text-center mt-10">{t('bookings.loadError')}</div>;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.search.title')}</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <input type="text" placeholder={t('bookings.search.placeholder')} className="pl-10 block w-full p-2 border border-gray-300 rounded-md" autoComplete="off" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.status.title')}</label>
             <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <select className="pl-10 block w-full p-2 border border-gray-300 rounded-md appearance-none" autoComplete="off">
                    <option>{t('bookings.status.all')}</option>
                </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookings.user.title')}</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                <select className="pl-10 block w-full p-2 border border-gray-300 rounded-md appearance-none" autoComplete="off">
                    <option>{t('bookings.user.all')}</option>
                </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings?.map(booking => (
          <BookingCard key={booking.id} booking={booking} t={t} />
        ))}
      </div>
    </div>
  );
};

export default BookingsPage; 