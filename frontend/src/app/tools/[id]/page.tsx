'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import Spinner from '@/components/Spinner';
import { Circle, Wrench, CheckCircle, Edit, History, Bookmark } from 'lucide-react';

const ToolViewPage = () => {
    const { t, i18n } = useTranslation('common');
    const params = useParams();
    const { id } = params;
    const [activeTab, setActiveTab] = useState('details');

    const { data: tool, isLoading, isError } = useQuery({
        queryKey: ['tool', id],
        queryFn: () => api.get(`/tools/${id}`).then(res => res.data),
        enabled: !!id,
    });

    if (isLoading || !i18n.isInitialized) return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
    if (isError) return <div className="text-center mt-10">{t('tool.loadError')}</div>;
    if (!tool) return null;

    const { toolType } = tool;

    const detailItems = [
        { label: t('tool.description'), value: toolType.description },
        { label: t('tool.location'), value: tool.location?.name },
        { label: t('tool.manufacturer'), value: toolType.manufacturer?.name },
        { label: t('tool.purchaseDate'), value: tool.purchaseDate ? new Date(tool.purchaseDate).toLocaleDateString() : 'N/A' },
        { label: t('tool.cost'), value: tool.cost ? `${tool.cost.toFixed(2)} €` : 'N/A' },
        { label: t('tool.warrantyEndDate'), value: tool.warrantyEndDate ? new Date(tool.warrantyEndDate).toLocaleDateString() : 'N/A' },
    ];
    
    const actionButtons = [
        { label: t('tool.directCheckout'), icon: CheckCircle, color: 'purple' },
        { label: t('tool.requestBooking'), icon: Bookmark, color: 'white' },
        { label: t('tool.logMaintenance'), icon: Wrench, color: 'white' },
        { label: t('tool.editTool'), icon: Edit, color: 'white' },
        { label: t('tool.lifecycle'), icon: History, color: 'white' },
    ];

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="relative w-full h-80 rounded-lg overflow-hidden">
                            <Image src={toolType.image || '/images/tools/default.jpg'} alt={toolType.name} layout="fill" objectFit="cover" />
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold">{toolType.name}</h1>
                            <Circle size={24} className="text-green-500" />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <p><strong>{t('tool.type')}:</strong> {toolType.category?.name}</p>
                            <p><strong>{t('tool.rfid')}:</strong> {tool.rfid}</p>
                            <p><strong>{t('tool.category')}/{t('tool.serialNumber')}:</strong> {tool.serialNumber}</p>
                        </div>
                        
                        <div className="mt-6 border-b border-gray-200">
                            <nav className="flex space-x-4">
                                <button onClick={() => setActiveTab('details')} className={`py-2 px-1 font-semibold ${activeTab === 'details' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>{t('tool.tabs.details')}</button>
                                <button onClick={() => setActiveTab('bookings')} className={`py-2 px-1 font-semibold ${activeTab === 'bookings' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>{t('tool.tabs.bookings')}</button>
                                <button onClick={() => setActiveTab('maintenance')} className={`py-2 px-1 font-semibold ${activeTab === 'maintenance' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>{t('tool.tabs.maintenance')}</button>
                                <button onClick={() => setActiveTab('attachments')} className={`py-2 px-1 font-semibold ${activeTab === 'attachments' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>{t('tool.tabs.attachments')}</button>
                            </nav>
                        </div>

                        <div className="mt-6">
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    {detailItems.map(item => (
                                        <div key={item.label}>
                                            <p className="font-semibold">{item.label}</p>
                                            <p className="text-gray-600">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {actionButtons.map(btn => (
                        <button key={btn.label} className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-semibold ${btn.color === 'purple' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-300'}`}>
                            <btn.icon size={16} />
                            <span>{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ToolViewPage; 