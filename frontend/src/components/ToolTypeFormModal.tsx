'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import MasterDataFormModal from './MasterDataFormModal';
import Image from 'next/image';

interface ToolType {
    id: number;
    name: string;
    description?: string;
    categoryId?: number;
    image?: string;
}

interface Category {
    id: number;
    name: string;
}

interface ToolTypeFormModalProps {
    onClose: () => void;
    onSuccess?: (newToolType: ToolType) => void;
    toolType?: ToolType | null;
}

const ToolTypeFormModal = ({ onClose, onSuccess, toolType }: ToolTypeFormModalProps) => {
    const { t, i18n } = useTranslation('common');
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        image: null as File | null,
    });
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    useEffect(() => {
        if (toolType) {
            setFormData({
                name: toolType.name || '',
                description: toolType.description || '',
                categoryId: toolType.categoryId?.toString() || '',
                image: null,
            });
        }
    }, [toolType]);

    const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<{ data: Category[] }>({
        queryKey: ['categories'],
        queryFn: () => api.get('/categories').then(res => res.data),
    });
    const categories = categoriesData?.data;

    const mutation = useMutation({
        mutationFn: (newToolType: FormData) => {
            if (toolType) {
                return api.put(`/tool-types/${toolType.id}`, newToolType, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            return api.post('/tool-types', newToolType, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tool-types'] });
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            toast.success(t(toolType ? 'toolTypeForm.updateSuccess' : 'toolTypeForm.createSuccess'));
            if (onSuccess) {
                onSuccess(data.data);
            }
            onClose();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || t('toolTypeForm.error'));
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const postData = new FormData();
        postData.append('name', formData.name);
        postData.append('description', formData.description);
        postData.append('categoryId', formData.categoryId);
        if (formData.image) {
            postData.append('image', formData.image);
        }
        mutation.mutate(postData);
    };
    
    if (!i18n.isInitialized || isLoadingCategories) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-6">{toolType ? t('toolTypeForm.editTitle') : t('toolTypeForm.title')}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('toolTypeForm.nameLabel')}</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('toolTypeForm.descriptionLabel')}</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">{t('toolTypeForm.categoryLabel')}</label>
                            <div className="flex items-center space-x-2">
                                <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                                    <option value="">{t('toolTypeForm.selectCategory')}</option>
                                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setIsCategoryModalOpen(true)} className="mt-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">+</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('toolTypeForm.imageLabel')}</label>
                            <input type="file" name="image" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                            {formData.image && <Image src={URL.createObjectURL(formData.image)} alt="preview" className="mt-2 h-32" width={128} height={128} />}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={mutation.isPending}>
                                {mutation.isPending ? t('saving') : t('save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {isCategoryModalOpen && (
                <MasterDataFormModal
                    resource="category"
                    title={t('settings.masterData.categories')}
                    item={null}
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSuccess={(newCategory) => {
                        queryClient.setQueryData(['categories'], (old: { data: Category[] } | undefined) => {
                            if (!old || !old.data) return { data: [newCategory] };
                            return { data: [...old.data, newCategory] };
                        });
                        setFormData(prev => ({ ...prev, categoryId: newCategory.id.toString() }));
                    }}
                />
            )}
        </>
    );
};

export default ToolTypeFormModal; 