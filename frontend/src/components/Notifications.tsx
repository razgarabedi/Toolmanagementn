'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
// @ts-ignore: If you see a module error, run: npm install socket.io-client
import { io as socketIOClient } from 'socket.io-client';

interface Notification {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
}

const Notifications = () => {
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const { data: notifications } = useQuery<Notification[]>({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications/my-notifications').then(res => res.data),
        enabled: isAuthenticated,
    });

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        const socket = socketIOClient('http://localhost:5000', {
            withCredentials: true,
        });
        socket.on('connect', () => {
            socket.emit('join', user.id);
        });
        socket.on('notification', () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });
        return () => {
            socket.disconnect();
        };
    }, [isAuthenticated, user, queryClient]);

    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
    
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative">
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
                    <div className="p-2 font-bold border-b">Notifications</div>
                    <ul className="divide-y max-h-96 overflow-y-auto">
                        {notifications?.map(notification => (
                            <li 
                                key={notification.id} 
                                className={`p-2 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                            >
                                <p className="text-sm">{notification.message}</p>
                                <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                            </li>
                        ))}
                        {notifications?.length === 0 && <li className="p-4 text-center text-gray-500">No new notifications</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Notifications; 