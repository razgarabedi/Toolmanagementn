'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SparePart {
    id: number;
    name: string;
    quantity: number;
}

const SparePartsPage = () => {
    const { isAuthenticated, loading: authLoading, hasRole } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(0);

    const isAuthorized = hasRole(['admin', 'manager']);

    const { data: spareParts, isLoading } = useQuery<SparePart[]>({
        queryKey: ['spareParts'],
        queryFn: () => api.get('/spare-parts').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });

    const createMutation = useMutation({
        mutationFn: (newPart: {name: string, quantity: number}) => api.post('/spare-parts', newPart),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spareParts'] });
            setName('');
            setQuantity(0);
        }
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAuthorized)) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router, isAuthorized]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, quantity });
    };

    if (authLoading || isLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }
    
    if (!isAuthorized) {
        return <div className="text-center p-8">You are not authorized to view this page.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Spare Parts Inventory</h1>
            
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-2">Add New Spare Part</h2>
                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Part Name" 
                        className="p-2 border rounded w-full"
                        required 
                    />
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))} 
                        placeholder="Quantity" 
                        className="p-2 border rounded w-1/4"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Adding...' : 'Add Part'}
                    </button>
                </div>
            </form>

            <div className="bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-2">Current Inventory</h2>
                <ul className="divide-y divide-gray-200">
                    {spareParts?.map(part => (
                        <li key={part.id} className="py-2 flex justify-between items-center">
                            <span>{part.name}</span>
                            <span>Quantity: {part.quantity}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SparePartsPage; 