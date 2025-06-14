'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from './Spinner';

interface Maintenance {
    id: number;
    description: string;
    cost?: number;
    startDate: string;
    endDate?: string;
    status: string;
}

const MaintenanceHistory = ({ toolId }: { toolId: number }) => {
    const { data: history, isLoading } = useQuery<Maintenance[]>({
        queryKey: ['maintenance-history', toolId],
        queryFn: () => api.get(`/maintenance/tool/${toolId}`).then(res => res.data),
        enabled: !!toolId
    });

    if (isLoading) return <Spinner />;

    return (
        <div className="bg-white p-6 rounded shadow-md mt-4">
            <h3 className="text-xl font-bold mb-4">Maintenance History</h3>
            {history && history.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {history.map(item => (
                        <li key={item.id} className="py-4">
                            <p><strong>Status:</strong> {item.status}</p>
                            <p><strong>Date:</strong> {new Date(item.startDate).toLocaleDateString()}{item.endDate ? ` - ${new Date(item.endDate).toLocaleDateString()}` : ''}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            {item.cost && <p><strong>Cost:</strong> ${item.cost}</p>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No maintenance history for this tool.</p>
            )}
        </div>
    );
};

export default MaintenanceHistory; 