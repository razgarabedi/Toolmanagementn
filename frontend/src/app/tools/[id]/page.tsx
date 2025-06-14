'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import BookingForm from '@/components/BookingForm';
import useAuth from '@/hooks/useAuth';
import useToolActions from '@/hooks/useToolActions';
import MaintenanceForm from '@/components/MaintenanceForm';
import MaintenanceHistory from '@/components/MaintenanceHistory';

const ToolDetailPage = () => {
    const { id } = useParams();
    const { user, hasRole } = useAuth();
    const { checkout, checkin, loading: actionLoading } = useToolActions();
    const router = useRouter();

    const { data: tool, isLoading, error } = useQuery({
        queryKey: ['tool', id],
        queryFn: () => api.get(`/tools/${id}`).then(res => res.data)
    });

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (error) return <div>Error loading tool details.</div>;

    const statusColor = tool.status === 'available' ? 'bg-green-500' :
                        tool.status === 'in_use' ? 'bg-yellow-500' :
                        tool.status === 'in_maintenance' ? 'bg-red-500' :
                        'bg-gray-500';

    return (
        <div className="container mx-auto p-4">
            <button onClick={() => router.back()} className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                &larr; Back to List
            </button>
            <div className="bg-white p-6 rounded shadow-md">
                <h1 className="text-3xl font-bold mb-4">{tool.name}</h1>
                <p className="mb-4">{tool.description}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-white ${statusColor}`}>{tool.status}</span></p>
                <p><strong>Condition:</strong> {tool.condition}</p>
                {tool.type && <p><strong>Type:</strong> {tool.type}</p>}
                {tool.location && <p><strong>Location:</strong> {tool.location.name}</p>}
                {tool.purchaseDate && <p><strong>Age:</strong> {`${Math.floor((new Date() - new Date(tool.purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25))} years old`}</p>}
                <p><strong>Usage Count:</strong> {tool.usageCount || 0}</p>
            </div>
            {tool.currentOwner && (
                <div className="mt-4">
                    <p>Currently checked out by: <strong>{tool.currentOwner.username}</strong></p>
                </div>
            )}
            <div className="mt-6 flex space-x-4">
                {tool.status === 'available' && (
                    <button 
                        onClick={() => checkout(Number(id))} 
                        disabled={actionLoading} 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        {actionLoading ? 'Processing...' : 'Check-out'}
                    </button>
                )}
                 {tool.status === 'in_use' && tool.currentOwnerId === user?.id && (
                    <button 
                        onClick={() => checkin(Number(id))} 
                        disabled={actionLoading}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        {actionLoading ? 'Processing...' : 'Check-in'}
                    </button>
                )}
            </div>
            
            <div className="mt-8">
                <BookingForm toolId={Number(id)} />
            </div>

            {(hasRole(['admin', 'manager'])) && (
                 <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-2">Maintenance</h2>
                    <MaintenanceForm toolId={Number(id)} />
                </div>
            )}
           
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-2">Maintenance History</h2>
                <MaintenanceHistory toolId={Number(id)} />
            </div>
        </div>
    );
};

export default ToolDetailPage; 