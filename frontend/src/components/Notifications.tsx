'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
// @ts-ignore: If you see a module error, run: npm install socket.io-client
import { io as socketIOClient } from 'socket.io-client';
import { useTranslation, Trans } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import moment from 'moment';
import 'moment/locale/de';

interface Notification {
    id: number;
    messageKey: string;
    messagePayload: object;
    isRead: boolean;
    createdAt: string;
}

const Notifications = () => {
    const { isAuthenticated, user } = useAuth();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const { t, i18n } = useTranslation(['translation', 'common']);
    const router = useRouter();

    const { data: notifications } = useQuery<Notification[]>({
        queryKey: ['unread-notifications'],
        queryFn: () => api.get('/notifications/unread').then(res => res.data),
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
            queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });
        return () => {
            socket.disconnect();
        };
    }, [isAuthenticated, user, queryClient]);

    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => api.put(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsReadMutation.mutateAsync(notification.id);
        }
        setIsOpen(false);
        router.push('/my-bookings');
    };

    const renderMessage = (notification: any) => {
        const { messageKey, messagePayload } = notification;
        const payload = {
            ...messagePayload,
            toolName: notification.tool?.name || notification.tool?.toolType?.name || messagePayload.toolName,
        };
        return (
            <div>
                <div>
                    <Trans
                        i18nKey={`notifications.${messageKey}`}
                        values={payload}
                        components={{
                            username: <span className="text-green-600 font-bold" />,
                            toolName: <span className="text-purple-600 font-bold" />,
                            startDate: <span className="text-blue-600 font-bold" />,
                            endDate: <span className="text-blue-600 font-bold" />
                        }}
                    />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {moment(notification.createdAt).locale(i18n.language).format('LLL')}
                </div>
            </div>
        )
    }

    const unreadCount = notifications?.length || 0;

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
                    <div className="p-2 font-bold border-b">{t('notifications.title')}</div>
                    <ul className="divide-y max-h-96 overflow-y-auto">
                        {notifications?.map(notification => (
                            <li
                                key={notification.id}
                                className={`p-4 cursor-pointer transition-colors ${
                                    notification.isRead 
                                    ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' 
                                    : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className={notification.isRead ? 'text-gray-500 dark:text-gray-400' : ''}>
                                    {renderMessage(notification)}
                                </div>
                            </li>
                        ))}
                        {unreadCount === 0 && <li className="p-4 text-center text-gray-500">{t('notifications.none')}</li>}
                    </ul>
                    <div className="p-2 border-t text-center">
                        <Link href="/notifications" onClick={() => setIsOpen(false)} className="text-sm text-blue-500 hover:underline">
                            {t('notifications.all')}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications; 