'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';
import SafeImage from './SafeImage';

interface ToolInstance {
    id: number;
    rfid?: string;
    serialNumber?: string;
    status: string;
    condition: string;
    instanceImage?: string;
    location?: { name: string };
}

interface ToolType {
    name: string;
    image?: string;
    category?: { name: string };
}

const ToolInstanceCard = ({ instance, toolType }: { instance: ToolInstance, toolType: ToolType }) => {
    const { t } = useTranslation();
    const router = useRouter();

    const getStatusClasses = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-200 text-green-800';
            case 'in_use':
            case 'checked_out': return 'bg-yellow-200 text-yellow-800';
            case 'in_maintenance': return 'bg-red-200 text-red-800';
            case 'booked': return 'bg-purple-200 text-purple-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }

    const instanceImageUrl = getImageUrl(instance.instanceImage);
    const toolTypeImageUrl = getImageUrl(toolType.image);

    const getConditionClasses = (condition: string) => {
        switch (condition) {
            case 'new':
            case 'good': return 'bg-blue-200 text-blue-800';
            case 'fair':
            case 'acceptable': return 'bg-yellow-200 text-yellow-800';
            case 'poor': return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={() => router.push(`/tools/${instance.id}`)}>
            <div className="relative h-40">
                <SafeImage
                    src={instanceImageUrl || toolTypeImageUrl || ''}
                    fallbackSrc="/vercel.svg"
                    alt={toolType.name}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-lg">{toolType.name}</h3>
                <p className="text-sm text-gray-500">{`RFID: ${instance.rfid || 'N/A'}`}</p>
                <p className="text-sm text-gray-500">{t('toolInstanceCard.serialNumber', { serialNumber: instance.serialNumber || 'N/A' })}</p>
                <p className="text-sm text-gray-500">{toolType.category?.name}</p>
                <div className="mt-2 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(instance.status)}`}>
                        {t(`toolInstanceForm.status.${instance.status}`)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConditionClasses(instance.condition)}`}>
                         {t(`toolInstanceForm.condition.${instance.condition}`)}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{t('toolInstanceCard.location', { location: instance.location?.name || 'N/A' })}</p>
                <div className="mt-4 flex gap-2">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">{t('toolInstanceCard.checkout')}</button>
                    <button className="bg-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400">{t('toolInstanceCard.book')}</button>
                </div>
            </div>
        </div>
    );
};

export default ToolInstanceCard; 