'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Location {
    id: number;
    name: string;
}

const LocationsPage = () => {
    const { isAuthenticated, loading: authLoading, hasRole } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');

    const isAuthorized = hasRole(['admin', 'manager']);

    const { data: locations, isLoading } = useQuery<Location[]>({
        queryKey: ['locations'],
        queryFn: () => api.get('/locations').then(res => res.data),
        enabled: !!(isAuthenticated && isAuthorized),
    });

    const createMutation = useMutation({
        mutationFn: (newLocation: {name: string}) => api.post('/locations', newLocation),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            setName('');
        }
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAuthorized)) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router, isAuthorized]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name });
    };

    if (authLoading || isLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }
    
    if (!isAuthorized) {
        return <div className="text-center p-8">You are not authorized to view this page.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Locations</h1>
            
            <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-2">Add New Location</h2>
                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Location Name" 
                        className="p-2 border rounded w-full"
                        required 
                    />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Adding...' : 'Add Location'}
                    </button>
                </div>
            </form>

            <div className="bg-white p-4 rounded shadow-md">
                <h2 className="text-xl font-bold mb-2">Existing Locations</h2>
                <ul className="divide-y divide-gray-200">
                    {locations?.map(location => (
                        <li key={location.id} className="py-2 flex justify-between items-center">
                            <span>{location.name}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LocationsPage; 