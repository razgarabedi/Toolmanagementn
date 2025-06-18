'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from './Spinner';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: number;
    username: string;
    department?: string;
}

interface Tool {
    id: number;
    name: string;
    rfid?: string;
}

interface BookingFormProps {
    tool: Tool | null;
    onClose: () => void;
    isAdminOrManager: boolean;
}

const BookingForm = ({ tool, onClose, isAdminOrManager }: BookingFormProps) => {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(() => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    });
    const [notes, setNotes] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

    const { data: users, isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => api.get('/users').then(res => res.data),
        enabled: isAdminOrManager,
    });

    const bookingMutation = useMutation({
        mutationFn: (data: { toolId: number, userId?: number, startDate: Date, endDate: Date, notes?: string }) => {
            return api.post('/bookings', { ...data, status: 'pending' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            toast.success(t('bookingForm.success'));
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t('bookingForm.error'));
        }
    });

    useEffect(() => {
        if (users && users.length > 0) {
            setSelectedUserId(users[0].id);
        }
    }, [users]);

    if (!tool) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        bookingMutation.mutate({
            toolId: tool.id,
            startDate,
            endDate,
            notes,
            userId: selectedUserId
        });
    };

    const formatDateForInput = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('Buchung für')} {tool.name}</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">({tool.rfid || 'N/A'})</p>

                <form onSubmit={handleSubmit}>
                    {isAdminOrManager && (
                        <div className="mb-4">
                            <label htmlFor="user" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Benutzer')}</label>
                            {usersLoading ? <Spinner /> : (
                                <select
                                    id="user"
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="" disabled>{t('bookingForm.selectUser')}</option>
                                    {users?.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} {user.department ? `(${user.department})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Startdatum')}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="startDate"
                                    value={formatDateForInput(startDate)}
                                    readOnly
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="date"
                                    onChange={(e) => setStartDate(new Date(e.target.value))}
                                    className="absolute right-0 top-0 h-full w-full opacity-0 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Enddatum')}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="endDate"
                                    value={formatDateForInput(endDate)}
                                    readOnly
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="date"
                                    onChange={(e) => setEndDate(new Date(e.target.value))}
                                    className="absolute right-0 top-0 h-full w-full opacity-0 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Notizen (optional)')}</label>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-purple-600 dark:text-purple-400 font-bold py-2 px-4 rounded-md">{t('Abbrechen')}</button>
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2 font-bold" disabled={bookingMutation.isPending}>
                            {bookingMutation.isPending ? <Spinner size="sm" /> : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {t('Buchung bestätigen')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm; 