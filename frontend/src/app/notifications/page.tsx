'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { useTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/de'; // import German locale for moment

const NotificationsPage = () => {
    const { t, i18n } = useTranslation(['translation', 'common']);
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => api.get('/notifications/all').then(res => res.data),
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => api.put('/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
            toast.success(t('notifications.markedAsReadSuccess'));
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: () => api.delete('/notifications/clear-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
            toast.success(t('notifications.clearedAllSuccess'));
        },
    });
    
    const markAsReadMutation = useMutation({
        mutationFn: (id: number) => api.put(`/notifications/${id}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
        }
    });

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            await markAsReadMutation.mutateAsync(notification.id);
        }
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
                {notification.tool?.location && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {t('common:location')}: <span className="font-medium">{notification.tool.location.name}</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('notifications.title')}</h1>
                <div className="space-x-2">
                    <button
                        onClick={() => markAllAsReadMutation.mutate()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={markAllAsReadMutation.isPending}
                    >
                        {markAllAsReadMutation.isPending ? t('common:loading') : t('notifications.markAllAsRead')}
                    </button>
                    <button
                        onClick={() => clearAllMutation.mutate()}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        disabled={clearAllMutation.isPending}
                    >
                        {clearAllMutation.isPending ? t('common:loading') : t('notifications.clearAll')}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <p>{t('common:loading')}</p>
            ) : (
                <div className="space-y-2">
                    {notifications?.length > 0 ? (
                        notifications.map((notification: any) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${notification.isRead ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                            >
                                <div className={`space-y-1 ${notification.isRead ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                                    {renderMessage(notification)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {moment(notification.createdAt).locale(i18n.language).format('LLL')}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>{t('notifications.none')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;