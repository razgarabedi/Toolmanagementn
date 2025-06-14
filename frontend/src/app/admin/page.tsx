'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
    id: number;
    username: string;
    email: string;
    role: { name: string };
}

interface Role {
    id: number;
    name: string;
}

const AdminDashboard = () => {
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const { data: users, isLoading: usersLoading, isError: usersError } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => api.get('/users').then(res => res.data),
        enabled: isAuthenticated && currentUser?.role === 'admin',
    });

    const { data: roles, isLoading: rolesLoading, isError: rolesError } = useQuery<Role[]>({
        queryKey: ['roles'],
        queryFn: () => api.get('/roles').then(res => res.data),
        enabled: isAuthenticated && currentUser?.role === 'admin',
    });

    const { data: overdueBookings, isLoading: overdueLoading } = useQuery<any[]>({
        queryKey: ['overdue-bookings'],
        queryFn: () => api.get('/bookings/overdue').then(res => res.data),
        enabled: isAuthenticated && currentUser?.role === 'admin',
    });

    const mutation = useMutation({
        mutationFn: ({ userId, roleId }: { userId: number, roleId: number }) => {
            return api.put(`/users/${userId}/role`, { roleId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User role updated successfully!');
            setSelectedUser(null);
            setSelectedRoleId(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    });

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || currentUser?.role !== 'admin')) {
            router.push('/');
        }
    }, [isAuthenticated, authLoading, currentUser, router]);
    
    const handleRoleChange = (userId: number, roleId: string) => {
        mutation.mutate({userId, roleId: parseInt(roleId, 10)});
    }

    if (authLoading || usersLoading || rolesLoading || overdueLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    }

    if (usersError || rolesError) {
        return <div className="container mx-auto p-4">Error fetching data.</div>;
    }
    
    if (!isAuthenticated || currentUser?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">User Management</h2>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">Username</th>
                            <th className="py-2">Email</th>
                            <th className="py-2">Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <tr key={user.id}>
                                <td className="border px-4 py-2">{user.username}</td>
                                <td className="border px-4 py-2">{user.email}</td>
                                <td className="border px-4 py-2">
                                    <select 
                                        value={roles?.find(r => r.name === user.role.name)?.id} 
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="p-2 border border-gray-300 rounded"
                                        disabled={mutation.isPending}
                                    >
                                        {roles?.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white p-6 rounded shadow-md mt-4">
                <h2 className="text-xl font-bold mb-4">Overdue Tools</h2>
                {overdueBookings && overdueBookings.length > 0 ? (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2">Tool</th>
                                <th className="py-2">User</th>
                                <th className="py-2">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overdueBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="border px-4 py-2">{booking.tool.name}</td>
                                    <td className="border px-4 py-2">{booking.user.username}</td>
                                    <td className="border px-4 py-2">{new Date(booking.endDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No overdue tools.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 