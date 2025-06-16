'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

interface Category {
    id: number;
    name: string;
}

interface CategoryFormModalProps {
    onClose: () => void;
    onSuccess: (newCategory: Category) => void;
}

const CategoryFormModal = ({ onClose, onSuccess }: CategoryFormModalProps) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');

    const mutation = useMutation({
        mutationFn: (newCategory: { name: string }) => api.post('/categories', newCategory),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success(t('categoryForm.createSuccess'));
            onSuccess(data.data);
            onClose();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || t('categoryForm.error'));
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutation.mutate({ name });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">{t('categoryForm.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('categoryForm.nameLabel')}</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={mutation.isPending}>
                            {mutation.isPending ? <Spinner /> : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal; 