'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface Tool {
    id: number;
    name: string;
    rfid?: string;
    condition?: Condition;
}

interface Booking {
    id: number;
}

type Condition = 'new' | 'good' | 'fair' | 'poor';

interface CheckinFormProps {
    tool: Tool | null;
    booking: Booking | null;
    onClose: () => void;
    onSubmit: (data: { condition: Condition; notes?: string }) => void;
}

const CheckinForm = ({ tool, booking, onClose, onSubmit }: CheckinFormProps) => {
    const { t } = useTranslation('common');
    const [notes, setNotes] = useState('');
    const [condition, setCondition] = useState<Condition>(tool?.condition || 'good');

    if (!tool || !booking) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            condition,
            notes,
        });
    };
    
    const conditionOptions: Condition[] = ['good', 'fair', 'poor'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                    {t('checkinForm.title', { toolName: tool.name })}
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">({tool.rfid || 'N/A'})</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkinForm.returnCondition')}</label>
                        <select
                            id="condition"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value as Condition)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                            required
                        >
                            {conditionOptions.map(option => (
                                <option key={option} value={option}>
                                    {t(`checkinForm.condition_${option}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkinForm.notesLabel')}</label>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="text-purple-600 dark:text-purple-400 font-bold py-2 px-4 rounded-md">{t('checkinForm.cancelButton')}</button>
                        <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2 font-bold">
                            {t('checkinForm.confirmButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckinForm; 