'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from './Spinner';
import { X } from 'lucide-react';

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

interface CheckoutFormProps {
    tool: Tool | null;
    onClose: () => void;
    onSubmit: (data: { userId?: number; endDate: Date; notes?: string }) => void;
    isAdminOrManager: boolean;
}

const CheckoutForm = ({ tool, onClose, onSubmit, isAdminOrManager }: CheckoutFormProps) => {
    const { t } = useTranslation('common');
    const [endDate, setEndDate] = useState<Date>(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Default to 7 days from now
        return date;
    });
    const [notes, setNotes] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

    const { data: users, isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => api.get('/users').then(res => res.data),
        enabled: isAdminOrManager, // Only fetch users if admin/manager
    });

    useEffect(() => {
        if (users && users.length > 0) {
            setSelectedUserId(users[0].id);
        }
    }, [users]);

    if (!tool) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            endDate,
            notes,
            userId: selectedUserId
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4">{t('checkout.title')}</h2>
                <p className="mb-6 text-gray-600">{`${tool.name} (${tool.rfid || 'N/A'})`}</p>

                <form onSubmit={handleSubmit}>
                    {isAdminOrManager && (
                        <div className="mb-4">
                            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.user')}</label>
                            {usersLoading ? <Spinner /> : (
                                <select
                                    id="user"
                                    value={selectedUserId || ''}
                                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="" disabled>{t('checkout.selectUser')}</option>
                                    {users?.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} {user.department ? `(${user.department})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.returnDate')}</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate.toISOString().split('T')[0]}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.notes')}</label>
                        <textarea
                            id="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder={t('checkout.notesPlaceholder')}
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-900">{t('common.cancel')}</button>
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700">{t('checkout.confirm')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm; 