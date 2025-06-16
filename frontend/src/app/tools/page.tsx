'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { Grid, List, ChevronDown, ChevronUp } from 'lucide-react';
import Spinner from '@/components/Spinner';
import ToolInstanceCard from '@/components/ToolInstanceCard';
import Image from 'next/image';
import ToolInstanceForm from '@/components/ToolInstanceForm';
import { getImageUrl } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';

interface ToolInstance {
    id: number;
    status: 'available' | 'in_use' | 'checked_out' | 'in_maintenance' | 'booked';
    rfid?: string;
    serialNumber?: string;
    condition: string;
}

interface ToolType {
    id: number;
    name: string;
    image?: string;
    category?: {
        name: string;
    };
    instances?: ToolInstance[];
}

const ToolsPage = () => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
    const [showForm, setShowForm] = useState(false);

    const { data: toolTypes, isLoading, isError } = useQuery<ToolType[]>({
        queryKey: ['toolTypes'],
        queryFn: () => api.get('/tool-types').then(res => res.data),
    });

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSearchChange = (id: number, value: string) => {
        setSearchTerms(prev => ({ ...prev, [id]: value }));
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    if (isError) return <div className="text-center mt-10">{t('tools.loadError')}</div>;

    const getStatusCounts = (instances: ToolInstance[] = []) => {
        const available = instances.filter(i => i.status === 'available').length;
        const checkedOut = instances.filter(i => i.status === 'in_use' || i.status === 'checked_out').length;
        return { available, checkedOut, total: instances.length };
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{t('nav.tools')}</h1>
                <div className="flex items-center gap-4">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2">
                        <Grid size={20} />
                        <span>{t('tools.scan')}</span>
                    </button>
                    <button onClick={() => setShowForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                        <span>+ {t('tools.newToolInstance')}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('tools.search.title')}</label>
                        <input type="text" placeholder={t('tools.search.placeholder')} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('tools.status.title')}</label>
                        <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            <option>{t('tools.status.all')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('tools.category.title')}</label>
                        <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            <option>{t('tools.category.all')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('tools.typeFilter.title')}</label>
                        <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                            <option>{t('tools.typeFilter.all')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center mb-4">
                <div className="flex items-center gap-2">
                    <span>{t('tools.viewMode')}:</span>
                    <button className="p-2 rounded-md bg-purple-200 text-purple-700"><Grid size={20} /></button>
                    <button className="p-2 rounded-md"><List size={20} /></button>
                </div>
            </div>

            <div className="space-y-4">
                {toolTypes?.map((type) => {
                    const instances = type.instances || [];
                    const counts = getStatusCounts(instances);
                    const filteredInstances = instances.filter((instance) =>
                        (instance.rfid?.toLowerCase() || '').includes(searchTerms[type.id]?.toLowerCase() || '') ||
                        (instance.serialNumber?.toLowerCase() || '').includes(searchTerms[type.id]?.toLowerCase() || '')
                    );

                    return (
                        <div key={type.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(type.id)}>
                                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                    <SafeImage
                                        src={getImageUrl(type.image) || ''}
                                        fallbackSrc="/vercel.svg"
                                        alt={type.name}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h2 className="font-bold text-xl">{type.name}</h2>
                                    <p className="text-sm text-gray-500">{type.category?.name}</p>
                                    <p className="text-sm">
                                        <span className="text-green-600">{counts.available} {t('tools.available')}</span> / <span className="text-blue-600">{counts.checkedOut} {t('tools.checkedOut')}</span> ({counts.total} {t('tools.total')})
                                    </p>
                                </div>
                                {expanded[type.id] ? <ChevronUp /> : <ChevronDown />}
                            </div>

                            {expanded[type.id] && (
                                <div className="p-4 border-t border-gray-200">
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            placeholder={t('tools.instanceSearchPlaceholder')}
                                            value={searchTerms[type.id] || ''}
                                            onChange={(e) => handleSearchChange(type.id, e.target.value)}
                                            className="w-full md:w-1/3 p-2 border rounded-md"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {filteredInstances.map((instance) => (
                                            <ToolInstanceCard 
                                                key={instance.id} 
                                                instance={instance} 
                                                toolType={{
                                                    name: type.name,
                                                    image: type.image,
                                                    category: type.category,
                                                }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showForm && <ToolInstanceForm onFormSubmit={() => setShowForm(false)} />}
        </div>
    );
};

export default ToolsPage; 