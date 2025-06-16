'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface InventorySummary {
    available: number;
    in_use: number;
    in_maintenance: number;
    booked: number;
}

interface MaintenanceSummary {
    scheduled: number;
    'in-progress': number;
    completed: number;
}

interface UtilizationSummary {
    toolId: number;
    bookingCount: string;
    tool: {
        name: string;
    };
}

const ManagerDashboard = () => {
    const { t } = useTranslation();
    const { isAuthenticated, loading: authLoading, hasRole } = useAuth();
    const router = useRouter();

    const isAuthorized = hasRole(['admin', 'manager']);

    const { data: inventory, isLoading: inventoryLoading } = useQuery<InventorySummary>({
        queryKey: ['inventory-summary'],
        queryFn: () => api.get('/dashboard/inventory').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });

    const { data: maintenance, isLoading: maintenanceLoading } = useQuery<MaintenanceSummary>({
        queryKey: ['maintenance-summary'],
        queryFn: () => api.get('/dashboard/maintenance').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });
    
    const { data: utilization, isLoading: utilizationLoading } = useQuery<UtilizationSummary[]>({
        queryKey: ['utilization-summary'],
        queryFn: () => api.get('/dashboard/utilization').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAuthorized)) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router, isAuthorized]);

    if (authLoading || inventoryLoading || maintenanceLoading || utilizationLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    if (!isAuthorized) {
        return <div className="text-center p-8">{t('managerDashboard.notAuthorized')}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('managerDashboard.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Inventory Summary */}
                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('managerDashboard.inventory.title')}</h2>
                    <ul className="space-y-2">
                        <li>{t('managerDashboard.inventory.available')}: <span className="font-semibold">{inventory?.available || 0}</span></li>
                        <li>{t('managerDashboard.inventory.inUse')}: <span className="font-semibold">{inventory?.in_use || 0}</span></li>
                        <li>{t('managerDashboard.inventory.inMaintenance')}: <span className="font-semibold">{inventory?.in_maintenance || 0}</span></li>
                        <li>{t('managerDashboard.inventory.booked')}: <span className="font-semibold">{inventory?.booked || 0}</span></li>
                    </ul>
                </div>

                {/* Maintenance Summary */}
                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('managerDashboard.maintenance.title')}</h2>
                    <ul className="space-y-2">
                        <li>{t('managerDashboard.maintenance.scheduled')}: <span className="font-semibold">{maintenance?.scheduled || 0}</span></li>
                        <li>{t('managerDashboard.maintenance.inProgress')}: <span className="font-semibold">{maintenance?.['in-progress'] || 0}</span></li>
                        <li>{t('managerDashboard.maintenance.completed')}: <span className="font-semibold">{maintenance?.completed || 0}</span></li>
                    </ul>
                </div>

                {/* Utilization Summary */}
                <div className="bg-white p-6 rounded shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('managerDashboard.utilization.title')}</h2>
                    {utilization && utilization.length > 0 ? (
                        <ul className="space-y-2">
                            {utilization.map(item => (
                                <li key={item.toolId} className="flex justify-between">
                                    <Link href={`/tools/${item.toolId}`} className="text-blue-600 hover:underline">{item.tool.name}</Link>
                                    <span>{t('managerDashboard.utilization.bookings', { count: Number(item.bookingCount) })}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{t('managerDashboard.utilization.noData')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard; 