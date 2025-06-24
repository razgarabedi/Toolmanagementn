'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ScanLine } from 'lucide-react';
import ScannerModal from '@/components/ScannerModal';
import CheckoutForm from '@/components/CheckoutForm';
import CheckinForm from '@/components/CheckinForm';
import { useToolActions } from '@/hooks/useToolActions';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Condition = 'new' | 'good' | 'fair' | 'poor';

interface Tool {
    id: number;
    name: string;
    condition: Condition;
    tool: {
        id: number;
        name: string;
    };
    activeBooking?: { id: number } | null;
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

type ScanMode = 'checkin' | 'checkout' | null;

const UserDashboard = () => {
    const { t } = useTranslation();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { checkinMutation, checkoutMutation } = useToolActions();
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [scanMode, setScanMode] = useState<ScanMode>(null);
    const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [isCheckinModalOpen, setCheckinModalOpen] = useState(false);

    const { data: checkedOutTools, isLoading: toolsLoading, refetch: refetchTools } = useQuery<Tool[]>({
        queryKey: ['my-tools'],
        queryFn: () => api.get('/tools/my-tools').then(res => res.data),
        enabled: isAuthenticated,
    });

    const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery<Booking[]>({
        queryKey: ['my-bookings'],
        queryFn: () => api.get('/bookings/my-bookings').then(res => res.data),
        enabled: isAuthenticated,
    });

    const handleScanSuccess = async (scannedId: string) => {
        try {
            const { data: tool } = await api.get(`/tools/${scannedId}`);
            if (tool && (tool.rfid === scannedId || tool.serialNumber === scannedId || tool.id.toString() === scannedId)) {
                setSelectedTool(tool);
                if (scanMode === 'checkout') {
                    setCheckoutModalOpen(true);
                } else if (scanMode === 'checkin') {
                    if (tool.status === 'in_use') {
                        setCheckinModalOpen(true);
                    } else {
                        toast.error(t('dashboard.scan.notCheckedOut'));
                    }
                }
            } else {
                toast.error(t('dashboard.scan.toolNotFound'));
            }
        } catch (error) {
            toast.error(t('dashboard.scan.toolNotFound'));
        } finally {
            setScannerOpen(false);
        }
    };

    const handleConfirmCheckout = (data: { userId?: number, endDate: Date, notes?: string }) => {
        if (selectedTool) {
            checkoutMutation.mutate({ toolId: selectedTool.id, ...data }, {
                onSuccess: () => {
                    setCheckoutModalOpen(false);
                    setSelectedTool(null);
                    refetchTools();
                    refetchBookings();
                }
            });
        }
    };
    
    const handleConfirmCheckin = (data: { condition: any; notes?: string }) => {
        if (selectedTool && selectedTool.activeBooking) {
            checkinMutation.mutate({ 
                bookingId: selectedTool.activeBooking.id, 
                toolId: selectedTool.id,
                ...data 
            }, {
                onSuccess: () => {
                    setCheckinModalOpen(false);
                    setSelectedTool(null);
                    refetchTools();
                    refetchBookings();
                }
            });
        } else {
            toast.error("No active booking found for this tool.");
        }
    };

    if (authLoading || toolsLoading || bookingsLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }
    
    const upcomingBookings = bookings?.filter(b => new Date(b.startDate) > new Date() && b.status === 'booked');

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('dashboard.welcome', { username: user?.username })}</h1>
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => { setScanMode('checkout'); setScannerOpen(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
                >
                    <ScanLine />
                    {t('dashboard.scan.checkout')}
                </button>
                <button
                    onClick={() => { setScanMode('checkin'); setScannerOpen(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
                >
                    <ScanLine />
                    {t('dashboard.scan.checkin')}
                </button>
            </div>
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
            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setScannerOpen(false)}
                onScan={handleScanSuccess}
            />
            {isCheckoutModalOpen && selectedTool && (
                <CheckoutForm
                    tool={selectedTool}
                    onClose={() => setCheckoutModalOpen(false)}
                    onSubmit={handleConfirmCheckout}
                    isAdminOrManager={user?.role === 'admin' || user?.role === 'manager'}
                />
            )}
            {isCheckinModalOpen && selectedTool && (
                <CheckinForm
                    tool={selectedTool}
                    booking={selectedTool.activeBooking || null}
                    onClose={() => setCheckinModalOpen(false)}
                    onSubmit={handleConfirmCheckin}
                />
            )}
        </div>
    );
};

export default UserDashboard; 