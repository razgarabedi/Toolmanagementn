'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MaintenanceCostReportItem {
    toolId: number;
    totalCost: string;
    'tool.name': string;
}

interface UtilizationReportItem {
    id: number;
    name: string;
    usageCount: number;
    totalDuration: number; // in milliseconds
}

interface MissingToolReportItem {
    id: number;
    endDate: string;
    tool: { name: string };
    user: { username: string };
}

const ReportsPage = () => {
    const { isAuthenticated, loading: authLoading, hasRole } = useAuth();
    const router = useRouter();

    const isAuthorized = hasRole(['admin', 'manager']);

    const { data: maintenanceCostReport, isLoading: maintenanceLoading } = useQuery<MaintenanceCostReportItem[]>({
        queryKey: ['maintenanceCostReport'],
        queryFn: () => api.get('/dashboard/reports/maintenance-cost').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });
    
    const { data: utilizationReport, isLoading: utilizationLoading } = useQuery<UtilizationReportItem[]>({
        queryKey: ['utilizationReport'],
        queryFn: () => api.get('/dashboard/reports/utilization').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });
    
    const { data: missingToolsReport, isLoading: missingToolsLoading } = useQuery<MissingToolReportItem[]>({
        queryKey: ['missingToolsReport'],
        queryFn: () => api.get('/dashboard/reports/missing-tools').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAuthorized)) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router, isAuthorized]);

    if (authLoading || maintenanceLoading || utilizationLoading || missingToolsLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }
    
    if (!isAuthorized) {
        return <div className="text-center p-8">You are not authorized to view this page.</div>;
    }

    const formatDuration = (ms: number) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${days}d ${hours}h`;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            
            <div className="bg-white p-6 rounded shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">Maintenance Cost Report</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {maintenanceCostReport?.map(item => (
                            <tr key={item.toolId}>
                                <td className="px-6 py-4 whitespace-nowrap">{item['tool.name']}</td>
                                <td className="px-6 py-4 whitespace-nowrap">${parseFloat(item.totalCost).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white p-6 rounded shadow-md mt-8">
                <h2 className="text-xl font-bold mb-4">Utilization Report</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Duration</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {utilizationReport?.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.usageCount}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{formatDuration(item.totalDuration)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white p-6 rounded shadow-md mt-8">
                <h2 className="text-xl font-bold mb-4">Missing Tools Report</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tool Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen With</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {missingToolsReport?.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.tool.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(item.endDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage; 