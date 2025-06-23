'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import { useTranslation } from 'react-i18next';
import SafeImage from '@/components/SafeImage';
import { getImageUrl } from '@/lib/utils';
import { Key, Tag, HardHat, MapPin, Wrench, Info, Package, Users, Calendar, CheckCircle } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import BookingForm from '@/components/BookingForm';
import CheckoutForm from '@/components/CheckoutForm';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ToolInstance {
    id: number;
    name: string;
    description: string;
    status: 'available' | 'in_use' | 'in_maintenance' | 'booked';
    rfid?: string;
    serialNumber?: string;
    condition: string;
    instanceImage?: string;
    location?: { id: number; name: string };
    toolType?: {
        id: number;
        name: string;
        image?: string;
        category?: { id: number; name: string; };
        manufacturer?: { id: number; name: string; };
    };
    bookings?: any[];
    maintenances?: any[];
    activeBooking?: { id: number; user: { id: number; name: string }, endDate: string };
}

const ToolDetailPage = () => {
    const { t } = useTranslation('common');
    const params = useParams();
    const { id } = params;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);

    const { data: tool, isLoading, isError, error } = useQuery<ToolInstance>({
        queryKey: ['tool', id],
        queryFn: () => api.get(`/tools/${id}`).then(res => res.data),
        enabled: !!id,
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
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            toast.success(t('toolDetail.checkoutSuccess'));
            setCheckoutModalOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || t('toolDetail.checkoutError')),
    });

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    if (isError) {
        return <div className="text-center mt-10 text-red-500">{t('tools.loadError')}: {error?.message}</div>;
    }

    if (!tool) {
        return <div className="text-center mt-10">{t('tools.notFound')}</div>;
    }

    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'in_use': return 'bg-yellow-100 text-yellow-800';
            case 'in_maintenance': return 'bg-red-100 text-red-800';
            case 'booked': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getConditionClasses = (condition: string) => {
        switch (condition) {
            case 'new':
            case 'good': return 'bg-blue-100 text-blue-800';
            case 'fair': return 'bg-yellow-100 text-yellow-800';
            case 'poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const handleCheckout = () => {
        if (tool.status === 'available') {
            setCheckoutModalOpen(true);
        } else {
            toast.error(t('tools.notAvailableForCheckout'));
        }
    };
    
    const handleBook = () => {
        if (tool.status === 'available' || tool.status === 'booked') {
            setBookingModalOpen(true);
        } else {
            toast.error(t('tools.notAvailableForBooking'));
        }
    };

    const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | React.ReactNode }) => (
        <div className="flex items-start text-sm">
            <div className="flex-shrink-0 w-6 h-6 text-gray-500">{icon}</div>
            <div className="ml-3">
                <p className="font-medium text-gray-800">{label}</p>
                <p className="text-gray-600">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/3 relative h-80">
                            <SafeImage
                                src={getImageUrl(tool.instanceImage) || getImageUrl(tool.toolType?.image) || ''}
                                fallbackSrc="/vercel.svg"
                                alt={tool.name || 'Tool Image'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="p-6 md:w-2/3">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusClasses(tool.status)}`}>
                                    {t(`toolInstanceForm.status.${tool.status}`)}
                                </span>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getConditionClasses(tool.condition)}`}>
                                    {t(`toolInstanceForm.condition.${tool.condition}`)}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-6">{tool.description}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DetailItem icon={<Info />} label={t('toolDetail.type')} value={tool.toolType?.name} />
                                <DetailItem icon={<Package />} label={t('toolDetail.category')} value={tool.toolType?.category?.name} />
                                <DetailItem icon={<HardHat />} label={t('toolDetail.manufacturer')} value={tool.toolType?.manufacturer?.name} />
                                <DetailItem icon={<MapPin />} label={t('toolDetail.location')} value={tool.location?.name} />
                                <DetailItem icon={<Key />} label={t('toolDetail.rfid')} value={tool.rfid} />
                                <DetailItem icon={<Tag />} label={t('toolDetail.serialNumber')} value={tool.serialNumber} />
                            </div>

                            {tool.status === 'in_use' && tool.activeBooking && (
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h3 className="font-bold text-yellow-800 flex items-center gap-2"><Users />{t('toolDetail.checkedOutTo')}</h3>
                                    <p className="text-yellow-700">{tool.activeBooking.user.name}</p>
                                    <p className="text-yellow-700">{t('toolDetail.returnDate', { date: new Date(tool.activeBooking.endDate).toLocaleDateString() })}</p>
                                </div>
                            )}

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleCheckout}
                                    disabled={tool.status !== 'available'}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={20} /> {t('toolDetail.checkout')}
                                </button>
                                <button
                                    onClick={handleBook}
                                    disabled={tool.status === 'in_use' || tool.status === 'in_maintenance'}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Calendar size={20} /> {t('toolDetail.book')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {isBookingModalOpen && (
                    <BookingForm
                        toolId={tool.id}
                        isOpen={isBookingModalOpen}
                        onClose={() => setBookingModalOpen(false)}
                        onBookingSuccess={() => {
                            setBookingModalOpen(false);
                            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
                            queryClient.invalidateQueries({ queryKey: ['tool', id] });
                        }}
                    />
                )}
                 {isCheckoutModalOpen && (
                    <CheckoutForm
                        tool={tool}
                        isOpen={isCheckoutModalOpen}
                        onClose={() => setCheckoutModalOpen(false)}
                        onConfirm={(data) => {
                            checkoutMutation.mutate({ toolId: tool.id, ...data });
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ToolDetailPage; 