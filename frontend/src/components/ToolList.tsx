'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import useDebounce from '@/hooks/useDebounce';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import BookingForm from './BookingForm';
import UserSelectionModal from './UserSelectionModal';
import ConfirmationModal from './ConfirmationModal';

interface Tool {
    id: number;
    name: string;
    type: string;
    description: string;
    status: string;
    condition: string;
    location?: { name: string };
    bookings?: { id: number, endDate: string, status: string }[];
    activeBooking?: { id: number };
}

const ToolList = ({ onEdit }: { onEdit: (tool: Tool) => void }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [selectedToolId, setSelectedToolId] = useState<number | null>(null);
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [isUserSelectModalOpen, setUserSelectModalOpen] = useState(false);
  const [isCheckoutConfirmOpen, setCheckoutConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState<'book' | 'checkout' | null>(null);
  const [targetUserId, setTargetUserId] = useState<number | undefined>(undefined);

  const { data: tools, isLoading, isError } = useQuery({
    queryKey: ['tools', debouncedSearchTerm],
    queryFn: () => api.get('/tools', { params: { search: debouncedSearchTerm } }).then(res => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/tools/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success(t('toolList.deleteSuccess'));
    },
    onError: (error: any) => toast.error(error.response?.data?.message || t('toolList.error')),
  });

  const checkinMutation = useMutation({
      mutationFn: (bookingId: number) => api.put(`/bookings/${bookingId}/checkin`),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tools']});
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          toast.success("Tool checked in successfully!");
      },
      onError: (error: any) => toast.error(error.response?.data?.message || "Failed to check in tool."),
  });

  const checkoutMutation = useMutation({
      mutationFn: (data: { toolId: number, userId?: number, endDate: Date }) => {
          const { toolId, userId, endDate } = data;
          return api.post('/bookings', {
              toolId,
              userId,
              startDate: new Date(),
              endDate,
              status: 'active'
          });
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tools']});
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          toast.success("Tool checked out successfully!");
          setCheckoutConfirmOpen(false);
          setSelectedToolId(null);
      },
      onError: (error: any) => toast.error(error.response?.data?.message || "Failed to checkout tool."),
  });


  const handleBookClick = (toolId: number) => {
    setSelectedToolId(toolId);
    if (user?.role === 'admin' || user?.role === 'manager') {
      setActionType('book');
      setUserSelectModalOpen(true);
    } else {
      setBookingModalOpen(true);
    }
  };

  const handleCheckoutClick = (toolId: number) => {
    setSelectedToolId(toolId);
    if (user?.role === 'admin' || user?.role === 'manager') {
      setActionType('checkout');
      setUserSelectModalOpen(true);
    } else {
      setCheckoutConfirmOpen(true);
    }
  };

  const handleUserSelected = (userId: number) => {
    setUserSelectModalOpen(false);
    setTargetUserId(userId);
    if (actionType === 'book') {
      setBookingModalOpen(true);
    } else if (actionType === 'checkout') {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Default 1 week checkout
      checkoutMutation.mutate({ toolId: selectedToolId!, userId, endDate });
    }
  };
  
  const handleConfirmCheckout = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Default 1 week checkout
    checkoutMutation.mutate({ toolId: selectedToolId!, endDate });
  };
  
  const handleCheckin = (tool: Tool) => {
      const activeBooking = tool.bookings?.find(b => b.status === 'active');
      if(activeBooking) {
          checkinMutation.mutate(activeBooking.id);
      } else {
          toast.error("No active booking found for this tool.");
      }
  }

  if (isLoading) return <Spinner />;
  if (isError) return <div>{t('toolList.errorFething')}</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Modals */}
      {isBookingModalOpen && selectedToolId && (
        <BookingForm 
          toolId={selectedToolId}
          userId={targetUserId}
          onClose={() => {
              setBookingModalOpen(false);
              setTargetUserId(undefined);
          }} 
          onSuccess={() => {
            setBookingModalOpen(false);
            setTargetUserId(undefined);
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }}
        />
      )}
      {isUserSelectModalOpen && (
        <UserSelectionModal 
          onClose={() => setUserSelectModalOpen(false)}
          onSelect={handleUserSelected}
        />
      )}
      {isCheckoutConfirmOpen && (
          <ConfirmationModal
              title="Confirm Checkout"
              message="Do you want to check out this tool for a default period of 7 days?"
              onConfirm={handleConfirmCheckout}
              onCancel={() => setCheckoutConfirmOpen(false)}
              confirmText="Checkout"
          />
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('toolList.title')}</h1>
        <input
          type="text"
          placeholder={t('toolList.searchPlaceholder')}
          value={searchTerm}
          autoComplete="off"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">{t('toolList.name')}</th>
            <th className="py-2">{t('toolList.type')}</th>
            <th className="py-2">{t('toolList.description')}</th>
            <th className="py-2">{t('toolList.status')}</th>
            <th className="py-2">{t('toolList.condition')}</th>
            <th className="py-2">{t('toolList.location')}</th>
            {(user?.role === 'admin' || user?.role === 'manager') && <th className="py-2">{t('toolList.actions')}</th>}
            <th className="py-2">{t('toolList.availabilityActions')}</th>
          </tr>
        </thead>
        <tbody>
          {tools?.map((tool: Tool) => (
            <tr key={tool.id}>
              <td className="border px-4 py-2">
                <Link href={`/tools/${tool.id}`} className="text-blue-600 hover:underline">
                  {tool.name}
                </Link>
              </td>
              <td className="border px-4 py-2">{tool.type}</td>
              <td className="border px-4 py-2">{tool.description}</td>
              <td className="border px-4 py-2">{tool.status}</td>
              <td className="border px-4 py-2">
                {tool.condition}
                {tool.status === 'in_use' && tool.bookings && tool.bookings.length > 0 && new Date(tool.bookings[0].endDate) < new Date() && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {t('toolList.overdue')}
                    </span>
                )}
              </td>
              <td className="border px-4 py-2">{tool.location?.name}</td>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => onEdit(tool)}
                  >
                    {t('toolList.edit')}
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteMutation.mutate(tool.id)}
                  >
                    {t('toolList.delete')}
                  </button>
                </td>
              )}
              <td className="border px-4 py-2">
                {tool.status === 'available' ? (
                  <>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleBookClick(tool.id)}
                    >
                      {t('toolList.book')}
                    </button>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleCheckoutClick(tool.id)}
                    >
                      {t('toolList.checkOut')}
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => handleCheckin(tool)}
                    disabled={checkinMutation.isPending}
                  >
                    {t('toolList.checkIn')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToolList; 