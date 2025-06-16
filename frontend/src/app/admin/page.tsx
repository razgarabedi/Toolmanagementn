'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface User {
    id: number;
    username: string;
    email: string;
    role: { name: string };
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface Booking {
    id: number;
    endDate: string;
    tool: {
        toolType: {
            name: string;
        }
    };
    user: {
        username: string;
    };
}

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

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

    const { data: overdueBookings, isLoading: overdueLoading } = useQuery<Booking[]>({
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
            toast.success(t('admin.roleUpdateSuccess'));
        },
        onError: (error: { response?: { status?: number, data?: { message?: string } } }) => {
            if (error.response?.status === 403) {
                toast.error(t('admin.cantChangeOwnRole'));
            } else {
                toast.error(error.response?.data?.message || t('admin.error'));
            }
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
        return <div className="container mx-auto p-4">{t('admin.errorFetching')}</div>;
    }
    
    if (!isAuthenticated || currentUser?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t('admin.title')}</h1>
            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-xl font-bold mb-4">{t('admin.userManagement.title')}</h2>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2">{t('admin.userManagement.username')}</th>
                            <th className="py-2">{t('admin.userManagement.email')}</th>
                            <th className="py-2">{t('admin.userManagement.role')}</th>
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
                <h2 className="text-xl font-bold mb-4">{t('admin.overdueTools.title')}</h2>
                {overdueBookings && overdueBookings.length > 0 ? (
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2">{t('admin.overdueTools.tool')}</th>
                                <th className="py-2">{t('admin.overdueTools.user')}</th>
                                <th className="py-2">{t('admin.overdueTools.dueDate')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overdueBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td className="border px-4 py-2">{booking.tool.toolType.name}</td>
                                    <td className="border px-4 py-2">{booking.user.username}</td>
                                    <td className="border px-4 py-2">{new Date(booking.endDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>{t('admin.overdueTools.noOverdue')}</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 